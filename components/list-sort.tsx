import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";

interface ListSortProps {
  sortDirection: string;
  onChange: (direction: "ASC" | "DESC") => void;
}

export default function ListSort({ sortDirection, onChange }: ListSortProps) {
  return (
    <div className="flex space-x-1 items-center">
      <button
        className={`${sortDirection === "ASC" && "text-amber-700 bg-amber-100"}
        basic-transition p-1 hover:bg-amber-100 hover:text-amber-700 rounded`}
        onClick={() => onChange("ASC")}
      >
        <ArrowUpIcon className={"w-5 h-5"} />
      </button>
        <button
        className={`${sortDirection === "DESC" && "text-amber-700 bg-amber-100"}
        basic-transition p-1 hover:bg-amber-100 hover:text-amber-700 rounded`}
        onClick={() => onChange("DESC")}
      >
        <ArrowDownIcon className={"w-5 h-5"} />
      </button>
    </div>
  );
}
