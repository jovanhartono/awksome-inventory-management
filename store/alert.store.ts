import create from "zustand";
import produce from "immer";

export enum AlertStatus {
  SUCCESS = "success",
  ERROR = "error",
}

type AlertPayload = {
  visible: boolean;
  message: string;
  status: AlertStatus;
};

type AlertStore = {
  alertState: AlertPayload;
  show: (message: string, status?: AlertStatus) => void;
  hide: () => void;
};

export const useAlertStore = create<AlertStore>((set) => ({
  alertState: {
    visible: false,
    message: "Default fallback alert message",
    status: AlertStatus.SUCCESS,
  },
  show: (message: string, status: AlertStatus = AlertStatus.SUCCESS) =>
    set(
      produce(({ alertState, hide }: AlertStore) => {
        alertState.visible = true;
        alertState.status = status;
        alertState.message = message;

        setTimeout(() => {
            hide();
        }, 3000)
      })
    ),
  hide: () =>
    set(produce((state: AlertStore) => void(state.alertState.visible = false))),
}));
