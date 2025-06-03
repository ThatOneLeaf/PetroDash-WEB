import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Popper from "@mui/material/Popper";
import ClickAwayListener from "@mui/material/ClickAwayListener";

// Main Search Component for filtering/searching with suggestions
const Search = ({ onSearch, suggestions = [] }) => {
  // State for the current input value
  const [query, setQuery] = React.useState("");
  // State to control visibility of suggestions dropdown
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  // Ref for the input element (used as anchor for Popper)
  const anchorRef = React.useRef(null);

  // Memoized filtered suggestions based on current input
  const filteredSuggestions = React.useMemo(() => {
    if (!query) return [];
    const lower = query.toLowerCase();
    return suggestions
      .filter((s) => s && s.toLowerCase().includes(lower))
      .slice(0, 8);
  }, [query, suggestions]);

  // Handle input value change
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setShowSuggestions(!!val && filteredSuggestions.length > 0);
    if (onSearch) onSearch(val);
  };

  // Handle clicking a suggestion (fills input and triggers search)
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    if (onSearch) onSearch(suggestion);
  };

  // Show suggestions when input is focused and there are suggestions
  const handleFocus = () => {
    setShowSuggestions(filteredSuggestions.length > 0);
  };

  // Hide suggestions when clicking away from the input/suggestion list
  const handleClickAway = (event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target)
    ) {
      return;
    }
    setShowSuggestions(false);
  };

  return (
    // Container for search input and suggestions dropdown
    <Box display="inline-block" position="relative" className="search-suggestion-root">
      {/* Search input field */}
      <TextField
        inputRef={anchorRef}
        type="text"
        placeholder="Company, Quarter, Year, etc."
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        autoComplete="off"
        size="small"
        sx={{
          width: 315,
          minWidth: 0,
          height: 40, // Match Filter button height
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            border: "1px solid #182959",
            fontSize: 14,
            background: "#fff",
            color: "#555",
            height: 40, // Ensure input itself is 40px
            minHeight: 40,
            paddingTop: 0,
            paddingBottom: 0,
          },
          "& .MuiInputBase-input": {
            height: "40px !important",
            padding: "0 14px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon sx={{ color: "#555" }} />
            </InputAdornment>
          ),
        }}
      />
      {/* Suggestions dropdown using Popper */}
      <Popper
        open={showSuggestions && filteredSuggestions.length > 0}
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
              maxHeight: 180,
              overflowY: "auto",
              p: 0,
            }}
          >
            {/* List of suggestion items */}
            <List dense disablePadding>
              {filteredSuggestions.map((s, idx) => (
                <ListItemButton
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  sx={{
                    fontSize: 16,
                    color: "#333",
                  }}
                >
                  <ListItemText primary={s} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};

export default Search;

/*
Usage Example:

<Search onSearch={val => console.log(val)} suggestions={['apple', 'banana', 'cherry']} />
*/
