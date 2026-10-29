const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "configuraciones");
const ASSET_DIR = path.join(ROOT, "public", "pne-assets");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(ASSET_DIR, { recursive: true });
for (const filename of fs.readdirSync(ASSET_DIR)) {
  if (filename.endsWith(".svg")) fs.rmSync(path.join(ASSET_DIR, filename));
}

const palette = {
  ink: "#07313d",
  blue: "#146c86",
  cyan: "#2aa7c7",
  green: "#2ea66f",
  coral: "#e36b55",
  yellow: "#f4cf3f",
  paper: "#f8fbfc",
  grid: "#d8e6ea",
  muted: "#5d737a",
  purple: "#6d4bc3"
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function frame(title, inner, options = {}) {
  const width = options.width || 960;
  const height = options.height || 540;
  const subtitle = options.subtitle
    ? `<text x="48" y="88" class="subtitle">${escapeXml(options.subtitle)}</text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}">
  <rect width="${width}" height="${height}" rx="24" fill="${palette.paper}"/>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="23" fill="none" stroke="#c8d9de" stroke-width="2"/>
  <style>
    text { font-family: Arial, Helvetica, sans-serif; fill: ${palette.ink}; letter-spacing: 0; }
    .title { font-size: 30px; font-weight: 700; }
    .subtitle { font-size: 20px; fill: ${palette.muted}; }
    .label { font-size: 22px; font-weight: 700; }
    .small { font-size: 18px; }
    .tiny { font-size: 15px; }
  </style>
  <text x="48" y="52" class="title">${escapeXml(title)}</text>
  ${subtitle}
  ${inner}
</svg>`;
}

function saveSvg(name, svg) {
  const filename = `${name}.svg`;
  fs.writeFileSync(path.join(ASSET_DIR, filename), svg, "utf8");
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

function coordinatePlane(name, title, options = {}) {
  const xMin = options.xMin ?? -6;
  const xMax = options.xMax ?? 6;
  const yMin = options.yMin ?? -5;
  const yMax = options.yMax ?? 5;
  const maxPlotWidth = 770;
  const maxPlotHeight = 380;
  const equalScale = options.equalScale !== false;
  const unitScale = Math.min(maxPlotWidth / (xMax - xMin), maxPlotHeight / (yMax - yMin));
  const plotWidth = equalScale ? (xMax - xMin) * unitScale : maxPlotWidth;
  const plotHeight = equalScale ? (yMax - yMin) * unitScale : maxPlotHeight;
  const left = 95 + (maxPlotWidth - plotWidth) / 2;
  const top = 105 + (maxPlotHeight - plotHeight) / 2;
  const sx = (x) => left + ((x - xMin) / (xMax - xMin)) * plotWidth;
  const sy = (y) => top + ((yMax - y) / (yMax - yMin)) * plotHeight;
  const scaleX = equalScale ? unitScale : plotWidth / (xMax - xMin);
  const scaleY = equalScale ? unitScale : plotHeight / (yMax - yMin);
  const elements = [];

  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) {
    elements.push(`<line x1="${sx(x)}" y1="${top}" x2="${sx(x)}" y2="${top + plotHeight}" stroke="${palette.grid}" stroke-width="1"/>`);
    if (x !== 0) elements.push(`<text x="${sx(x)}" y="${sy(0) + 25}" text-anchor="middle" class="tiny">${x}</text>`);
  }
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += 1) {
    elements.push(`<line x1="${left}" y1="${sy(y)}" x2="${left + plotWidth}" y2="${sy(y)}" stroke="${palette.grid}" stroke-width="1"/>`);
    if (y !== 0) elements.push(`<text x="${sx(0) - 14}" y="${sy(y) + 6}" text-anchor="end" class="tiny">${y}</text>`);
  }
  elements.push(`<line x1="${left}" y1="${sy(0)}" x2="${left + plotWidth}" y2="${sy(0)}" stroke="${palette.ink}" stroke-width="3"/>`);
  elements.push(`<line x1="${sx(0)}" y1="${top}" x2="${sx(0)}" y2="${top + plotHeight}" stroke="${palette.ink}" stroke-width="3"/>`);
  elements.push(`<text x="${left + plotWidth + 18}" y="${sy(0) + 6}" class="small">x</text>`);
  elements.push(`<text x="${sx(0) + 12}" y="${top - 12}" class="small">y</text>`);

  for (const circle of options.circles || []) {
    elements.push(`<circle cx="${sx(circle.x)}" cy="${sy(circle.y)}" r="${circle.r * Math.min(scaleX, scaleY)}" fill="${circle.fill || "none"}" fill-opacity="${circle.fillOpacity ?? 0.08}" stroke="${circle.color || palette.blue}" stroke-width="${circle.width || 4}" ${circle.dash ? `stroke-dasharray="${circle.dash}"` : ""}/>`);
  }
  for (const line of options.lines || []) {
    elements.push(`<line x1="${sx(line.x1)}" y1="${sy(line.y1)}" x2="${sx(line.x2)}" y2="${sy(line.y2)}" stroke="${line.color || palette.coral}" stroke-width="${line.width || 4}" ${line.dash ? `stroke-dasharray="${line.dash}"` : ""}/>`);
  }
  for (const pathPoints of options.paths || []) {
    const points = pathPoints.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ");
    elements.push(`<polyline points="${points}" fill="none" stroke="${pathPoints.color || palette.blue}" stroke-width="${pathPoints.width || 5}" stroke-linejoin="round" stroke-linecap="round"/>`);
  }
  for (const polygon of options.polygons || []) {
    const points = polygon.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ");
    elements.push(`<polygon points="${points}" fill="${polygon.fill || palette.cyan}" fill-opacity="${polygon.fillOpacity ?? 0.12}" stroke="${polygon.color || palette.blue}" stroke-width="${polygon.width || 4}"/>`);
  }
  for (const point of options.points || []) {
    elements.push(`<circle cx="${sx(point.x)}" cy="${sy(point.y)}" r="7" fill="${point.color || palette.coral}" stroke="white" stroke-width="2"/>`);
    if (point.label) elements.push(`<text x="${sx(point.x) + (point.dx ?? 12)}" y="${sy(point.y) + (point.dy ?? -12)}" class="small" font-weight="700">${escapeXml(point.label)}</text>`);
  }

  if (options.annotation) {
    elements.push(`<rect x="635" y="116" width="210" height="58" rx="10" fill="white" stroke="#bcd0d6"/>`);
    elements.push(`<text x="740" y="152" text-anchor="middle" class="small" font-weight="700">${escapeXml(options.annotation)}</text>`);
  }
  return saveSvg(name, frame(title, elements.join("\n"), { subtitle: options.subtitle }));
}

function numberLine(name, title, options = {}) {
  const min = options.min ?? -5;
  const max = options.max ?? 5;
  const left = 105;
  const right = 855;
  const y = 300;
  const sx = (x) => left + ((x - min) / (max - min)) * (right - left);
  const parts = [
    `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="${palette.ink}" stroke-width="5"/>`,
    `<path d="M ${left} ${y} l 18 -10 v 20 z" fill="${palette.ink}"/>`,
    `<path d="M ${right} ${y} l -18 -10 v 20 z" fill="${palette.ink}"/>`
  ];
  for (let value = min; value <= max; value += 1) {
    parts.push(`<line x1="${sx(value)}" y1="${y - 13}" x2="${sx(value)}" y2="${y + 13}" stroke="${palette.ink}" stroke-width="3"/>`);
    parts.push(`<text x="${sx(value)}" y="${y + 48}" text-anchor="middle" class="small">${value}</text>`);
  }
  for (const segment of options.segments || []) {
    parts.push(`<line x1="${sx(segment.from)}" y1="${y}" x2="${sx(segment.to)}" y2="${y}" stroke="${segment.color || palette.coral}" stroke-width="12" stroke-linecap="round"/>`);
  }
  for (const point of options.points || []) {
    const fill = point.open ? palette.paper : point.color || palette.coral;
    parts.push(`<circle cx="${sx(point.value)}" cy="${y}" r="11" fill="${fill}" stroke="${point.color || palette.coral}" stroke-width="5"/>`);
    if (point.label) parts.push(`<text x="${sx(point.value) + (point.dx ?? 0)}" y="${y - 35 + (point.dy ?? 0)}" text-anchor="middle" class="label">${escapeXml(point.label)}</text>`);
  }
  return saveSvg(name, frame(title, parts.join("\n"), { subtitle: options.subtitle }));
}

function tableImage(name, title, headers, rows, options = {}) {
  const x = 95;
  const y = 135;
  const width = 770;
  const rowHeight = 66;
  const columns = headers.length;
  const colWidth = width / columns;
  const parts = [];
  parts.push(`<rect x="${x}" y="${y}" width="${width}" height="${rowHeight * (rows.length + 1)}" rx="12" fill="white" stroke="#b8cdd3" stroke-width="3"/>`);
  parts.push(`<rect x="${x}" y="${y}" width="${width}" height="${rowHeight}" rx="12" fill="${palette.blue}"/>`);
  headers.forEach((header, col) => {
    parts.push(`<text x="${x + colWidth * (col + 0.5)}" y="${y + 42}" text-anchor="middle" font-size="22" font-weight="700" fill="white">${escapeXml(header)}</text>`);
  });
  rows.forEach((row, rowIndex) => {
    if (rowIndex % 2 === 1) parts.push(`<rect x="${x}" y="${y + rowHeight * (rowIndex + 1)}" width="${width}" height="${rowHeight}" fill="#edf6f8"/>`);
    row.forEach((cell, col) => {
      parts.push(`<text x="${x + colWidth * (col + 0.5)}" y="${y + rowHeight * (rowIndex + 1) + 42}" text-anchor="middle" font-size="23" font-weight="${options.boldLast && col === columns - 1 ? 700 : 400}">${escapeXml(cell)}</text>`);
    });
  });
  for (let col = 1; col < columns; col += 1) {
    parts.push(`<line x1="${x + colWidth * col}" y1="${y}" x2="${x + colWidth * col}" y2="${y + rowHeight * (rows.length + 1)}" stroke="#b8cdd3" stroke-width="2"/>`);
  }
  for (let row = 1; row <= rows.length; row += 1) {
    parts.push(`<line x1="${x}" y1="${y + rowHeight * row}" x2="${x + width}" y2="${y + rowHeight * row}" stroke="#b8cdd3" stroke-width="2"/>`);
  }
  return saveSvg(name, frame(title, parts.join("\n"), { subtitle: options.subtitle }));
}

function mappingImage(name) {
  const leftValues = [-2, 0, 2];
  const rightValues = [1, 5];
  const leftY = [190, 300, 410];
  const rightY = [225, 375];
  const parts = [
    `<rect x="170" y="130" width="210" height="340" rx="90" fill="#e9f5f8" stroke="${palette.blue}" stroke-width="3"/>`,
    `<rect x="580" y="130" width="210" height="340" rx="90" fill="#f2ecfb" stroke="${palette.purple}" stroke-width="3"/>`,
    `<text x="275" y="165" text-anchor="middle" class="label">Dominio</text>`,
    `<text x="685" y="165" text-anchor="middle" class="label">Salida</text>`
  ];
  leftValues.forEach((value, index) => parts.push(`<circle cx="275" cy="${leftY[index]}" r="27" fill="white" stroke="${palette.blue}" stroke-width="3"/><text x="275" y="${leftY[index] + 8}" text-anchor="middle" class="label">${value}</text>`));
  rightValues.forEach((value, index) => parts.push(`<circle cx="685" cy="${rightY[index]}" r="27" fill="white" stroke="${palette.purple}" stroke-width="3"/><text x="685" y="${rightY[index] + 8}" text-anchor="middle" class="label">${value}</text>`));
  [[leftY[0], rightY[0]], [leftY[1], rightY[0]], [leftY[2], rightY[1]]].forEach(([fromY, toY]) => parts.push(`<path d="M 305 ${fromY} C 420 ${fromY}, 530 ${toY}, 650 ${toY}" fill="none" stroke="${palette.coral}" stroke-width="4" marker-end="url(#arrow)"/>`));
  const defs = `<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${palette.coral}"/></marker></defs>`;
  return saveSvg(name, frame("Relación entre dos conjuntos", defs + parts.join("\n"), { subtitle: "Cada valor del dominio debe tener una sola salida." }));
}

function shapeImage(name, title, inner, subtitle = "") {
  return saveSvg(name, frame(title, inner, { subtitle }));
}

function boxPlotImage(name) {
  const x = (value) => 130 + value * 70;
  const parts = [];
  for (let value = 0; value <= 10; value += 1) {
    parts.push(`<line x1="${x(value)}" y1="150" x2="${x(value)}" y2="455" stroke="${palette.grid}" stroke-width="1"/>`);
    parts.push(`<text x="${x(value)}" y="490" text-anchor="middle" class="small">${value}</text>`);
  }
  parts.push(`<text x="70" y="240" class="label">A</text><text x="70" y="375" class="label">B</text>`);
  const draw = (y, min, q1, median, q3, max, color) => {
    parts.push(`<line x1="${x(min)}" y1="${y}" x2="${x(max)}" y2="${y}" stroke="${color}" stroke-width="4"/>`);
    parts.push(`<line x1="${x(min)}" y1="${y - 25}" x2="${x(min)}" y2="${y + 25}" stroke="${color}" stroke-width="4"/>`);
    parts.push(`<line x1="${x(max)}" y1="${y - 25}" x2="${x(max)}" y2="${y + 25}" stroke="${color}" stroke-width="4"/>`);
    parts.push(`<rect x="${x(q1)}" y="${y - 45}" width="${x(q3) - x(q1)}" height="90" fill="white" stroke="${color}" stroke-width="5"/>`);
    parts.push(`<line x1="${x(median)}" y1="${y - 45}" x2="${x(median)}" y2="${y + 45}" stroke="${color}" stroke-width="5"/>`);
  };
  draw(220, 2, 4, 7, 8, 9, palette.blue);
  draw(355, 1, 2, 5, 8, 10, palette.coral);
  return saveSvg(name, frame("Comparación de diagramas de cajas", parts.join("\n"), { subtitle: "Compara medianas y recorridos intercuartílicos." }));
}

function vennImage(name) {
  const parts = [
    `<circle cx="390" cy="310" r="155" fill="${palette.cyan}" fill-opacity="0.18" stroke="${palette.blue}" stroke-width="5"/>`,
    `<circle cx="570" cy="310" r="155" fill="${palette.yellow}" fill-opacity="0.22" stroke="#ba8c00" stroke-width="5"/>`,
    `<text x="315" y="180" class="label">A</text><text x="635" y="180" class="label">B</text>`,
    `<text x="325" y="315" text-anchor="middle" class="label">0,35</text>`,
    `<text x="480" y="315" text-anchor="middle" class="label">0,20</text>`,
    `<text x="635" y="315" text-anchor="middle" class="label">0,20</text>`,
    `<text x="480" y="470" text-anchor="middle" class="small">Fuera de A y B: 0,25</text>`
  ];
  return saveSvg(name, frame("Eventos A y B", parts.join("\n"), { subtitle: "Las regiones indican probabilidades." }));
}

function clue(value, question, answer, hint, explanation, images = {}) {
  return {
    value,
    question,
    answer,
    hint,
    explanation,
    questionImage: images.questionImage || "",
    hintImage: images.hintImage || "",
    answerImage: images.answerImage || "",
    explanationImage: images.explanationImage || "",
    answered: false
  };
}

const images = {};

images.circleBasic = coordinatePlane("circunferencia-centro-radio", "Circunferencia en el plano", {
  xMin: -6, xMax: 4, yMin: -2, yMax: 7,
  circles: [{ x: -2, y: 3, r: 2 }],
  points: [{ x: -2, y: 3, label: "C(-2, 3)" }],
  lines: [{ x1: -2, y1: 3, x2: 0, y2: 3, color: palette.coral }],
  annotation: "radio = 2"
});

images.circleEquation = coordinatePlane("circunferencia-ecuacion", "Centro y radio", {
  xMin: -2, xMax: 10, yMin: -7, yMax: 5,
  circles: [{ x: 4, y: -1, r: 5 }],
  annotation: "(x-4)²+(y+1)²=25"
});

images.circleTranslation = coordinatePlane("traslacion-circunferencia", "Traslación de una circunferencia", {
  xMin: -7, xMax: 6, yMin: -6, yMax: 7,
  circles: [
    { x: 1, y: -2, r: 3, color: palette.muted, dash: "10 8" },
    { x: -3, y: 3, r: 3, color: palette.blue }
  ],
  points: [{ x: 1, y: -2, label: "C" }, { x: -3, y: 3, label: "C'", color: palette.green }],
  lines: [{ x1: 1, y1: -2, x2: -3, y2: 3, color: palette.coral, dash: "9 7" }],
  subtitle: "4 unidades a la izquierda y 5 hacia arriba"
});

images.pointCircle = coordinatePlane("punto-exterior", "Posición de un punto", {
  xMin: -4, xMax: 8, yMin: -5, yMax: 7,
  circles: [{ x: 1, y: 1, r: 3 }],
  points: [{ x: 5, y: 1, label: "P(5, 1)", color: palette.purple }]
});

images.tangent = coordinatePlane("recta-tangente", "Radio y recta tangente", {
  xMin: -4, xMax: 9, yMin: -7, yMax: 5,
  circles: [{ x: 2, y: -1, r: 4 }],
  points: [{ x: 2, y: -1, label: "C" }, { x: 6, y: -1, label: "Q", color: palette.green }],
  lines: [
    { x1: 2, y1: -1, x2: 6, y2: -1, color: palette.coral },
    { x1: 6, y1: -7, x2: 6, y2: 5, color: palette.purple }
  ],
  annotation: "CQ ⟂ tangente"
});

images.composite = shapeImage("area-compuesta", "Figura compuesta", `
  <path d="M 190 145 H 520 V 245 H 770 V 435 H 190 Z" fill="#d9f0f5" stroke="${palette.blue}" stroke-width="6"/>
  <rect x="520" y="145" width="250" height="100" fill="#fff4ce" fill-opacity="0.55" stroke="${palette.coral}" stroke-width="3" stroke-dasharray="10 7"/>
  <line x1="190" y1="465" x2="770" y2="465" stroke="${palette.ink}" stroke-width="3"/>
  <line x1="190" y1="450" x2="190" y2="480" stroke="${palette.ink}" stroke-width="3"/>
  <line x1="770" y1="450" x2="770" y2="480" stroke="${palette.ink}" stroke-width="3"/>
  <text x="480" y="505" text-anchor="middle" class="label">10 m</text>
  <text x="135" y="300" text-anchor="middle" class="label">6 m</text>
  <text x="645" y="135" text-anchor="middle" class="label">4 m</text>
  <text x="548" y="205" class="label">2 m</text>
`, "Rectángulo de 10 m por 6 m con una esquina de 4 m por 2 m retirada.");

images.cylinder = shapeImage("seccion-cilindro", "Sección axial de un cilindro", `
  <ellipse cx="480" cy="165" rx="150" ry="48" fill="#d9f0f5" stroke="${palette.blue}" stroke-width="5"/>
  <path d="M 330 165 V 405 C 330 432 397 453 480 453 C 563 453 630 432 630 405 V 165" fill="#d9f0f5" fill-opacity="0.45" stroke="${palette.blue}" stroke-width="5"/>
  <ellipse cx="480" cy="405" rx="150" ry="48" fill="#cce8ee" stroke="${palette.blue}" stroke-width="5"/>
  <rect x="330" y="165" width="300" height="240" fill="${palette.yellow}" fill-opacity="0.35" stroke="${palette.coral}" stroke-width="5" stroke-dasharray="10 7"/>
  <line x1="480" y1="165" x2="630" y2="165" stroke="${palette.purple}" stroke-width="5"/>
  <text x="555" y="145" text-anchor="middle" class="label">r = 3 cm</text>
  <text x="680" y="295" class="label">h = 8 cm</text>
`, "El corte vertical pasa por el eje del cilindro.");

images.reflectionQuestion = coordinatePlane("reflexion-pregunta", "Reflexión respecto a y = x", {
  xMin: -5, xMax: 5, yMin: -5, yMax: 5,
  lines: [{ x1: -5, y1: -5, x2: 5, y2: 5, color: palette.muted, dash: "10 7" }],
  points: [{ x: -3, y: 2, label: "A(-3, 2)" }]
});

images.reflectionAnswer = coordinatePlane("reflexion-solucion", "Reflexión respecto a y = x", {
  xMin: -5, xMax: 5, yMin: -5, yMax: 5,
  lines: [{ x1: -5, y1: -5, x2: 5, y2: 5, color: palette.muted, dash: "10 7" }],
  points: [{ x: -3, y: 2, label: "A(-3, 2)" }, { x: 2, y: -3, label: "A'(2, -3)", color: palette.green }]
});

images.homothetyQuestion = coordinatePlane("homotecia-pregunta", "Homotecia con centro en el origen", {
  xMin: -9, xMax: 5, yMin: -7, yMax: 5,
  polygons: [{ points: [[1, 1], [4, 1], [1, 3]], color: palette.blue, fill: palette.cyan }],
  points: [{ x: 0, y: 0, label: "O" }],
  annotation: "k = -2"
});

images.homothetyAnswer = coordinatePlane("homotecia-solucion", "Homotecia con centro en el origen", {
  xMin: -9, xMax: 5, yMin: -7, yMax: 5,
  polygons: [
    { points: [[1, 1], [4, 1], [1, 3]], color: palette.blue, fill: palette.cyan },
    { points: [[-2, -2], [-8, -2], [-2, -6]], color: palette.coral, fill: palette.yellow }
  ],
  points: [{ x: 0, y: 0, label: "O" }],
  annotation: "k = -2"
});

images.mapping = mappingImage("relacion-funcion");

images.line = coordinatePlane("funcion-lineal", "Recta determinada por dos puntos", {
  xMin: 0, xMax: 8, yMin: 0, yMax: 16,
  equalScale: false,
  lines: [{ x1: 0, y1: 1, x2: 7.5, y2: 16, color: palette.blue }],
  points: [{ x: 2, y: 5, label: "A", dx: 12, dy: 22 }, { x: 6, y: 13, label: "B", color: palette.green, dx: 12, dy: 22 }]
});

const quadraticPoints = [];
for (let x = -1; x <= 7; x += 0.25) quadraticPoints.push([x, -((x - 3) ** 2) + 4]);
images.quadraticQuestion = coordinatePlane("funcion-cuadratica-pregunta", "Función cuadrática", {
  xMin: -1, xMax: 7, yMin: -6, yMax: 6,
  equalScale: false,
  paths: [{ points: quadraticPoints, color: palette.blue }]
});

images.quadraticAnswer = coordinatePlane("funcion-cuadratica-solucion", "Función cuadrática", {
  xMin: -1, xMax: 7, yMin: -6, yMax: 6,
  equalScale: false,
  paths: [{ points: quadraticPoints, color: palette.blue }],
  points: [
    { x: 3, y: 4, label: "V(3, 4)", color: palette.coral },
    { x: 1, y: 0, label: "1", dy: 28 },
    { x: 5, y: 0, label: "5", dy: 28 }
  ]
});

images.systemQuestion = coordinatePlane("sistema-ecuaciones-pregunta", "Intersección de dos rectas", {
  xMin: -2, xMax: 8, yMin: -2, yMax: 10,
  equalScale: false,
  lines: [
    { x1: -1, y1: -1, x2: 4.5, y2: 10, color: palette.blue },
    { x1: -2, y1: 9, x2: 8, y2: -1, color: palette.coral }
  ],
  annotation: "y=2x+1; y=-x+7"
});

images.systemAnswer = coordinatePlane("sistema-ecuaciones-solucion", "Intersección de dos rectas", {
  xMin: -2, xMax: 8, yMin: -2, yMax: 10,
  equalScale: false,
  lines: [
    { x1: -1, y1: -1, x2: 4.5, y2: 10, color: palette.blue },
    { x1: -2, y1: 9, x2: 8, y2: -1, color: palette.coral }
  ],
  points: [{ x: 2, y: 5, label: "S(2, 5)", color: palette.green }]
});

images.inverse = coordinatePlane("funcion-inversa", "Una función y su inversa", {
  xMin: -5, xMax: 9, yMin: -5, yMax: 9,
  equalScale: true,
  lines: [
    { x1: -5, y1: -5, x2: 9, y2: 9, color: palette.muted, dash: "10 7" },
    { x1: 0.4, y1: -5, x2: 5, y2: 9, color: palette.blue },
    { x1: -5, y1: 0.33, x2: 9, y2: 5, color: palette.coral }
  ],
  annotation: "simetría en y=x"
});

images.linearTable = tableImage("modelo-lineal", "Datos de una situación", ["t", "0", "1", "2", "3"], [["y", "4", "7", "10", "13"]], { subtitle: "Observa las diferencias entre valores consecutivos." });
images.exponentialTable = tableImage("modelo-exponencial", "Crecimiento de una población", ["t", "0", "1", "2", "3", "4"], [["P(t)", "80", "120", "180", "270", "?"]], { subtitle: "Identifica el factor multiplicativo constante." });

const sqrtPoints = [];
for (let x = 1; x <= 10; x += 0.2) sqrtPoints.push([x, 2 * Math.sqrt(x - 1) + 3]);
images.sqrtQuestion = coordinatePlane("funcion-raiz-pregunta", "Modelo de raíz cuadrada", {
  xMin: 0, xMax: 11, yMin: 0, yMax: 10,
  equalScale: false,
  paths: [{ points: sqrtPoints, color: palette.blue }]
});

images.sqrtAnswer = coordinatePlane("funcion-raiz-solucion", "Modelo de raíz cuadrada", {
  xMin: 0, xMax: 11, yMin: 0, yMax: 10,
  equalScale: false,
  paths: [{ points: sqrtPoints, color: palette.blue }],
  points: [{ x: 1, y: 3, label: "inicio (1, 3)", color: palette.coral }],
  annotation: "d(t)=2√(t-1)+3"
});

images.compositionQuestion = shapeImage("composicion-pregunta", "Funciones f y g", `
  <rect x="150" y="185" width="280" height="170" rx="18" fill="#e8f5f7" stroke="${palette.blue}" stroke-width="4"/>
  <rect x="530" y="185" width="280" height="170" rx="18" fill="#f2ecfb" stroke="${palette.purple}" stroke-width="4"/>
  <text x="290" y="255" text-anchor="middle" class="label">f(x)=2x+1</text>
  <text x="290" y="305" text-anchor="middle" class="small">función f</text>
  <text x="670" y="255" text-anchor="middle" class="label">g(x)=√(x+1)</text>
  <text x="670" y="305" text-anchor="middle" class="small">función g</text>
`, "Determina el orden correcto para calcular (f∘g)(3).");

images.compositionAnswer = shapeImage("composicion-solucion", "Composición de funciones", `
  <defs><marker id="arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="${palette.coral}"/></marker></defs>
  <rect x="90" y="205" width="190" height="120" rx="18" fill="#e8f5f7" stroke="${palette.blue}" stroke-width="4"/>
  <rect x="385" y="205" width="190" height="120" rx="18" fill="#f2ecfb" stroke="${palette.purple}" stroke-width="4"/>
  <rect x="680" y="205" width="190" height="120" rx="18" fill="#fff4ce" stroke="#ba8c00" stroke-width="4"/>
  <text x="185" y="255" text-anchor="middle" class="label">x = 3</text><text x="185" y="292" text-anchor="middle" class="small">entrada</text>
  <text x="480" y="255" text-anchor="middle" class="label">g(x)=√(x+1)</text><text x="480" y="292" text-anchor="middle" class="small">primero g</text>
  <text x="775" y="255" text-anchor="middle" class="label">f(x)=2x+1</text><text x="775" y="292" text-anchor="middle" class="small">después f</text>
  <line x1="285" y1="265" x2="375" y2="265" stroke="${palette.coral}" stroke-width="5" marker-end="url(#arrow2)"/>
  <line x1="580" y1="265" x2="670" y2="265" stroke="${palette.coral}" stroke-width="5" marker-end="url(#arrow2)"/>
`, "La salida de g se utiliza como entrada de f.");

images.boxplot = boxPlotImage("diagramas-cajas");
images.vennQuestion = shapeImage("probabilidad-venn-pregunta", "Eventos A y B", `
  <circle cx="390" cy="310" r="155" fill="${palette.cyan}" fill-opacity="0.18" stroke="${palette.blue}" stroke-width="5"/>
  <circle cx="570" cy="310" r="155" fill="${palette.yellow}" fill-opacity="0.22" stroke="#ba8c00" stroke-width="5"/>
  <text x="315" y="180" class="label">A</text>
  <text x="635" y="180" class="label">B</text>
  <text x="480" y="492" text-anchor="middle" class="small">Espacio muestral</text>
`, "Identifica la unión, la intersección y el complemento antes de calcular.");
images.vennAnswer = vennImage("probabilidad-venn-solucion");
images.variation = tableImage("coeficiente-variacion", "Comparación de variabilidad", ["Grupo", "Media", "Desv. estándar"], [["X", "80", "8"], ["Y", "50", "7,5"]], { subtitle: "Compara la variabilidad en relación con el tamaño de la media." });

images.finalQuestion = coordinatePlane("reto-final", "Jardín circular y punto de tangencia", {
  xMin: -5, xMax: 10, yMin: -8, yMax: 8,
  circles: [{ x: 2, y: -1, r: 5 }],
  points: [{ x: 2, y: -1, label: "C(2, -1)" }, { x: 5, y: 3, label: "P(5, 3)", color: palette.green }],
  lines: [{ x1: 2, y1: -1, x2: 5, y2: 3, color: palette.coral }],
  annotation: "CP = 5"
});

images.finalAnswer = coordinatePlane("reto-final-solucion", "Recta tangente en P", {
  xMin: -5, xMax: 10, yMin: -8, yMax: 8,
  circles: [{ x: 2, y: -1, r: 5 }],
  points: [{ x: 2, y: -1, label: "C" }, { x: 5, y: 3, label: "P", color: palette.green }],
  lines: [
    { x1: 2, y1: -1, x2: 5, y2: 3, color: palette.coral },
    { x1: -1.5, y1: 7.875, x2: 10, y2: -0.75, color: palette.purple }
  ],
  annotation: "m_t = -3/4"
});

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="PNE Matemática 2026">
  <rect width="512" height="512" rx="112" fill="${palette.blue}"/>
  <path d="M 112 330 Q 256 42 400 330" fill="none" stroke="${palette.yellow}" stroke-width="44" stroke-linecap="round"/>
  <line x1="105" y1="374" x2="407" y2="374" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <text x="256" y="304" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="108" font-weight="800" fill="white">PNE</text>
  <text x="256" y="445" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="white">2026</text>
</svg>`;
images.logo = saveSvg("logo-pne-2026", logoSvg);

const game = {
  title: "La Gran Apuesta: PNE Matemática 2026",
  logoImage: images.logo,
  final: {
    category: "Reto final: Geometría analítica",
    question: "Un jardín circular tiene centro $C(2,-1)$ y pasa por $P(5,3)$. Determina la ecuación de la circunferencia y una ecuación de la recta tangente en $P$.",
    answer: "Circunferencia: $(x-2)^2+(y+1)^2=25$. Tangente: $y-3=-\\frac{3}{4}(x-5)$.",
    explanation: "El radio $\\overline{CP}$ tiene vector $(3,4)$, longitud $5$ y pendiente $\\frac{4}{3}$. La tangente es perpendicular, por lo que su pendiente es $-\\frac{3}{4}$ y pasa por $P(5,3)$.",
    questionImage: images.finalQuestion,
    answerImage: images.finalAnswer,
    explanationImage: images.finalAnswer
  },
  teams: [
    { id: "team-1", name: "Equipo Celeste", score: 0, color: "#1f88b5" },
    { id: "team-2", name: "Equipo Verde", score: 0, color: "#2ea66f" },
    { id: "team-3", name: "Equipo Coral", score: 0, color: "#ef8a62" }
  ],
  categories: [
    {
      title: "Números y medidas",
      clues: [
        clue(100,
          "Calcula $15+27$.",
          "$42$.",
          "Suma primero las unidades y luego las decenas.",
          "$15+27=(10+20)+(5+7)=30+12=42$."),
        clue(200,
          "Expresa $\\frac{3}{4}$ como número decimal y como porcentaje.",
          "$\\frac{3}{4}=0{,}75=75\\%$.",
          "Divide $3$ entre $4$ y multiplica el decimal por $100$.",
          "$3\\div4=0{,}75$. Luego, $0{,}75\\times100=75$, por lo que corresponde a $75\\%$."),
        clue(300,
          "Calcula el $20\\%$ de $150$.",
          "$30$.",
          "El $20\\%$ equivale a $0{,}20$.",
          "$150\\times0{,}20=30$. También puede calcularse como la quinta parte de $150$."),
        clue(400,
          "Convierte $2{,}5$ km a metros.",
          "$2500$ m.",
          "Un kilómetro equivale a $1000$ metros.",
          "$2{,}5\\times1000=2500$. Por tanto, $2{,}5$ km equivalen a $2500$ m."),
        clue(500,
          "Calcula $\\sqrt{81}+2^3$.",
          "$17$.",
          "Resuelve por separado la raíz y la potencia.",
          "$\\sqrt{81}=9$ y $2^3=8$. Entonces, $9+8=17$."),
      ]
    },
    {
      title: "Circunferencia",
      clues: [
        clue(100,
          "La circunferencia mostrada tiene centro $C(-2,3)$ y radio $2$. Escribe su ecuación.",
          "$(x+2)^2+(y-3)^2=4$.",
          "Usa $(x-h)^2+(y-k)^2=r^2$ y cuida los signos del centro.",
          "Con $h=-2$, $k=3$ y $r=2$: $(x-(-2))^2+(y-3)^2=2^2$, es decir, $(x+2)^2+(y-3)^2=4$.",
          { questionImage: images.circleBasic, explanationImage: images.circleBasic }),
        clue(200,
          "Para $(x-4)^2+(y+1)^2=25$, indica el centro y la medida del radio.",
          "Centro $(4,-1)$ y radio $5$.",
          "Compara con $(x-h)^2+(y-k)^2=r^2$.",
          "El término $y+1$ es $y-(-1)$, por eso $k=-1$. Además, $r^2=25$, de modo que $r=5$.",
          { questionImage: images.circleEquation, explanationImage: images.circleEquation }),
        clue(300,
          "La circunferencia $(x-1)^2+(y+2)^2=9$ se traslada $4$ unidades a la izquierda y $5$ hacia arriba. ¿Cuál es la nueva ecuación?",
          "$(x+3)^2+(y-3)^2=9$.",
          "Traslada el centro $(1,-2)$; el radio no cambia.",
          "El nuevo centro es $(1-4,-2+5)=(-3,3)$ y el radio sigue siendo $3$. Por eso la ecuación es $(x+3)^2+(y-3)^2=9$.",
          { questionImage: images.circleTranslation, explanationImage: images.circleTranslation }),
        clue(400,
          "La circunferencia tiene centro $C(1,1)$ y radio $3$. Clasifica el punto $P(5,1)$ como interior, exterior o perteneciente a la circunferencia.",
          "$P$ es exterior.",
          "Compara la distancia $CP$ con el radio.",
          "$CP=\\sqrt{(5-1)^2+(1-1)^2}=4$. Como $4>3$, el punto está fuera de la circunferencia.",
          { questionImage: images.pointCircle, explanationImage: images.pointCircle }),
        clue(500,
          "Una circunferencia tiene centro $C(2,-1)$ y radio $4$. En el punto $Q(6,-1)$ se traza una tangente. ¿Cuál es la ecuación de esa recta?",
          "$x=6$.",
          "El radio $CQ$ es horizontal; la tangente debe ser perpendicular.",
          "El segmento $CQ$ está sobre $y=-1$, por lo que es horizontal. La recta perpendicular que pasa por $Q(6,-1)$ es vertical: $x=6$.",
          { questionImage: images.tangent, explanationImage: images.tangent }),
      ]
    },
    {
      title: "Geometría",
      clues: [
        clue(100,
          "Un rectángulo mide $8$ m de largo y $5$ m de ancho. ¿Cuál es su perímetro?",
          "$26$ m.",
          "Suma dos largos y dos anchos.",
          "$P=2(8)+2(5)=16+10=26$ m."),
        clue(200,
          "A un rectángulo de $10$ m por $6$ m se le retira una esquina rectangular de $4$ m por $2$ m. ¿Cuál es el área restante?",
          "$52$ m$^2$.",
          "Calcula el área grande y resta el área retirada.",
          "$10\\times6-4\\times2=60-8=52$ m$^2$.",
          { questionImage: images.composite, explanationImage: images.composite }),
        clue(300,
          "Un cilindro recto tiene radio $3$ cm y altura $8$ cm. Un plano vertical que pasa por su eje produce una sección rectangular. ¿Cuál es el área de esa sección?",
          "$48$ cm$^2$.",
          "La base del rectángulo es el diámetro del cilindro.",
          "El diámetro es $2r=6$ cm y la altura es $8$ cm. Por tanto, el área de la sección es $6\\times8=48$ cm$^2$.",
          { questionImage: images.cylinder, explanationImage: images.cylinder }),
        clue(400,
          "Refleja el punto $A(-3,2)$ respecto a la recta $y=x$.",
          "$A'(2,-3)$.",
          "Al reflejar respecto a $y=x$, se intercambian las coordenadas.",
          "La regla es $(x,y)\\mapsto(y,x)$. Así, $(-3,2)\\mapsto(2,-3)$.",
          { questionImage: images.reflectionQuestion, explanationImage: images.reflectionAnswer }),
        clue(500,
          "Aplica al triángulo $A(1,1)$, $B(4,1)$, $C(1,3)$ una homotecia de centro en el origen y razón $k=-2$.",
          "$A'(-2,-2)$, $B'(-8,-2)$ y $C'(-2,-6)$.",
          "Multiplica cada coordenada por $-2$.",
          "En una homotecia centrada en el origen, $(x,y)\\mapsto(kx,ky)$. El signo negativo coloca la imagen al lado opuesto y el factor $2$ duplica las distancias.",
          { questionImage: images.homothetyQuestion, explanationImage: images.homothetyAnswer }),
      ]
    },
    {
      title: "Funciones",
      clues: [
        clue(100,
          "Según el diagrama, ¿la relación representada es una función? Justifica.",
          "Sí. Cada elemento del dominio tiene exactamente una salida.",
          "Revisa cuántas flechas salen de cada valor del dominio.",
          "Aunque $-2$ y $0$ tienen la misma imagen, esto sí se permite. Lo importante es que de cada entrada salga una sola flecha.",
          { questionImage: images.mapping, explanationImage: images.mapping }),
        clue(200,
          "Una recta pasa por $(2,5)$ y $(6,13)$. Determina su pendiente y su ecuación.",
          "Pendiente $m=2$; ecuación $y=2x+1$.",
          "Calcula $m=\\frac{13-5}{6-2}$ y luego usa uno de los puntos.",
          "$m=\\frac{8}{4}=2$. En $y=mx+b$, al usar $(2,5)$: $5=2(2)+b$, de donde $b=1$.",
          { questionImage: images.line, explanationImage: images.line }),
        clue(300,
          "Para $f(x)=-(x-3)^2+4$, indica el valor máximo y los ceros.",
          "Máximo $4$ en $x=3$; ceros $x=1$ y $x=5$.",
          "La forma de vértice permite leer el máximo. Para los ceros, iguala $f(x)$ a $0$.",
          "El vértice es $(3,4)$ y la parábola abre hacia abajo. Al resolver $-(x-3)^2+4=0$, se obtiene $(x-3)^2=4$, por lo que $x=1$ o $x=5$.",
          { questionImage: images.quadraticQuestion, explanationImage: images.quadraticAnswer }),
        clue(400,
          "Resuelve el sistema $y=2x+1$ y $y=-x+7$.",
          "$(x,y)=(2,5)$.",
          "Iguala las dos expresiones de $y$.",
          "$2x+1=-x+7$ implica $3x=6$, así que $x=2$. Al sustituir, $y=2(2)+1=5$. Gráficamente, es el punto de intersección.",
          { questionImage: images.systemQuestion, explanationImage: images.systemAnswer }),
        clue(500,
          "Determina la inversa de $f(x)=3x-6$.",
          "$f^{-1}(x)=\\frac{x+6}{3}$.",
          "Escribe $y=3x-6$, intercambia $x$ y $y$, y despeja $y$.",
          "Después de intercambiar: $x=3y-6$. Entonces $x+6=3y$ y $y=\\frac{x+6}{3}$. Las gráficas de $f$ y $f^{-1}$ son simétricas respecto a $y=x$.",
          { questionImage: images.inverse, explanationImage: images.inverse }),
      ]
    },
    {
      title: "Álgebra y modelos",
      clues: [
        clue(100,
          "La tabla muestra una relación entre $t$ y $y$. Determina el modelo algebraico.",
          "$y=3t+4$.",
          "Las diferencias de $y$ son constantes.",
          "Cada vez que $t$ aumenta $1$, $y$ aumenta $3$, así que la pendiente es $3$. Cuando $t=0$, $y=4$, por lo que el modelo es $y=3t+4$.",
          { questionImage: images.linearTable, explanationImage: images.linearTable }),
        clue(200,
          "La población de la tabla aumenta con un patrón constante. Identifica el tipo de modelo y calcula $P(4)$.",
          "Modelo exponencial; $P(t)=80(1{,}5)^t$ y $P(4)=405$.",
          "Divide cada valor entre el anterior.",
          "Los cocientes son $120/80=180/120=270/180=1{,}5$. El factor constante indica crecimiento exponencial. Luego, $270\\times1{,}5=405$.",
          { questionImage: images.exponentialTable, explanationImage: images.exponentialTable }),
        clue(300,
          "Para $d(t)=2\\sqrt{t-1}+3$, indica el dominio y el valor inicial de la función.",
          "Dominio $t\\ge1$ y valor inicial $d(1)=3$.",
          "El radicando debe ser no negativo.",
          "$t-1\\ge0$ implica $t\\ge1$. En el extremo del dominio, $d(1)=2\\sqrt0+3=3$.",
          { questionImage: images.sqrtQuestion, explanationImage: images.sqrtAnswer }),
        clue(400,
          "Sean $f(x)=2x+1$ y $g(x)=\\sqrt{x+1}$. Calcula $(f\\circ g)(3)$.",
          "$(f\\circ g)(3)=5$.",
          "Primero calcula $g(3)$ y usa ese resultado como entrada de $f$.",
          "$g(3)=\\sqrt{4}=2$. Luego, $f(2)=2(2)+1=5$.",
          { questionImage: images.compositionQuestion, explanationImage: images.compositionAnswer }),
        clue(500,
          "Resuelve $\\log_3(x)+\\log_3(x-2)=1$.",
          "$x=3$.",
          "Combina los logaritmos y recuerda que $x>2$.",
          "$\\log_3(x(x-2))=1$ implica $x(x-2)=3$. Entonces $x^2-2x-3=0$, es decir, $(x-3)(x+1)=0$. Solo $x=3$ cumple el dominio $x>2$."),
      ]
    },
    {
      title: "Estadística y azar",
      clues: [
        clue(100,
          "Para los datos $4,5,5,7,9$, determina la mediana, la moda y el recorrido.",
          "Mediana $5$, moda $5$ y recorrido $5$.",
          "Los datos ya están ordenados; el recorrido es máximo menos mínimo.",
          "El valor central es $5$, el valor que más se repite es $5$ y $9-4=5$."),
        clue(200,
          "Una calificación se compone de $30\\%$ de tareas ($70$), $30\\%$ de proyecto ($85$) y $40\\%$ de prueba ($90$). Calcula la nota ponderada.",
          "$82{,}5$.",
          "Multiplica cada nota por su peso decimal y suma.",
          "$70(0{,}30)+85(0{,}30)+90(0{,}40)=21+25{,}5+36=82{,}5$."),
        clue(300,
          "En el diagrama, $P(A)=0{,}55$, $P(B)=0{,}40$ y $P(A\\cap B)=0{,}20$. Calcula $P(A\\cup B)$ y $P(A^c)$.",
          "$P(A\\cup B)=0{,}75$ y $P(A^c)=0{,}45$.",
          "En la unión, resta una vez la intersección; para el complemento, resta de $1$.",
          "$P(A\\cup B)=0{,}55+0{,}40-0{,}20=0{,}75$. Además, $P(A^c)=1-0{,}55=0{,}45$.",
          { questionImage: images.vennQuestion, explanationImage: images.vennAnswer }),
        clue(400,
          "Observa los diagramas de cajas. ¿Cuál grupo tiene mayor mediana y cuál tiene mayor recorrido intercuartílico?",
          "El grupo A tiene mayor mediana y el grupo B tiene mayor recorrido intercuartílico.",
          "La mediana es la línea dentro de la caja; el RIC es el ancho de la caja.",
          "En A, la mediana es $7$ y el RIC es $8-4=4$. En B, la mediana es $5$ y el RIC es $8-2=6$. Por eso A tiene mayor mediana, mientras que B tiene mayor dispersión central.",
          { questionImage: images.boxplot, explanationImage: images.boxplot }),
        clue(500,
          "El grupo X tiene media $80$ y desviación estándar $8$; el grupo Y tiene media $50$ y desviación estándar $7{,}5$. ¿Cuál presenta mayor variabilidad relativa?",
          "El grupo Y.",
          "Compara los coeficientes de variación $CV=\\frac{s}{\\bar{x}}\\times100\\%$.",
          "Para X, $CV=\\frac8{80}\\times100\\%=10\\%$. Para Y, $CV=\\frac{7{,}5}{50}\\times100\\%=15\\%$. Por eso Y tiene mayor variabilidad relativa.",
          { questionImage: images.variation, explanationImage: images.variation }),
      ]
    }
  ]
};

const outputPath = path.join(OUTPUT_DIR, "jeopardy-pne-matematica-2026.json");
fs.writeFileSync(outputPath, `${JSON.stringify(game, null, 2)}\n`, "utf8");

const summary = {
  output: outputPath,
  categories: game.categories.length,
  clues: game.categories.reduce((total, category) => total + category.clues.length, 0),
  images: fs.readdirSync(ASSET_DIR).filter((filename) => filename.endsWith(".svg")).length,
  bytes: fs.statSync(outputPath).size
};

console.log(JSON.stringify(summary, null, 2));
