import AsyncStorage from "@react-native-async-storage/async-storage";
import { DateTime } from "luxon";

export interface Price {
  time_start: string;
  time_end: string;
  EUR_per_kWh: number;
}

export interface PriceStorage {
  start: string;
  end: string;
  prices: Price[];
}

export const getLimits = async () => {
  return await getMultiple(["mLimit", "hLimit"]);
};

export const savePrices = async (
  date: DateTime,
  prices: Price[],
  key: string
) => {
  try {
    const storageData = {
      start: date.toISODate(),
      end: date.plus({ days: 1 }).toISODate(),
      prices: prices,
    };
    saveValue(key, JSON.stringify(storageData));
  } catch (e) {
    console.error(e);
  }
};

export const getValue = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
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
    console.error(e);
    return null;
  }
};

export const saveValue = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value ? value : "<empty>");
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
    console.error(e);
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error(e);
  }
};

export const deleteValue = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(e);
  }
};

export const deleteMultiple = async (keys: string[]) => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (e) {
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
      console.error(e);
    });

  return keys;
  // ['@MyApp_user', '@MyApp_key']
};
