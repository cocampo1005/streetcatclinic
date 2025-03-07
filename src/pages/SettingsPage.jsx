import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { DeleteIcon, EditIcon, Plus } from "../components/svgs/Icons";
import DosageChartSettings from "../components/DosageChartSettings";

export default function SettingsPage() {
  const { user } = useAuth();

  // Categories for dropdown options
  const categories = [
    "services",
    "surgeriesPerformed",
    "surgicalNotes",
    "catColors",
    "breeds",
    "estimatedAges",
    "additionalDrugs",
    "outcomes",
  ];

  // State to manage dropdown options
  const [dropdowns, setDropdowns] = useState(
    categories.reduce((acc, category) => ({ ...acc, [category]: [] }), {})
  );

  // State to manage new option input for each category
  const [newOptions, setNewOptions] = useState(
    categories.reduce((acc, category) => ({ ...acc, [category]: "" }), {})
  );

  // State to manage expanded categories
  const [expandedCategories, setExpandedCategories] = useState({});

  // State to manage editing an option
  const [editingOption, setEditingOption] = useState(null);

  // Fetch dropdown options from Firestore
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const newDropdowns = { ...dropdowns };

        await Promise.all(
          categories.map(async (category) => {
            const docRef = doc(db, `dropdownOptions`, category);
            const docSnap = await getDoc(docRef);

            newDropdowns[category] = docSnap.exists()
              ? docSnap.data().options
              : [];
          })
        );

        setDropdowns(newDropdowns);
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      }
    };

    fetchDropdowns();
  }, []);

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Handle drag and drop reordering
  const handleDragEnd = async (result, category) => {
    // If dropped outside the list or no destination
    if (!result.destination) return;

    // Create a copy of the options
    const newOptions = Array.from(dropdowns[category]);

    // Remove the dragged item from its original position
    const [reorderedItem] = newOptions.splice(result.source.index, 1);

    // Insert the dragged item at the new position
    newOptions.splice(result.destination.index, 0, reorderedItem);

    try {
      // Update Firestore with new order
      const docRef = doc(db, `dropdownOptions`, category);
      await updateDoc(docRef, { options: newOptions });

      // Update local state
      setDropdowns((prev) => ({
        ...prev,
        [category]: newOptions,
      }));
    } catch (err) {
      console.error(`Error reordering options in ${category}:`, err);
    }
  };

  // Handle adding a new option to a category
  const handleAddOption = async (category) => {
    const newOption = newOptions[category].trim();
    if (!newOption) return;

    try {
      const docRef = doc(db, `dropdownOptions`, category);
      const currentOptions = dropdowns[category];
      const updatedOptions = [...currentOptions, newOption];

      await updateDoc(docRef, { options: updatedOptions });

      // Update local state
      setDropdowns((prev) => ({
        ...prev,
        [category]: updatedOptions,
      }));

      // Clear input
      setNewOptions((prev) => ({
        ...prev,
        [category]: "",
      }));
    } catch (err) {
      console.error(`Error adding option to ${category}:`, err);
    }
  };

  // Generate a unique draggable ID
  const getDraggableId = (category, option) => {
    // Replace any problematic characters and ensure uniqueness
    const sanitizedOption = option
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()
      .trim();
    return `${category}-${sanitizedOption}`;
  };

  // Handle removing an option from a category
  const handleRemoveOption = async (category, optionToRemove) => {
    try {
      const docRef = doc(db, `dropdownOptions`, category);
      const updatedOptions = dropdowns[category].filter(
        (option) => option !== optionToRemove
      );

      await updateDoc(docRef, { options: updatedOptions });

      // Update local state
      setDropdowns((prev) => ({
        ...prev,
        [category]: updatedOptions,
      }));
    } catch (err) {
      console.error(`Error removing option from ${category}:`, err);
    }
  };

  // Handle editing an option
  const handleEditOption = async (category, oldOption, newOption) => {
    try {
      const docRef = doc(db, `dropdownOptions`, category);
      const updatedOptions = dropdowns[category].map((option) =>
        option === oldOption ? newOption : option
      );

      await updateDoc(docRef, { options: updatedOptions });

      // Update local state
      setDropdowns((prev) => ({
        ...prev,
        [category]: updatedOptions,
      }));

      // Reset editing state
      setEditingOption(null);
    } catch (err) {
      console.error(`Error editing option in ${category}:`, err);
    }
  };

  // If user is not an admin, show restricted access message
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center bg-red-100 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Restricted
          </h2>
          <p className="text-red-800">
            You do not have permission to access the admin settings. Please
            contact your system administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="w-full flex justify-between border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent font-bold text-4xl">Settings</h1>
      </header>
      <section className="p-8">
        <h2 className="text-2xl font-bold mb-6">Dropdown Options</h2>
        <div className="grid grid-cols-2 gap-8">
          {categories.map((category) => (
            <div key={category} className="border rounded-xl overflow-hidden">
              {/* Category Header */}
              <div
                onClick={() => toggleCategory(category)}
                className="flex justify-between items-center p-4 bg-tertiaryGray cursor-pointer hover:bg-gray-200"
              >
                <h2 className="text-lg font-semibold capitalize">
                  {category.replace(/([A-Z])/g, " $1").toLowerCase()}
                </h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 transform transition-transform duration-200 ${
                    expandedCategories[category] ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Category Content */}
              {expandedCategories[category] && (
                <div className="p-4">
                  {/* Option List with Drag and Drop */}
                  <DragDropContext
                    onDragEnd={(result) => handleDragEnd(result, category)}
                  >
                    <Droppable droppableId={`droppable-${category}`}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="max-h-64 overflow-y-auto mb-4"
                        >
                          {dropdowns[category].length > 0 ? (
                            dropdowns[category].map((option, index) => (
                              <Draggable
                                key={getDraggableId(category, option)}
                                draggableId={getDraggableId(category, option)}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-md mb-2"
                                  >
                                    {editingOption?.category === category &&
                                    editingOption?.oldOption === option ? (
                                      <input
                                        type="text"
                                        value={editingOption.newOption}
                                        onChange={(e) =>
                                          setEditingOption((prev) => ({
                                            ...prev,
                                            newOption: e.target.value,
                                          }))
                                        }
                                        onKeyPress={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            editingOption.newOption.trim()
                                          ) {
                                            handleEditOption(
                                              category,
                                              editingOption.oldOption,
                                              editingOption.newOption.trim()
                                            );
                                          }
                                        }}
                                        className="flex-grow p-1 border rounded mr-2"
                                      />
                                    ) : (
                                      <span>{option}</span>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          if (
                                            editingOption?.category ===
                                              category &&
                                            editingOption?.oldOption === option
                                          ) {
                                            setEditingOption(null);
                                          } else {
                                            setEditingOption({
                                              category,
                                              oldOption: option,
                                              newOption: option,
                                            });
                                          }
                                        }}
                                        className="text-secondaryGray hover:text-primaryGreen"
                                      >
                                        <EditIcon />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleRemoveOption(category, option)
                                        }
                                        className="text-secondaryGray hover:text-errorRed"
                                      >
                                        <DeleteIcon />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          ) : (
                            <p className="text-gray-500 italic">
                              No options available for this category
                            </p>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  {/* Add New Option */}
                  <div className="flex">
                    <input
                      type="text"
                      placeholder={`Add new ${category} option`}
                      value={newOptions[category]}
                      onChange={(e) =>
                        setNewOptions((prev) => ({
                          ...prev,
                          [category]: e.target.value,
                        }))
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddOption(category)
                      }
                    />
                    <button
                      onClick={() => handleAddOption(category)}
                      disabled={!newOptions[category].trim()}
                      className={`flex ml-4 items-center gap-2 px-4 py-2 rounded-lg 
                        ${
                          newOptions[category].trim()
                            ? "bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      <Plus />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <DosageChartSettings />
      </section>
    </>
  );
}
