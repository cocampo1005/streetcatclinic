import React from "react";
import DropdownMenuInput from "../components/DropdownMenuInput";
import { services, surgeriesPerformed } from "../data/dropdownOptions";
import { Checkmark, NoCert } from "../components/svgs/Icons";
import MultiSelect from "../components/MultiSelectInput";

export default function NewEntryPage() {
  const trappers = [
    { id: 1, name: "Tia Williams" },
    { id: 2, name: "John Smith" },
    { id: 3, name: "Angela Brown" },
    { id: 4, name: "Carlos Hernandez" },
  ];

  return (
    <>
      <header className="w-full border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent text-4xl">New Cat Entry</h1>
      </header>
      <section className="p-8">
        {/* First Row */}
        <div className="grid grid-flow-col gap-6 mb-4">
          <div>
            <label htmlFor="trapper">Trapper</label>
            <select id="trapper" name="trapper">
              <option value="" disabled selected className="text-gray-500">
                Select a trapper
              </option>
              {trappers.map((trapper) => (
                <option key={trapper.id} value={trapper.id}>
                  {trapper.id} - {trapper.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="intakeDate">Intake / Pickup Date</label>
            <input
              id="intakeDate"
              name="intakeDate"
              type="text"
              placeholder="12/15/2024"
            />
          </div>
          <DropdownMenuInput
            id={"service"}
            label={"Service"}
            options={services}
            placeholder="Select a service"
          />
          <div>
            <label htmlFor="catID">Cat ID</label>
            <input
              id="catID"
              name="catID"
              type="text"
              placeholder="12/15/2024"
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="flex gap-6">
          <div className="w-3/5 flex flex-col">
            <div className="flex gap-6 mb-4">
              <div className="w-full">
                <label htmlFor="crossStreet">TNR - Cross Street</label>
                <input
                  id="crossStreet"
                  name="crossStreet"
                  type="text"
                  placeholder="310 N 68th Ave, Hollywood"
                />
              </div>
              <div className="min-w-28">
                <label htmlFor="crossZipCode">Zip Code</label>
                <input
                  id="crossZipCode"
                  name="crossZipCode"
                  type="text"
                  placeholder="33025"
                />
              </div>
              <div className="min-w-40">
                <div className="flex items-center">
                  <label className="pr-3" htmlFor="microchip">
                    Microchip
                  </label>
                  <label class="custom-checkbox">
                    <input type="checkbox" class="hidden" />
                    <span class="checkbox">
                      <Checkmark />
                    </span>
                  </label>
                </div>
                <input
                  id="microchip"
                  name="microchip"
                  type="text"
                  placeholder="900263000787990"
                />
              </div>
            </div>
          </div>

          {/* Check Boxes */}
          <div className="flex flex-col justify-between w-2/5 h-[70px]">
            <div className="flex justify-between">
              <div className="flex items-start">
                <p className="label">Rabies</p>
                <label class="custom-checkbox">
                  <input type="checkbox" class="hidden" />
                  <span class="checkbox mt-[2px]">
                    <Checkmark />
                  </span>
                </label>
              </div>
              <div className="flex items-start">
                <p className="label mr-1">Rabies</p>
                <NoCert />
                <label class="custom-checkbox">
                  <input type="checkbox" class="hidden" />
                  <span class="checkbox mt-[2px]">
                    <Checkmark />
                  </span>
                </label>
              </div>
              <div className="flex items-start">
                <p className="label">FVRCP</p>
                <label class="custom-checkbox">
                  <input type="checkbox" class="hidden" />
                  <span class="checkbox mt-[2px]">
                    <Checkmark />
                  </span>
                </label>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex w-full">
                <p className="text-labelGray font-bold block mr-3">FeLV/FIV</p>
                <div className="flex w-full justify-between">
                  {["- / -", "+ / -", "- / +"].map((text, index) => (
                    <button
                      key={index}
                      className="rounded-full px-4 text-sm font-bold border border-secondaryGray text-labelGray hover:border-primaryGreen hover:text-primaryGreen focus:border-primaryGreen focus:bg-primaryGreen focus:text-white transition"
                      type="button"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row */}
        <div>
          <MultiSelect
            label="Surgeries Performed"
            options={surgeriesPerformed}
            placeholder="Select Surgeries"
          />
        </div>
      </section>
    </>
  );
}
