import React, { useEffect, useState } from "react";
import {
  CalendarIcon,
  CatIcon,
  DownloadIcon,
  FilterIcon,
  TipIcon,
  TrapperIcon,
} from "../components/svgs/Icons";
import useForms from "../hooks/useForms";

export default function FormsPage() {
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedForms, setSelectedForms] = useState([]);

  // Filtering States
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterDate, setFilterDate] = useState({ month: "", year: "" });
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Fetch Forms Hook
  const {
    forms,
    isLoading,
    isExporting,
    fetchFirstPage,
    fetchNextPage,
    isLastPage,
    fetchFilteredForms,
    exportBatchPDFs,
    exportSelectedPDFs,
  } = useForms(10);

  // Initial fetch on component mount
  useEffect(() => {
    fetchFirstPage();
  }, []);

  // Apply selected filters
  const applyFilters = () => {
    if (!filterDate.month || !filterDate.year) {
      alert("Please select a month and year before filtering.");
      return;
    }

    setFiltersApplied(true);
    const filters = {
      month: filterDate.month,
      year: filterDate.year,
    };
    fetchFilteredForms(filters);

    // Clear selected forms when filters change
    setSelectedForms([]);

    // Close filter panel after applying
    setIsFiltersOpen(false);
  };

  const resetFilters = () => {
    setFiltersApplied(false);
    setFilterDate({ month: "", year: "" });
    fetchFirstPage(); // Reload default forms again
    setSelectedForms([]);

    // Close filter panel after resetting
    setIsFiltersOpen(false);
  };

  // Handle showing all filtered results
  const handleShowAll = () => {
    if (filtersApplied) {
      fetchFilteredForms(
        {
          month: filterDate.month,
          year: filterDate.year,
        },
        true // showAll flag
      );
    }
  };

  // Handle export all PDFs for selected month/year
  const handleExportBatch = () => {
    if (!filterDate.month || !filterDate.year) {
      alert("Please select a month and year before exporting.");
      return;
    }

    const filters = {
      month: filterDate.month,
      year: filterDate.year,
    };

    exportBatchPDFs(filters);
  };

  // Handle export selected PDFs
  const handleExportSelected = () => {
    if (selectedForms.length === 0) {
      alert("Please select at least one form to export.");
      return;
    }

    exportSelectedPDFs(selectedForms);
  };

  const handleRowClick = (form, event) => {
    // Check if shift key was pressed for multi-select
    if (event.ctrlKey || event.metaKey) {
      setSelectedForms((prev) => {
        const isSelected = prev.some((f) => f.id === form.id);
        if (isSelected) {
          return prev.filter((f) => f.id !== form.id);
        } else {
          return [...prev, form];
        }
      });
    } else {
      // Single select behavior
      setSelectedForm((prevForm) => (prevForm?.id === form.id ? null : form));
      setSelectedRowId((prevId) => (prevId === form.id ? null : form.id));
    }
  };

  // Check if a form is selected in the multi-select array
  const isFormSelected = (formId) => {
    return selectedForms.some((form) => form.id === formId);
  };

  // Add this function inside your FormsPage component
  const getMonthName = (monthNum) => {
    if (!monthNum) return "";
    const date = new Date(0, parseInt(monthNum) - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  return (
    <>
      <header className="w-full flex justify-between border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent font-bold text-4xl">TIP Forms</h1>
        <div className="flex gap-4">
          {filtersApplied && (
            <button
              onClick={handleExportBatch}
              disabled={isExporting || !filtersApplied}
              className="flex gap-2 bg-primaryWhite border-2 border-primaryGreen hover:bg-cyan-100 text-primaryGreen font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DownloadIcon />
              {isExporting
                ? "Exporting..."
                : `Export All PDFs for ${getMonthName(filterDate.month)} ${
                    filterDate.year
                  }`}
            </button>
          )}
          {selectedForms.length > 0 && (
            <>
              <button
                onClick={handleExportSelected}
                disabled={isExporting}
                className="flex gap-2 bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DownloadIcon />
                {isExporting
                  ? "Exporting..."
                  : `Export Selected (${selectedForms.length})`}
              </button>
              <button
                onClick={() => setSelectedForms([])}
                className="flex gap-2 bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-lg"
              >
                Clear Selection
              </button>
            </>
          )}
        </div>
      </header>

      <section className="p-8 max-h-screen flex flex-col gap-8">
        {selectedForm && (
          <article className="rounded-xl flex flex-col flex-shrink-0 gap-4 p-6 bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CatIcon />
                <h2 className="text-2xl font-bold">{selectedForm.catId}</h2>
              </div>
              <a
                href={selectedForm.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-2 bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite py-2 px-4 rounded-lg"
              >
                <DownloadIcon />
                <span>View PDF</span>
              </a>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center">
                <CalendarIcon />
                <p className="pl-2">
                  {selectedForm.intakePickupDate || "Unknown Date"}
                </p>
              </div>
              <div className="flex items-center">
                <TrapperIcon />
                <p className="pl-2">{selectedForm.trapperName}</p>
              </div>
            </div>

            <div className="mt-2">
              <p>
                <strong>Generated:</strong> {selectedForm.generatedDate}
              </p>
              <p>
                <strong>File:</strong> {selectedForm.fileName}
              </p>
              {selectedForm.color && selectedForm.color.length > 0 && (
                <p>
                  <strong>Color:</strong> {selectedForm.color.join(", ")}
                </p>
              )}
              {selectedForm.sex && (
                <p>
                  <strong>Sex:</strong> {selectedForm.sex}
                </p>
              )}
              {selectedForm.age && (
                <p>
                  <strong>Age:</strong> {selectedForm.age}
                </p>
              )}
            </div>
          </article>
        )}

        {/* Table */}
        <div
          className={`w-full overflow-x-auto overflow-y-auto flex-grow ${
            selectedForm
              ? "max-h-[calc(100vh-400px)]"
              : "max-h-[calc(100vh-170px)]"
          }`}
        >
          <div className="mb-3 text-sm text-gray-500">
            <p>
              Hold Ctrl/Cmd while clicking to select multiple forms for batch
              download
            </p>
          </div>
          <table className="w-full min-w-full divide-y divide-secondaryGray rounded-xl">
            <thead className="sticky top-0 z-10 bg-tertiaryGray rounded-xl border-b border-primaryWhite">
              <tr>
                <th className="w-16 px-3 py-3 text-center rounded-tl-xl rounded-bl-xl">
                  <div className="flex items-center justify-center">Select</div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="flex items-center gap-1">Cat ID</div>
                </th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">File Name</th>
                <th
                  className="px-6 py-3 text-left cursor-pointer rounded-tr-xl rounded-br-xl"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Filter</span>
                    <FilterIcon />
                  </div>
                </th>
              </tr>
            </thead>

            {/* Collapsible Filter Bar */}
            {isFiltersOpen && (
              <thead className="transition-all duration-300">
                <tr>
                  <th colSpan="5" className="p-4 bg-white">
                    <div className="flex gap-4 items-center">
                      <label>Month</label>
                      <select
                        onChange={(e) =>
                          setFilterDate({
                            ...filterDate,
                            month: e.target.value,
                          })
                        }
                        value={filterDate.month}
                        className="p-2 border rounded"
                      >
                        <option value="">All</option>
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString("default", {
                              month: "long",
                            })}
                          </option>
                        ))}
                      </select>

                      <label>Year</label>
                      <select
                        onChange={(e) =>
                          setFilterDate({ ...filterDate, year: e.target.value })
                        }
                        value={filterDate.year}
                        className="p-2 border rounded"
                      >
                        <option value="">All</option>
                        {[...Array(new Date().getFullYear() - 2024 + 1)].map(
                          (_, i) => {
                            const year = 2024 + i;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          }
                        )}
                      </select>

                      <button
                        onClick={applyFilters}
                        className="bg-primaryGreen hover:bg-secondaryGreen text-white px-4 py-2 rounded-lg"
                        disabled={isLoading}
                      >
                        Apply
                      </button>
                      <button
                        onClick={resetFilters}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                      >
                        Reset
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
            )}

            <tbody className="bg-white divide-y divide-gray-300 overflow-y-auto">
              {forms?.map((form) => (
                <tr
                  key={form.id}
                  className={`group hover:bg-gray-50 cursor-pointer ${
                    selectedRowId === form.id ? "bg-tertiaryGreen" : ""
                  } ${isFormSelected(form.id) ? "bg-blue-100" : ""}`}
                  onClick={(e) => handleRowClick(form, e)}
                >
                  <td className="px-3 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={isFormSelected(form.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSelectedForms((prev) => {
                          if (e.target.checked) {
                            return [...prev, form];
                          } else {
                            return prev.filter((f) => f.id !== form.id);
                          }
                        });
                      }}
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold">{form.catId}</td>
                  <td className="px-6 py-4">{form.generatedDate}</td>
                  <td className="px-6 py-4">{form.fileName}</td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={form.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite py-1 px-3 rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DownloadIcon />
                      <span>PDF</span>
                    </a>
                  </td>
                </tr>
              ))}

              {forms.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {isLoading ? "Loading forms..." : "No forms found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center py-4">
            {!isLastPage && forms.length > 0 && (
              <button
                onClick={fetchNextPage}
                className="bg-primaryGreen hover:bg-secondaryGreen text-white py-2 px-4 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            )}

            {/* Optional: Show All Button */}
            {filtersApplied && !isLastPage && forms.length > 0 && (
              <button
                onClick={handleShowAll}
                className="bg-primaryWhite border-2 border-primaryGreen hover:bg-cyan-100 text-primaryGreen font-bold py-2 px-4 rounded-lg ml-4"
              >
                Show All
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
