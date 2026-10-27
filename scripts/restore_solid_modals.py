import os
import re

modal_dir = r"C:\hackthons\frontend\src\components\modals"

for fname in os.listdir(modal_dir):
    if not fname.endswith(".jsx"):
        continue
    fpath = os.path.join(modal_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    orig = content

    # 1. Replace backdrop containing image2_backdrop.png with softly dimmed solid backdrop
    content = re.sub(
        r'\{\/\* Background showing Image 2 building with cinematic blur \*\/\}[\s\S]*?<div className="absolute inset-0 bg-black\/(?:40|45|50)[^"]*" onClick=\{onClose\} \/>',
        '<div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />',
        content
    )

    # 2. Replace modal surface class
    content = re.sub(
        r'bg-white\/92\s+backdrop-blur-xl\s+border\s+border-white\/60\s+rounded-\[22px\]\s+shadow-\[0_20px_50px_rgba\(0,0,0,0\.25\)\]',
        'bg-[#FBF8F5] border border-[#EDE4DC] rounded-[18px] shadow-2xl',
        content
    )

    # 3. Replace header backgrounds
    content = re.sub(
        r'border-b border-\[#EDE4DC\](?:\/80)?\s+bg-white(?:\/70)?(?:\s+backdrop-blur-md)?',
        'border-b border-[#EDE4DC] bg-white',
        content
    )

    # 4. Replace footer backgrounds
    content = re.sub(
        r'border-t border-\[#EDE4DC\](?:\/80)?\s+bg-white(?:\/70)?(?:\s+backdrop-blur-md)?',
        'border-t border-[#EDE4DC] bg-white',
        content
    )

    # 5. Clean up bg-white/80 inside modals to clean solid white
    content = content.replace("bg-white/80", "bg-white")
    content = content.replace("bg-white/70", "bg-white")
    content = content.replace("bg-white/90", "bg-white")
    content = content.replace("bg-white/50", "bg-[#FAF7F3]")

    # 6. Close button hover style
    content = content.replace("hover:bg-black/5", "hover:bg-[#EDE4DC]/50")

    if content != orig:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated solid ivory styling for: {fname}")
    else:
        print(f"No changes needed for: {fname}")
