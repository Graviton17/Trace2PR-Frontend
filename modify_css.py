import re

with open('src/index.css', 'r') as f:
    content = f.read()

# Replace root variables
content = re.sub(r'--ink: #[a-f0-9]+;', '--ink: #ffffff;', content)
content = re.sub(r'--muted: #[a-f0-9]+;', '--muted: #a1a1aa;', content)
content = re.sub(r'--muted-strong: #[a-f0-9]+;', '--muted-strong: #d4d4d8;', content)
content = re.sub(r'--page: #[a-f0-9]+;', '--page: #09090b;', content)
content = re.sub(r'--page-deep: #[a-f0-9]+;', '--page-deep: #000000;', content)
content = re.sub(r'--surface: #[a-f0-9]+;', '--surface: #09090b;', content)
content = re.sub(r'--surface-raised: #[a-f0-9]+;', '--surface-raised: #18181b;', content)
content = re.sub(r'--acid: #[a-f0-9]+;', '--acid: #ffffff;', content)
content = re.sub(r'--line: rgba\([^)]+\);', '--line: rgba(255, 255, 255, .1);', content)
content = re.sub(r'--line-strong: rgba\([^)]+\);', '--line-strong: rgba(255, 255, 255, .2);', content)

# Replace all rgba(185, 255, 99, x) or rgba(185,255,99,x) with rgba(255, 255, 255, x)
content = re.sub(r'185,\s*255,\s*99', '255, 255, 255', content)
# other greens
content = re.sub(r'174,\s*202,\s*185', '255, 255, 255', content)
content = re.sub(r'41,\s*111,\s*77', '255, 255, 255', content)
# other specific hexes used in landing page background/borders
content = re.sub(r'#0a1813', '#09090b', content)
content = re.sub(r'#0a1511', '#09090b', content)
content = re.sub(r'#0d1b16', '#18181b', content)
content = re.sub(r'#08130f', '#09090b', content)
content = re.sub(r'#0b1914', '#09090b', content)
content = re.sub(r'#0c2118', '#000000', content)
content = re.sub(r'#101c17', '#18181b', content)
content = re.sub(r'#15221c', '#18181b', content)
content = re.sub(r'#07100c', '#000000', content)
content = re.sub(r'#07100d', '#000000', content)
content = re.sub(r'#091511', '#09090b', content)
content = re.sub(r'#0c1c16', '#18181b', content)
content = re.sub(r'#344139', '#27272a', content) # workflow rail
content = re.sub(r'#48534d', '#27272a', content) # workflow level dot
content = re.sub(r'#4c5650', '#27272a', content)
content = re.sub(r'#314138', '#27272a', content)
content = re.sub(r'#405148', '#3f3f46', content)
content = re.sub(r'#405049', '#3f3f46', content)

# specific text colors
content = re.sub(r'#c9f49b', '#ffffff', content)
content = re.sub(r'#a7e57e', '#ffffff', content)
content = re.sub(r'#baf294', '#ffffff', content)
content = re.sub(r'#d1ff99', '#e4e4e7', content) # hover button
content = re.sub(r'#a4df7c', '#ffffff', content)
content = re.sub(r'#a8e57f', '#ffffff', content)
content = re.sub(r'#8ee747', '#a1a1aa', content)
content = re.sub(r'#d7f4b8', '#e4e4e7', content)
content = re.sub(r'#91d872', '#ffffff', content)
content = re.sub(r'#75a851', '#ffffff', content)
content = re.sub(r'#a8d99a', '#a1a1aa', content)

with open('src/index.css', 'w') as f:
    f.write(content)
