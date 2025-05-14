import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDate, formatHourRange } from "@/utils/format";
import { saveValue } from "@/utils/manageStorage";
import { DateTime, Settings } from "luxon";
import { getMultiple } from "@/utils/manageStorage";
import { DefaultValues } from "@/constants/DefaultValues";
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
  const [mLimit, setMLimit] = useState<number>(10);
  const [hLimit, setHLimit] = useState<number>(20);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const roundedPrice = (price: number) =>
    Math.round((price + Number.EPSILON) * 10000) / 100;
  const keys = ["mLimit", "hLimit"];

  const getPrices = async (date: DateTime) => {
    try {
      const response = await fetch(
        `https://www.sahkonhintatanaan.fi/api/v1/prices/${formatDate(
          date
        )}.json`
      );

      const limits = await getMultiple(keys);
      if (limits) {
        setMLimit(
          limits[0][1] ? parseInt(limits[0][1]) : parseInt(DefaultValues.MLIMIT)
        );
        setHLimit(
          limits[1][1] ? parseInt(limits[1][1]) : parseInt(DefaultValues.HLIMIT)
        );
      }

      const json = await response.json();
      const currentPrice = roundedPrice(json[hour].EUR_per_kWh).toString();
      const now = DateTime.now();
      setPrices(json);
      setHour(now.get("hour"));
      if (today.get("day") !== now.get("day")) {
        setToday(now);
      }
      saveValue(currentPrice, "electricityPrice");
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
      <ThemedText
        type="title"
        style={{ marginBottom: 30, alignSelf: "center" }}
      >
        Today's prices (c/kWh)
      </ThemedText>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          {prices.map((price, index) => (
            // If the index is the current hour, highlight the row and the price
            <TouchableOpacity
              key={index}
              style={[
                styles.priceRow,
                index === hour ? styles.currentRow : {},
                selectedRow === index ? styles.highligtRow : {},
              ]}
              onPress={() => {
                //set the style to highlight the row
                setSelectedRow(selectedRow === index ? null : index);
              }}
            >
              <ThemedText
                type="subtitle"
                style={[
                  index === hour ? styles.currentHour : {},
                  styles.hourTitle,
                ]}
              >
                {formatHourRange(price.time_start, price.time_end)}
              </ThemedText>
              <ThemedText type="default">
                {roundedPrice(price.EUR_per_kWh)} c/kWh
              </ThemedText>
            </TouchableOpacity>
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
    padding: 16,
    textAlign: "center",
    alignContent: "center",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "transparent",
  },
  priceRow: {
    padding: 8,
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 8,
    alignSelf: "center",
    width: "40%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "center",
  },
  currentRow: {
    borderColor: "#087ea4",
    height: 80,
    borderWidth: 2,
    borderRadius: 5,
  },
  highligtRow: {
    backgroundColor: "rgba(0, 125, 163, 0.29)",
  },
  hourTitle: {},
  currentHour: {
    color: "#087ea4",
  },
});
