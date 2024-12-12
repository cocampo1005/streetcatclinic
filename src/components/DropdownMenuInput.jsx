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
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled selected className="text-gray-500">
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
