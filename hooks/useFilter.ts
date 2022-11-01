import {useMemo} from "react";

export function useFilter<T>(dataSource: T[], query: string, key: keyof T) {
    return useMemo(() => {
        return dataSource.filter((data: T) =>
            (data[key] as string).toLowerCase().includes(query.toLowerCase())
        );
    }, [query, dataSource]);
}
