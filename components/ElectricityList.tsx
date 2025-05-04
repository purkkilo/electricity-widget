import { ActivityIndicator, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDate, formatHourRange } from "@/utils/format";
import { getAllKeys, saveValue } from "@/utils/manageStorage";
import { DateTime, Settings } from "luxon";

// Configure the time zone
Settings.defaultLocale = "fi-FI";
Settings.defaultZone = "Europe/Helsinki";
interface Price {
  time_start: string;
  time_end: string;
  EUR_per_kWh: number;
}

export default function ElectricityList() {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [prices, setPrices] = useState<Price[]>([]);
  const [today, setToday] = useState<DateTime>(DateTime.now());
  const [hour, setHour] = useState<number>(today.get("hour"));
  const roundedPrice = (price: number) =>
    Math.round((price + Number.EPSILON) * 10000) / 100;

  const getPrices = async (date: DateTime) => {
    try {
      const response = await fetch(
        `https://www.sahkonhintatanaan.fi/api/v1/prices/${formatDate(
          date
        )}.json`
      );
      const json = await response.json();
      setPrices(json);
      setHour(DateTime.now().get("hour"));
      saveValue(json[hour].EUR_per_kWh.toString(), "electricityPrice2");
      console.log(hour, json[hour].EUR_per_kWh.toString(), "electricityPrice");
      await getAllKeys();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    saveValue("10", "mediumLimit");
    saveValue("20", "highLimit");
    getPrices(today);
  }, []);

  return (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="title">Today's prices (c/kWh)</ThemedText>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          {prices.map((price, index) => (
            <ThemedView key={index} style={{ padding: 8 }}>
              <ThemedText
                type="subtitle"
                style={index === hour ? styles.currentHour : {}}
              >
                {formatHourRange(price.time_start, price.time_end)}
              </ThemedText>
              <ThemedText type="default">
                {roundedPrice(price.EUR_per_kWh)} c/kWh
              </ThemedText>
              <ThemedText type="default">{price.EUR_per_kWh} c/kWh</ThemedText>
            </ThemedView>
          ))}
        </SafeAreaView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  currentHour: {
    color: "green",
  },
});
