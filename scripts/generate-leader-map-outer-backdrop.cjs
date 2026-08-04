const fs = require("node:fs/promises");
const path = require("node:path");

// The project lockfile contains Sharp, while the image-processing runtime is
// shared with the existing asset-preparation workspace.
const sharp = require(
  path.resolve(
    __dirname,
    "..",
    "..",
    "ai-website-cloner-template",
    "node_modules",
    "sharp",
  ),
);

const repoRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(repoRoot, "..");
const screenshotPath = path.join(workspaceRoot, "map2.png");
const outputDirectory = path.join(repoRoot, "public", "campus-map", "outer");
const outputPath = path.join(outputDirectory, "2_5d-expanded.webp");

// `map2.png` is an official-map overview. Cropping the left and right edges
// removes the compass/zoom controls and the overview minimap while preserving
// the complete lower map extension.
const safeMapCrop = { left: 160, top: 0, width: 2200, height: 1362 };
const outputDivisor = 8;
// Full-resolution registration against the existing 2.5D overview places its
// top-left at screenshot pixel [456, 263]. Account for safeMapCrop.left here.
const cropOrigin = { x: (456 - safeMapCrop.left) * outputDivisor, y: 263 * outputDivisor };

// The official screenshot contains another campus floating in the upper-left
// corner. A feathered map-paper mask removes it entirely and stops before the
// registered main-campus overlap begins at y=263.
const otherCampusMask = {
  width: 900,
  height: 340,
  solidUntil: "72%",
};

function createOtherCampusMask() {
  const { width, height, solidUntil } = otherCampusMask;
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient
          id="map-paper"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="scale(${width} ${height})"
        >
          <stop offset="0%" stop-color="#f7fafc" stop-opacity="1" />
          <stop offset="${solidUntil}" stop-color="#f7fafc" stop-opacity="1" />
          <stop offset="100%" stop-color="#f7fafc" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#map-paper)" />
    </svg>
  `);
}

async function main() {
  const input = await sharp(screenshotPath, { limitInputPixels: false }).metadata();
  if (input.width !== 2562 || input.height !== 1362) {
    throw new Error(
      `Expected map2.png to be 2562×1362, received ${input.width}×${input.height}.`,
    );
  }

  await fs.mkdir(outputDirectory, { recursive: true });
  await sharp(screenshotPath, { limitInputPixels: false })
    .extract(safeMapCrop)
    .composite([
      {
        input: createOtherCampusMask(),
        left: 0,
        top: 0,
      },
    ])
    .webp({ quality: 80, alphaQuality: 100, effort: 5, smartSubsample: true })
    .toFile(outputPath);

  const metadata = {
    version: 1,
    source: "map2.png",
    url: "/campus-map/outer/2_5d-expanded.webp",
    outputDivisor,
    safeMapCrop,
    otherCampusMask,
    outerWidth: safeMapCrop.width * outputDivisor,
    outerHeight: safeMapCrop.height * outputDivisor,
    cropOrigin: [cropOrigin.x, cropOrigin.y],
    notes:
      "Official-map controls are outside the crop; the upper-left secondary campus is covered by a feathered map-paper mask outside the main-campus overlap.",
  };
  await fs.writeFile(
    path.join(outputDirectory, "2_5d-expanded.metadata.json"),
    `${JSON.stringify(metadata, null, 2)}\n`,
    "utf8",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
