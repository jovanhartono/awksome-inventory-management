import { ButtonSubmit, Dialog } from "@components";
import { ChangeEvent, useState } from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { AlertStatus, useAlertStore } from "../store/alert.store";

interface DateRangeProps {
  active: boolean;
  onChange: (dateFrom: string, dateTo: string) => void;
}

export default function DateRange({
  active,
  onChange: setOrderDateFilter,
}: DateRangeProps) {
  const { show: showAlert } = useAlertStore();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const onSubmit = () => {
    if (!dateFrom || !dateTo) {
      showAlert("Date From and Date To must be filled.", AlertStatus.ERROR);
      return;
    }

    setOrderDateFilter(dateFrom, dateTo);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={"Date Filter"}
      >
        <section className="space-y-3">
          <div className="flex items-center justify-between space-x-2.5">
            <label htmlFor={"filter-date-from"} className={"whitespace-nowrap"}>
              Date From
            </label>
            <input
              className={"w-32"}
              id={"filter-date-from"}
              type={"date"}
              value={dateFrom}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setDateFrom(dayjs(event.target.value).format("YYYY-MM-DD"));
              }}
            />
          </div>
          <div className="flex items-center justify-between space-x-2.5">
            <label htmlFor={"filter-date-to"} className={"whitespace-nowrap"}>
              Date To
            </label>
            <input
              className={"w-32"}
              id={"filter-date-to"}
              type={"date"}
              value={dateTo}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setDateTo(dayjs(event.target.value).format("YYYY-MM-DD"));
              }}
            />
          </div>
        </section>
        <ButtonSubmit text={"Apply"} className={"mt-6"} onClick={onSubmit} />
      </Dialog>
      <button
        className={`${
          active && "text-amber-700 bg-amber-100"
        } basic-transition hover:text-amber-700 hover:bg-amber-100 
        p-1.5 rounded text-sm flex items-center justify-between space-x-1`}
        onClick={() => setIsDialogOpen(true)}
      >
        <p>Date</p>
        <FunnelIcon className="w-4 h-4" />
      </button>
    </>
  );
}
