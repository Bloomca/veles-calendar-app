export function pickRandomElement<T>(arr: T[]): T {
  const newIndex = Math.floor(Math.random() * arr.length);
  return arr[newIndex];
}

export function pickRandomElements<T>(arr: T[], amount: number): T[] {
  if (amount <= 0 || arr.length === 0) {
    return [];
  }

  const mutableValues = [...arr];
  const result: T[] = [];
  let valuesToPick = amount;

  while (valuesToPick > 0 && mutableValues.length > 0) {
    const newIndex = Math.floor(Math.random() * mutableValues.length);
    result.push(mutableValues[newIndex]);
    mutableValues.splice(newIndex, 1);
    valuesToPick = valuesToPick - 1;
  }

  return result;
}
