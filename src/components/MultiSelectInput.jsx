import { useRef, useEffect, useState } from "react";
import chevron from "../assets/icons/chevron-down.png";
import { RoundX } from "./svgs/Icons";

const DropdownComponent = ({
  label,
  options,
  placeholder,
  value = [],
  onChange,
}) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const dropdownRef = useRef(null); // Reference to the dropdown container
  const inputRef = useRef(null); // Reference to the div that's acting as the input

  // Handle toggling an option (add/remove from selection)
  const toggleOption = (option) => {
    const newSelected = value.includes(option)
      ? value.filter((item) => item !== option) // Remove from selection
      : [...value, option]; // Add to selection

    onChange(newSelected); // Notify the parent of the updated selection
  };

  // Handle click outside of the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setDropdownVisible(false);
        inputRef.current.blur(); // Remove focus from the input div
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full">
      <label>{label}</label>
      <div
        ref={inputRef} // Attach ref to the input container
        className="relative rounded-lg border border-secondaryGray focus:border-primaryGreen focus:ring-1 focus:ring-primaryGreen"
        tabIndex={0} // Ensures the div can receive focus
        onFocus={() => setDropdownVisible(true)}
        onBlur={() => {
          // Delay to ensure click events inside the dropdown are handled
          setTimeout(() => setDropdownVisible(false), 100);
        }}
      >
        <div className="flex flex-wrap items-center gap-2 rounded-lg py-1 pl-2 pr-8">
          {value.length > 0 ? (
            value.map((option) => (
              <div
                key={option}
                className="flex items-center bg-tertiaryGray rounded-full pl-3 pr-2 py-1 text-sm"
              >
                {option}
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => toggleOption(option)}
                  className="ml-2 text-gray-600"
                >
                  <RoundX />
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-400 text-sm p-1">{placeholder}</span>
          )}
          <img src={chevron} className="absolute top-1/5 right-2 h-3.5 w-3.5" />
        </div>
        {isDropdownVisible && (
          <div
            ref={dropdownRef} // Attach ref to the dropdown container
            className="absolute top-full shadow-xl left-0 right-0 bg-white border rounded-lg mt-px z-10 max-h-40 overflow-y-auto"
          >
            {options.map((option) => (
              <div
                key={option}
                onClick={() => toggleOption(option)}
                className={`cursor-pointer px-4 py-2 ${
                  value.includes(option)
                    ? "bg-primaryGreen text-white hover:text-primaryGreen"
                    : ""
                } hover:bg-tertiaryGray`}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownComponent;
