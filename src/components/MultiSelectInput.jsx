import React, { useState } from "react";
import chevron from "../assets/icons/chevron-down.png";
import { RoundX } from "./svgs/Icons";

export default function MultiSelect({ options, label, placeholder }) {
  const [selected, setSelected] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const toggleOption = (option) => {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="w-full">
      <label>{label}</label>
      <div
        className="relative rounded-lg border border-secondaryGray focus:border-primaryGreen focus:ring-1 focus:ring-primaryGreen"
        tabIndex={0} // Ensures the div can receive focus
        onFocus={() => setDropdownVisible(true)}
        onBlur={() => {
          // Delay to ensure click events inside the dropdown are handled
          setTimeout(() => setDropdownVisible(false), 100);
        }}
      >
        <div className="flex flex-wrap items-center gap-2 rounded-lg p-2 pr-8">
          {selected.length > 0 ? (
            selected.map((option) => (
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
            <span className="text-gray-400">{placeholder}</span>
          )}
          <img src={chevron} className="absolute top-1/5 right-2 h-3.5 w-3.5" />
        </div>
        {isDropdownVisible && (
          <div className="absolute top-full shadow-xl left-0 right-0 bg-white border rounded-lg mt-px z-10 max-h-40 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option}
                onClick={() => toggleOption(option)}
                className={`cursor-pointer px-4 py-2 ${
                  selected.includes(option)
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
}
