import { useMemo } from "react";

export function useFilteredData(data, filters) {
  return useMemo(() => {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        return item[key] === value;
      });
    });
  }, [data, filters]);
}
