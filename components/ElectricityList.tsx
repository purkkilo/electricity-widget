import { ActivityIndicator, StyleSheet, ScrollView } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

interface Price {
  time_start: string;
  time_end: string;
  EUR_per_kWh: number;
}

export default function ElectricityList() {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [prices, setPrices] = useState<Price[]>([]);
  const [today, setToday] = useState<Date>(new Date());
  const roundedPrice = (price: number) =>
    Math.round((price + Number.EPSILON) * 10000) / 100;

  const formatDate = (date: Date) => {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return `${y}/${m >= 10 ? m : `0${m}`}-${d >= 10 ? d : `0${d}`}`;
  };

  const formatHourRange = (start: string, end: string) => {
    const s: Date = new Date(start);
    const e: Date = new Date(end);
    const temp_s = s.getHours();
    const temp_e = e.getHours();

    const s_h = temp_s >= 10 ? temp_s.toString() : `0${temp_s}`;
    const e_h = temp_e >= 10 ? temp_e.toString() : `0${temp_e}`;

    return `${s_h} - ${e_h}`;
  };

  const getPrices = async (date: Date) => {
    try {
      const response = await fetch(
        `https://www.sahkonhintatanaan.fi/api/v1/prices/${formatDate(
          date
        )}.json`
      );
      const json = await response.json();
      setPrices(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPrices(today);
  }, []);

  return (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="title">Today's prices (c/kWh)</ThemedText>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView>
            {prices.map((price, index) => (
              <ThemedView key={index} style={{ padding: 8 }}>
                <ThemedText type="subtitle">
                  {formatHourRange(price.time_start, price.time_end)}
                </ThemedText>
                <ThemedText type="default">
                  {roundedPrice(price.EUR_per_kWh)} c/kWh
                </ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
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
});
