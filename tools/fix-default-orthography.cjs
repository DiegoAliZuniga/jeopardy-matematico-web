const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const originalPath = path.join(root, "jeopardy-matematico-default-respaldo-original.json");
const backupPath = path.join(root, "jeopardy-matematico-default-respaldo.json");
const defaultGamePath = path.join(root, "public", "default-game.js");

const replacements = [
  ["Jeopardy Matematico", "Jeopardy Matemático"],
  ["Numeros naturales", "Números naturales"],
  ["Numeros enteros", "Números enteros"],
  ["Va justo despues.", "Va justo después."],
  ["Cuantos divisores tiene $12$?", "¿Cuántos divisores tiene $12$?"],
  ["los numeros", "los números"],
  ["El minimo comun multiplo", "El mínimo común múltiplo"],
  ["primer multiplo", "primer múltiplo"],
  ["Multiples", "Múltiplos"],
  ["comun es", "común es"],
  ["denominador comun", "denominador común"],
  ["Convierte $1.25$ a fraccion simplificada.", "Convierte $1.25$ a fracción simplificada."],
  ["Algebra", "Álgebra"],
  ["factor comun", "factor común"],
  ["Ambos terminos", "Ambos términos"],
  ["Areas", "Áreas"],
  ["Area de un rectangulo", "Área de un rectángulo"],
  ["Formula del area de un triangulo.", "Fórmula del área de un triángulo."],
  ["mitad de un rectangulo", "mitad de un rectángulo"],
  ["Un triangulo", "Un triángulo"],
  ["del rectangulo", "del rectángulo"],
  ["Area de un circulo", "Área de un círculo"],
  ["La formula del area", "La fórmula del área"],
  ["Area de un trapecio", "Área de un trapecio"],
  ["tiene area", "tiene área"],
  ["Cual es su lado?", "¿Cuál es su lado?"],
  ["raiz cuadrada del area", "raíz cuadrada del área"],
  ["Que numero primo es par?", "¿Qué número primo es par?"],
  ["el unico primo par", "el único primo par"],
  ["Si una razon", "Si una razón"],
  ["La razon", "La razón"],
  ["Mas a la izquierda", "Más a la izquierda"],
  ["recta numerica", "recta numérica"],
  ["esta mas", "está más"],
  ["despues", "después"],
];

function fixText(value) {
  if (typeof value !== "string" || value.startsWith("data:image")) return value;
  return replacements.reduce((text, [from, to]) => text.split(from).join(to), value);
}

function fixValue(value) {
  if (Array.isArray(value)) return value.map(fixValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fixValue(item)]));
  }
  return fixText(value);
}

const game = JSON.parse(fs.readFileSync(originalPath, "utf8"));
const fixed = fixValue(game);
const json = `${JSON.stringify(fixed, null, 2)}\n`;

fs.writeFileSync(backupPath, json, "utf8");
fs.writeFileSync(defaultGamePath, `window.DEFAULT_GAME = ${json.trim()};\n`, "utf8");

const clueValues = fixed.categories.flatMap((category) => category.clues.map((clue) => clue.value));
const teamScores = fixed.teams.map((team) => team.score);
console.log(JSON.stringify({
  title: fixed.title,
  categories: fixed.categories.map((category) => category.title),
  firstValue: clueValues[0],
  firstValueType: typeof clueValues[0],
  firstAnsweredType: typeof fixed.categories[0].clues[0].answered,
  firstScore: teamScores[0],
  firstScoreType: typeof teamScores[0],
}, null, 2));
