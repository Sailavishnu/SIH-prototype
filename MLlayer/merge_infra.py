import os
import glob
import shutil
import random
import xml.etree.ElementTree as ET
from PIL import Image

ROOT = r"E:\SIH 26124 ph tracker\dataset\infra"
OUT_ROOT = r"E:\SIH 26124 ph tracker\dataset\infra_yolo"

SEED = 42
HF_VAL_RATIO = 0.10

random.seed(SEED)

IMG_EXTS = [".jpg", ".jpeg", ".png"]

INFRA1_MAP = {i: 5 for i in range(44)}
INFRA1_MAP[11] = 6
INFRA1_MAP[43] = 8

INFRA2_MAP = {i: 5 for i in range(56)}
INFRA2_MAP[15] = 6
INFRA2_MAP[38] = 7
INFRA2_MAP[29] = 8

INFRA3_MAP = {i: 5 for i in range(70)}
INFRA3_MAP[50] = 7
INFRA3_MAP[11] = 8


def find_image(images_dir, stem):
    for ext in IMG_EXTS:
        p = os.path.join(images_dir, stem + ext)
        if os.path.exists(p):
            return p
    matches = glob.glob(os.path.join(images_dir, stem + ".*"))
    return matches[0] if matches else None


def ensure_out_dirs():
    for split in ("train", "val"):
        os.makedirs(os.path.join(OUT_ROOT, "images", split), exist_ok=True)
        os.makedirs(os.path.join(OUT_ROOT, "labels", split), exist_ok=True)


def remap_roboflow_split(src_root, split_name, class_map, prefix, out_split):
    images_dir = os.path.join(src_root, split_name, "images")
    labels_dir = os.path.join(src_root, split_name, "labels")

    if not os.path.isdir(images_dir) or not os.path.isdir(labels_dir):
        print(f"SKIP (missing images/labels): {images_dir}")
        return 0, 0

    label_files = glob.glob(os.path.join(labels_dir, "*.txt"))

    written = 0
    skipped_no_image = 0

    for label_path in label_files:
        stem = os.path.splitext(os.path.basename(label_path))[0]

        img_path = find_image(images_dir, stem)

        if img_path is None:
            skipped_no_image += 1
            continue

        with open(label_path, "r", encoding="utf-8") as f:
            lines = [l.strip() for l in f if l.strip()]

        out_lines = []

        for line in lines:
            parts = line.split()

            cls = int(parts[0])
            rest = parts[1:]

            new_cls = class_map.get(cls)

            if new_cls is None:
                continue

            out_lines.append(" ".join([str(new_cls)] + rest))

        out_name = f"{prefix}_{stem}"
        ext = os.path.splitext(img_path)[1]

        out_img_path = os.path.join(OUT_ROOT, "images", out_split, out_name + ext)
        out_lbl_path = os.path.join(OUT_ROOT, "labels", out_split, out_name + ".txt")

        shutil.copy2(img_path, out_img_path)

        with open(out_lbl_path, "w", encoding="utf-8") as f:
            f.write("\n".join(out_lines))

        written += 1

    if skipped_no_image:
        print(f"{prefix}/{split_name}: {skipped_no_image} labels had no matching image")

    return written, skipped_no_image


def voc_box_to_yolo(xmin, ymin, xmax, ymax, w, h):
    xmin = max(0.0, min(xmin, w))
    xmax = max(0.0, min(xmax, w))
    ymin = max(0.0, min(ymin, h))
    ymax = max(0.0, min(ymax, h))

    if xmax <= xmin or ymax <= ymin:
        return None

    xc = ((xmin + xmax) / 2) / w
    yc = ((ymin + ymax) / 2) / h
    bw = (xmax - xmin) / w
    bh = (ymax - ymin) / h

    return xc, yc, bw, bh


def convert_hf_voc():
    hf_root = os.path.join(ROOT, "hugging -face2", "indian_traffic_sign_images")

    ann_dir = os.path.join(hf_root, "Annotations", "Annotations")
    img_dir = os.path.join(hf_root, "images", "images")

    if not os.path.isdir(ann_dir) or not os.path.isdir(img_dir):
        print(f"SKIP hugging-face2 (folders not found): {ann_dir}")
        return 0, 0

    xml_files = glob.glob(os.path.join(ann_dir, "*.xml"))
    random.shuffle(xml_files)

    n_val = int(len(xml_files) * HF_VAL_RATIO)
    val_set = set(xml_files[:n_val])

    written = 0
    skipped = 0

    for xml_path in xml_files:
        try:
            tree = ET.parse(xml_path)
            root = tree.getroot()
        except Exception as e:
            print(f"Skipping {xml_path}: {e}")
            skipped += 1
            continue

        filename = root.findtext("filename")

        if not filename:
            skipped += 1
            continue

        img_path = os.path.join(img_dir, filename)

        if not os.path.exists(img_path):
            stem = os.path.splitext(filename)[0]
            img_path = find_image(img_dir, stem)

        if img_path is None or not os.path.exists(img_path):
            skipped += 1
            continue

        size = root.find("size")

        if size is not None and size.findtext("width") and size.findtext("height"):
            w = float(size.findtext("width"))
            h = float(size.findtext("height"))
        else:
            with Image.open(img_path) as im:
                w, h = im.size

        out_lines = []

        for obj in root.findall("object"):
            bnd = obj.find("bndbox")

            if bnd is None:
                continue

            try:
                xmin = float(bnd.findtext("xmin"))
                ymin = float(bnd.findtext("ymin"))
                xmax = float(bnd.findtext("xmax"))
                ymax = float(bnd.findtext("ymax"))
            except (TypeError, ValueError):
                continue

            box = voc_box_to_yolo(xmin, ymin, xmax, ymax, w, h)

            if box is None:
                continue

            xc, yc, bw, bh = box
            out_lines.append(f"5 {xc:.6f} {yc:.6f} {bw:.6f} {bh:.6f}")

        if not out_lines:
            skipped += 1
            continue

        out_split = "val" if xml_path in val_set else "train"

        stem = os.path.splitext(os.path.basename(xml_path))[0]
        out_name = f"hf_{stem}"
        ext = os.path.splitext(img_path)[1]

        out_img_path = os.path.join(OUT_ROOT, "images", out_split, out_name + ext)
        out_lbl_path = os.path.join(OUT_ROOT, "labels", out_split, out_name + ".txt")

        shutil.copy2(img_path, out_img_path)

        with open(out_lbl_path, "w", encoding="utf-8") as f:
            f.write("\n".join(out_lines))

        written += 1

    return written, skipped


def main():

    ensure_out_dirs()

    total_train = 0
    total_val = 0

    sources = [
        ("infra 1", INFRA1_MAP, "infra1"),
        ("infra 2", INFRA2_MAP, "infra2"),
        ("infra 3", INFRA3_MAP, "infra3"),
    ]

    for folder, class_map, prefix in sources:
        src_root = os.path.join(ROOT, folder)

        n_train, _ = remap_roboflow_split(src_root, "train", class_map, prefix, "train")
        n_val, _ = remap_roboflow_split(src_root, "valid", class_map, prefix, "val")

        print(f"{folder}: train={n_train} val={n_val}")

        total_train += n_train
        total_val += n_val

    hf_train, hf_skipped = convert_hf_voc()

    hf_val_count = len(glob.glob(os.path.join(OUT_ROOT, "images", "val", "hf_*")))
    hf_train_count = len(glob.glob(os.path.join(OUT_ROOT, "images", "train", "hf_*")))

    print(f"hugging-face2: train={hf_train_count} val={hf_val_count} skipped={hf_skipped}")

    total_train += hf_train_count
    total_val += hf_val_count

    print()
    print("=" * 50)
    print("MERGE COMPLETE")
    print("=" * 50)
    print(f"Total train images: {total_train}")
    print(f"Total val images  : {total_val}")
    print(f"Output            : {OUT_ROOT}")


if __name__ == "__main__":
    main()