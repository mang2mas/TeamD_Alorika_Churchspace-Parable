// Round-robin keeps reading order left-to-right, so new posts land on the top row.
export function toColumns<T>(items: readonly T[], n: number): T[][] {
  const cols = Array.from({ length: n }, (): T[] => [])
  items.forEach((it, i) => cols[i % n]?.push(it))
  return cols
}
