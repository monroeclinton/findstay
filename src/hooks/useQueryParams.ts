import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export const useQueryParams = <T>(): [
    (_: string) => string | null,
    (_: Partial<T>) => void
] => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const getQueryParam = useCallback(
        (key: string) => searchParams.get(key),
        [searchParams]
    );

    const setQueryParams = useCallback(
        (params: Partial<T>) => {
            const urlSearchParams = new URLSearchParams(
                Object.fromEntries(searchParams)
            );

            Object.entries(params).forEach(([key, value]) => {
                if (value === undefined || value === null) {
                    urlSearchParams.delete(key);
                } else {
                    urlSearchParams.set(key, String(value));
                }
            });

            const search = urlSearchParams.toString();
            const query = search ? `?${search}` : "";
            router.replace(`${pathname}${query}`);
        },
        [pathname, router, searchParams]
    );

    return [getQueryParam, setQueryParams];
};
