import { useMemo } from "react";

export const useFilteredData = (data, filters, searchQuery = "") => {
  return useMemo(() => {
    return data.filter((item) => {
      // Apply filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key] && item[key].toString() === value;
      });

      // Apply search
      const matchesSearch = !searchQuery
        ? true
        : Object.values(item).some(
            (val) =>
              val &&
              val.toString().toLowerCase().includes(searchQuery.toLowerCase())
          );

      return matchesFilters && matchesSearch;
    });
  }, [data, filters, searchQuery]);
};
