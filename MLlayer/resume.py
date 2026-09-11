from ultralytics import YOLO

MODEL = r"E:\SIH 26124 ph tracker\ML layer\runs\detect\runs\detect\combined9_yolo11s_640_20ep\weights\last.pt"

def main():
    model = YOLO(MODEL)
    model.train(resume=True)

if __name__ == "__main__":
    main()