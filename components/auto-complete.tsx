import { ChangeEvent, Fragment, useEffect, useMemo, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

type ComboboxOption = {
  label: string;
  value: string;
};

type ComboboxProps = {
  value: string;
  onChange: (selectedOption: ComboboxOption) => void;
  options: ComboboxOption[];
};

export default function AutoComplete({
  options,
  value,
  onChange,
}: ComboboxProps) {
  const [selected, setSelected] = useState<ComboboxOption>({
    value: "",
    label: "",
  });
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    const selectedOption = options.find((x) => x.value === value) ?? {
      value: "",
      label: "",
    };
    setSelected(selectedOption);
  }, [value, options]);

  const filteredProducts = useMemo(() => {
    return query === ""
      ? options
      : options.filter((option) =>
          option.label
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );
  }, [query, options]);

  return (
    <div className="w-full">
      <Combobox value={selected} onChange={onChange} by={"value"}>
        <div className="relative mt-1">
          <div className="w-full text-left p-2 border border-gray-300 rounded focus:border-amber-700 focus:outline-none">
            {/*wrapped combobox input with div button to open the options on click. */}
            <Combobox.Button as={"div"}>
              <Combobox.Input
                className="w-full border-none p-0"
                displayValue={(option: ComboboxOption) => option?.label ?? ""}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setQuery(event.target.value)
                }
              />
            </Combobox.Button>
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="z-20 absolute mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 text-base shadow-md focus:outline-none sm:text-sm">
              {filteredProducts.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredProducts.map((option) => (
                  <Combobox.Option
                    key={option.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                      }`
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {option.label}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600 ${
                              active ? "text-white" : "text-teal-600"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}
