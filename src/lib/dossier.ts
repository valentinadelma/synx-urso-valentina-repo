/* ------------------------------------------------------------------
 * Planilha de Investigação — cada dado coletado nas buscas é
 * normalizado em linhas e guardado localmente para consulta/export.
 * ------------------------------------------------------------------ */

export const DOSSIER_KEY = "synx_dossier";
export const DOSSIER_EVENT = "synx:dossier";

export interface DossierRow {
  id: string;
  ts: number;
  module: string;
  tool: string;
  target: string;
  category: string;
  field: string;
  value: string;
}

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DOSSIER_EVENT));
  }
}

export function readDossier(): DossierRow[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(DOSSIER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DossierRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(rows: DossierRow[]) {
  localStorage.setItem(DOSSIER_KEY, JSON.stringify(rows.slice(0, 5000)));
  emit();
}

export function clearDossier() {
  persist([]);
}

export function removeRows(ids: string[]) {
  const set = new Set(ids);
  persist(readDossier().filter((r) => !set.has(r.id)));
}

export function removeTarget(target: string) {
  persist(readDossier().filter((r) => r.target !== target));
}

const SKIP_KEYS = new Set(["password_hash", "token", "apikey", "api_key"]);

function label(key: string) {
  return key
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Achata um objeto JSON arbitrário em pares campo/valor legíveis. */
function flatten(
  value: unknown,
  path: string[],
  out: { field: string; value: string; category: string }[],
  depth = 0,
) {
  if (value === null || value === undefined || value === "") return;
  if (depth > 5 || out.length > 400) return;

  const category = label(path[0] ?? "geral") || "geral";

  if (Array.isArray(value)) {
    value.forEach((item, i) => flatten(item, [...path, String(i + 1)], out, depth + 1));
    return;
  }

  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SKIP_KEYS.has(k.toLowerCase())) continue;
      flatten(v, [...path, k], out, depth + 1);
    }
    return;
  }

  out.push({
    category,
    field: path.map(label).join(" › "),
    value: String(value),
  });
}

export function collect(input: {
  module: string;
  tool: string;
  target: string;
  data: unknown;
}): number {
  const flat: { field: string; value: string; category: string }[] = [];
  flatten(input.data, [], flat);
  if (!flat.length) return 0;

  const ts = Date.now();
  const existing = readDossier();
  const seen = new Set(
    existing.map((r) => `${r.target}|${r.field}|${r.value}`),
  );

  const fresh: DossierRow[] = [];
  flat.forEach((f, i) => {
    const key = `${input.target}|${f.field}|${f.value}`;
    if (seen.has(key)) return;
    seen.add(key);
    fresh.push({
      id: `${ts}-${i}`,
      ts,
      module: input.module,
      tool: input.tool,
      target: input.target,
      category: f.category,
      field: f.field,
      value: f.value,
    });
  });

  if (fresh.length) persist([...fresh, ...existing]);
  return fresh.length;
}

export function toCSV(rows: DossierRow[]): string {
  const head = ["Data", "Módulo", "Ferramenta", "Alvo", "Categoria", "Campo", "Valor"];
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const body = rows.map((r) =>
    [
      new Date(r.ts).toLocaleString("pt-BR"),
      r.module,
      r.tool,
      r.target,
      r.category,
      r.field,
      r.value,
    ]
      .map(esc)
      .join(";"),
  );
  return "\uFEFF" + [head.map(esc).join(";"), ...body].join("\n");
}
