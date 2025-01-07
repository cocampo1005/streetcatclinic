import React, { useState } from "react";
import CsvUploader from "../components/CsvUploader";
import TrapperUploader from "../components/TrapperUploader";
import { Link } from "react-router-dom";
import {
  CalendarIcon,
  CatIcon,
  ClipboardIcon,
  DeleteIcon,
  EditIcon,
  GreenCheck,
  LocationIcon,
  NoCert,
  Plus,
  RedX,
  ServiceIcon,
  TipIcon,
  TrapperIcon,
  VetIcon,
} from "../components/svgs/Icons";
import { useRecords } from "../contexts/RecordsContext";

export default function RecordsPage() {
  const { records } = useRecords();
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleRowClick = (record) => {
    setSelectedRecord(record);
  };

  return (
    <>
      <header className="w-full flex justify-between border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent text-4xl">Records</h1>
        {/* <CsvUploader /> */}
        <Link
          to={"/"}
          className="flex gap-2 bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite py-2 px-4 rounded-lg"
        >
          <Plus />
          <span>Add Entry</span>
        </Link>
      </header>

      {/* {records.map((record) => (
        <div key={record.id}>{record.catId}</div>
      ))} */}

      {/* {isDeleteModalOpen && (
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
                <strong>Insert Record Info Here</strong>
              </p>
            </>
          }
        />
      )} */}
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
                    {selectedRecord.qualifiesForTIP ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-grow">
              {/* Cat Details */}
              <div className="flex gap-3 items-start">
                <div className="flex">
                  <ClipboardIcon />
                </div>
                <div className="flex flex-col gap-4 flex-grow">
                  <div className="flex flex-col gap-2 flex-grow">
                    <div className="grid grid-cols-3 gap-2 flex-grow">
                      <p>
                        <strong>Name: </strong>
                        {`${selectedRecord.catName}`}
                      </p>
                      <p>
                        <strong>Wt: </strong>
                        {`${selectedRecord.weight} lbs`}
                      </p>
                      <p>
                        <strong>Color: </strong>
                        {`${selectedRecord.color.join(", ")}`}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 flex-grow">
                      <p>
                        <strong>Breed: </strong>
                        {`${selectedRecord.breed}`}
                      </p>
                      <p>
                        <strong>Age: </strong>
                        {`${selectedRecord.age}`}
                      </p>
                      <p>
                        <strong>Microchip: </strong>
                        {selectedRecord.microchip
                          ? `${selectedRecord.michrochipNumber}`
                          : "None"}
                      </p>
                    </div>
                  </div>
                  {/* </div> */}

                  {/* Medical Details */}
                  {/* <div className="flex gap-3 items-start"> */}
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
                // onClick={() => setDeleteModalOpen(true)}
                className="text-secondaryGray hover:text-errorRed"
              >
                <DeleteIcon />
              </button>
              <button
                // onClick={() => handleEdit(selectedTrapper)}
                className="text-secondaryGray hover:text-primaryGreen"
              >
                <EditIcon />
              </button>
            </div>
          </article>
        )}
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
                  Cat ID
                </th>
                <th className="px-6 py-3 text-left">Intake Date</th>
                <th className="px-6 py-3 text-left">Trapper</th>
                <th className="px-6 py-3 text-left">Service</th>
                <th className="px-6 py-3 text-left rounded-tr-xl rounded-br-xl">
                  Qualified for TIP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300 overflow-y-auto max-h-[calc(100vh-350px)]">
              {records?.map((record) => (
                <tr
                  key={record.id}
                  className="group hover:bg-gray-50"
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
        </div>
      </section>
    </>
  );
}
