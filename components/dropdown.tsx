import { Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type DropdownPayload = {
  label: string;
  value: string;
};

type DropdownProps = {
  value?: string;
  changeHandler?: (event: DropdownPayload) => void;
  options: DropdownPayload[];
};

const Dropdown = ({ value, options, changeHandler }: DropdownProps) => {
  const [selected, setSelected] = useState<DropdownPayload>(
    options.find((x) => x.value === value) ?? options[0]
  );

  useEffect(() => {
    changeHandler && changeHandler(selected);
  }, [selected]);

  return (
    <div className={"w-full"}>
      <Listbox value={selected} onChange={setSelected} by={"value"}>
        <div className="relative">
          <Listbox.Button className="w-full text-left p-2 border border-gray-300 rounded font-normal text-base focus:border-amber-700 focus:outline-none">
            <span className="block truncate">
              {selected?.label ?? "Select Value"}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="z-20 absolute mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 text-base shadow-md focus:outline-none sm:text-sm">
              {options.map((data: DropdownPayload, idx: number) => (
                <Listbox.Option
                  key={idx}
                  className={({
                    active,
                  }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 
                                    ${
                                      active
                                        ? "bg-amber-100 text-amber-900"
                                        : "text-gray-900"
                                    }`}
                  value={data}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {data.label}
                      </span>
                      <p>{selected}</p>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
              {options.length === 0 && (
                <Listbox.Option
                  disabled={true}
                  value={"empty"}
                  className={"bg-slate-200 py-2 px-4 flex items-center"}
                >
                  <XMarkIcon className={"w-5 h-5 text-slate-700"} />
                  <span className={"text-sm font-light text-slate-700"}>
                    No more variants
                  </span>
                </Listbox.Option>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default Dropdown;
