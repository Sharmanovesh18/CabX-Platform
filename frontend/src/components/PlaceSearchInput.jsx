import React, { useState, useEffect, useRef } from 'react';
import { searchPlaces, popularCities, formatPlaceName } from '../services/placeSearchService';
import './PlaceSearchInput.css';

const PlaceSearchInput = ({ 
  placeholder = "Enter location",
  value = "",
  onChange,
  onSelectPlace,
  label = ""
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Fetch suggestions when user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.trim().length < 2) {
        setSuggestions(popularCities);
        setShowSuggestions(true);
        return;
      }

      setLoading(true);
      try {
        const results = await searchPlaces(value);
        setSuggestions(results);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [value]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSelectSuggestion(suggestions[selectedIndex]);
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSuggestions, selectedIndex, suggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion) => {
    const placeName = formatPlaceName(suggestion);
    onChange(placeName);
    onSelectPlace(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="place-search-container">
      {label && <label className="place-search-label">{label}</label>}
      
      <div className="place-search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="place-search-input"
          autoComplete="off"
        />
        {loading && <span className="place-search-loading">🔍</span>}
        {value && (
          <button
            className="place-search-clear"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="place-search-suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id || suggestion.name || index}
              className={`place-search-suggestion-item ${
                index === selectedIndex ? "selected" : ""
              }`}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="suggestion-icon">📍</div>
              <div className="suggestion-content">
                <div className="suggestion-name">
                  {formatPlaceName(suggestion)}
                </div>
                {suggestion.address && (
                  <div className="suggestion-address">
                    {typeof suggestion.address === "object"
                      ? `${suggestion.address.city || ""}, ${suggestion.address.state || ""}`
                      : suggestion.address}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && value.trim().length >= 2 && suggestions.length === 0 && !loading && (
        <div className="place-search-no-results">
          No places found for "{value}"
        </div>
      )}
    </div>
  );
};

export default PlaceSearchInput;
