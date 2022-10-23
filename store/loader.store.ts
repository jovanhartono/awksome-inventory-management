import create from "zustand";

type LoaderStore = {
  visible: boolean;
  hide: () => void;
  show: () => void;
};

export const useLoaderStore = create<LoaderStore>((set) => ({
  visible: false,
  hide: () =>
    set(() => ({
      visible: false,
    })),
  show: () =>
    set(() => ({
      visible: true,
    })),
}));
