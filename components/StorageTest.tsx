import { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Button,
} from "react-native";

import {
  saveValue,
  clearAll,
  deleteValue,
  getValue,
} from "@/utils/manageStorage";

export default function StorageTest() {
  const [value, setValue] = useState<string | null>(null);

  const [editingValue, setEditingValue] = useState<string | null>(null);
  const key = "myKey";
  useEffect(() => {
    const storedValue = getValue(key);
    setValue(storedValue ?? "");
  }, []);

  function save() {
    saveValue(editingValue, key);
    setValue(editingValue);
  }

  function clear() {
    clearAll();
    setValue("");
  }

  function remove() {
    deleteValue(key);
    setValue("");
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.text}>
        Current stored value is: {value ?? "No Value"}
      </Text>
      <TextInput
        placeholder="Enter the text you want to store"
        style={styles.textInput}
        onChangeText={setEditingValue}
      />
      <Button title="Save" onPress={save} />
      <Button title="Delete" onPress={remove} />
      <Button title="Clear" onPress={clear} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  text: {
    margin: 10,
    fontSize: 20,
  },
  textInput: {
    margin: 10,
    height: 40,
    borderColor: "black",
    borderWidth: 1,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
  },
});
