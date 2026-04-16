/* eslint-env node */
/**
 * Generates iOS and Android app icons from a single SVG source.
 *
 * Usage:  node scripts/generate-icons.js
 *
 * Outputs:
 *   ios/FrontEndChallenge/Images.xcassets/AppIcon.appiconset/  (PNG per size)
 *   android/app/src/main/res/mipmap-{mdpi,hdpi,...}/ic_launcher.png
 *   android/app/src/main/res/mipmap-{mdpi,hdpi,...}/ic_launcher_round.png
 */

const sharp = require('sharp');
const path = require('path');

// ── Icon SVG ─────────────────────────────────────────────────────────────────
// Orange background, white stylised cat face.
// Designed to read clearly at 48 px (Android mdpi) and up.
const SVG = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024"
     xmlns="http://www.w3.org/2000/svg">

  <!-- Background -->
  <rect width="1024" height="1024" fill="#E8622A"/>

  <!-- Cat ears (white triangle + coloured inner) -->
  <polygon points="170,410 265,150 360,410" fill="#F5E6DC"/>
  <polygon points="664,410 759,150 854,410" fill="#F5E6DC"/>
  <polygon points="215,390 265,195 315,390" fill="#D4856A"/>
  <polygon points="709,390 759,195 809,390" fill="#D4856A"/>

  <!-- Head -->
  <ellipse cx="512" cy="570" rx="320" ry="305" fill="#F5E6DC"/>

  <!-- Eyes -->
  <ellipse cx="390" cy="510" rx="58" ry="70" fill="#2C1A0E"/>
  <ellipse cx="634" cy="510" rx="58" ry="70" fill="#2C1A0E"/>
  <!-- Iris -->
  <ellipse cx="390" cy="510" rx="36" ry="56" fill="#7B4F2E"/>
  <ellipse cx="634" cy="510" rx="36" ry="56" fill="#7B4F2E"/>
  <!-- Pupil -->
  <ellipse cx="390" cy="515" rx="16" ry="48" fill="#1A0A00"/>
  <ellipse cx="634" cy="515" rx="16" ry="48" fill="#1A0A00"/>
  <!-- Shine -->
  <circle cx="406" cy="492" r="14" fill="white" opacity="0.9"/>
  <circle cx="650" cy="492" r="14" fill="white" opacity="0.9"/>

  <!-- Nose -->
  <polygon points="512,598 490,624 534,624" fill="#D4856A"/>

  <!-- Mouth -->
  <path d="M490,624 Q475,650 450,648"
        stroke="#8C5A40" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M534,624 Q549,650 574,648"
        stroke="#8C5A40" stroke-width="9" fill="none" stroke-linecap="round"/>

  <!-- Whiskers left -->
  <line x1="240" y1="590" x2="468" y2="610"
        stroke="#8C5A40" stroke-width="6" stroke-linecap="round" opacity="0.55"/>
  <line x1="240" y1="618" x2="468" y2="622"
        stroke="#8C5A40" stroke-width="6" stroke-linecap="round" opacity="0.55"/>
  <line x1="240" y1="646" x2="468" y2="638"
        stroke="#8C5A40" stroke-width="6" stroke-linecap="round" opacity="0.55"/>

  <!-- Whiskers right -->
  <line x1="784" y1="590" x2="556" y2="610"
        stroke="#8C5A40" stroke-width="6" stroke-linecap="round" opacity="0.55"/>
  <line x1="784" y1="618" x2="556" y2="622"
        stroke="#8C5A40" stroke-width="6" stroke-linecap="round" opacity="0.55"/>
  <line x1="784" y1="646" x2="556" y2="638"
        stroke="#8C5A40" stroke-width="6" stroke-linecap="round" opacity="0.55"/>
</svg>
`;

// ── Size tables ───────────────────────────────────────────────────────────────

const IOS_SIZES = [
  { filename: 'Icon-40.png', size: 40 }, // 20×20 @2x
  { filename: 'Icon-60.png', size: 60 }, // 20×20 @3x
  { filename: 'Icon-58.png', size: 58 }, // 29×29 @2x
  { filename: 'Icon-87.png', size: 87 }, // 29×29 @3x
  { filename: 'Icon-80.png', size: 80 }, // 40×40 @2x
  { filename: 'Icon-120.png', size: 120 }, // 40×40 @3x / 60×60 @2x
  { filename: 'Icon-180.png', size: 180 }, // 60×60 @3x
  { filename: 'Icon-1024.png', size: 1024 }, // App Store / ios-marketing
];

const ANDROID_SIZES = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

// ── Paths ─────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const IOS_OUT = path.join(
  ROOT,
  'ios/FrontEndChallenge/Images.xcassets/AppIcon.appiconset',
);
const ANDROID_RES = path.join(ROOT, 'android/app/src/main/res');

// ── Generator ─────────────────────────────────────────────────────────────────
async function generate() {
  const svgBuf = Buffer.from(SVG);

  // iOS
  console.log('\niOS icons →', IOS_OUT);
  for (const { filename, size } of IOS_SIZES) {
    const out = path.join(IOS_OUT, filename);
    await sharp(svgBuf).resize(size, size).png().toFile(out);
    console.log(`  ✓ ${filename} (${size}×${size})`);
  }

  // Android (square + round — same image, OS clips it for round)
  console.log('\nAndroid icons →', ANDROID_RES);
  for (const { dir, size } of ANDROID_SIZES) {
    const resDir = path.join(ANDROID_RES, dir);
    for (const name of ['ic_launcher.png', 'ic_launcher_round.png']) {
      const out = path.join(resDir, name);
      await sharp(svgBuf).resize(size, size).png().toFile(out);
    }
    console.log(`  ✓ ${dir} (${size}×${size})`);
  }

  console.log('\nAll icons generated.\n');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
