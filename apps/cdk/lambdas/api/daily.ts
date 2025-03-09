import type { APIGatewayProxyHandler } from "aws-lambda";
import {
  getDatesInBetween,
  isValidDate,
  isValidDateFormat,
  isValidDateInterval,
  isValidDateRange,
} from "./helpers/dateHelper";
import { createResponse } from "./helpers/response";
import { fetchDailyPricesFromS3 } from "./helpers/s3-helpers";

export const handler: APIGatewayProxyHandler = async (event) => {
  const startDate = event.queryStringParameters?.startDate;
  const endDate = event.queryStringParameters?.endDate;

  if (!startDate || !endDate) {
    return {
      statusCode: 400,
      body: "Missing required parameters.",
    };
  }

  if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
    return createResponse(400, {
      message: "Invalid date format. Please use 'YYYY-MM-DD'",
    });
  }

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  if (!isValidDate(parsedStartDate) || !isValidDate(parsedEndDate)) {
    return createResponse(400, {
      message: "Invalid date format. Please use 'YYYY-MM-DD'",
    });
  }

  if (!isValidDateRange(parsedStartDate, parsedEndDate)) {
    return createResponse(400, {
      message:
        "Invalid date range. The start date must be before the end date.",
    });
  }

  if (!isValidDateInterval(parsedStartDate, parsedEndDate)) {
    return createResponse(400, {
      message: "Invalid date interval. The maximum interval is 31 days",
    });
  }

  const daysToFetch = getDatesInBetween(parsedStartDate, parsedEndDate);

  try {
    const prices = await fetchDailyPricesFromS3(daysToFetch);
    return createResponse(200, prices);
  } catch {
    return createResponse(404, {
      message: "Prices not found for the specified date.",
    });
  }
};
