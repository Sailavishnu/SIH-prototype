import os
import glob
import shutil

RDD_ROOT = r"E:\SIH 26124 ph tracker\dataset\rdd_yolo"
INFRA_ROOT = r"E:\SIH 26124 ph tracker\dataset\infra_yolo"
OUT_ROOT = r"E:\SIH 26124 ph tracker\dataset\combined_yolo_v2"


def ensure_out_dirs():
    for split in ("train", "val"):
        os.makedirs(os.path.join(OUT_ROOT, "images", split), exist_ok=True)
        os.makedirs(os.path.join(OUT_ROOT, "labels", split), exist_ok=True)


def copy_split(src_root, split, prefix):
    images_dir = os.path.join(src_root, "images", split)
    labels_dir = os.path.join(src_root, "labels", split)

    img_files = glob.glob(os.path.join(images_dir, "*.*"))

    written = 0

    for img_path in img_files:
        stem = os.path.splitext(os.path.basename(img_path))[0]
        ext = os.path.splitext(img_path)[1]

        label_path = os.path.join(labels_dir, stem + ".txt")

        out_name = f"{prefix}_{stem}"

        out_img_path = os.path.join(OUT_ROOT, "images", split, out_name + ext)
        out_lbl_path = os.path.join(OUT_ROOT, "labels", split, out_name + ".txt")

        shutil.copy2(img_path, out_img_path)

        if os.path.exists(label_path):
            shutil.copy2(label_path, out_lbl_path)
        else:
            open(out_lbl_path, "w").close()

        written += 1

    return written


def main():

    ensure_out_dirs()

    rdd_train = copy_split(RDD_ROOT, "train", "rdd")
    rdd_val = copy_split(RDD_ROOT, "val", "rdd")

    infra_train = copy_split(INFRA_ROOT, "train", "infra")
    infra_val = copy_split(INFRA_ROOT, "val", "infra")

    print(f"rdd   : train={rdd_train} val={rdd_val}")
    print(f"infra : train={infra_train} val={infra_val}")

    print()
    print("=" * 50)
    print("FINAL MERGE COMPLETE")
    print("=" * 50)
    print(f"Total train images: {rdd_train + infra_train}")
    print(f"Total val images  : {rdd_val + infra_val}")
    print(f"Output            : {OUT_ROOT}")


if __name__ == "__main__":
    main()