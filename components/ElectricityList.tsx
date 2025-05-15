import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatHourRange } from "@/utils/format";
import { getPricesForDate } from "@/utils/api";
import { getLimits, saveValue } from "@/utils/manageStorage";
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
  const roundedPrice = (price: number, precision: number = 2) => {
    // Round to precision number of digits
    // Math.round((price + Number.EPSILON) * 10000) / 100;
    return (
      Math.round((price + Number.EPSILON) * Math.pow(10, precision + 1)) /
      Math.pow(10, precision)
    );
  };

  const setLimits = async () => {
    const limits = await getLimits();
    if (limits) {
      setMLimit(
        limits[0][1] ? parseInt(limits[0][1]) : parseInt(DefaultValues.MLIMIT)
      );
      setHLimit(
        limits[1][1] ? parseInt(limits[1][1]) : parseInt(DefaultValues.HLIMIT)
      );
    }
  };

  const priceToColor = (price: number) => {
    // Set the color of the price based on the limits
    if (price < 0) {
      return "rgba(0, 255, 0, 0.35)"; // Neon
    } else if (price < mLimit) {
      return "#087ea4"; // Green
    } else if (price > hLimit) {
      return "rgba(255, 0, 0, 0.35)"; // Red
    } else {
      return "rgb(255, 255, 0.35)"; // Yellow
    }
  };

  useEffect(() => {
    setLoading(true);
    setLimits();
    getPricesForDate(today)
      .then((data) => {
        setPrices(data);
      })
      .finally(() => {
        setLoading(false);
      });
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
                {
                  borderColor: priceToColor(roundedPrice(price.EUR_per_kWh)),
                },
              ]}
              onPress={() => {
                //set the style to highlight the row
                setSelectedRow(selectedRow === index ? null : index);
              }}
            >
              <ThemedText
                type="subtitle"
                style={[index === hour ? styles.currentHour : {}]}
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
  },
  priceRow: {
    padding: 10,
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 4,
    alignSelf: "center",
    width: "40%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "center",
  },
  currentRow: { backgroundColor: "rgba(0, 125, 163, 0.29)" },
  highligtRow: {
    backgroundColor: "rgba(0, 225, 255, 0.3)",
  },
  currentHour: {
    color: "#087ea4",
  },
});
