
//import NativeLocalStorage from "../specs/NativeLocalStorage"
import {Platform} from "react-native";
const EMPTY = "<empty>";

const NativeLocalStorage = Platform.OS == "android" ? require("../specs/NativeLocalStorage") : undefined;

// Mimic localstorage for now (only used in widget in android app)
// So I can develop on my linux laptop
const LocalStorage = {
  getItem: (i) => {console.log("getItem", i)},
  setItem: (v,k) => {console.log("setItem", v,k)},
  clear: () => {console.log("Clearing storage")},
  delete: (v) => {console.log("delete", v)},
}


export function getValue(key: string) {
  console.log(Platform.OS);
  const value = Platform.OS == "android" ? NativeLocalStorage?.getItem(key) : LocalStorage.getItem(key);
  return value === EMPTY ? null : value;
}

export function saveValue(value: string | null, key: string) {
  Platform.OS == "android" ? NativeLocalStorage?.setItem(value ?? EMPTY, key) : LocalStorage.setItem(value, key);
}

export function clearAll() {
  Platform.OS == "android" ? NativeLocalStorage?.clear() : LocalStorage.clear();
}

export function deleteValue(value: string | null) {
  Platform.OS == "android" ? NativeLocalStorage?.removeItem(value ?? EMPTY): LocalStorage.delete(value);
}
