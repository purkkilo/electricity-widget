import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

interface Price {
  time_start: string;
  time_end: string;
  EUR_per_kWh: number;
}

export default function HomeScreen() {
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
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
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
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
