import { useEffect, useRef, useState } from "react";
import chevron from "../assets/icons/chevron-down.png";

export default function EditableSelect({ options = [], value = "", onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const optionRefs = useRef([]);

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const scrollToOption = (index) => {
    window.requestAnimationFrame(() => {
      optionRefs.current[index]?.scrollIntoView({
        block: "nearest",
      });
    });
  };

  const findMatchingIndex = (searchValue) => {
    const normalizedSearch = searchValue.trim().toLocaleLowerCase();

    if (!normalizedSearch) {
      return -1;
    }

    return options.findIndex((option) =>
      String(option).toLocaleLowerCase().startsWith(normalizedSearch),
    );
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    const matchIndex = findMatchingIndex(newValue);

    setSelectedOption(newValue);
    setIsOpen(true);
    setHighlightedIndex(matchIndex);
    onChange(newValue);

    if (matchIndex >= 0) {
      scrollToOption(matchIndex);
    }
  };

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(option);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);

      const nextIndex =
        highlightedIndex < options.length - 1 ? highlightedIndex + 1 : 0;

      setHighlightedIndex(nextIndex);
      scrollToOption(nextIndex);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);

      const previousIndex =
        highlightedIndex > 0 ? highlightedIndex - 1 : options.length - 1;

      setHighlightedIndex(previousIndex);
      scrollToOption(previousIndex);
      return;
    }

    if (event.key === "Enter" && isOpen && highlightedIndex >= 0) {
      event.preventDefault();
      handleSelect(options[highlightedIndex]);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleFocus = () => {
    const matchIndex = findMatchingIndex(selectedOption);

    setIsOpen(true);
    setHighlightedIndex(matchIndex);

    if (matchIndex >= 0) {
      scrollToOption(matchIndex);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        className="w-full rounded border border-gray-300 px-3 py-2"
        value={selectedOption}
        placeholder="Select or edit option"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        autoComplete="off"
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />

      <button
        type="button"
        className="absolute right-0 top-0 flex h-full items-center px-2"
        aria-label="Toggle options"
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={() => setIsOpen((current) => !current)}
      >
        <img src={chevron} alt="" className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow"
          role="listbox"
        >
          {options.map((option, index) => (
            <li
              key={option}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              role="option"
              aria-selected={selectedOption === option}
              className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${
                highlightedIndex === index ? "bg-gray-100" : ""
              }`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(option);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
