import React from "react";
import { DeleteIcon } from "./svgs/Icons";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-cyan-950 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl flex flex-col gap-6 shadow-lg py-12 px-16 max-w-lg w-full">
        <div className="flex items-center text-red-500">
          <DeleteIcon />
          <h2 className="text-3xl pl-2 text-primaryGray font-accent font-bold">
            {title}
          </h2>
        </div>
        <div className="text-gray-700">{message}</div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 font-bold border-2 border-primaryGreen text-primaryGreen rounded-lg hover:bg-green-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
