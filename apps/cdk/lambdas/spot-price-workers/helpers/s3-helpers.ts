import type { Price } from "@spot-prices/shared-types";
import { S3 } from "aws-sdk";
import { format, startOfMonth, startOfWeek } from "date-fns";

const s3 = new S3();

const BUCKET_NAME = process.env.BUCKET_NAME ?? "";

const regex = /daily\/(\d{4}\/\d{2}\/\d{2})/;

const generateDailyS3Key = (date: string): string => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");
  return `daily/${year}/${month}/${day}/prices.json`;
};

const generateYearlyS3Key = (year: string): string => {
  return `yearly/${year}/prices.json`;
};

const generateWeeklyS3Key = (weekKey: string): string => {
  return `weekly/${weekKey}/prices.json`;
};

const generateMonthlyS3Key = (monthKey: string): string => {
  return `monthly/${monthKey}/prices.json`;
};

const uploadToS3 = async (key: string, data: string): Promise<void> => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: data,
      ContentType: "application/json",
    };

    await s3.putObject(params).promise();
  } catch (error) {
    throw new Error(`Failed to upload data for ${key}`);
  }
};

export const storeDailyPricesInS3 = async (
  prices: Record<string, unknown[]>,
): Promise<void> => {
  try {
    const uploadPromises = Object.entries(prices).map(
      ([date, priceEntries]) => {
        const s3Key = generateDailyS3Key(date);
        const dataToUpload = JSON.stringify(priceEntries);

        return uploadToS3(s3Key, dataToUpload);
      },
    );

    await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error("Failed to store prices in S3");
  }
};

const listObjectsInS3 = async (prefix: string): Promise<string[]> => {
  const response = await s3
    .listObjectsV2({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    })
    .promise();

  const { Contents } = response;

  if (!Contents) return [];

  return Contents.map((content) => content.Key).filter(
    (key): key is string => key !== undefined,
  );
};

const getJsonFromS3 = async (key: string): Promise<Record<string, Price[]>> => {
  try {
    const { Body } = await s3
      .getObject({
        Bucket: BUCKET_NAME,
        Key: key,
      })
      .promise();

    if (!Body) {
      throw new Error(`Failed to fetch data for ${key}`);
    }

    const prices = JSON.parse(Body.toString()) as Price[];

    const match = key.match(regex);

    if (!match) {
      throw new Error(`Failed to fetch data for ${key} due to regex mismatch`);
    }

    const dateKey = match[1];

    return { [dateKey]: prices };
  } catch (error) {
    throw new Error(`Failed to fetch yearly data: ${error}`);
  }
};

export const fetchDailyPricesFromS3ForYear = async (year: string) => {
  const prefix = `daily/${year}/`;
  const keys = await listObjectsInS3(prefix);

  const prices = await Promise.all(keys.map(getJsonFromS3));

  return prices.reduce(
    (acc, currentPrices) => {
      const dateKey = Object.keys(currentPrices)[0];
      acc[dateKey] = currentPrices[dateKey];
      return acc;
    },
    {} as Record<string, Price[]>,
  );
};

const storeYearlyPricesInS3 = async (
  year: string,
  prices: Record<string, Price[]>,
): Promise<void> => {
  try {
    const dataToUpload = JSON.stringify(prices);
    const s3Key = generateYearlyS3Key(year);

    await uploadToS3(s3Key, dataToUpload);
  } catch (error) {
    throw new Error("Failed to store yearly prices in S3");
  }
};

const aggregateByWeek = (
  prices: Record<string, Price[]>,
): Record<string, Price[]> => {
  const weeklyPrices: Record<string, Price[]> = {};

  for (const [date, priceEntries] of Object.entries(prices)) {
    const dateObj = new Date(date);
    const weekStart = startOfWeek(dateObj);
    const weekKey = format(weekStart, "yyyy/MM/dd");

    if (!weeklyPrices[weekKey]) {
      weeklyPrices[weekKey] = [];
    }

    weeklyPrices[weekKey].push(...priceEntries);
  }

  return weeklyPrices;
};

const aggregateByMonth = (
  prices: Record<string, Price[]>,
): Record<string, Price[]> => {
  const monthlyPrices: Record<string, Price[]> = {};

  for (const [date, priceEntries] of Object.entries(prices)) {
    const dateObj = new Date(date);
    const monthStart = startOfMonth(dateObj);
    const monthKey = format(monthStart, "yyyy/MM");

    if (!monthlyPrices[monthKey]) {
      monthlyPrices[monthKey] = [];
    }

    monthlyPrices[monthKey].push(...priceEntries);
  }

  return monthlyPrices;
};

export const storeMonthlyPricesInS3 = async (
  prices: Record<string, Price[]>,
  year: string,
): Promise<void> => {
  try {
    const monthlyPrices = aggregateByMonth(prices);
    const monthlyPromises = [];
    for (const [monthKey, priceEntries] of Object.entries(monthlyPrices)) {
      const s3Key = generateMonthlyS3Key(monthKey);
      const dataToUpload = JSON.stringify(priceEntries);
      monthlyPromises.push(uploadToS3(s3Key, dataToUpload));
    }

    await Promise.all(monthlyPromises);
  } catch (error) {
    throw new Error(`Failed to store monthly prices in S3: ${error}`);
  }
};

export const storeWeeklyPricesInS3 = async (
  prices: Record<string, Price[]>,
  year: string,
): Promise<void> => {
  try {
    const weeklyPrices = aggregateByWeek(prices);
    const weeklyPromises = [];
    for (const [weekKey, priceEntries] of Object.entries(weeklyPrices)) {
      const s3Key = generateWeeklyS3Key(weekKey);
      const dataToUpload = JSON.stringify(priceEntries);
      weeklyPromises.push(uploadToS3(s3Key, dataToUpload));
    }

    await Promise.all(weeklyPromises);
  } catch (error) {
    throw new Error(`Failed to store weekly prices in S3: ${error}`);
  }
};

export const storeAggregatedPricesInS3 = async (
  year: string,
  prices: Record<string, Price[]>,
): Promise<void> => {
  try {
    await storeYearlyPricesInS3(year, prices);
    await storeWeeklyPricesInS3(prices, year);
    await storeMonthlyPricesInS3(prices, year);
  } catch (error) {
    throw new Error(`Failed to store yearly prices in S3 ${error}`);
  }
};
