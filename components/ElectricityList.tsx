import {
  ActivityIndicator,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatHourRange } from "@/utils/format";
import { getPricesForDate } from "@/utils/api";
import {
  getLimits,
  savePrices,
  getValue,
  PriceStorage,
  Price,
} from "@/utils/manageStorage";
import { DateTime, Settings } from "luxon";
import {
  msUntilNextHour,
  msUntilMidnight,
  msUntilPriceUpdate,
  roundedPrice,
  priceToColor,
} from "@/utils/utils";
import { DefaultValues } from "@/constants/DefaultValues";
import TabMenu from "@/components/TabMenu";

// Configure the time zone
Settings.defaultLocale = "fi-FI";
Settings.defaultZone = "Europe/Helsinki";

export default function ElectricityList() {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isLoadingYesterday, setLoadingYesterday] = useState<boolean>(true);
  const [isLoadingTomorrow, setLoadingTomorrow] = useState<boolean>(true);
  const [todayInterval, setTodayInterval] = useState<number>(0);
  const [updateInterval, setUpdateInterval] = useState<number>(0);
  const [midnightInterval, setMidnightInterval] = useState<number>(0);
  const [prices, setPrices] = useState<Price[]>([]);
  const [prevPrices, setPrevPrices] = useState<Price[]>([]);
  const [tomorrowPrices, setTomorrowPrices] = useState<Price[]>([]);
  const [today, setToday] = useState<DateTime>(DateTime.now());
  const [yesterday, setYesterday] = useState<DateTime>(
    DateTime.now().minus({ days: 1 })
  );
  const [tomorrow, setTomorrow] = useState<DateTime>(
    DateTime.now().plus({ days: 1 })
  );
  const [hour, setHour] = useState<number>(today.get("hour"));
  const [mLimit, setMLimit] = useState<number>(10);
  const [hLimit, setHLimit] = useState<number>(20);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Get the user set limits for colors
  const setLimits = async () => {
    const limits = await getLimits();
    if (limits) {
      setMLimit(
        limits[0][1]
          ? parseFloat(limits[0][1])
          : parseFloat(DefaultValues.MLIMIT)
      );
      setHLimit(
        limits[1][1]
          ? parseFloat(limits[1][1])
          : parseFloat(DefaultValues.HLIMIT)
      );
    }
  };

  const switchDates = () => {
    setToday(DateTime.now());
    setYesterday(DateTime.now().minus({ days: 1 }));
    setTomorrow(DateTime.now().plus({ days: 1 }));
    setPrevPrices(prices);
    setPrices(tomorrowPrices);
    setTomorrowPrices([]);
  };

  const checkStorageAndHandlePrices = (dateKey: string) => {
    const sampleData: PriceStorage = {
      start: DateTime.now().toISODate(),
      end: DateTime.now().toISODate(),
      prices: [],
    };

    if (dateKey === "prices-yesterday") {
      setLoadingYesterday(true);
    } else if (dateKey === "prices-tomorrow") {
      setLoadingTomorrow(true);
    } else {
      setLoading(true);
    }

    getValue(dateKey)
      .then((data) => {
        let reload = false;
        let parsedData: PriceStorage = { ...sampleData };
        let date: DateTime;
        if (dateKey === "prices-yesterday") {
          date = yesterday;
        } else if (dateKey === "prices-tomorrow") {
          date = tomorrow;
        } else date = today;
        // If there is data in storage, and the date is today
        // set the prices to the state
        // else fetch the prices from the api
        if (data) {
          parsedData = JSON.parse(data);
          const startDate = DateTime.fromISO(parsedData.start);
          reload = startDate.toISODate() !== date.toISODate();
        } else reload = true;
        if (reload) {
          fetchPricesFromApi(date, dateKey);
        } else {
          if (dateKey === "prices-yesterday") {
            setPrevPrices(parsedData.prices);
          } else if (dateKey === "prices-tomorrow") {
            setTomorrowPrices(parsedData.prices);
          } else setPrices(parsedData.prices);
        }
      })
      .finally(() => {
        if (dateKey === "prices-yesterday") {
          setLoadingYesterday(false);
        } else if (dateKey === "prices-tomorrow") {
          setLoadingTomorrow(false);
        } else {
          setLoading(false);
        }
      });
  };

  const fetchPricesFromApi = (date: DateTime, dateKey: string) => {
    console.log("Fetching prices for", date.toISODate());
    getPricesForDate(date)
      .then((data) => {
        if (dateKey === "prices-yesterday") {
          setPrevPrices(data);
        } else if (dateKey === "prices-tomorrow") {
          setTomorrowPrices(data);
        } else {
          setPrices(data);
        }
        savePrices(date, data, dateKey);
      })
      .catch((error) => {
        console.error("Error fetching prices:", error);
      });
  };

  const setIntervals = () => {
    // Set timer and intervals for updating the prices
    // and the hour, clear them on unmount
    setTimeout(() => {
      setHour(DateTime.now().get("hour"));
      const t = setInterval(() => {
        setHour(DateTime.now().get("hour"));
      }, 36000); // 1 hour
      setTodayInterval(t);
    }, msUntilNextHour());

    setTimeout(() => {
      const m = setInterval(() => {
        switchDates();
      }, 864e5); // 24 hours
      setMidnightInterval(m);
    }, msUntilMidnight());

    setTimeout(() => {
      // Get tomorrow's prices
      const u = setInterval(() => {
        fetchPricesFromApi(tomorrow, "prices-tomorrow");
      }, 864e5); // 24 hours
      setUpdateInterval(u);
    }, msUntilPriceUpdate());
  };

  useEffect(() => {
    setLoading(true);
    setLoadingYesterday(true);
    setLoadingTomorrow(true);

    // Get/Set limits for colors
    setLimits();

    // Get prices for today, yesterday and tomorrow
    // save them to storage so no need to fetch from api again
    checkStorageAndHandlePrices("prices-today");
    checkStorageAndHandlePrices("prices-yesterday");
    checkStorageAndHandlePrices("prices-tomorrow");

    setIntervals();

    return () => {
      clearInterval(todayInterval);
      clearInterval(updateInterval);
      clearInterval(midnightInterval);
    };
  }, []);

  return (
    <ThemedView style={styles.stepContainer}>
      <ThemedView
        style={{
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <TabMenu tabs={["Yesterday", "Today", "Tomorrow"]}></TabMenu>
      </ThemedView>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          <ThemedText
            type="title"
            style={{ marginBottom: 30, alignSelf: "center" }}
          >
            Today's prices (c/kWh)
          </ThemedText>
          {prices.map((price, index) => (
            // If the index is the current hour, highlight the row and the price
            <TouchableOpacity
              key={index}
              style={[
                styles.priceRow,
                index === hour ? styles.currentRow : {},
                selectedRow === index ? styles.highligtRow : {},
                {
                  borderColor: priceToColor(
                    roundedPrice(price.EUR_per_kWh),
                    mLimit,
                    hLimit
                  ),
                },
              ]}
              onPress={() => {
                //set the style to highlight the row
                setSelectedRow(selectedRow === index ? null : index);
              }}
            >
              <ThemedText type="subtitle">
                {formatHourRange(price.time_start, price.time_end)}
              </ThemedText>
              <ThemedText type="default">
                {roundedPrice(price.EUR_per_kWh)} c/kWh
              </ThemedText>
            </TouchableOpacity>
          ))}
          <ThemedText
            type="title"
            style={{ marginBottom: 30, alignSelf: "center" }}
          >
            Tomorrow's prices (c/kWh)
          </ThemedText>
          {tomorrowPrices.map((price, index) => (
            // If the index is the current hour, highlight the row and the price
            <TouchableOpacity
              key={index}
              style={[
                styles.priceRow,
                index === hour ? styles.currentRow : {},
                selectedRow === index ? styles.highligtRow : {},
                {
                  borderColor: priceToColor(
                    roundedPrice(price.EUR_per_kWh),
                    mLimit,
                    hLimit
                  ),
                },
              ]}
              onPress={() => {
                //set the style to highlight the row
                setSelectedRow(selectedRow === index ? null : index);
              }}
            >
              <ThemedText type="subtitle">
                {formatHourRange(price.time_start, price.time_end)}
              </ThemedText>
              <ThemedText type="default">
                {roundedPrice(price.EUR_per_kWh)} c/kWh
              </ThemedText>
            </TouchableOpacity>
          ))}
          <ThemedText
            type="title"
            style={{ marginBottom: 30, alignSelf: "center" }}
          >
            Yesterday's prices (c/kWh)
          </ThemedText>
          {prevPrices.map((price, index) => (
            // If the index is the current hour, highlight the row and the price
            <TouchableOpacity
              key={index}
              style={[
                styles.priceRow,
                index === hour ? styles.currentRow : {},
                selectedRow === index ? styles.highligtRow : {},
                {
                  borderColor: priceToColor(
                    roundedPrice(price.EUR_per_kWh),
                    mLimit,
                    hLimit
                  ),
                },
              ]}
              onPress={() => {
                //set the style to highlight the row
                setSelectedRow(selectedRow === index ? null : index);
              }}
            >
              <ThemedText type="subtitle">
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
  tabContainer: {
    flexDirection: "row",
    position: "relative",
  },
  tab: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  tabText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
