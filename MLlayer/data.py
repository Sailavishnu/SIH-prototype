import os
import glob
import json
import shutil
import random
from PIL import Image

# ==================== CONFIG ====================

RDD_ROOT = r"E:\SIH 26124 ph tracker\dataset\rdd2022-DatasetNinja"
OUT_ROOT = r"E:\SIH 26124 ph tracker\dataset\pothole_yolo"

TARGET_CLASS = "pothole"

# Training hard-negative/normal-road retention
KEEP_NEGATIVE_RATIO = 0.50
KEEP_EMPTY_RATIO = 0.25

# Validation should contain all available negatives
KEEP_VAL_NEGATIVES = True

SEED = 42

random.seed(SEED)


# ==================== BOX CONVERSION ====================

def voc_to_yolo_box(xmin, ymin, xmax, ymax, w, h):
    xmin = max(0, min(xmin, w))
    xmax = max(0, min(xmax, w))
    ymin = max(0, min(ymin, h))
    ymax = max(0, min(ymax, h))

    if xmax <= xmin or ymax <= ymin:
        return None

    xc = ((xmin + xmax) / 2) / w
    yc = ((ymin + ymax) / 2) / h
    bw = (xmax - xmin) / w
    bh = (ymax - ymin) / h

    return xc, yc, bw, bh


# ==================== FIND IMAGE/JSON PAIRS ====================

def find_pairs(split_dir):
    ann_dir = os.path.join(split_dir, "ann")
    img_dir = os.path.join(split_dir, "img")

    json_paths = glob.glob(
        os.path.join(ann_dir, "*.jpg.json")
    )

    pairs = []

    for json_path in json_paths:
        base = os.path.basename(json_path)[:-len(".json")]
        img_path = os.path.join(img_dir, base)

        if os.path.exists(img_path):
            pairs.append((img_path, json_path))

    return pairs


# ==================== PARSE ANNOTATIONS ====================

def parse_boxes(json_path, img_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    size = data.get("size")

    if size is not None:
        w = int(size["width"])
        h = int(size["height"])
    else:
        with Image.open(img_path) as im:
            w, h = im.size

    pothole_boxes = []
    has_other = False
    invalid_boxes = 0

    for obj in data.get("objects", []):

        if obj.get("geometryType") != "rectangle":
            continue

        name = obj.get("classTitle", "").strip().lower()

        try:
            (x1, y1), (x2, y2) = obj["points"]["exterior"]

            xmin, xmax = sorted((float(x1), float(x2)))
            ymin, ymax = sorted((float(y1), float(y2)))

        except Exception:
            invalid_boxes += 1
            continue

        if name == TARGET_CLASS.lower():

            box = voc_to_yolo_box(
                xmin,
                ymin,
                xmax,
                ymax,
                w,
                h
            )

            if box is not None:
                pothole_boxes.append(box)
            else:
                invalid_boxes += 1

        else:
            has_other = True

    return pothole_boxes, has_other, invalid_boxes


# ==================== WRITE SAMPLE ====================

def write_sample(
    img_path,
    boxes,
    img_out,
    lbl_out,
    prefix=""
):
    original_name = os.path.splitext(
        os.path.basename(img_path)
    )[0]

    base = f"{prefix}_{original_name}" if prefix else original_name

    shutil.copy2(
        img_path,
        os.path.join(img_out, base + ".jpg")
    )

    label_path = os.path.join(
        lbl_out,
        base + ".txt"
    )

    with open(label_path, "w", encoding="utf-8") as f:

        lines = []

        for xc, yc, bw, bh in boxes:
            lines.append(
                f"0 {xc:.6f} {yc:.6f} {bw:.6f} {bh:.6f}"
            )

        f.write("\n".join(lines))


# ==================== CONVERT SPLIT ====================

def convert_split(
    pairs,
    img_out,
    lbl_out,
    split_name,
    is_validation=False
):

    os.makedirs(img_out, exist_ok=True)
    os.makedirs(lbl_out, exist_ok=True)

    positive_images = 0
    hard_negative_images = 0
    empty_negative_images = 0
    skipped = 0
    invalid_boxes = 0

    for img_path, json_path in pairs:

        try:
            boxes, has_other, bad_boxes = parse_boxes(
                json_path,
                img_path
            )

            invalid_boxes += bad_boxes

        except Exception as e:

            skipped += 1

            print(
                f"Skipping {json_path}: {e}"
            )

            continue

        # ---------------- POSITIVE ----------------

        if boxes:

            write_sample(
                img_path,
                boxes,
                img_out,
                lbl_out,
                prefix=split_name
            )

            positive_images += 1

        # ---------------- HARD NEGATIVE ----------------

        elif has_other:

            if (
                is_validation
                and KEEP_VAL_NEGATIVES
            ) or (
                not is_validation
                and random.random() < KEEP_NEGATIVE_RATIO
            ):

                write_sample(
                    img_path,
                    [],
                    img_out,
                    lbl_out,
                    prefix=split_name
                )

                hard_negative_images += 1

        # ---------------- NORMAL / EMPTY IMAGE ----------------

        else:

            if (
                is_validation
                and KEEP_VAL_NEGATIVES
            ) or (
                not is_validation
                and random.random() < KEEP_EMPTY_RATIO
            ):

                write_sample(
                    img_path,
                    [],
                    img_out,
                    lbl_out,
                    prefix=split_name
                )

                empty_negative_images += 1

    print()
    print(f"{split_name.upper()} DATASET")
    print("-" * 40)
    print(f"Pothole images      : {positive_images}")
    print(f"Hard negatives      : {hard_negative_images}")
    print(f"Normal road images  : {empty_negative_images}")
    print(f"Skipped             : {skipped}")
    print(f"Invalid boxes       : {invalid_boxes}")

    return (
        positive_images,
        hard_negative_images,
        empty_negative_images
    )


# ==================== MAIN ====================

def main():

    train_dir = os.path.join(
        RDD_ROOT,
        "train"
    )

    test_dir = os.path.join(
        RDD_ROOT,
        "test"
    )

    train_pairs = find_pairs(train_dir)
    test_pairs = find_pairs(test_dir)

    print("=" * 60)
    print("RDD2022 → YOLO POTHOLE DATASET")
    print("=" * 60)

    print()
    print(f"RDD root       : {RDD_ROOT}")
    print(f"Output root    : {OUT_ROOT}")
    print(f"Target class   : {TARGET_CLASS}")
    print(f"Negative ratio : {KEEP_NEGATIVE_RATIO}")
    print(f"Empty ratio    : {KEEP_EMPTY_RATIO}")

    print()
    print(f"RDD train pairs: {len(train_pairs)}")
    print(f"RDD test pairs : {len(test_pairs)}")

    if not train_pairs:
        print()
        print("ERROR: No training image/JSON pairs found.")
        print("Check the RDD_ROOT path and folder structure.")
        return

    if not test_pairs:
        print()
        print("ERROR: No test image/JSON pairs found.")
        print("Check the RDD_ROOT path and folder structure.")
        return

    # Use official RDD2022 split
    train_pairs.sort()
    test_pairs.sort()

    train_img_out = os.path.join(
        OUT_ROOT,
        "images",
        "train"
    )

    train_lbl_out = os.path.join(
        OUT_ROOT,
        "labels",
        "train"
    )

    val_img_out = os.path.join(
        OUT_ROOT,
        "images",
        "val"
    )

    val_lbl_out = os.path.join(
        OUT_ROOT,
        "labels",
        "val"
    )

    print()
    print("Converting training data...")

    train_stats = convert_split(
        train_pairs,
        train_img_out,
        train_lbl_out,
        "train",
        is_validation=False
    )

    print()
    print("Converting validation data...")

    val_stats = convert_split(
        test_pairs,
        val_img_out,
        val_lbl_out,
        "val",
        is_validation=True
    )

    print()
    print("=" * 60)
    print("DATASET CREATION COMPLETE")
    print("=" * 60)

    print()
    print("TRAIN")
    print(f"  Pothole       : {train_stats[0]}")
    print(f"  Hard negative : {train_stats[1]}")
    print(f"  Normal road   : {train_stats[2]}")

    print()
    print("VAL")
    print(f"  Pothole       : {val_stats[0]}")
    print(f"  Hard negative : {val_stats[1]}")
    print(f"  Normal road   : {val_stats[2]}")

    print()
    print(f"YOLO dataset:")
    print(OUT_ROOT)

    print()
    print("Next step:")
    print("Train YOLO11s using pothole.yaml")


if __name__ == "__main__":
    main()