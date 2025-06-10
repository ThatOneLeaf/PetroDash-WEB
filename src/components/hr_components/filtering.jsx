import { useMemo } from "react";

export const useFilteredData = (data, filters, searchQuery = "") => {
  return useMemo(() => {
    return data.filter((item) => {
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        const itemValue = item[key];

        if (typeof itemValue === "string") {
          return (
            itemValue.trim().toLowerCase() ===
            value.toString().trim().toLowerCase()
          );
        }

        return itemValue?.toString() === value.toString();
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
