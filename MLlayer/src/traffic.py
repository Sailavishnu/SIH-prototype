import cv2
import torch
from pathlib import Path
from ultralytics import YOLO

# Paths
SRC_DIR = Path("/home/jetson/Desktop/SIH/traffic_images")
DEST_DIR = Path("/home/jetson/Desktop/SIH/traffic_images_result")
MODEL_PATH = Path("/home/jetson/Desktop/SIH/best.pt")

# YOLO settings
CONF = 0.10
IMGSZ = 640
DEVICE = 0

# Create destination folder
DEST_DIR.mkdir(parents=True, exist_ok=True)

# Check GPU
print("CUDA:", torch.cuda.is_available())
if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(DEVICE))

# Load model
print("\nLoading YOLO model...")
model = YOLO(str(MODEL_PATH))
print("Model loaded successfully.\n")

# Supported image formats
extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

images = sorted(
    [p for p in SRC_DIR.iterdir() if p.suffix.lower() in extensions]
)

print(f"Found {len(images)} images.")
print("=" * 50)

processed = 0
detections = 0

for image_path in images:

    print(f"Processing: {image_path.name}")

    frame = cv2.imread(str(image_path))

    if frame is None:
        print("  ERROR: Could not read image")
        continue

    # YOLO inference on Jetson GPU
    results = model.predict(
        source=frame,
        device=DEVICE,
        imgsz=IMGSZ,
        conf=CONF,
        verbose=False
    )

    result = results[0]

    # Draw detections
    annotated = result.plot()

    # Save with same filename
    output_path = DEST_DIR / image_path.name
    cv2.imwrite(str(output_path), annotated)

    processed += 1

    num_detections = len(result.boxes)

    if num_detections > 0:
        detections += num_detections
        print(f"  ✓ {num_detections} pothole(s) detected")
    else:
        print("  - No pothole detected")

print("\n" + "=" * 50)
print("PROCESSING COMPLETE")
print("=" * 50)
print(f"Images found:       {len(images)}")
print(f"Images processed:   {processed}")
print(f"Total detections:   {detections}")
print(f"Results saved to:   {DEST_DIR}")
print("=" * 50)
