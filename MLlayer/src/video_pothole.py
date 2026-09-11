#!/usr/bin/env python3
"""
Jetson Orin Nano - Pothole Detection from Video (Unique Detections Only)
Processes all frames but saves each unique pothole only ONCE using IoU deduplication
"""

import os
import cv2
import torch
import numpy as np
from pathlib import Path
from ultralytics import YOLO
from datetime import datetime
import time

# ==========================================
# CONFIGURATION
# ==========================================
BASE_DIR = Path.home() / "Desktop" / "SIH"
MODEL_PT = BASE_DIR / "best.pt"
VIDEO_INPUT = BASE_DIR / "sample_vidio2.mp4"
OUTPUT_DIR = BASE_DIR / "detected_frames"

# YOLO parameters from commands.txt
IMGSZ = 640
CONF = 0.10
IOU = 0.50
DEVICE = 0  # GPU device

# Deduplication: Only save a pothole if it's different from all saved ones
# Lower IOU = stricter deduplication (0.3 = needs >70% difference to count as new)
DEDUP_IOU_THRESHOLD = 0.3  # If IoU > 0.3, consider it the same pothole, skip

# ==========================================
# LOGGING
# ==========================================
def log(msg="", level="INFO"):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if msg:
        print(f"[{timestamp}] [{level}] {msg}")
    else:
        print()


def setup_output_dir():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    return OUTPUT_DIR


def check_gpu():
    log("Checking GPU...")
    if not torch.cuda.is_available():
        log("ERROR: CUDA not available!", "ERROR")
        return False
    log(f"✓ GPU: {torch.cuda.get_device_name(DEVICE)}")
    log(f"✓ CUDA: {torch.cuda.get_device_capability(DEVICE)}")
    return True


def verify_files():
    if not MODEL_PT.exists():
        log(f"ERROR: {MODEL_PT} not found", "ERROR")
        return False
    log(f"✓ Model: {MODEL_PT} ({MODEL_PT.stat().st_size / (1024**2):.1f} MB)")
    
    if not VIDEO_INPUT.exists():
        log(f"ERROR: {VIDEO_INPUT} not found", "ERROR")
        return False
    
    cap = cv2.VideoCapture(str(VIDEO_INPUT))
    if not cap.isOpened():
        log(f"ERROR: Cannot open video", "ERROR")
        return False
    
    frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()
    
    log(f"✓ Video: {w}x{h} @ {fps:.1f} fps, {frames} frames (~{frames/fps:.1f}s)")
    return True


def load_model():
    log("Loading YOLO model...")
    try:
        model = YOLO(str(MODEL_PT))
        log(f"✓ Model loaded (PyTorch GPU inference)")
        log(f"  Input: {IMGSZ}x{IMGSZ} | Conf: {CONF} | NMS IoU: {IOU}")
        log(f"  Dedup IoU threshold: {DEDUP_IOU_THRESHOLD} (saves unique potholes only)")
        return model
    except Exception as e:
        log(f"ERROR: {e}", "ERROR")
        return None


# ==========================================
# IoU CALCULATION & DEDUPLICATION
# ==========================================
def calculate_iou(box1, box2):
    """
    Calculate Intersection over Union (IoU) for two bounding boxes
    box format: [x1, y1, x2, y2] (normalized 0-1 or pixel coords, doesn't matter as long as consistent)
    Returns: IoU value (0.0 - 1.0)
    """
    x1_min, y1_min, x1_max, y1_max = box1
    x2_min, y2_min, x2_max, y2_max = box2
    
    # Calculate intersection
    inter_x_min = max(x1_min, x2_min)
    inter_y_min = max(y1_min, y2_min)
    inter_x_max = min(x1_max, x2_max)
    inter_y_max = min(y1_max, y2_max)
    
    if inter_x_max < inter_x_min or inter_y_max < inter_y_min:
        return 0.0
    
    inter_area = (inter_x_max - inter_x_min) * (inter_y_max - inter_y_min)
    
    # Calculate union
    box1_area = (x1_max - x1_min) * (y1_max - y1_min)
    box2_area = (x2_max - x2_min) * (y2_max - y2_min)
    union_area = box1_area + box2_area - inter_area
    
    if union_area == 0:
        return 0.0
    
    iou = inter_area / union_area
    return iou


def is_duplicate_pothole(new_box, saved_boxes, threshold=DEDUP_IOU_THRESHOLD):
    """
    Check if new detection overlaps significantly with any saved pothole
    Returns: (is_duplicate, max_iou_with_saved)
    """
    if not saved_boxes:
        return False, 0.0
    
    max_iou = 0.0
    for saved_box in saved_boxes:
        iou = calculate_iou(new_box, saved_box)
        max_iou = max(max_iou, iou)
        
        if iou > threshold:
            return True, iou
    
    return False, max_iou


# ==========================================
# VIDEO PROCESSING
# ==========================================
def process_video_dedup(model):
    """
    Process video: save ONLY unique potholes (deduplicated by IoU)
    """
    
    log("Starting video processing (IoU-based deduplication)...")
    log(f"  Dedup threshold: {DEDUP_IOU_THRESHOLD} (IoU > {DEDUP_IOU_THRESHOLD} = same pothole)")
    log()
    
    cap = cv2.VideoCapture(str(VIDEO_INPUT))
    if not cap.isOpened():
        log("ERROR: Cannot open video", "ERROR")
        return
    
    frame_idx = 0
    processed_frames = 0
    total_detections = 0
    saved_unique = 0
    skipped_duplicates = 0
    saved_boxes = []  # List of all saved bounding boxes
    
    start_time = time.time()
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_idx += 1
            t0 = time.time()
            
            try:
                results = model.predict(
                    source=frame,
                    device=DEVICE,
                    imgsz=IMGSZ,
                    conf=CONF,
                    iou=IOU,
                    verbose=False
                )
                result = results[0]
            except Exception as e:
                log(f"ERROR at frame {frame_idx}: {e}", "ERROR")
                continue
            
            # Process detections
            if len(result.boxes) > 0:
                processed_frames += 1
                
                for box_idx, box in enumerate(result.boxes):
                    conf = float(box.conf[0])
                    x1, y1, x2, y2 = box.xyxy[0]
                    
                    # Normalize coordinates to 0-1 range for IoU calculation
                    h, w = frame.shape[:2]
                    norm_box = [
                        float(x1) / w,
                        float(y1) / h,
                        float(x2) / w,
                        float(y2) / h
                    ]
                    
                    total_detections += 1
                    
                    # Check if this is a duplicate
                    is_dup, max_iou_val = is_duplicate_pothole(norm_box, saved_boxes, DEDUP_IOU_THRESHOLD)
                    
                    if is_dup:
                        skipped_duplicates += 1
                    else:
                        # NEW UNIQUE POTHOLE - SAVE IT
                        saved_unique += 1
                        saved_boxes.append(norm_box)
                        
                        annotated = result.plot()
                        output_file = OUTPUT_DIR / f"pothole_unique_{saved_unique:04d}_f{frame_idx:06d}_conf{conf:.3f}.jpg"
                        cv2.imwrite(str(output_file), annotated)
                        
                        inf_time = time.time() - t0
                        inf_fps = 1.0 / inf_time if inf_time > 0 else 0
                        
                        log(f"Frame {frame_idx}: UNIQUE pothole #{saved_unique} (conf: {conf:.3f}, fps: {inf_fps:.1f}) → SAVED")
            
            # Progress every 150 frames
            if frame_idx % 150 == 0:
                elapsed = time.time() - start_time
                avg_fps = frame_idx / elapsed if elapsed > 0 else 0
                log(f"  Progress: {frame_idx} frames | {total_detections} total detections | {saved_unique} unique saved | {skipped_duplicates} duplicates skipped | {avg_fps:.1f} fps")
    
    except KeyboardInterrupt:
        log("Interrupted by user", "WARN")
    except Exception as e:
        log(f"ERROR: {e}", "ERROR")
    finally:
        cap.release()
    
    # Stats
    elapsed = time.time() - start_time
    log("\n" + "="*60)
    log("PROCESSING COMPLETE (UNIQUE POTHOLES ONLY)")
    log("="*60)
    log(f"Total video frames: {frame_idx}")
    log(f"Frames with detections: {processed_frames}")
    log(f"Total detections found: {total_detections}")
    log(f"Unique potholes saved: {saved_unique}")
    log(f"Duplicate detections skipped: {skipped_duplicates}")
    log(f"Deduplication efficiency: {100*skipped_duplicates/max(total_detections, 1):.1f}% redundancy removed")
    log(f"Processing time: {elapsed:.1f}s")
    log(f"Average FPS: {frame_idx/elapsed if elapsed > 0 else 0:.1f}")
    log(f"Output directory: {OUTPUT_DIR}")
    log("="*60 + "\n")


# ==========================================
def main():
    log("\n" + "="*60)
    log("JETSON POTHOLE DETECTION - UNIQUE DETECTIONS ONLY")
    log("="*60 + "\n")
    
    setup_output_dir()
    
    if not check_gpu():
        return
    log()
    
    if not verify_files():
        return
    log()
    
    model = load_model()
    if not model:
        return
    log()
    
    process_video_dedup(model)
    log("Done!")


if __name__ == "__main__":
    main()
