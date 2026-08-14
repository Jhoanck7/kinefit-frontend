import os
import re

SECTIONS_DIR = "src/components/sections"
sections = [
    "HeroSection.tsx",
    "AboutSection.tsx",
    "TeamSection.tsx",
    "TestimonialsSection.tsx",
    "ProcessSection.tsx",
    "GallerySection.tsx",
    "LocationSection.tsx"
]

for section_file in sections:
    file_path = os.path.join(SECTIONS_DIR, section_file)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update imports
    if "LandingConfigData" not in content:
        content = re.sub(
            r"import \{([^}]+)\} from '@/lib/services/landingConfig\.service';",
            r"import { \1, LandingConfigData } from '@/lib/services/landingConfig.service';",
            content
        )
    
    if "import { landingConfigService" in content:
        # We don't need to fetch from service directly if it's passed as prop, but maybe they import types.
        # Let's just make sure LandingConfigData is imported.
        pass

    # 2. Add config to props
    # Usually: export default function HeroSection() {
    # Replace with: export default function HeroSection({ config }: { config: LandingConfigData }) {
    
    # Catch cases with existing props like TeamSection({ initialTeam }: any)
    match_func = re.search(r"export default function ([A-Za-z0-9_]+)\((.*?)\)\s*{", content)
    if match_func:
        func_name = match_func.group(1)
        args = match_func.group(2).strip()
        
        # If it has config already, skip
        if "config" not in args:
            if args == "" or args == " ":
                new_args = "{ config }: { config: LandingConfigData }"
            else:
                # If there are other args, we replace them entirely since page.tsx now only passes config
                new_args = "{ config }: { config: LandingConfigData }"
            
            content = content.replace(
                f"export default function {func_name}({match_func.group(2)})",
                f"export default function {func_name}({new_args})"
            )

    # 3. Remove local state and useEffect for config
    # Look for: const [config, setConfig] = useState<LandingConfigData>(defaultLandingConfig);
    content = re.sub(r"const \[config,\s*setConfig\]\s*=\s*useState<LandingConfigData>[^\n]+;\n?", "", content)
    
    # Look for useEffect that fetches config
    # useEffect(() => { async function fetchConfig() { const data = await landingConfigService.getConfig(); setConfig(data); } fetchConfig(); }, []);
    content = re.sub(r"useEffect\(\(\)\s*=>\s*\{\s*async\s*function\s*fetchConfig[^\}]+setConfig\(data\);\s*\}\s*fetchConfig\(\);\s*\},\s*\[\]\);\n?", "", content)

    # Some files use "cargando" or similar
    content = re.sub(r"const \[cargando,\s*setCargando\]\s*=\s*useState\(true\);\n?", "", content)

    # For GallerySection and TestimonialsSection and ProcessSection, they might parse JSON from config
    # Let's replace the `useEffect` that parses JSON with a standard memo or direct parse
    
    # For ProcessSection:
    if "ProcessSection" in section_file:
        content = re.sub(r"const \[steps,\s*setSteps\]\s*=\s*useState<ProcessStepItem\[\]>\(.*?\);", "let steps = defaultProcessSteps;", content)
        content = re.sub(r"useEffect\(\(\)\s*=>\s*\{[\s\S]*?fetchConfig\(\);\s*\},\s*\[\]\);", "", content)
        
        # Add parsing logic at the top of component
        parse_logic = """
  let steps = defaultProcessSteps;
  if (config.processStepsJson) {
    try {
      const parsed = JSON.parse(config.processStepsJson);
      if (Array.isArray(parsed) && parsed.length > 0) steps = parsed;
    } catch {}
  }
"""
        # Inject right after function signature
        content = re.sub(r"(export default function ProcessSection[^{]*\{)", r"\1" + parse_logic, content)
        
        # Remove old useEffect that parses processStepsJson
        content = re.sub(r"useEffect\(\(\)\s*=>\s*\{[^}]*processStepsJson[^}]*setSteps[^}]*\}\s*\}, \[config\]\);", "", content)
        
    elif "GallerySection" in section_file:
        content = re.sub(r"const \[slides,\s*setSlides\]\s*=\s*useState<GallerySlideItem\[\]>\(.*?\);", "", content)
        content = re.sub(r"const \[config,\s*setConfig\]\s*=\s*useState.*?;", "", content)
        
        parse_logic = """
  let slides = CAROUSEL_SLIDES;
  if (config.galleryJson) {
    try {
      const parsed = JSON.parse(config.galleryJson);
      if (Array.isArray(parsed) && parsed.length > 0) slides = parsed;
    } catch {}
  }
"""
        content = re.sub(r"(export default function GallerySection[^{]*\{)", r"\1" + parse_logic, content)

    elif "TestimonialsSection" in section_file:
        content = re.sub(r"const \[reviews,\s*setReviews\]\s*=\s*useState<GoogleReviewItem\[\]>\(.*?\);", "", content)
        content = re.sub(r"const \[config,\s*setConfig\]\s*=\s*useState.*?;", "", content)
        
        parse_logic = """
  let reviews = defaultGoogleReviews;
  if (config.reviewsJson) {
    try {
      const parsed = JSON.parse(config.reviewsJson);
      if (Array.isArray(parsed) && parsed.length > 0) reviews = parsed;
    } catch {}
  }
"""
        content = re.sub(r"(export default function TestimonialsSection[^{]*\{)", r"\1" + parse_logic, content)

    # Some files use "use client"; at the top, maybe they don't need it if they have no other state?
    # Actually, HeroSection has `currentBg` state. AboutSection doesn't seem to have state.
    # We will leave "use client" just in case they use framer-motion or interactive elements.

    # Remove unused sanity imports
    content = re.sub(r"import\s+\w+\s+from\s+['\"]@/types/sanity['\"];\n?", "", content)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Refactored {section_file}")
