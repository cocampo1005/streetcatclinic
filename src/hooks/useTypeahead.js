import { useCallback, useEffect, useRef } from "react";

const RESET_DELAY = 700;

export default function useTypeahead({
  options = [],
  onMatch,
  resetDelay = RESET_DELAY,
}) {
  const searchRef = useRef("");
  const timeoutRef = useRef(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  return useCallback(
    (event) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.key.length !== 1
      ) {
        return false;
      }

      const pressedKey = event.key.toLocaleLowerCase();
      const nextSearch = `${searchRef.current}${pressedKey}`;

      let matchIndex = options.findIndex((option) =>
        String(option).toLocaleLowerCase().startsWith(nextSearch),
      );

      if (matchIndex === -1) {
        searchRef.current = pressedKey;

        matchIndex = options.findIndex((option) =>
          String(option).toLocaleLowerCase().startsWith(pressedKey),
        );
      } else {
        searchRef.current = nextSearch;
      }

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        searchRef.current = "";
      }, resetDelay);

      if (matchIndex === -1) {
        return false;
      }

      onMatch(matchIndex);
      return true;
    },
    [onMatch, options, resetDelay],
  );
}
