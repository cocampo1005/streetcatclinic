import React from "react";
import RecordForm from "./RecordForm";
import { EditIcon } from "./svgs/Icons";

export default function RecordModal({ initialData, onClose }) {
  console.log(initialData);
  return (
    <div className="fixed inset-0 bg-cyan-950 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl py-8 px-16">
        <div className="flex items-center text-primaryGreen">
          <EditIcon size="36px" />
          <h2 className="text-3xl ml-4 pt-1 font-accent text-primaryGray font-bold">
            Edit Record
          </h2>
        </div>
        <RecordForm initialData={initialData} onClose={onClose} />
      </div>
    </div>
  );
}
