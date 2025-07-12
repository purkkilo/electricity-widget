import { DateTime, Settings } from "luxon";
// Configure the time zone
Settings.defaultLocale = "fi-FI";
Settings.defaultZone = "Europe/Helsinki";

export const cleanTerminalFromDumbWarnings = () => {
  const originalConsoleWarn = console.warn;

  console.warn = (...args) => {
    // https://github.com/react-navigation/react-navigation/issues/11730
    // https://github.com/expo/expo/issues/33248
    if (
      args[0] === "props.pointerEvents is deprecated. Use style.pointerEvents"
    ) {
      return;
    }
    if (args[0] === '"shadow*" style props are deprecated. Use "boxShadow".') {
      return;
    }
    originalConsoleWarn(...args);
  };
};

export const msUntilNextMinute = () => {
  const now = DateTime.now();
  const nextMinute = now.plus({ minutes: 1 }).startOf("minute");
  return nextMinute.diff(now).milliseconds;
};

export const msUntilNextHour = () => {
  const now = DateTime.now();
  const nextHour = now.plus({ hours: 1 }).startOf("hour");
  return nextHour.diff(now).milliseconds;
};

export const msUntilMidnight = () => {
  const now = DateTime.now();
  const nextMidnight = now.plus({ days: 1 }).startOf("day");
  return nextMidnight.diff(now).milliseconds;
};

export const msUntilPriceUpdate = () => {
  const now = DateTime.now();
  // Prices update every day at 14:15
  const nextPriceUpdate = now
    .plus({ days: 1 })
    .set({ hour: 14, minute: 15 })
    .startOf("minute");
  return nextPriceUpdate.diff(now).milliseconds;
};

export const roundedPrice = (
  price: number,
  precision: number = 2,
  addTax: boolean = true
) => {
  // Round to precision number of digits
  if (addTax) price = price * 1.255; // Add tax
  return (
    Math.round((price + Number.EPSILON) * Math.pow(10, precision + 2)) /
    Math.pow(10, precision)
  );
};

// Set the color of the price based on the limits
export const priceToColor = (price: number, mLimit: number, hLimit: number) => {
  const p = roundedPrice(price); // Round the price to 2 digits
  if (p < 0) {
    return "rgba(0, 255, 0, 0.35)"; // Green
  } else if (p < mLimit) {
    return "#087ea4"; // Neon
  } else if (p > hLimit) {
    return "rgba(255, 0, 0, 0.35)"; // Red
  } else {
    return "rgb(255, 255, 0.35)"; // Yellow
  }
};
