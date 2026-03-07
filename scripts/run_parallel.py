import subprocess
import os
import sys

# List of tuples (prompt_path, output_path, aspect_ratio)
tasks = [
    ("prompts/categorias/c01.json", "images/categorias/c01.webp", "4:3"),
    ("prompts/categorias/c02.json", "images/categorias/c02.webp", "4:3"),
    ("prompts/categorias/c03.json", "images/categorias/c03.webp", "4:3"),
    ("prompts/categorias/c04.json", "images/categorias/c04.webp", "4:3"),
    ("prompts/categorias/c05.json", "images/categorias/c05.webp", "4:3"),
    ("prompts/categorias/c06.json", "images/categorias/c06.webp", "4:3"),
    ("prompts/hero/h01.json", "images/hero/h01.webp", "16:9")
]

processes = []

for prompt, out, ar in tasks:
    print(f"Starting job for {out}...")
    cmd = [sys.executable, r".agents\skills\nano_banana_image_generation\scripts\generate_kie.py", prompt, out, ar]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    processes.append((p, out))

print(f"Waiting for {len(processes)} parallel jobs to complete...")

failed = False
for p, out in processes:
    stdout, stderr = p.communicate()
    print(f"--- Output for {out} ---")
    print(stdout)
    if stderr:
        print("ERRORS:")
        print(stderr)
    if p.returncode != 0:
        failed = True
        print(f"FAILED: {out}")
    else:
        print(f"SUCCESS: {out}")

if failed:
    sys.exit(1)
else:
    print("ALL JOBS FINISHED SUCCESSFULLY!")
    sys.exit(0)
