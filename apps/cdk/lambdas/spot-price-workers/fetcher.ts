import { addDays, subDays } from "date-fns";
import { logger } from "../common/logger";
import { processPriceData } from "./helpers/data-helpers";
import {
  fetchPrices,
  formatDateForApi,
  parseXmlToJson,
} from "./helpers/entsoe-helpers";
import { storeDailyPricesInS3 } from "./helpers/s3-helpers";

export const handler = async () => {
  try {
    const startDate = addDays(new Date(), 1);
    const endDate = addDays(new Date(), 1);

    // const startDate = new Date("2024-11-1");
    // const endDate = new Date("2024-12-31");

    const formattedStartDate = formatDateForApi(subDays(startDate, 1));
    const formattedEndDate = formatDateForApi(endDate);

    logger.info(
      `Fetching prices for: ${formattedStartDate} to ${formattedEndDate}`,
    );

    const data = await fetchPrices(formattedStartDate, formattedEndDate);

    const parsedData = await parseXmlToJson(data);
    const timeseries = parsedData.Publication_MarketDocument?.TimeSeries;

    if (!Array.isArray(timeseries)) {
      throw new Error("No prices available.");
    }

    const groupedPrices = processPriceData(timeseries, startDate, endDate);

    logger.info("Storing prices in S3");

    await storeDailyPricesInS3(groupedPrices);
  } catch (error) {
    throw new Error("Failed to store prices in S3");
  }
};
