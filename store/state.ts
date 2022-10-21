import create from "zustand";

type LoaderStore = {
    visible: boolean,
    hide: () => void,
    show: () => void
}

type AlertPayload = {
    show: boolean;
    message: string;
    status: "success" | "error";
};

export const useLoaderStore = create<LoaderStore>((set) => ({
    visible: false,
    hide: () => set(() => ({
        visible: false
    })),
    show: () => set(() => ({
        visible: true
    }))
}));


// export const useAlertStore = create<AlertStore>()
