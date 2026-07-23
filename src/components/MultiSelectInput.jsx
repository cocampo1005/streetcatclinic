import { useEffect, useRef, useState } from "react";
import chevron from "../assets/icons/chevron-down.png";
import useTypeahead from "../hooks/useTypeahead";
import { RoundX } from "./svgs/Icons";

export default function MultiSelectInput({
  label,
  options = [],
  placeholder,
  value = [],
  onChange,
}) {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const optionRefs = useRef([]);

  const toggleOption = (option) => {
    const newSelected = value.includes(option)
      ? value.filter((item) => item !== option)
      : [...value, option];

    onChange(newSelected);
  };

  const scrollToOption = (index) => {
    window.requestAnimationFrame(() => {
      optionRefs.current[index]?.scrollIntoView({
        block: "nearest",
      });
    });
  };

  const handleTypeahead = useTypeahead({
    options,
    onMatch: (index) => {
      setDropdownVisible(true);
      setHighlightedIndex(index);
      scrollToOption(index);
    },
  });

  const handleKeyDown = (event) => {
    if (event.target.closest("button")) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setDropdownVisible(true);

      const nextIndex =
        highlightedIndex < options.length - 1 ? highlightedIndex + 1 : 0;

      setHighlightedIndex(nextIndex);
      scrollToOption(nextIndex);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setDropdownVisible(true);

      const previousIndex =
        highlightedIndex > 0 ? highlightedIndex - 1 : options.length - 1;

      setHighlightedIndex(previousIndex);
      scrollToOption(previousIndex);
      return;
    }

    if (event.key === "Enter" && highlightedIndex >= 0) {
      event.preventDefault();
      toggleOption(options[highlightedIndex]);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setDropdownVisible(false);
      setHighlightedIndex(-1);
      return;
    }

    if (handleTypeahead(event)) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setDropdownVisible(false);
        setHighlightedIndex(-1);
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
        ref={containerRef}
        className="relative rounded-lg border border-secondaryGray focus:border-primaryGreen focus:ring-1 focus:ring-primaryGreen"
        tabIndex={0}
        role="combobox"
        aria-expanded={isDropdownVisible}
        aria-haspopup="listbox"
        onClick={() => setDropdownVisible(true)}
        onFocus={() => setDropdownVisible(true)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-wrap items-center gap-2 rounded-lg py-1 pl-2 pr-8">
          {value.length > 0 ? (
            value.map((option) => (
              <div
                key={option}
                className="flex items-center rounded-full bg-tertiaryGray py-1 pl-3 pr-2 text-sm"
              >
                {option}

                <button
                  type="button"
                  className="ml-2 text-gray-600"
                  aria-label={`Remove ${option}`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleOption(option);
                  }}
                >
                  <RoundX />
                </button>
              </div>
            ))
          ) : (
            <span className="p-1 text-sm text-gray-400">{placeholder}</span>
          )}

          <img
            src={chevron}
            alt=""
            className="absolute right-2 top-1/5 h-3.5 w-3.5"
          />
        </div>

        {isDropdownVisible && (
          <div
            className="absolute left-0 right-0 top-full z-10 mt-px max-h-40 overflow-y-auto rounded-lg border bg-white shadow-xl"
            role="listbox"
            aria-multiselectable="true"
          >
            {options.map((option, index) => {
              const isSelected = value.includes(option);
              const isHighlighted = highlightedIndex === index;

              return (
                <div
                  key={option}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  className={`cursor-pointer px-4 py-2 hover:bg-tertiaryGray ${
                    isSelected
                      ? "bg-primaryGreen text-white hover:text-primaryGreen"
                      : isHighlighted
                        ? "bg-tertiaryGray"
                        : ""
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleOption(option);
                  }}
                >
                  {option}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
