import re

with open('src/index.css', 'r') as f:
    content = f.read()

# Change primary accent back to the original green
content = re.sub(r'--acid: #3b82f6;', '--acid: #b9ff63;', content)
# Update button text color to dark (since white on green is hard to read)
content = re.sub(r'\.button \{ (.*? )color: #ffffff;', r'.button { \1color: #091006;', content)
# Update button hover background to original hover green
content = re.sub(r'\.button:hover \{ background: #60a5fa;', '.button:hover { background: #d1ff99;', content)
# Update box-shadow in button:hover to use the green RGBA
content = re.sub(r'box-shadow: 0 8px 28px rgba\(255, 255, 255,\.14\)', 'box-shadow: 0 8px 28px rgba(185,255,99,.14)', content)

# Check for another instance of integration details button
content = re.sub(r'\.integration-details__footer button \{ (.*? )color: #081007;', r'.integration-details__footer button { \1color: #091006;', content)

with open('src/index.css', 'w') as f:
    f.write(content)
