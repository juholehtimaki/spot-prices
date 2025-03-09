import axios from "axios";
import { addHours, format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Parser } from "xml2js";
import type { ApiResponseInJson, Price, TimeSeries } from "./types";

const API_KEY = process.env.ENTSOE_API_KEY;
const API_BASE_URL = "https://web-api.tp.entsoe.eu";
const BIDDING_ZONE = "10YFI-1--------U";

export const formatDateForApi = (date: Date): string =>
  format(toZonedTime(date, "UTC"), "yyyyMMddHHmm");

export const fetchPrices = async (startDate: string, endDate: string) => {
  const url = `${API_BASE_URL}/api?documentType=A44&out_domain=${BIDDING_ZONE}&in_Domain=${BIDDING_ZONE}&periodStart=${startDate}&periodEnd=${endDate}&securityToken=${API_KEY}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch prices.");
  }
};

export const parseXmlToJson = async (
  xmlData: string,
): Promise<ApiResponseInJson> => {
  const parser = new Parser({ explicitArray: false, mergeAttrs: true });

  return new Promise((resolve, reject) => {
    parser.parseString(xmlData, (err, result) => {
      if (err) {
        reject(new Error("Error parsing XML."));
      } else {
        resolve(result as ApiResponseInJson);
      }
    });
  });
};
