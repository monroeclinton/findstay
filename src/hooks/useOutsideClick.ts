import { useEffect } from "react";

const useOutsideClick = (
    callback: (e: MouseEvent) => void,
    ref: React.RefObject<HTMLElement>,
    within: React.RefObject<HTMLElement> | null = null
) => {
    useEffect(() => {
        const onOutsideClick = (e: MouseEvent) => {
            if (!within?.current?.contains(e.target as Node)) {
                return;
            }

            if (e && !ref.current?.contains(e.target as Node)) {
                callback(e);
            }
        };

        document.addEventListener("mousedown", onOutsideClick);

        return () => document.removeEventListener("mousedown", onOutsideClick);
    }, [ref, callback, within]);
};

export default useOutsideClick;
