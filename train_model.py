from ultralytics import YOLO

DATA = r"E:\SIH 26124 ph tracker\dataset\pothole_yolo\pothole.yaml"
MODEL = r"E:\SIH 26124 ph tracker\ML layer\yolo11s.pt"

def main():
    model = YOLO(MODEL)

    results = model.train(
        data=DATA,
        epochs=30,
        imgsz=768,
        batch=8,
        workers=4,
        patience=10,
        pretrained=True,
        device=0,
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
        name="pothole_yolo11s_960_50ep"
    )

if __name__ == "__main__":
    main()