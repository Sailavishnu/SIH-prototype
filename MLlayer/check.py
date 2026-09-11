import os
import glob
import json
from collections import Counter

RDD_ROOT = r"E:\SIH 26124 ph tracker\dataset\rdd2022-DatasetNinja"


def count_classes(split):
    ann_dir = os.path.join(RDD_ROOT, split, "ann")
    json_paths = glob.glob(os.path.join(ann_dir, "*.json"))

    counts = Counter()

    for json_path in json_paths:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        for obj in data.get("objects", []):
            name = obj.get("classTitle", "unknown")
            counts[name] += 1

    return counts


def main():

    for split in ("train", "test"):
        counts = count_classes(split)

        print()
        print(f"{split.upper()} — {len(counts)} unique classes")
        print("-" * 40)

        for name, n in counts.most_common():
            print(f"{name:25s}: {n}")


if __name__ == "__main__":
    main()