import { useDailyPricesQuery } from "@/lib/api/prices/hooks";
import { PageContainer } from "../utility/PageContainer";

export const DailyPricesPage = () => {
  const prices = useDailyPricesQuery("2025/03/10");
  return (
    <PageContainer>
      {prices.data && <div>{JSON.stringify(prices)}</div>}
    </PageContainer>
  );
};
