import re

with open('src/index.css', 'r') as f:
    content = f.read()

# Change primary accent to a professional blue (Tailwind blue-500)
content = re.sub(r'--acid: #ffffff;', '--acid: #3b82f6;', content)
# Update button hover to blue-400
content = re.sub(r'\.button:hover \{ background: #[a-f0-9]+;', '.button:hover { background: #60a5fa;', content)
# Ensure button text is white on the blue background (instead of black on white)
content = re.sub(r'\.button \{ (.*? )color: #[a-f0-9]+;', r'.button { \1color: #ffffff;', content)

with open('src/index.css', 'w') as f:
    f.write(content)
