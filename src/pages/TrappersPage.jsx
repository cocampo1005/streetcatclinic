import React, { useState } from "react";
import {
  DeleteIcon,
  EditIcon,
  LocationIcon,
  MailIcon,
  PhoneIcon,
  Plus,
} from "../components/svgs/Icons";
import { useTrappers } from "../contexts/TrappersContext";
import TrapperModal from "../components/TrapperModal";
import ConfirmationModal from "../components/ConfirmationModal";

export default function TrappersPage() {
  const [selectedTrapperId, setSelectedTrapperId] = useState(null);
  const { trappers, createTrapper, updateTrapper, deleteTrapper } =
    useTrappers();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editTrapper, setEditTrapper] = useState(null);

  const selectedTrapper = trappers.find(
    (trapper) => trapper.id === selectedTrapperId
  );

  const handleAdd = () => {
    setEditTrapper(null); // No initial data for adding a new trapper
    setModalOpen(true);
  };

  const handleEdit = (trapper) => {
    setEditTrapper(trapper);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    if (editTrapper) {
      updateTrapper(editTrapper.id, data);
    } else {
      createTrapper(data);
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    deleteTrapper(selectedTrapper.id);
    setDeleteModalOpen(false);
    setSelectedTrapperId(null); // Deselect trapper after deletion
  };

  const handleRowClick = (trapper) => {
    setSelectedTrapperId(trapper.id);
  };

  return (
    <>
      <header className="w-full flex justify-between border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent text-4xl">Trappers</h1>
        <button
          onClick={handleAdd}
          className="flex gap-2 bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite py-2 px-4 rounded-lg"
        >
          <Plus />
          <span>Add Trapper</span>
        </button>
      </header>
      {isModalOpen && (
        <TrapperModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          initialData={editTrapper || {}} // Pass an empty object for adding a new trapper
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Trapper"
          message={
            <>
              <p>
                Are you sure you want to delete the following trapper? This
                action cannot be undone.
              </p>
              <p className="pl-4 py-2">
                <strong>
                  {selectedTrapper?.trapperId} - {selectedTrapper?.firstName}{" "}
                  {selectedTrapper?.lastName}
                </strong>
              </p>
            </>
          }
        />
      )}
      <section className="p-8 max-h-screen flex flex-col gap-8">
        {selectedTrapper && (
          <article className="rounded-xl flex justify-between flex-shrink-0 gap-8 px-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {selectedTrapper.firstName} {selectedTrapper.lastName}
              </h2>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <LocationIcon />
                  <p>
                    {[
                      selectedTrapper.address.street,
                      selectedTrapper.address.apartment,
                      selectedTrapper.address.city,
                      selectedTrapper.address.state,
                      selectedTrapper.address.zip,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <MailIcon />
                  <p>{selectedTrapper.email}</p>
                </div>
                <div className="flex gap-2">
                  <PhoneIcon />
                  <p>{selectedTrapper.phone}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div className="flex gap-2">
                <p className="font-bold">Trapper ID:</p>
                <p>{selectedTrapper.trapperId}</p>
              </div>
              <div className="flex gap-2">
                <p className="font-bold">Trapper Code:</p>
                <p>{selectedTrapper.code}</p>
              </div>
              <div className="flex gap-2">
                <p className="font-bold">Qualifies for TIP:</p>
                <p>{selectedTrapper.qualifies ? "Yes" : "No"}</p>
              </div>
            </div>
            <div>
              <p className="font-bold">Signature:</p>
              {selectedTrapper.signature ? (
                <img
                  src={selectedTrapper.signature}
                  alt="Trapper's signature"
                  className="w-56 h-24 object-contain"
                  loading="lazy"
                />
              ) : (
                <p className="italic text-gray-500">No signature available</p>
              )}
            </div>
            <div className="flex flex-col justify-between items-end gap-4">
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="text-secondaryGray hover:text-errorRed"
              >
                <DeleteIcon />
              </button>
              <button
                onClick={() => handleEdit(selectedTrapper)}
                className="text-secondaryGray hover:text-primaryGreen"
              >
                <EditIcon />
              </button>
            </div>
          </article>
        )}
        <div
          className={`w-full overflow-x-auto overflow-y-auto flex-grow ${
            selectedTrapper
              ? "max-h-[calc(100vh-355px)]"
              : "max-h-[calc(100vh-170px)]"
          }`}
        >
          <table className="w-full min-w-full divide-y divide-secondaryGray rounded-xl">
            <thead className="sticky top-0 z-10 bg-tertiaryGray rounded-xl border-b border-primaryWhite">
              <tr>
                <th className="px-6 py-3 text-left rounded-tl-xl rounded-bl-xl">
                  ID
                </th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Address</th>
                <th className="px-6 py-3 text-left">Phone Number</th>
                <th className="px-6 py-3 text-left rounded-tr-xl rounded-br-xl">
                  Code
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300 overflow-y-auto max-h-[calc(100vh-350px)]">
              {trappers?.map((trapper) => (
                <tr
                  key={trapper.id}
                  className={`group hover:bg-gray-50 ${
                    selectedTrapperId === trapper.id ? "bg-tertiaryGreen" : ""
                  }`}
                  onClick={() => handleRowClick(trapper)}
                >
                  <td className="px-6 py-4">{trapper.trapperId}</td>
                  <td className="px-6 py-4">
                    {trapper.firstName} {trapper.lastName}
                  </td>
                  <td className="px-6 py-4">
                    {[
                      trapper.address.street,
                      trapper.address.apartment,
                      trapper.address.city,
                      trapper.address.state,
                      trapper.address.zip,
                    ]
                      .filter(Boolean)
                      .join(", ")}{" "}
                  </td>
                  <td className="px-6 py-4">{trapper.phone}</td>
                  <td className="px-6 py-4">{trapper.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
