import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  YAxis,
  Line,
  Tooltip,
  TooltipProps,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import dayjs from "dayjs";

interface CustomLineChartProps {
  data: Array<{
    key: string;
    value: string | number;
  }>;
}

export default function CustomLineChart({ data }: CustomLineChartProps) {
  return (
    <div className="w-full md:w-1/2 h-48 md:h-72">
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid vertical={false} opacity={0.3} />
          <YAxis
            width={30}
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            domain={["dataMin", "auto"]}
            tick={{ style: { fontWeight: 400, fill: "#374151" } }}
            tickFormatter={(value: number) => value.toLocaleString("id-ID")}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#b45309"
            strokeWidth={1.5}
            activeDot={{ r: 5 }}
            dot={false}
          />
          <Tooltip
            content={<LineChartTooltip />}
            wrapperStyle={{ outline: "none" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  function LineChartTooltip({
    active,
    payload,
  }: TooltipProps<ValueType, NameType>) {
    if (active) {
      return (
        <div className="shadow-lg bg-white p-3 rounded-lg space-y-1">
          {payload?.map((v, idx: number) => (
            <div key={idx}>
              <h5 className={"font-light"}>
                  {dayjs(v?.payload?.key).format('DD MMMM YYYY')}
              </h5>
              <h5 className="text-amber-700">
                {v.value?.toLocaleString("id-ID")}
              </h5>
            </div>
          ))}
        </div>
      );
    }
    return null;
  }
}
