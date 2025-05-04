import AsyncStorage from "@react-native-async-storage/async-storage";
const EMPTY = "<empty>";

export const getValue = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return EMPTY;

    return value;
  } catch (e) {
    // error reading value
    console.error(e);
    return null;
  }
};

export const saveValue = async (value: string, key: string) => {
  try {
    await AsyncStorage.setItem(key, value ? value : EMPTY);
  } catch (e) {
    // saving error
    console.error(e);
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    // clear error
    console.error(e);
  }

  console.log("clearAll Done.");
};

export const deleteValue = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    // remove error
    console.error(e);
  }

  console.log("deleteValue Done.");
};

export const getAllKeys = async () => {
  let keys: readonly string[] = [];
  await AsyncStorage.getAllKeys()
    .then((k) => {
      keys = k;
    })
    .catch((e) => {
      // error getting keys
      console.error(e);
    })
    .finally(() => {
      console.log("getAllKeys Done.");
      console.log(keys);
    });
  // example console.log result:
  // ['@MyApp_user', '@MyApp_key']
};
