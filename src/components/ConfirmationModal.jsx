import React from "react";

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
      <div className="bg-white rounded-3xl shadow-lg py-8 px-16 max-w-lg w-full">
        <h2 className="text-2xl text-primaryGray font-bold mb-4">{title}</h2>
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
