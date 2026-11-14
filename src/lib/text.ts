export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalize(s: string): string {
  return fold(s.replace(/\(.*?\)|\[.*?\]/g, " "));
}
