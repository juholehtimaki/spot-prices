import { apiAxiosClient } from "../clients";

export const getPrices = async (fileKey: string) => {
  const response = await apiAxiosClient.get(`${fileKey}`);
  return response.data;
};
