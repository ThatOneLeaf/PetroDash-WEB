import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Popper from "@mui/material/Popper";
import ClickAwayListener from "@mui/material/ClickAwayListener";

const Search = ({ onSearch, suggestions = [], placeholder = "Search..." }) => {
  const [query, setQuery] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const anchorRef = React.useRef(null);

  const filteredSuggestions = React.useMemo(() => {
    if (!query) return [];
    const lower = query.toLowerCase();
    return suggestions
      .filter((s) => s && s.toLowerCase().includes(lower))
      .slice(0, 8);
  }, [query, suggestions]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setShowSuggestions(!!val && filteredSuggestions.length > 0);
    if (onSearch) onSearch(val);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    if (onSearch) onSearch(suggestion);
  };

  const handleFocus = () => {
    setShowSuggestions(filteredSuggestions.length > 0);
  };

  const handleClickAway = (event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target)
    ) {
      return;
    }
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery("");
    setShowSuggestions(false);
    if (onSearch) onSearch("");
  };

  return (
    <Box display="inline-block" position="relative" className="search-suggestion-root">
      <TextField
        inputRef={anchorRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        autoComplete="off"
        size="small"
        sx={{
          width: 250,
          minWidth: 0,
          height: 32,
          "& .MuiOutlinedInput-root": {
            borderRadius: 100,
            border: "2px solid #1A1818",
            fontSize: 13,
            background: "#fff",
            color: "#555",
            height: 40,
            minHeight: 40,
            paddingTop: 0,
            paddingBottom: 0,
          },
          "& .MuiInputBase-input": {
            height: "32px !important",
            padding: "0 10px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            fontSize: 13,
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {query ? (
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon sx={{ fontSize: 18 }} />
                </IconButton>
              ) : (
                <SearchIcon sx={{ color: "#555", fontSize: 18 }} />
              )}
            </InputAdornment>
          ),
        }}
      />
      <Popper
        open={showSuggestions && (filteredSuggestions.length > 0 || (!!query && filteredSuggestions.length === 0))}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1300, width: anchorRef.current ? anchorRef.current.offsetWidth : undefined }}
      >
        <ClickAwayListener onClickAway={handleClickAway}>
          <Paper
            elevation={4}
            sx={{
              mt: 1,
              borderRadius: 2,
              maxHeight: 120,
              overflowY: "auto",
              p: 0,
              minWidth: 160,
            }}
          >
            {filteredSuggestions.length > 0 ? (
              <List dense disablePadding>
                {filteredSuggestions.map((s, idx) => (
                  <ListItemButton
                    key={idx}
                    onClick={() => handleSuggestionClick(s)}
                    sx={{
                      fontSize: 13,
                      color: "#333",
                      minHeight: 28,
                      px: 1.5,
                    }}
                  >
                    <ListItemText primary={s} primaryTypographyProps={{ fontSize: 13 }} />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              !!query && (
                <Box sx={{ p: 1, color: "#888", fontSize: 13, textAlign: "center" }}>
                  No data for '{query}'
                </Box>
              )
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};

export default Search;
