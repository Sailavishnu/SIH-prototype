import os
import torch
from ultralytics import YOLO

DATA = r"E:\SIH 26124 ph tracker\dataset\combined_yolo_v2\combined_v2.yaml"
MODEL = r"E:\SIH 26124 ph tracker\ML layer\runs\detect\runs\detect\pothole_yolo11s_960_50ep-4\weights\best.pt"


def main():

    if not os.path.exists(DATA):
        print(f"ERROR: data.yaml not found at {DATA}")
        return

    if not os.path.exists(MODEL):
        print(f"ERROR: base weights not found at {MODEL}")
        return

    device = 0 if torch.cuda.is_available() else "cpu"

    if device == "cpu":
        print("WARNING: CUDA not available, training will run on CPU")

    model = YOLO(MODEL)

    results = model.train(
        data=DATA,
        epochs=20,
        imgsz=640,
        batch=16,
        cache="ram",
        workers=4,
        patience=10,
        pretrained=True,
        device=device,
        optimizer="AdamW",
        lr0=0.001,
        lrf=0.01,
        weight_decay=0.0005,
        degrees=5,
        translate=0.1,
        scale=0.5,
        shear=2,
        perspective=0.0005,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.1,
        project="runs/detect",
        name="combined9_yolo11s_640_20ep"
    )

    save_dir = results.save_dir
    best_weights = os.path.join(save_dir, "weights", "best.pt")

    print()
    print("=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)
    print(f"Run directory : {save_dir}")
    print(f"Best weights  : {best_weights}")

    metrics = results.results_dict

    if metrics:
        print()
        print("Final metrics")
        print("-" * 40)
        for k, v in metrics.items():
            print(f"{k:25s}: {v}")


if __name__ == "__main__":
    main()