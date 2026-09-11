import os
import glob
import json
import random
from PIL import Image

RDD_ROOT = r"E:\SIH 26124 ph tracker\dataset\rdd2022-DatasetNinja"
OUT_ROOT = r"E:\SIH 26124 ph tracker\dataset\rdd_yolo"

VAL_RATIO = 0.15
KEEP_EMPTY_RATIO = 0.15

SEED = 42
random.seed(SEED)

CLASS_MAP = {
    "pothole": 0,
    "longitudinal crack": 1,
    "transverse crack": 2,
    "alligator crack": 3,
    "other corruption": 4,
}


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


def find_pairs():
    ann_dir = os.path.join(RDD_ROOT, "train", "ann")
    img_dir = os.path.join(RDD_ROOT, "train", "img")

    json_paths = glob.glob(os.path.join(ann_dir, "*.jpg.json"))

    pairs = []

    for json_path in json_paths:
        base = os.path.basename(json_path)[:-len(".json")]
        img_path = os.path.join(img_dir, base)

        if os.path.exists(img_path):
            pairs.append((img_path, json_path))

    return pairs


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

    boxes = []

    for obj in data.get("objects", []):

        if obj.get("geometryType") != "rectangle":
            continue

        name = obj.get("classTitle", "").strip().lower()
        cls = CLASS_MAP.get(name)

        if cls is None:
            continue

        try:
            (x1, y1), (x2, y2) = obj["points"]["exterior"]
            xmin, xmax = sorted((float(x1), float(x2)))
            ymin, ymax = sorted((float(y1), float(y2)))
        except Exception:
            continue

        box = voc_to_yolo_box(xmin, ymin, xmax, ymax, w, h)

        if box is not None:
            xc, yc, bw, bh = box
            boxes.append(f"{cls} {xc:.6f} {yc:.6f} {bw:.6f} {bh:.6f}")

    return boxes


def write_sample(img_path, lines, split):
    stem = os.path.splitext(os.path.basename(img_path))[0]

    out_img = os.path.join(OUT_ROOT, "images", split, stem + ".jpg")
    out_lbl = os.path.join(OUT_ROOT, "labels", split, stem + ".txt")

    with Image.open(img_path) as im:
        im.convert("RGB").save(out_img, "JPEG")

    with open(out_lbl, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def main():

    for split in ("train", "val"):
        os.makedirs(os.path.join(OUT_ROOT, "images", split), exist_ok=True)
        os.makedirs(os.path.join(OUT_ROOT, "labels", split), exist_ok=True)

    pairs = find_pairs()
    pairs.sort()

    print(f"Found {len(pairs)} image/json pairs")

    random.shuffle(pairs)
    n_val = int(len(pairs) * VAL_RATIO)
    val_set = set(p[0] for p in pairs[:n_val])

    counts = {"train": 0, "val": 0}
    class_counts = {name: 0 for name in CLASS_MAP}
    skipped_empty = 0

    for img_path, json_path in pairs:

        try:
            lines = parse_boxes(json_path, img_path)
        except Exception as e:
            print(f"Skipping {json_path}: {e}")
            continue

        split = "val" if img_path in val_set else "train"

        if not lines:
            if split == "val":
                pass
            elif random.random() >= KEEP_EMPTY_RATIO:
                skipped_empty += 1
                continue

        write_sample(img_path, lines, split)
        counts[split] += 1

        for line in lines:
            cls_id = int(line.split()[0])
            name = [k for k, v in CLASS_MAP.items() if v == cls_id][0]
            class_counts[name] += 1

    print()
    print("=" * 50)
    print("RDD2022 -> YOLO (5 classes) COMPLETE")
    print("=" * 50)
    print(f"Train images  : {counts['train']}")
    print(f"Val images    : {counts['val']}")
    print(f"Empty skipped : {skipped_empty}")
    print()
    print("Instances written per class:")
    for name, n in class_counts.items():
        print(f"  {name:20s}: {n}")
    print()
    print(f"Output: {OUT_ROOT}")


if __name__ == "__main__":
    main()