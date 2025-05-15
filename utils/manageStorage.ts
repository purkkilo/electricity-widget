import AsyncStorage from "@react-native-async-storage/async-storage";
const EMPTY = "<empty>";

export const getLimits = async () => {
  return await getMultiple(["mLimit", "hLimit"]);
};

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

export const getMultiple = async (keys: string[]) => {
  let values;
  try {
    values = await AsyncStorage.multiGet(keys);
    return values ? values : [];
  } catch (e) {
    // error reading values
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

export const saveMultiple = async (items: [string, string][]) => {
  try {
    /*
      items = [
                ["@MyApp_user", "value_1"],
                ["@MyApp_key", "value_2"]
              ]
    */
    console.log("Saving multiple items:", items);

    await AsyncStorage.multiSet(items);
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
};

export const deleteValue = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    // remove error
    console.error(e);
  }
};

export const deleteMultiple = async (keys: string[]) => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (e) {
    // remove error
    console.error(e);
  }
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
    });

  return keys;
  // example console.log result:
  // ['@MyApp_user', '@MyApp_key']
};
