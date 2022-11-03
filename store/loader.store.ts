import create from "zustand";
import produce from "immer";

type LoaderStore = {
  visible: boolean;
  hide: () => void;
  show: () => void;
};

export const useLoaderStore = create<LoaderStore>((set) => ({
  visible: false,
  hide: () =>
    set(
      produce((draft: LoaderStore) => {
        if (draft.visible) {
          draft.visible = false;
        }
      })
    ),
  show: () =>
    set(
      produce((draft: LoaderStore) => {
        if (!draft.visible) {
          draft.visible = true;
        }
      })
    ),
}));
