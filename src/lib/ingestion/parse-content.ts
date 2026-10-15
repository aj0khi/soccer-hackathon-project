export type DataRow = Record<string, unknown>;
export type ParsedDatasetFormat = "json" | "csv" | "ndjson" | "unknown";

function parseCsvLine(line: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];
    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }
  values.push(value.trim());
  return values;
}

export function parseCsv(content: string): DataRow[] {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

export function parseContent(content: string, fileName: string): { format: ParsedDatasetFormat; rows: DataRow[] } {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "csv") return { format: "csv", rows: parseCsv(content) };
  if (extension === "ndjson" || extension === "jsonl") {
    return { format: "ndjson", rows: content.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)) };
  }
  try {
    const value = JSON.parse(content);
    const rows = Array.isArray(value) ? value : value.events ?? [value];
    return { format: "json", rows: rows as DataRow[] };
  } catch {
    return { format: "unknown", rows: [] };
  }
}
