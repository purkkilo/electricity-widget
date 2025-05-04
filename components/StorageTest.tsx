import { useEffect, useState } from "react";
import { StyleSheet, TextInput, Button, Appearance } from "react-native";

import {
  saveValue,
  clearAll,
  deleteValue,
  getValue,
} from "@/utils/manageStorage";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function StorageTest() {
  const [value, setValue] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const key = "myKey";
  const [textInputStyle, setTextInputStyle] = useState(styles.lightTextInput);
  useEffect(() => {
    fetchStoredValue(key);
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTextInputStyle(
        colorScheme === "dark" ? styles.darkTextInput : styles.lightTextInput
      );
    });
    return () => {
      subscription.remove();
    };
  }, []);

  async function fetchStoredValue(key: string) {
    const storedValue = await getValue(key);
    setValue(storedValue ?? "");
  }

  function save() {
    if (editingValue !== null) {
      saveValue(editingValue, key);
    }
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
    <ThemedView>
      <ThemedText type="default" style={styles.text}>
        Current stored value is: {value ?? "No Value"}
      </ThemedText>
      <TextInput
        placeholder="Enter the text you want to store"
        style={textInputStyle}
        onChangeText={setEditingValue}
      />
      <Button title="Save" onPress={save} />
      <Button title="Delete" onPress={remove} />
      <Button title="Clear" onPress={clear} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  text: {
    margin: 10,
    fontSize: 20,
  },
  lightTextInput: {
    color: "black",
    backgroundColor: "white",
    margin: 10,
    height: 40,
    borderWidth: 1,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
  },
  darkTextInput: {
    color: "white",
    backgroundColor: "black",
    margin: 10,
    height: 40,
    borderWidth: 1,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
  },
});
