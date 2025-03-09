import type { Price } from "@spot-prices/shared-types";
import { S3 } from "aws-sdk";
import { logger } from "../../common/logger";

const s3 = new S3();
const BUCKET_NAME = process.env.BUCKET_NAME ?? "";

const parseS3KeyForDate = (date: string): string => {
  const [year, month, day] = date.split("-");
  return `daily/${year}/${month}/${day}/prices.json`;
};

const fetchPricesForDate = async (date: string): Promise<Price[]> => {
  const s3Key = parseS3KeyForDate(date);
  const params = {
    Bucket: BUCKET_NAME,
    Key: s3Key,
  };

  try {
    const { Body } = await s3.getObject(params).promise();

    if (!Body) {
      logger.warn(`No data found for date: ${date}`);
      return [];
    }

    return JSON.parse(Body.toString());
  } catch (error) {
    logger.error(`Error fetching data for ${date}: ${error}`);
    return [];
  }
};

export const fetchDailyPricesFromS3 = async (
  dates: string[],
): Promise<Price[]> => {
  const promises = dates.map((date) => fetchPricesForDate(date));
  const pricesArray = await Promise.all(promises);

  return pricesArray.flat();
};
