import { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  TextInput,
  Button,
  Appearance,
  ToastAndroid,
  Pressable,
} from "react-native";

import { saveMultiple, getMultiple } from "@/utils/manageStorage";

import { DefaultValues } from "@/constants/DefaultValues";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { DarkTheme } from "@react-navigation/native";

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

  async function saveLimits() {
    try {
      if (!editingMLimit || !editingHLimit) {
        ToastAndroid.show(
          "Please enter positive values for both limits.",
          ToastAndroid.SHORT
        );
        return;
      }
      if (parseFloat(editingHLimit) <= parseFloat(editingMLimit)) {
        ToastAndroid.show(
          "High limit must be greater than medium limit.",
          ToastAndroid.SHORT
        );
        return;
      }
      if (parseFloat(editingHLimit) <= 0 || parseFloat(editingMLimit) <= 0) {
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
    } catch (error) {
      console.log("Error saving values or showing toast:", error);
    }
  }

  async function resetToDefault() {
    await saveMultiple([
      ["mLimit", DefaultValues.MLIMIT],
      ["hLimit", DefaultValues.HLIMIT],
    ])
      .then(() => {
        try {
          setMLimit(DefaultValues.MLIMIT);
          setHLimit(DefaultValues.HLIMIT);
        } catch (error) {
          console.log("Error saving values or showing toast:", error);
        }
      })
      .catch((error) => {
        console.error("Error resetting values:", error);
      })
      .finally(() => {
        try {
          ToastAndroid.show("Default values reset.", ToastAndroid.SHORT);
          clearInputs();
          console.log("Default values reset successfully");
        } catch (error) {
          console.log("Error saving values or showing toast:", error);
        }
      });
  }

  function clearInputs() {
    setEditingMLimit("");
    setEditingHLimit("");
    tInput.current?.clear();
    tInput2.current?.clear();
  }

  return (
    <ThemedView
      style={{
        alignItems: "center",
        width: "100%",
      }}
    >
      <ThemedText type="default" style={[styles.text, { color: "yellow" }]}>
        Medium Limit: {mLimit}
      </ThemedText>
      <TextInput
        ref={tInput}
        placeholder="Medium Limit"
        style={textInputStyle}
        onChangeText={setEditingMLimit}
        clearButtonMode="always"
        keyboardType="numeric"
        inputMode="decimal"
      />
      <ThemedText type="default" style={[styles.text, { color: "red" }]}>
        High Limit: {hLimit}
      </ThemedText>
      <TextInput
        ref={tInput2}
        placeholder="High Limit"
        style={textInputStyle}
        onChangeText={setEditingHLimit}
        clearButtonMode="always"
        keyboardType="numeric"
        inputMode="decimal"
      />
      <ThemedView
        style={{
          margin: 20,
          gap: 15,
          justifyContent: "center",
        }}
      >
        <Pressable
          onPress={saveLimits}
          style={({ pressed }) => [
            styles.button,

            {
              outlineColor: pressed ? "#007224ff" : "#4da167ff",
            },
          ]}
        >
          <ThemedText style={[styles.buttonText, { color: "#4da167ff" }]}>
            Save
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={resetToDefault}
          style={({ pressed }) => [
            styles.button,
            { outlineColor: pressed ? "#494b00ff" : "#95a000ff" },
          ]}
        >
          <ThemedText style={[styles.buttonText, { color: "#95a000ff" }]}>
            Reset default values
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  text: {
    margin: 10,
    fontSize: 20,
    textShadowColor: "black",
    textShadowRadius: 7,
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
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    outlineWidth: 1,
    outlineStyle: "solid",
  },
  buttonText: {
    fontSize: 16,
  },
});
