import {
  fetchDailyPricesFromS3ForYear,
  storeAggregatedPricesInS3,
} from "./helpers/s3-helpers";

export const handler = async () => {
  try {
    const year = new Date().getFullYear().toString();
    const pricesForTheYear = await fetchDailyPricesFromS3ForYear(year);

    await storeAggregatedPricesInS3(year, pricesForTheYear);
  } catch (error) {
    throw new Error("Failed to aggregate prices");
  }
};
