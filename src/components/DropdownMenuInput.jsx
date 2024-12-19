import React from "react";

export default function DropdownMenuInput({
  id,
  label,
  options,
  placeholder = "Select an option",
  value,
  onChange,
}) {
  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => {
          const element = e.target;
          element.classList.toggle("text-gray-400", element.value === "");
          element.classList.toggle("text-primaryGray", element.value !== "");
        }}
      >
        <option value="" disabled hidden selected className="text-gray-400">
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option} className="text-primaryGray">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
