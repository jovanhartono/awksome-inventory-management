import { Fragment, ReactNode, useEffect, useState } from "react";
import { Transition, Dialog as HeadlessDialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface DialogProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children?: ReactNode;
}

export default function Dialog(dialogProps: DialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(dialogProps.isOpen);

  useEffect(() => {
    setIsOpen(dialogProps.isOpen);
  }, [dialogProps.isOpen]);

  function closeDialog() {
    setIsOpen(false);
    dialogProps.onClose && dialogProps.onClose();
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessDialog as="div" className="relative z-10" onClose={closeDialog}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HeadlessDialog.Panel className="w-full max-w-md transform overflow-hidden rounded bg-white p-5 text-left align-middle shadow-xl transition-all">
                <HeadlessDialog.Title
                  as="div"
                  className="flex justify-between items-center"
                >
                  <h3 className="text-xl font-medium leading-6 text-gray-900">
                    {dialogProps.title}
                  </h3>
                  <button
                    className="p-2 rounded-full bg-amber-100"
                    onClick={closeDialog}
                  >
                    <XMarkIcon className={"w-4 h-4 text-amber-700"} />
                  </button>
                </HeadlessDialog.Title>
                {dialogProps.children}
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}
