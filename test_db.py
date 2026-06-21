import os
import tempfile
import subprocess

with tempfile.TemporaryDirectory() as tmp:
    target = os.path.join(tmp, 'test')
    result = subprocess.run(
        ['git', 'clone', '--depth=1', 'https://github.com/ndleah/python-mini-project.git', target],
        capture_output=True, text=True
    )
    print("RETURNCODE:", result.returncode)
    if os.path.exists(target):
        files = os.listdir(target)
        print("FILES:", files)
    else:
        print("DIRECTORY NOT CREATED")