
export type CellData = {
  value: string;
  computedValue?: string | number;
};

export type SpreadsheetData = Record<string, CellData>;

const COL_REGEX = /^[A-Z]+$/;
const CELL_REF_REGEX = /\b([A-Z]+)(\d+)\b/g;
const RANGE_REGEX = /([A-Z]+)(\d+):([A-Z]+)(\d+)/g;

export function colToIndex(col: string): number {
  let idx = 0;
  for (let i = 0; i < col.length; i++) {
    idx = idx * 26 + (col.charCodeAt(i) - 64);
  }
  return idx - 1;
}

export function indexToCol(idx: number): string {
  let col = "";
  idx += 1;
  while (idx > 0) {
    const rem = (idx - 1) % 26;
    col = String.fromCharCode(65 + rem) + col;
    idx = Math.floor((idx - 1) / 26);
  }
  return col;
}

export function cellKey(col: number, row: number): string {
  return `${indexToCol(col)}${row + 1}`;
}

function expandRange(startCol: string, startRow: number, endCol: string, endRow: number): string[] {
  const cells: string[] = [];
  const sc = colToIndex(startCol);
  const ec = colToIndex(endCol);
  for (let r = startRow; r <= endRow; r++) {
    for (let c = sc; c <= ec; c++) {
      cells.push(`${indexToCol(c)}${r}`);
    }
  }
  return cells;
}

function getNumericValue(data: SpreadsheetData, key: string): number {
  const cell = data[key];
  if (!cell) return 0;
  const v = cell.computedValue ?? cell.value;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

export function evaluateFormula(formula: string, data: SpreadsheetData, visited: Set<string> = new Set()): string | number {
  if (!formula.startsWith("=")) return formula;

  let expr = formula.slice(1).trim().toUpperCase();

  // Handle SUM, AVG, MIN, MAX, COUNT
  const fnMatch = expr.match(/^(SUM|AVERAGE|MIN|MAX|COUNT)\((.+)\)$/);
  if (fnMatch) {
    const fn = fnMatch[1];
    const arg = fnMatch[2];
    const rangeMatch = arg.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    if (!rangeMatch) return "#ERROR";
    const cells = expandRange(rangeMatch[1], parseInt(rangeMatch[2]), rangeMatch[3], parseInt(rangeMatch[4]));
    const values = cells.map((k) => getNumericValue(data, k));
    switch (fn) {
      case "SUM": return values.reduce((a, b) => a + b, 0);
      case "AVERAGE": return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case "MIN": return Math.min(...values);
      case "MAX": return Math.max(...values);
      case "COUNT": return values.filter((v) => v !== 0).length;
    }
  }

  // Replace cell references with values
  expr = expr.replace(CELL_REF_REGEX, (match) => {
    if (visited.has(match)) return "0"; // circular ref
    const cell = data[match];
    if (!cell) return "0";
    if (cell.value.startsWith("=")) {
      visited.add(match);
      const result = evaluateFormula(cell.value, data, visited);
      return String(result);
    }
    const n = Number(cell.value);
    return isNaN(n) ? "0" : String(n);
  });

  try {
    // Safe eval using Function constructor with only math
    const result = new Function(`"use strict"; return (${expr})`)();
    if (typeof result === "number" && !isNaN(result)) {
      return Math.round(result * 1000000) / 1000000;
    }
    return "#ERROR";
  } catch {
    return "#ERROR";
  }
}

export function computeAll(data: SpreadsheetData): SpreadsheetData {
  const result: SpreadsheetData = {};
  for (const key of Object.keys(data)) {
    const cell = data[key];
    result[key] = {
      ...cell,
      computedValue: cell.value.startsWith("=")
        ? evaluateFormula(cell.value, result, new Set([key]))
        : cell.value,
    };
  }
  return result;
}
