export type DatasetFormat = "json" | "csv" | "ndjson" | "unknown";
export type FieldStatus = "recognized" | "mapped" | "unavailable";

export interface DatasetField {
  sourceName: string;
  canonicalName?: string;
  status: FieldStatus;
  confidence: number;
  sample?: string;
}

export interface DatasetReport {
  fileName: string;
  format: DatasetFormat;
  rowCount: number;
  recognizedEvents: number;
  unsupportedEvents: number;
  readiness: number;
  fields: DatasetField[];
  missingFields: string[];
  warnings: string[];
}
