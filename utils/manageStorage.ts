import NativeLocalStorage from "../specs/NativeLocalStorage";
const EMPTY = "<empty>";

export function getValue(key: string) {
  const value = NativeLocalStorage?.getItem(key);
  return value === EMPTY ? null : value;
}

export function saveValue(value: string | null, key: string) {
  NativeLocalStorage?.setItem(value ?? EMPTY, key);
}

export function clearAll() {
  NativeLocalStorage?.clear();
}

export function deleteValue(value: string | null) {
  NativeLocalStorage?.removeItem(value ?? EMPTY);
}
