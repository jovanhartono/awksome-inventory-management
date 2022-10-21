import { AlertStatus, useAlertStore } from "../store/alert.store";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Alert() {
  const {
    alertState: { status, message, visible },
  } = useAlertStore();

  return visible ? (
      <div className="fixed top-1.5 ">
        <div
          className={`${status === AlertStatus.SUCCESS && "bg-green-100"}
                       ${status === AlertStatus.ERROR && "bg-red-100"}
                        rounded p-3 flex items-center space-x-3 mx-auto`}
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
  ) : (
    <></>
  );
}
