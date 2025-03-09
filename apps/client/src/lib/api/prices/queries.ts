import type { Price } from "@spot-prices/shared-types";
import { apiAxiosClient } from "../clients";

export const getPrices = async (fileKey: string) => {
  const response = await apiAxiosClient.get(`${fileKey}`);
  return response.data as Price[];
};
