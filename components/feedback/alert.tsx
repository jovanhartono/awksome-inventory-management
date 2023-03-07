import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useAlertStore, AlertStatus } from "@store";

export default function Alert() {
  const {
    alertState: { status, message, visible },
  } = useAlertStore();

  return (
    <Transition
      as={Fragment}
      show={visible}
      enter="duration-200 transform transition ease-in-out"
      enterFrom="-translate-y-6 opacity-0"
      enterTo="translate-y-0 opacity-100"
      leave="duration-200 transform transition ease-in-out"
      leaveFrom="translate-y-0 opacity-100"
      leaveTo="-translate-y-6 opacity-0"
    >
      <div className="fixed top-6 flex justify-center left-0 right-0 px-6 md:px-0 z-30">
        <div
          className={`${status === AlertStatus.SUCCESS && "bg-green-100"}
                           ${status === AlertStatus.ERROR && "bg-red-100"}
                            rounded p-3 flex items-center space-x-3 container`}
        >
          {status === AlertStatus.SUCCESS && (
            <CheckIcon className={"w-5 h-5 text-green-700"} />
          )}
          {status === AlertStatus.ERROR && (
            <XMarkIcon className={"w-5 h-5 text-red-700"} />
          )}
          <span
            className={`${status === AlertStatus.SUCCESS && "text-green-700"} 
                            ${status === AlertStatus.ERROR && "text-red-700"} 
                            font-medium`}
          >
            {message}
          </span>
        </div>
      </div>
    </Transition>
  );
}
