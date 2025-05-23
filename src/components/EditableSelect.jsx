import React, { useEffect, useRef, useState } from "react";
import chevron from "../assets/icons/chevron-down.png";

export default function EditableSelect({ options, value = "", onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const dropdownRef = useRef(null);

  // Sync the local `selectedOption` state with the `value` prop whenever it changes
  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  // This function handles both selecting from the dropdown and typing in the input
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSelectedOption(newValue); // Update the local state to reflect typed value
    onChange(newValue); // Update the parent state as well
  };

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onChange(option);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative w-full"
      ref={dropdownRef}
      onClick={() => setIsOpen(true)}
    >
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded"
        value={selectedOption}
        onChange={handleInputChange}
        placeholder="Select or edit option"
      />
      <img src={chevron} className="absolute top-1/3 right-2 h-3.5 w-3.5" />
      {isOpen && (
        <ul className="absolute w-full bg-white border border-gray-300 rounded shadow mt-1 max-h-40 overflow-y-auto z-10">
          {options?.map((option, index) => (
            <li
              key={index}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
