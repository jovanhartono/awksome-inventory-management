import dayjs from "dayjs";

const buttonFilter = [
  {
    key: "1W",
    orderDateFrom: dayjs().subtract(1, "w").format("YYYY-MM-DD"),
  },
  {
    key: "2W",
    orderDateFrom: dayjs().subtract(2, "w").format("YYYY-MM-DD"),
  },
  {
    key: "1M",
    orderDateFrom: dayjs().subtract(1, "M").format("YYYY-MM-DD"),
  },
  {
    key: "3M",
    orderDateFrom: dayjs().subtract(3, "M").format("YYYY-MM-DD"),
  },
  {
    key: "6W",
    orderDateFrom: dayjs().subtract(6, "M").format("YYYY-MM-DD"),
  },
  {
    key: "1Y",
    orderDateFrom: dayjs().subtract(1, "y").format("YYYY-MM-DD"),
  },
];

export default buttonFilter;
