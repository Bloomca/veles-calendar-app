export function pickRandomElement<T>(arr: T[]): T {
  const newIndex = Math.floor(Math.random() * arr.length);
  return arr[newIndex];
}
