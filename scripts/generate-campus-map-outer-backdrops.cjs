const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const repoRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(repoRoot, "..");
const outputDirectory = path.join(repoRoot, "public", "campus-map", "outer");

const maps = [
  {
    id: "2d",
    outerSource: path.join(
      workspaceRoot,
      "北科大主校区_2D平面图_zoom1_向北扩展_最终无损(1).png",
    ),
    cropSource: path.join(workspaceRoot, "2D裁剪后.png"),
  },
  {
    id: "2_5d",
    outerSource: path.join(workspaceRoot, "北科大主校区_2.5D_zoom1_无损.png"),
    cropSource: path.join(workspaceRoot, "2.5D裁剪后.png"),
  },
];

const COARSE_ALIGNMENT_DIVISOR = 32;
const FINE_ALIGNMENT_DIVISOR = 8;
const OUTPUT_DIVISOR = 8;

function selectSamples(data, width, height) {
  const candidates = [];
  const stepX = Math.max(4, Math.floor(width / 42));
  const stepY = Math.max(4, Math.floor(height / 30));

  for (let y = stepY; y < height - stepY; y += stepY) {
    for (let x = stepX; x < width - stepX; x += stepX) {
      const index = y * width + x;
      const value = data[index];
      const contrast =
        Math.abs(value - data[index - stepX]) +
        Math.abs(value - data[index + stepX]) +
        Math.abs(value - data[index - stepY * width]) +
        Math.abs(value - data[index + stepY * width]);
      candidates.push({ x, y, value, contrast });
    }
  }

  return candidates
    .sort((left, right) => right.contrast - left.contrast)
    .slice(0, 480);
}

async function readAlignmentImage(filePath, width, height) {
  const { data } = await sharp(filePath, {
    limitInputPixels: false,
    sequentialRead: true,
  })
    .resize({ width, height, kernel: "nearest", fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return data;
}

function findBestOffset({
  outerData,
  outerWidth,
  outerHeight,
  cropData,
  cropWidth,
  cropHeight,
  searchBounds,
}) {
  const samples = selectSamples(cropData, cropWidth, cropHeight);
  let best = { x: 0, y: 0, error: Number.POSITIVE_INFINITY };
  const minX = Math.max(0, searchBounds?.minX ?? 0);
  const minY = Math.max(0, searchBounds?.minY ?? 0);
  const maxX = Math.min(
    outerWidth - cropWidth,
    searchBounds?.maxX ?? outerWidth - cropWidth,
  );
  const maxY = Math.min(
    outerHeight - cropHeight,
    searchBounds?.maxY ?? outerHeight - cropHeight,
  );

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      let error = 0;
      for (const sample of samples) {
        error += Math.abs(
          sample.value - outerData[(y + sample.y) * outerWidth + x + sample.x],
        );
        if (error >= best.error) break;
      }

      if (error < best.error) best = { x, y, error };
    }
  }

  return { ...best, meanAbsoluteError: best.error / samples.length };
}

async function locateCrop(outerSource, cropSource) {
  const [outerMetadata, cropMetadata] = await Promise.all([
    sharp(outerSource, { limitInputPixels: false }).metadata(),
    sharp(cropSource, { limitInputPixels: false }).metadata(),
  ]);

  const outerWidth = outerMetadata.width;
  const outerHeight = outerMetadata.height;
  const cropWidth = cropMetadata.width;
  const cropHeight = cropMetadata.height;

  if (!outerWidth || !outerHeight || !cropWidth || !cropHeight) {
    throw new Error("Unable to read campus map dimensions.");
  }

  const scaledOuterWidth = Math.round(outerWidth / COARSE_ALIGNMENT_DIVISOR);
  const scaledOuterHeight = Math.round(outerHeight / COARSE_ALIGNMENT_DIVISOR);
  const scaledCropWidth = Math.round(cropWidth / COARSE_ALIGNMENT_DIVISOR);
  const scaledCropHeight = Math.round(cropHeight / COARSE_ALIGNMENT_DIVISOR);

  const [outerData, cropData] = await Promise.all([
    readAlignmentImage(outerSource, scaledOuterWidth, scaledOuterHeight),
    readAlignmentImage(cropSource, scaledCropWidth, scaledCropHeight),
  ]);
  const coarse = findBestOffset({
    outerData,
    outerWidth: scaledOuterWidth,
    outerHeight: scaledOuterHeight,
    cropData,
    cropWidth: scaledCropWidth,
    cropHeight: scaledCropHeight,
  });

  const fineOuterWidth = Math.round(outerWidth / FINE_ALIGNMENT_DIVISOR);
  const fineOuterHeight = Math.round(outerHeight / FINE_ALIGNMENT_DIVISOR);
  const fineCropWidth = Math.round(cropWidth / FINE_ALIGNMENT_DIVISOR);
  const fineCropHeight = Math.round(cropHeight / FINE_ALIGNMENT_DIVISOR);
  const [fineOuterData, fineCropData] = await Promise.all([
    readAlignmentImage(outerSource, fineOuterWidth, fineOuterHeight),
    readAlignmentImage(cropSource, fineCropWidth, fineCropHeight),
  ]);
  const coarseToFine = COARSE_ALIGNMENT_DIVISOR / FINE_ALIGNMENT_DIVISOR;
  const expectedX = coarse.x * coarseToFine;
  const expectedY = coarse.y * coarseToFine;
  const fine = findBestOffset({
    outerData: fineOuterData,
    outerWidth: fineOuterWidth,
    outerHeight: fineOuterHeight,
    cropData: fineCropData,
    cropWidth: fineCropWidth,
    cropHeight: fineCropHeight,
    searchBounds: {
      minX: expectedX - 8,
      maxX: expectedX + 8,
      minY: expectedY - 8,
      maxY: expectedY + 8,
    },
  });

  return {
    outerWidth,
    outerHeight,
    cropWidth,
    cropHeight,
    cropOrigin: [
      fine.x * FINE_ALIGNMENT_DIVISOR,
      fine.y * FINE_ALIGNMENT_DIVISOR,
    ],
    sampleMeanAbsoluteError: fine.meanAbsoluteError,
  };
}

async function generateBackdrop(map) {
  const alignment = await locateCrop(map.outerSource, map.cropSource);
  const outputWidth = Math.ceil(alignment.outerWidth / OUTPUT_DIVISOR);
  const outputHeight = Math.ceil(alignment.outerHeight / OUTPUT_DIVISOR);
  const outputPath = path.join(outputDirectory, `${map.id}.webp`);

  await sharp(map.outerSource, {
    limitInputPixels: false,
    sequentialRead: true,
  })
    .resize({ width: outputWidth, height: outputHeight, fit: "fill" })
    .webp({ quality: 80, alphaQuality: 100, effort: 5, smartSubsample: true })
    .toFile(outputPath);

  return {
    id: map.id,
    url: `/campus-map/outer/${map.id}.webp`,
    ...alignment,
    outputWidth,
    outputHeight,
    outputDivisor: OUTPUT_DIVISOR,
  };
}

async function main() {
  await fs.mkdir(outputDirectory, { recursive: true });
  const generatedMaps = {};

  for (const map of maps) {
    const result = await generateBackdrop(map);
    generatedMaps[map.id] = result;
    console.log(
      `${map.id}: crop origin ${result.cropOrigin.join(",")}, ` +
        `alignment MAE ${result.sampleMeanAbsoluteError.toFixed(3)}`,
    );
  }

  await fs.writeFile(
    path.join(outputDirectory, "metadata.json"),
    `${JSON.stringify({ version: 1, maps: generatedMaps }, null, 2)}\n`,
    "utf8",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
