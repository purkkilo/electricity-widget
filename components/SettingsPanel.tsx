import { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  TextInput,
  Button,
  Appearance,
  ToastAndroid,
} from "react-native";

import { saveMultiple, getMultiple } from "@/utils/manageStorage";

import { DefaultValues } from "@/constants/DefaultValues";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function SettingsPanel() {
  const [mLimit, setMLimit] = useState<string>("10");
  const [hLimit, setHLimit] = useState<string>("20");
  const [editingMLimit, setEditingMLimit] = useState("");
  const [editingHLimit, setEditingHLimit] = useState("");
  const keys = ["mLimit", "hLimit"];
  const [textInputStyle, setTextInputStyle] = useState(styles.lightTextInput);
  const tInput = useRef<TextInput>(null);
  const tInput2 = useRef<TextInput>(null);

  useEffect(() => {
    fetchStoredValues(keys);
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTextInputStyle(
        colorScheme === "dark" ? styles.darkTextInput : styles.lightTextInput
      );
    });
    return () => {
      subscription.remove();
    };
  }, []);

  async function fetchStoredValues(keys: string[]) {
    const storedItems = await getMultiple(keys);

    if (storedItems) {
      setMLimit(storedItems[0][1] ? storedItems[0][1] : DefaultValues.MLIMIT);
      setHLimit(storedItems[1][1] ? storedItems[1][1] : DefaultValues.HLIMIT);
      setEditingMLimit(mLimit);
      setEditingHLimit(hLimit);
    }
  }

  async function save() {
    console.log("mLimit:", editingMLimit);
    console.log("hLimit:", editingHLimit);
    if (!editingMLimit || !editingHLimit) {
      ToastAndroid.show(
        "Please enter positive values for both limits.",
        ToastAndroid.SHORT
      );
      return;
    }
    if (parseInt(editingHLimit) <= parseInt(editingMLimit)) {
      ToastAndroid.show(
        "High limit must be greater than medium limit.",
        ToastAndroid.SHORT
      );
      return;
    }
    if (parseInt(editingHLimit) <= 0 || parseInt(editingMLimit) <= 0) {
      ToastAndroid.show(
        "Please enter positive values for both limits.",
        ToastAndroid.SHORT
      );
      return;
    }

    await saveMultiple([
      ["mLimit", editingMLimit],
      ["hLimit", editingHLimit],
    ])
      .then(() => {
        setMLimit(editingMLimit);
        setHLimit(editingHLimit);
        clearInputs();
        ToastAndroid.show("Values saved successfully", ToastAndroid.SHORT);
      })
      .catch((error) => {
        console.error("Error saving values:", error);
      });
  }

  async function resetToDefault() {
    if (
      editingMLimit !== "" &&
      editingHLimit !== "" &&
      (editingHLimit !== hLimit || editingMLimit !== mLimit)
    ) {
      await saveMultiple([
        ["mLimit", DefaultValues.MLIMIT],
        ["hLimit", DefaultValues.HLIMIT],
      ])
        .then(() => {
          clearInputs();
          ToastAndroid.show("Default values reset.", ToastAndroid.SHORT);
          setHLimit(DefaultValues.HLIMIT);
          setMLimit(DefaultValues.MLIMIT);
        })
        .catch((error) => {
          console.error("Error resetting values:", error);
        });
    }
  }

  function clearInputs() {
    setEditingMLimit("");
    setEditingHLimit("");
    tInput.current?.clear();
    tInput2.current?.clear();
  }

  return (
    <ThemedView>
      <ThemedText type="default" style={styles.text}>
        Medium Limit: {mLimit}
      </ThemedText>
      <TextInput
        ref={tInput}
        placeholder="Medium Limit"
        style={textInputStyle}
        onChangeText={setEditingMLimit}
        clearButtonMode="always"
        keyboardType="numeric"
      />
      <ThemedText type="default" style={styles.text}>
        High Limit: {hLimit}
      </ThemedText>
      <TextInput
        ref={tInput2}
        placeholder="High Limit"
        style={textInputStyle}
        onChangeText={setEditingHLimit}
        clearButtonMode="always"
        keyboardType="numeric"
      />
      <Button title="Save" onPress={save} />
      <Button title="Reset to default" onPress={resetToDefault} />
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
