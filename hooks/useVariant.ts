import useSWR from "swr";
import { Variant as PrismaVariant } from "@prisma/client";

type UseVariant = {
    variants: Array<PrismaVariant>,
    isLoading: boolean,
    isError: boolean
}

export default function useVariant(): UseVariant {
    const { data, error } = useSWR("/variant");

    return {
        variants: data ?? [],
        isLoading: !error && !data,
        isError: error,
    };
}
