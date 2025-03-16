import { useDailyPricesQuery } from "@/lib/api/prices/hooks";
import { useMemo } from "react";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { PageContainer } from "../utility/PageContainer";

export const DailyDashboardPage = () => {
  const { data } = useDailyPricesQuery("2025/03/13");

  const lowestPrice = useMemo(() => {
    if (!data || data.length === 0) return undefined;
    return data.reduce(
      (min, data, index) =>
        data.price < min.data.price ? { data, index } : min,
      { data: data[0], index: 0 },
    );
  }, [data]);

  const highestPrice = useMemo(() => {
    if (!data || data.length === 0) return undefined;
    return data.reduce(
      (max, data, index) =>
        data.price > max.data.price ? { data, index } : max,
      { data: data[0], index: 0 },
    );
  }, [data]);

  const averagePrice = useMemo(() => {
    if (!data || data.length === 0) return undefined;
    const total = data.reduce((sum, item) => sum + item.price, 0);
    return total / data.length;
  }, [data]);

  const getTimeFromIndex = (index: number) => {
    const start = index.toString().padStart(2, "0");
    const end = (index + 1).toString().padStart(2, "0");
    return `Klo ${start} - ${end}`;
  };

  return (
    <PageContainer>
      <div className="flex flex-col w-full gap-5">
        <Tabs defaultValue="today">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Eilen</TabsTrigger>
            <TabsTrigger value="password">Tänään</TabsTrigger>
            <TabsTrigger value="test">Huomenna</TabsTrigger>
          </TabsList>
        </Tabs>
        <Card className="w-full">
          <div className="flex justify-between w-full">
            <div className="flex flex-col gap-1 text-center flex-1">
              <p className="text-gray-500 text-sm font-semibold">
                Halvin hinta
              </p>
              {lowestPrice?.data && (
                <>
                  <p className="text-gray-600 font-sm">
                    {getTimeFromIndex(lowestPrice.index)}
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {lowestPrice.data.priceWithVat.toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-sm">c/kWh</p>
                </>
              )}
            </div>
            <Separator orientation="vertical" />
            <div className="flex flex-col gap-1 text-center flex-1">
              <p className="text-gray-500 text-sm font-semibold">
                Kallein hinta
              </p>
              {highestPrice?.data && (
                <>
                  <p className="text-gray-600 font-sm">
                    {getTimeFromIndex(highestPrice.index)}
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {highestPrice.data.priceWithVat.toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-sm">c/kWh</p>
                </>
              )}
            </div>
            <Separator orientation="vertical" />
            <div className="flex flex-col gap-1 text-center flex-1">
              <p className="text-gray-500 text-sm font-semibold">Keskihinta</p>
              <p className="text-gray-600 font-sm">Tänään</p>
              <p className="text-xl font-bold text-blue-600">
                {averagePrice?.toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm">c/kWh</p>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
