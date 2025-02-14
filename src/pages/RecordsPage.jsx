import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarIcon,
  CatIcon,
  ClipboardIcon,
  DeleteIcon,
  EditIcon,
  FilterIcon,
  GreenCheck,
  LocationIcon,
  NoCert,
  Plus,
  RedX,
  ServiceIcon,
  SortIcon,
  TipIcon,
  TrapperIcon,
  VetIcon,
} from "../components/svgs/Icons";
import ConfirmationModal from "../components/ConfirmationModal";
import RecordModal from "../components/RecordModal";
import { PDFViewer } from "@react-pdf/renderer";
import { surgeriesPerformed } from "../data/dropdownOptions";
import useRecords from "../hooks/useRecords";

export default function RecordsPage() {
  const { records, deleteRecord, isLoading, fetchNextPage, isLastPage } =
    useRecords(5);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  // Filtering States
  const [filterDate, setFilterDate] = useState({ month: "", year: "" });
  const [filterSurgeries, setFilterSurgeries] = useState([]);
  const [filterTIP, setFilterTIP] = useState("");

  // Sorting States
  const [sortedRecords, setSortedRecords] = useState(records);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    console.log("Records:", records);
  }, [records]);

  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setSelectedRowId(record.id);
  };

  const confirmDelete = () => {
    deleteRecord(selectedRecord.id);
    setDeleteModalOpen(false);
    setSelectedRecord(null);
  };

  // Function to filter records
  const filteredRecords = records.filter((record) => {
    const recordDate = new Date(record.intakePickupDate);
    const recordMonth = recordDate.getMonth() + 1;
    const recordYear = recordDate.getFullYear();

    // Filter by selected month/year
    if (
      (filterDate.month && recordMonth !== Number(filterDate.month)) ||
      (filterDate.year && recordYear !== Number(filterDate.year))
    ) {
      return false;
    }

    // Filter by surgeries performed
    if (
      filterSurgeries.length > 0 &&
      !filterSurgeries.some((surgery) =>
        record.surgeriesPerformed.includes(surgery)
      )
    ) {
      return false;
    }

    // Filter by TIP Qualification
    if (filterTIP && record.qualifiesForTIP !== (filterTIP === "yes")) {
      return false;
    }

    return true;
  });

  // Sorting function
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedData = [...records].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      // Handle numbers, dates, and strings separately
      if (key === "intakePickupDate") {
        valA = new Date(valA);
        valB = new Date(valB);
      } else if (!isNaN(valA) && !isNaN(valB)) {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = valA?.toString().toLowerCase();
        valB = valB?.toString().toLowerCase();
      }

      if (valA > valB) return direction === "asc" ? 1 : -1;
      if (valA < valB) return direction === "asc" ? -1 : 1;
      return 0;
    });

    setSortedRecords(sortedData);
    setSortConfig({ key, direction });
  };

  return (
    <>
      <header className="w-full flex justify-between border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent font-bold text-4xl">Records</h1>
        <Link
          to={"/"}
          className="flex gap-2 bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite py-2 px-4 rounded-lg"
        >
          <Plus />
          <span>Add Entry</span>
        </Link>
      </header>

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Record"
          message={
            <>
              <p>
                Are you sure you want to delete the following record entry? This
                action cannot be undone.
              </p>
              <p className="pl-4 py-2">
                <strong>Recorded Entry: {selectedRecord.catId}</strong>
              </p>
            </>
          }
        />
      )}
      {isEditModalOpen && (
        <RecordModal
          initialData={selectedRecord}
          onClose={() => setEditModalOpen(false)}
        />
      )}
      <section className="p-8 max-h-screen flex flex-col gap-8">
        {selectedRecord && (
          <article className="rounded-xl flex justify-between flex-shrink-0 gap-4 px-8">
            <div className="min-w-64">
              <div className="flex items-center gap-2 mb-4">
                <CatIcon />
                <h2 className="text-2xl font-bold">{selectedRecord.catId}</h2>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center">
                  <CalendarIcon />
                  <p className="pl-2 pt-1">{selectedRecord.intakePickupDate}</p>
                </div>
                <div className="flex items-center">
                  <TrapperIcon />
                  <p className="pl-2 pt-1">
                    {selectedRecord.trapper && selectedRecord.trapper.firstName
                      ? `${selectedRecord.trapper.trapperId} - 
                    ${selectedRecord.trapper.firstName} 
                    ${selectedRecord.trapper.lastName}`
                      : `${selectedRecord.trapper.name}`}
                  </p>
                </div>
                <div className="flex items-center">
                  <LocationIcon />
                  <p className="pl-2 pt-1">
                    {selectedRecord.crossStreet
                      ? `${selectedRecord.crossStreet}, ${selectedRecord.crossZip}`
                      : "No Cross Street or Zip"}
                  </p>
                </div>
                <div className="flex items-center">
                  <ServiceIcon />
                  <p className="pl-2">{selectedRecord.service}</p>
                </div>
                <div className="flex items-center">
                  <VetIcon />
                  <p className="pl-2 pt-1">{selectedRecord.veterinarian}</p>
                </div>
                <div className="flex items-center">
                  <TipIcon />
                  <p className="pl-2 pt-1">
                    {selectedRecord.qualifiesForTIP ? (
                      selectedRecord.pdfUrl ? (
                        <div className="flex gap-3">
                          <p>Yes</p>
                          <a href={selectedRecord.pdfUrl} target="_blank">
                            <button className="bg-errorRed text-primaryWhite font-bold text-xs px-2 rounded hover:bg-primaryWhite hover:border hover:border-errorRed hover:text-errorRed">
                              View PDF
                            </button>
                          </a>
                        </div>
                      ) : (
                        <p>
                          Yes -{" "}
                          <span className="text-errorRed">No PDF Found</span>
                        </p>
                      )
                    ) : (
                      <p>No</p>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 h-full flex-grow">
              {/* Cat Details */}
              <div className="flex gap-3 items-start">
                <div className="flex">
                  <ClipboardIcon />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 flex-grow">
                    <div className="grid grid-cols-4 gap-2 flex-grow">
                      <p className="col-span-1">
                        <strong>Name: </strong>
                        {`${selectedRecord.catName}`}
                      </p>
                      <p className="col-span-1">
                        <strong>Wt: </strong>
                        {`${selectedRecord.weight} lbs`}
                      </p>
                      <p className="col-span-2">
                        <strong>Color: </strong>
                        {`${selectedRecord.color.join(", ")}`}
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2 flex-grow">
                      <p className="col-span-1">
                        <strong>Breed: </strong>
                        {`${selectedRecord.breed}`}
                      </p>
                      <p className="col-span-1">
                        <strong>Age: </strong>
                        {`${selectedRecord.age}`}
                      </p>
                      <p className="col-span-2">
                        <strong>Microchip: </strong>
                        {selectedRecord.microchip
                          ? `${selectedRecord.microchipNumber}`
                          : "None"}
                      </p>
                    </div>
                  </div>

                  {/* Medical Details */}
                  <div className="flex flex-col gap-2 flex-grow">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-2 justify-between">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <p className="font-bold">Rabies</p>
                            {selectedRecord.rabies ? <GreenCheck /> : <RedX />}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <p className="font-bold">Rabies</p>
                              <NoCert />
                            </div>
                            {selectedRecord.rabiesWithoutCertificate ? (
                              <GreenCheck />
                            ) : (
                              <RedX />
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <p className="font-bold">FVRCP</p>
                            {selectedRecord.FVRCP ? <GreenCheck /> : <RedX />}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold">FeLVFIV</p>
                            {selectedRecord.FeLVFIV
                              ? `${selectedRecord.FeLVFIV}`
                              : "N/A"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">Additional Drugs: </p>
                          <p>
                            {selectedRecord.additionalDrug
                              ? `${selectedRecord.additionalDrug} (${selectedRecord.dosage}mls)`
                              : "None"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p>
                          <strong>Surgeries: </strong>
                          {`${selectedRecord.surgeriesPerformed.join(", ")}`}
                        </p>
                        <p>
                          <strong>Surgical Notes: </strong>
                          {`${selectedRecord.surgicalNotes}`}
                        </p>
                        <p>
                          <strong>Outcome: </strong>
                          {`${selectedRecord.outcome}`}
                        </p>
                      </div>
                    </div>
                    <p>
                      <strong>Additional Notes: </strong>
                      {`${selectedRecord.additionalNotes}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between items-end gap-4">
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="text-secondaryGray hover:text-errorRed"
              >
                <DeleteIcon />
              </button>
              <button
                onClick={() => setEditModalOpen(true)}
                className="text-secondaryGray hover:text-primaryGreen"
              >
                <EditIcon />
              </button>
            </div>
          </article>
        )}

        {/* Table */}
        <div
          className={`w-full overflow-x-auto overflow-y-auto flex-grow ${
            selectedRecord
              ? "max-h-[calc(100vh-510px)]"
              : "max-h-[calc(100vh-170px)]"
          }`}
        >
          <table className="w-full min-w-full divide-y divide-secondaryGray rounded-xl">
            <thead className="sticky top-0 z-10 bg-tertiaryGray rounded-xl border-b border-primaryWhite">
              <tr>
                <th className="px-6 py-3 text-left rounded-tl-xl rounded-bl-xl">
                  <div className="flex items-center gap-1">
                    Cat ID
                    <button
                      onClick={() => handleSort("catId")}
                      className="cursor-pointer"
                    >
                      <SortIcon />
                    </button>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => handleSort("intakePickupDate")}
                >
                  <div className="flex items-center gap-1">
                    Intake Date <SortIcon />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => handleSort("trapper.trapperId")}
                >
                  <div className="flex items-center gap-1">
                    Trapper <SortIcon />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => handleSort("service")}
                >
                  <div className="flex items-center gap-1">
                    Service <SortIcon />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => handleSort("qualifiesForTIP")}
                >
                  <div className="flex items-center gap-1">
                    Qualified for TIP <SortIcon />
                  </div>
                </th>
                <th className="px-6 py-3 text-left rounded-tr-xl rounded-br-xl">
                  <FilterIcon />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300 overflow-y-auto max-h-[calc(100vh-350px)]">
              {records?.map((record) => (
                <tr
                  key={record.id}
                  className={`group hover:bg-gray-50 ${
                    selectedRowId === record.id ? "bg-tertiaryGreen" : ""
                  }`}
                  onClick={() => handleRowClick(record)}
                >
                  <td className="px-6 py-4 font-bold">{record.catId}</td>
                  <td className="px-6 py-4">{record.intakePickupDate}</td>
                  <td className="px-6 py-4">
                    {record.trapper && record.trapper.firstName ? (
                      <>
                        {record.trapper.trapperId} - {record.trapper.firstName}{" "}
                        {record.trapper.lastName}
                      </>
                    ) : record.trapper && record.trapper.name ? (
                      record.trapper.name
                    ) : (
                      "No Trapper Assigned"
                    )}
                  </td>
                  <td className="px-6 py-4">{record.service}</td>
                  <td className="px-6 py-4">
                    {record.qualifiesForTIP ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className="flex justify-center py-4">
            {!isLastPage && (
              <button
                onClick={fetchNextPage}
                className="bg-primaryGreen hover:bg-secondaryGreen text-white py-2 px-4 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
