import React from "react";
import { Search, X } from "lucide-react";
import "./Search.css";

const SearchComponent = ({ value, onChange, placeholder = "Search..." }) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange("");
    }
  };

  return (
    <div className="search-wrapper">
      <div className="search-inner">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />

        {value && (
          <X 
            className="clear-icon" 
            size={19} 
            onClick={handleClear}
          />
        )}
      </div>
    </div>
  );
};

export default SearchComponent;