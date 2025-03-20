import { useQuery } from "@tanstack/react-query";
import { getPrices } from "./queries";

export type DateString =
  `${number}${number}${number}${number}/${number}${number}/${number}${number}`;

type Timeframe = "daily" | "weekly" | "monthly" | "yearly";

const usePricesQuery = (timeframe: Timeframe, keys: (string | number)[]) => {
  const fileKey = `${timeframe}/${keys.join("/")}/prices.json`;

  return useQuery({
    queryKey: [fileKey],
    queryFn: () => getPrices(fileKey),
    staleTime: Number.MAX_SAFE_INTEGER,
  });
};

export const useDailyPricesQuery = (dateString: DateString) =>
  usePricesQuery("daily", [dateString]);

export const useWeeklyPricesQuery = (year: number, week: number) =>
  usePricesQuery("weekly", [year, week]);

export const useMonthlyPricesQuery = (year: number, month: number) =>
  usePricesQuery("monthly", [year, month]);

export const useYearlyPricesQuery = (year: number) =>
  usePricesQuery("yearly", [year]);
