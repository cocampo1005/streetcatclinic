import React, { useState } from "react";
import {
  EditIcon,
  LocationIcon,
  MailIcon,
  PhoneIcon,
  Plus,
} from "../components/svgs/Icons";
import { useTrappers } from "../contexts/TrappersContext";

export default function TrappersPage() {
  const [selectedTrapper, setSelectedTrapper] = useState(null);
  const { trappers } = useTrappers();

  const handleRowClick = (trapper) => {
    setSelectedTrapper(trapper);
  };

  return (
    <>
      <header className="w-full flex justify-between border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent text-4xl">Trappers</h1>
        <button className="flex gap-2 bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite py-2 px-4 rounded-lg">
          <Plus />
          <span>Add Trapper</span>
        </button>
      </header>
      <section className="p-8 max-h-screen overflow-hidden">
        {selectedTrapper && (
          <article className="p-8 pt-0 rounded-xl">
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {selectedTrapper.name}
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
          </article>
        )}
        <div className="w-full overflow-x-auto  max-h-[calc(100vh-200px)]">
          <table className="w-full min-w-full divide-y divide-secondaryGray rounded-xl">
            <thead className="sticky top-0 z-10 bg-tertiaryGray rounded-xl border-b-2 border-primaryWhite">
              <tr>
                <th className="px-6 py-3 text-left rounded-tl-xl rounded-bl-xl">
                  ID
                </th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Address</th>
                <th className="px-6 py-3 text-left">Phone Number</th>
                <th className="px-6 py-3 text-left">Code</th>
                <th className="rounded-tr-xl rounded-br-xl"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300 overflow-y-auto max-h-[calc(100vh-350px)]">
              {trappers?.map((trapper, index) => (
                <tr
                  key={index}
                  className="group hover:bg-gray-50"
                  onClick={() => handleRowClick(trapper)}
                >
                  <td className="px-6 py-4">{trapper.trapperId}</td>
                  <td className="px-6 py-4">{trapper.name}</td>
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
                  <td className="px-6 py-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-primaryGreen hover:text-secondaryGreen">
                      <EditIcon />
                    </button>
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
