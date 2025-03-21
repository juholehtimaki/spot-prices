import { useDailyPricesQuery } from "@/lib/api/prices/hooks";
import { getDateInApiFormat } from "@/lib/dateUtils";
import { addDays, format, getHours, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { PageContainer } from "../utility/PageContainer";
import clsx from "clsx";

const PRICE_THRESHOLDS = {
  cheap: 10,
  moderate: 20,
};

const getPriceColor = (price: number) => {
  if (price <= PRICE_THRESHOLDS.cheap) return "text-green-600";
  if (price <= PRICE_THRESHOLDS.moderate) return "text-blue-500";
  return "text-red-600";
};

const getTimeFromIndex = (index?: number) => {
  if (index === undefined) return "";
  const start = index.toString().padStart(2, "0");
  const end = (index + 1).toString().padStart(2, "0");
  return `Klo ${start} - ${end}`;
};

export const DailyDashboardPage = () => {
  const today = new Date();
  const formattedDates = {
    yesterday: format(subDays(today, 2), "yyyy-MM-dd"),
    today: format(today, "yyyy-MM-dd"),
    tomorrow: format(addDays(today, 1), "yyyy-MM-dd"),
  };

  const [selectedDate, setSelectedDate] = useState(formattedDates.today);
  const { data } = useDailyPricesQuery(
    getDateInApiFormat(new Date(selectedDate)),
  );
  const { data: currentDayData } = useDailyPricesQuery(
    getDateInApiFormat(today),
  );

  const currentPrice = useMemo(() => {
    if (!currentDayData?.length) return undefined;
    const currentHour = getHours(new Date());
    return { data: currentDayData[currentHour], index: currentHour };
  }, [currentDayData]);

  const priceStats = useMemo(() => {
    if (!data?.length) return {};
    return {
      lowest: data.reduce(
        (min, d, index) =>
          d.price <= min.data.price ? { data: d, index } : min,
        { data: data[0], index: 0 },
      ),
      highest: data.reduce(
        (max, d, index) =>
          d.price >= max.data.price ? { data: d, index } : max,
        { data: data[0], index: 0 },
      ),
      average: data.reduce((sum, d) => sum + d.price, 0) / data.length,
    };
  }, [data]);

  return (
    <PageContainer>
      <div className="flex flex-col w-full gap-5">
        <Card>
          <PriceCard
            title="Hinta nyt"
            price={currentPrice?.data.price}
            timeLabel={getTimeFromIndex(currentPrice?.index)}
          />
        </Card>
        <Tabs
          defaultValue={formattedDates.today}
          onValueChange={setSelectedDate}
        >
          <PriceTabs formattedDates={formattedDates} />
          <TabsContent value={selectedDate}>
            <Card className="w-full">
              <div className="flex justify-between w-full">
                <PriceCard
                  title="Halvin hinta"
                  timeLabel={getTimeFromIndex(priceStats.lowest?.index)}
                  price={priceStats.lowest?.data.priceWithVat}
                />
                <Separator orientation="vertical" />
                <PriceCard
                  title="Kallein hinta"
                  timeLabel={getTimeFromIndex(priceStats.highest?.index)}
                  price={priceStats.highest?.data.priceWithVat}
                />
                <Separator orientation="vertical" />
                <PriceCard
                  title="Keskihinta"
                  price={priceStats.average}
                  timeLabel="Tänään"
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

type PriceTabsProps = {
  formattedDates: Record<string, string>;
};

const PriceTabs: React.FC<PriceTabsProps> = ({ formattedDates }) => (
  <TabsList className="grid w-full grid-cols-3">
    {Object.entries(formattedDates).map(([key, value]) => (
      <TabsTrigger key={key} value={value}>
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </TabsTrigger>
    ))}
  </TabsList>
);

type PriceCardProps = {
  title: string;
  timeLabel: string;
  price?: number;
};

const PriceCard: React.FC<PriceCardProps> = ({ title, timeLabel, price }) => (
  <div className="flex flex-col gap-1 text-center flex-1">
    <p className="text-gray-500 text-sm font-semibold">{title}</p>
    {price !== undefined && (
      <>
        <p className="text-gray-600 font-sm">{timeLabel}</p>
        <p className={clsx("text-xl font-bold", getPriceColor(price))}>
          {price.toFixed(2)}
        </p>
        <p className="text-gray-500 text-sm">c/kWh</p>
      </>
    )}
  </div>
);
