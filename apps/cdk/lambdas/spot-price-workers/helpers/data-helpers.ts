import type { Price } from "@spot-prices/shared-types";
import { addHours, isBefore, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import type { TimeSeries } from "./types";

const NEW_VAT_MULTIPLIER = 1.255;
const OLD_WAT_MULTIPLIER = 1.24;
const TIMEZONE = "Europe/Helsinki";

export const processPriceData = (
  timeseries: TimeSeries[],
  startDate: Date,
  endDate: Date,
): Record<string, Price[]> => {
  const groupedPrices: Record<string, Price[]> = {};

  const startKey = formatInTimeZone(startDate, TIMEZONE, "yyyy-MM-dd");
  const endKey = formatInTimeZone(endDate, TIMEZONE, "yyyy-MM-dd");

  for (const entry of timeseries) {
    const periodStart = parseISO(entry.Period.timeInterval.start);
    if (Number.isNaN(periodStart.getTime())) {
      continue;
    }

    for (const point of entry.Period.Point) {
      const startTime = addHours(periodStart, Number(point.position) - 1);
      const endTime = addHours(startTime, 1);

      const VAT_MULTIPLIER = isBefore(startTime, new Date("2024-09-01"))
        ? OLD_WAT_MULTIPLIER
        : NEW_VAT_MULTIPLIER;

      const formattedStartTime = formatInTimeZone(
        startTime,
        TIMEZONE,
        "yyyy-MM-dd'T'HH:mm:ssXXX",
      );
      const formattedEndTime = formatInTimeZone(
        endTime,
        TIMEZONE,
        "yyyy-MM-dd'T'HH:mm:ssXXX",
      );

      const dateKey = formatInTimeZone(startTime, TIMEZONE, "yyyy-MM-dd");

      if (dateKey < startKey || dateKey > endKey) continue;

      const priceAmount = Number(point["price.amount"]) / 10;
      const priceWithVat = priceAmount * VAT_MULTIPLIER;

      const priceEntry: Price = {
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        price: priceAmount,
        priceWithVat,
      };

      groupedPrices[dateKey] ??= [];
      groupedPrices[dateKey].push(priceEntry);
    }
  }

  return groupedPrices;
};
