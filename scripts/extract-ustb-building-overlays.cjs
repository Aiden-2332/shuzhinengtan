const fs = require("node:fs/promises");
const path = require("node:path");

const ORIGIN = "https://map.ustb.edu.cn";
const CATEGORY_NAMES = {
  "002001": "校内场馆",
  "002002": "教学科研",
  "002003": "学生宿舍",
  "002004": "行政办公",
  "002005": "家属住宅",
};
const CATEGORY_CODES = Object.keys(CATEGORY_NAMES);
const MAPS = {
  "2_5d": {
    baseUrl: ORIGIN,
    width: 14_336,
    height: 7_263,
    cropOrigin: [4_096, 5_120],
  },
  "2d": {
    baseUrl: `${ORIGIN}/2d`,
    width: 13_139,
    height: 8_759,
    cropOrigin: [5_888, 20_992],
  },
};
const OUTPUT_PATH = path.resolve(
  __dirname,
  "../src/data/ustb-building-overlays.json",
);

const requestHeaders = {
  Referer: `${ORIGIN}/`,
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36",
};

function decodeXml(buffer) {
  return new TextDecoder("gb18030").decode(buffer);
}

function decodeEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function readTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (match) return decodeEntities(match[1].trim());
  if (block.includes(`<${tag} />`) || block.includes(`<${tag}/>`)) return "";
  return "";
}

function parseNumberList(value) {
  return value
    .split(",")
    .map((item) => Number.parseInt(item, 10))
    .filter(Number.isFinite);
}

function parseHitAreas(xml) {
  const result = [];
  const blocks = xml.match(/<zJ>[\s\S]*?<\/zJ>/g) ?? [];

  for (const block of blocks) {
    const xValues = parseNumberList(readTag(block, "fG"));
    const yValues = parseNumberList(readTag(block, "fJ"));
    if (xValues.length < 3 || xValues.length !== yValues.length) continue;

    result.push({
      id: Number.parseInt(readTag(block, "zH"), 10),
      title: readTag(block, "zI"),
      anchor: [
        Number.parseInt(readTag(block, "fD"), 10),
        Number.parseInt(readTag(block, "fI"), 10),
      ],
      polygon: xValues.map((x, index) => [x, yValues[index]]),
      sortCode: readTag(block, "sC"),
    });
  }

  return result;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: requestHeaders });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return response.json();
}

async function fetchXml(url) {
  const response = await fetch(url, { headers: requestHeaders });
  if (!response.ok) return "";
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("xml")) return "";
  return decodeXml(await response.arrayBuffer());
}

function polygonCentroid(points) {
  let twiceArea = 0;
  let xTotal = 0;
  let yTotal = 0;

  for (let index = 0; index < points.length; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[(index + 1) % points.length];
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    xTotal += (x1 + x2) * cross;
    yTotal += (y1 + y2) * cross;
  }

  if (Math.abs(twiceArea) < 0.000_001) {
    const totals = points.reduce(
      (sum, [x, y]) => [sum[0] + x, sum[1] + y],
      [0, 0],
    );
    return [totals[0] / points.length, totals[1] / points.length];
  }

  return [xTotal / (3 * twiceArea), yTotal / (3 * twiceArea)];
}

function offsetPoint([x, y], [offsetX, offsetY]) {
  return [x - offsetX, y - offsetY];
}

function polygonIntersectsMap(polygon, width, height) {
  const xValues = polygon.map(([x]) => x);
  const yValues = polygon.map(([, y]) => y);
  return (
    Math.max(...xValues) >= 0 &&
    Math.min(...xValues) <= width &&
    Math.max(...yValues) >= 0 &&
    Math.min(...yValues) <= height
  );
}

async function extractMap(mapKey, config) {
  const categoryLists = await Promise.all(
    CATEGORY_CODES.map(async (sortCode) => {
      const url =
        `${config.baseUrl}/japi/get_poi_by_sort_xq?sortcode=${sortCode}`;
      const pois = await fetchJson(url);
      return pois.map((poi) => ({
        ...poi,
        category: CATEGORY_NAMES[sortCode],
      }));
    }),
  );
  const pois = categoryLists.flat();

  const tileKeys = [
    ...new Set(
      pois.map(
        (poi) =>
          `${Math.floor(Number(poi.x) / 256)},${Math.floor(Number(poi.y) / 256)}`,
      ),
    ),
  ].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

  const tileAreas = await Promise.all(
    tileKeys.map(async (tileKey) => {
      const xml = await fetchXml(
        `${config.baseUrl}/xml/tips/1/${tileKey}.xml`,
      );
      return parseHitAreas(xml);
    }),
  );
  const areasById = new Map(
    tileAreas.flat().map((area) => [area.id, area]),
  );

  const buildings = pois
    .map((poi) => {
      const area = areasById.get(Number(poi.id));
      if (!area) return null;
      const polygon = area.polygon.map((point) =>
        offsetPoint(point, config.cropOrigin),
      );
      if (!polygonIntersectsMap(polygon, config.width, config.height)) {
        return null;
      }
      return {
        id: String(poi.id),
        name: poi.title,
        category: poi.category,
        sortCode: poi.sortcode,
        anchor: offsetPoint(area.anchor, config.cropOrigin),
        centroid: offsetPoint(
          polygonCentroid(area.polygon),
          config.cropOrigin,
        ),
        polygon,
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(a.id) - Number(b.id));

  return {
    id: mapKey,
    width: config.width,
    height: config.height,
    cropOrigin: config.cropOrigin,
    totals: {
      poiCount: pois.length,
      polygonCount: buildings.length,
      tileCount: tileKeys.length,
    },
    buildings,
  };
}

async function main() {
  const mapEntries = await Promise.all(
    Object.entries(MAPS).map(async ([mapKey, config]) => [
      mapKey,
      await extractMap(mapKey, config),
    ]),
  );
  const maps = Object.fromEntries(mapEntries);
  const payload = {
    source: {
      poiEndpoint: "{mapOrigin}/japi/get_poi_by_sort_xq",
      hitAreaEndpoint: "{mapOrigin}/xml/tips/1/{tileX},{tileY}.xml",
      originalStyle: {
        fill: "#00ff33",
        fillOpacity: 0.2,
        stroke: "#00ff33",
        strokeWidth: 1,
      },
    },
    maps,
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload)}\n`);
  for (const [mapKey, mapData] of Object.entries(maps)) {
    process.stdout.write(
      `${mapKey}: ${mapData.totals.polygonCount}/${mapData.totals.poiCount} in-map building polygons from ${mapData.totals.tileCount} public tiles.\n`,
    );
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
});
