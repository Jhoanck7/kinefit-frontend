import os
import re

SECTIONS_DIR = "src/components/sections"
files_to_fix = [
    "GallerySection.tsx",
    "ProcessSection.tsx",
    "TestimonialsSection.tsx"
]

for section_file in files_to_fix:
    file_path = os.path.join(SECTIONS_DIR, section_file)
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # The error is that we injected the parsing logic inside the parameter list.
    # It looks like:
    # export default function GallerySection({
    #   let slides = CAROUSEL_SLIDES;
    #   ...
    # config }: { config: LandingConfigData }) {

    # Let's fix this by finding the signature and moving the logic inside the block.
    
    # Let's just find the `export default function Name({` and the `}) {`
    # and re-order it.

    # Find the function name
    name_match = re.search(r"export default function (.*?Section)\(", content)
    if name_match:
        name = name_match.group(1)
        
        # We can just do a very dumb replace
        # First, remove the bad signature and replace with a clean one
        
        # Look for the start of export default function
        start_idx = content.find(f"export default function {name}(")
        if start_idx != -1:
            # find the end of the signature which is `) {`
            end_idx = content.find(") {", start_idx)
            if end_idx != -1:
                end_idx += 3 # Include ") {"
                
                # The whole block from start_idx to end_idx is messed up.
                bad_signature = content[start_idx:end_idx]
                
                # Clean signature
                clean_signature = f"export default function {name}({{ config }}: {{ config: LandingConfigData }}) {{"
                
                # The logic that was injected inside is everything in bad_signature EXCEPT the parts of the signature
                logic = bad_signature.replace(f"export default function {name}({{", "")
                logic = logic.replace("config }: { config: LandingConfigData }) {", "")
                # It might have `{ config }: { config: LandingConfigData }` if it was fully there
                logic = re.sub(r"\{?\s*config\s*\}\s*:\s*\{\s*config\s*:\s*LandingConfigData\s*\}\s*\)?\s*\{?", "", logic)
                
                # Replace the whole bad part with clean signature + logic
                content = content[:start_idx] + clean_signature + logic + content[end_idx:]

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Fixed {section_file}")
