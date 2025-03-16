import { useDailyPricesQuery } from "@/lib/api/prices/hooks";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Dot,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { PageContainer } from "../utility/PageContainer";

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "hsl(var(--chart-2))",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export const DailyPricesPage = () => {
  const { data, isLoading } = useDailyPricesQuery("2025/03/09");

  // const total = useMemo(
  //   () => ({
  //     desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
  //     mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
  //   }),
  //   [],
  // );

  const chartData = data
    ? data.map((item, index) => ({
        date: `${index}-${index + 1}`,
        visitors: item.price,
      }))
    : [];

  return (
    <PageContainer>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Line Chart - Dots Colors</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 24,
                left: 24,
                right: 24,
              }}
            >
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    nameKey="visitors"
                    hideLabel
                  />
                }
              />
              <Line
                dataKey="visitors"
                type="natural"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={({ payload, ...props }) => {
                  return (
                    <Dot
                      key={payload.browser}
                      r={5}
                      cx={props.cx}
                      cy={props.cy}
                      fill={payload.fill}
                      stroke={payload.fill}
                    />
                  );
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="leading-none text-muted-foreground">
            Showing total visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
    </PageContainer>
  );
};
