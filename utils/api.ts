import { DateTime, Settings } from "luxon";
import { formatDate } from "@/utils/format";
// Configure the time zone
Settings.defaultLocale = "fi-FI";
Settings.defaultZone = "Europe/Helsinki";

const apiURL = "https://www.sahkonhintatanaan.fi/api/v1/prices";

export const getPricesForDate = async (date: DateTime) => {
  try {
    const response = await fetch(`${apiURL}/${formatDate(date)}.json`);

    if (response.status === 404) {
      console.error("No data available for the date:", date);
      return;
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};
