import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const apiAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount) => {
        return failureCount <= 3;
      },
    },
  },
});
