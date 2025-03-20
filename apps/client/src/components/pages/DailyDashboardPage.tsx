import { useDailyPricesQuery } from "@/lib/api/prices/hooks";
import { getDateInApiFormat } from "@/lib/dateUtils";
import { addDays, format, getHours, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { PageContainer } from "../utility/PageContainer";

export const DailyDashboardPage = () => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  const formattedToday = format(today, "yyyy-MM-dd");
  const formattedYesterday = format(yesterday, "yyyy-MM-dd");
  const formattedTomorrow = format(tomorrow, "yyyy-MM-dd");

  const [selectedDate, setSelectedDate] = useState(formattedToday);

  const { data } = useDailyPricesQuery(
    getDateInApiFormat(new Date(selectedDate)),
  );

  const { data: currentData } = useDailyPricesQuery(
    getDateInApiFormat(new Date(formattedToday)),
  );

  const currentPrice = useMemo(() => {
    if (!currentData || currentData.length === 0) return undefined;
    const currentHour = getHours(new Date());
    return { data: currentData[currentHour], index: currentHour };
  }, [currentData]);

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

  const getAveragePriceLabel = (selectedDate: string) => {
    if (selectedDate === formattedToday) {
      return "Tänään";
    }
    if (selectedDate === formattedYesterday) {
      return "Eilen";
    }
    if (selectedDate === formattedTomorrow) {
      return "Huomenna";
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col w-full gap-5">
        <Card>
          <div className="flex flex-col gap-1 text-center flex-1">
            <p className="text-gray-500 text-sm font-semibold">Hinta nyt</p>
            {currentPrice?.data && (
              <>
                <p className="text-gray-600 font-sm">
                  {getTimeFromIndex(currentPrice?.index)}
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {currentPrice?.data.priceWithVat?.toFixed(2)}
                </p>
                <p className="text-gray-500 text-sm">c/kWh</p>
              </>
            )}
          </div>
        </Card>
        <Tabs defaultValue={formattedToday} onValueChange={setSelectedDate}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value={formattedYesterday}>Eilen</TabsTrigger>
            <TabsTrigger value={formattedToday}>Tänään</TabsTrigger>
            <TabsTrigger value={formattedTomorrow}>Huomenna</TabsTrigger>
          </TabsList>
          <TabsContent value={selectedDate}>
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
                  <p className="text-gray-500 text-sm font-semibold">
                    Keskihinta
                  </p>
                  <p className="text-gray-600 font-sm">
                    {getAveragePriceLabel(selectedDate)}
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {averagePrice?.toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-sm">c/kWh</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};
