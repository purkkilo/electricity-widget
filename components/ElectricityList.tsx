import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState, useEffect } from "react";
import { formatHourRange } from "@/utils/format";
import { getPricesForDate } from "@/utils/api";
import {
  getLimits,
  savePrices,
  getValue,
  PriceStorage,
  Price,
  saveValue,
} from "@/utils/manageStorage";
import { DateTime, Settings } from "luxon";
import {
  msUntilNextHour,
  msUntilMidnight,
  msUntilPriceUpdate,
  roundedPrice,
  priceToColor,
  msUntilNextMinute,
} from "@/utils/utils";
import { DefaultValues } from "@/constants/DefaultValues";

// Configure the time zone
Settings.defaultLocale = "fi-FI";
Settings.defaultZone = "Europe/Helsinki";

import Animated, {
  FadeInLeft,
  FadeInRight,
  ReduceMotion,
} from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";

export default function ElectricityList() {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isLoadingYesterday, setLoadingYesterday] = useState<boolean>(true);
  const [isLoadingTomorrow, setLoadingTomorrow] = useState<boolean>(true);

  const [nowInterval, setNowInterval] = useState<number>(0);
  const [todayInterval, setTodayInterval] = useState<number>(0);
  const [updateInterval, setUpdateInterval] = useState<number>(0);
  const [midnightInterval, setMidnightInterval] = useState<number>(0);

  const dataNotAvailable = {
    time_start: "0",
    time_end: "24",
    EUR_per_kWh: NaN,
  };
  const [prices, setPrices] = useState<Price[]>([]);
  const [prevPrices, setPrevPrices] = useState<Price[]>([]);
  const [tomorrowPrices, setTomorrowPrices] = useState<Price[]>([
    dataNotAvailable,
  ]);

  const [now, setNow] = useState<DateTime>(DateTime.now());
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

  const [currentTab, setCurrentTab] = useState<number>(1); // Set the initial tab to the middle one
  const tabs = ["Yesterday", "Today", "Tomorrow"];
  const pricesToDisplay = [prevPrices, prices, tomorrowPrices];

  // Listen to focus changes to update the component
  const isFocused = useIsFocused();

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
    setTomorrowPrices([dataNotAvailable]);
  };

  const checkStorageAndHandlePrices = (dateKey: string) => {
    const sampleData: PriceStorage = {
      start: DateTime.now().toISODate(),
      end: DateTime.now().toISODate(),
      prices: [dataNotAvailable],
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
            setPrevPrices(
              parsedData.prices ? parsedData.prices : [dataNotAvailable]
            );
          } else if (dateKey === "prices-tomorrow") {
            setTomorrowPrices(
              parsedData.prices ? parsedData.prices : [dataNotAvailable]
            );
          } else
            setPrices(
              parsedData.prices ? parsedData.prices : [dataNotAvailable]
            );
        }
      })
      .finally(() => {
        if (dateKey === "prices-yesterday") {
          setLoadingYesterday(false);
        } else if (dateKey === "prices-tomorrow") {
          setLoadingTomorrow(false);
        } else {
          setLoading(false);
          saveValue(
            "electricityPrice",
            roundedPrice(
              prices[DateTime.now().get("hour")].EUR_per_kWh
            ).toString()
          );
        }
      });
  };

  const fetchPricesFromApi = (date: DateTime, dateKey: string) => {
    getPricesForDate(date)
      .then((data) => {
        if (!data || data.length === 0) {
          data = [dataNotAvailable];
        }
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
    setNow(DateTime.now());
    setTimeout(() => {
      const min = setInterval(() => {
        setNow(DateTime.now());
      }, 60000); // 1 minute
      setNowInterval(min);
    }, msUntilNextMinute());

    // Set timer and intervals for updating the prices
    // and the hour, clear them on unmount
    setHour(DateTime.now().get("hour"));
    setTimeout(() => {
      const t = setInterval(() => {
        setHour(DateTime.now().get("hour"));
        saveValue(
          "electricityPrice",
          roundedPrice(
            prices[DateTime.now().get("hour")].EUR_per_kWh
          ).toString()
        );
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
      clearInterval(nowInterval);
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      // Get/Set limits for colors
      setLimits();
    }
  }, [isFocused]);

  return (
    <ThemedView style={styles.stepContainer}>
      {!prices.length ? (
        <ThemedView style={{ marginBottom: 30, alignSelf: "center" }}>
          <ThemedText type="subtitle" style={{ textAlign: "center" }}>
            Loading data....
          </ThemedText>
          <ActivityIndicator></ActivityIndicator>
        </ThemedView>
      ) : (
        <ThemedView
          style={{
            marginBottom: 30,
            alignSelf: "center",
            borderColor: priceToColor(prices[hour].EUR_per_kWh, mLimit, hLimit),
            borderWidth: 2,
            padding: 30,
            borderRadius: 10,
          }}
        >
          <ThemedText
            type="title"
            style={{ textAlign: "center", marginBottom: 10 }}
          >
            {now.toLocaleString(DateTime.DATE_MED)}
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={{ textAlign: "center", marginBottom: 30 }}
          >
            {now.toLocaleString(DateTime.TIME_SIMPLE)}
          </ThemedText>
          <ThemedText type="subtitle" style={{ textAlign: "center" }}>
            {roundedPrice(prices[hour].EUR_per_kWh)} c/kWh
          </ThemedText>
        </ThemedView>
      )}
      <ThemedView
        style={{
          marginBottom: 30,
          alignSelf: "center",
          flexDirection: "row",
        }}
      >
        {
          /* Tab menu for switching between yesterday, today and tomorrow prices */
          tabs.map((tab, index) => (
            <Pressable
              key={index}
              style={[
                styles.tab,
                currentTab === index ? { borderColor: "#055671" } : {},
              ]}
              onPress={() => {
                setCurrentTab(index);
              }}
            >
              <ThemedText type="subtitle" style={[styles.tabText]}>
                {tab}
              </ThemedText>
            </Pressable>
          ))
        }
      </ThemedView>

      {isLoading || isLoadingTomorrow || isLoadingYesterday ? (
        <ActivityIndicator />
      ) : (
        <ThemedView style={{ flex: 1, alignItems: "center" }}>
          <ThemedText type="title" style={{ marginBottom: 30 }}>
            {currentTab
              ? currentTab === 1
                ? "Today's "
                : "Tomorrow's "
              : "Yesterday's "}
            prices (c/kWh)
          </ThemedText>
          {pricesToDisplay[currentTab].map((price, index) => (
            <Animated.View
              key={index}
              entering={
                index % 2 == 0
                  ? FadeInLeft.duration(1000 + index * 150).reduceMotion(
                      ReduceMotion.Never
                    )
                  : FadeInRight.duration(1000 + index * 150).reduceMotion(
                      ReduceMotion.Never
                    )
              }
              style={{ width: "80%" }}
            >
              <TouchableOpacity
                style={[
                  styles.priceRow,
                  index === hour && currentTab === 1 ? styles.currentRow : {},
                  selectedRow === index ? styles.highligtRow : {},
                  {
                    borderColor: priceToColor(
                      price.EUR_per_kWh ? price.EUR_per_kWh : hLimit,
                      mLimit,
                      hLimit
                    ),
                  },
                ]}
                onPress={() => {
                  setSelectedRow(selectedRow === index ? null : index);
                }}
              >
                {price.EUR_per_kWh === null ? (
                  <>
                    <ThemedText type="default" style={{ fontWeight: "bold" }}>
                      {price.time_start} - {price.time_end}
                    </ThemedText>
                    <ThemedText type="default" style={{ fontWeight: "bold" }}>
                      Data Not available yet (prices update after 14:00 Helsinki
                      (UTC+3))
                    </ThemedText>
                  </>
                ) : (
                  <>
                    <ThemedText type="subtitle">
                      {formatHourRange(price.time_start, price.time_end)}
                    </ThemedText>
                    <ThemedText type="default">
                      {roundedPrice(price.EUR_per_kWh)} c/kWh
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ThemedView>
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
    padding: 15,
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 3,
    alignSelf: "center",
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
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
    paddingVertical: 10,
    paddingHorizontal: 10,
    margin: 10,
    borderRadius: 5,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.0)",
    alignSelf: "center",
  },
  tabText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  divider: {
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
});
