import React, { useState } from "react";
import DropdownMenuInput from "../components/DropdownMenuInput";
import {
  additionalDrugs,
  breeds,
  catColors,
  estimatedAges,
  outcomes,
  services,
  surgeriesPerformed,
  surgicalNotes,
} from "../data/dropdownOptions";
import { Checkmark, NoCert } from "../components/svgs/Icons";
import qualified from "../assets/icons/qualified-icon.png";
import notQualified from "../assets/icons/not-qualified-icon.png";
import MultiSelect from "../components/MultiSelectInput";
import EditableSelect from "../components/EditableSelect";
import { NewEntryIcon } from "../components/svgs/NavIcons";

export default function NewEntryPage() {
  const [selectedService, setSelectedService] = useState("");
  const trappers = [
    { id: 1, name: "Tia Williams" },
    { id: 2, name: "John Smith" },
    { id: 3, name: "Angela Brown" },
    { id: 4, name: "Carlos Hernandez" },
  ];

  const handlePlaceholderColorChange = (element) => {
    element.classList.toggle("text-gray-400", element.value === "");
    element.classList.toggle("text-primaryGray", element.value !== "");
  };

  return (
    <>
      <header className="w-full border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent text-4xl">New Cat Entry</h1>
      </header>
      <section className="flex-grow p-8 overflow-scroll">
        {/* First Row */}
        <div className="grid grid-flow-col gap-6 mb-6">
          {/* Trapper */}
          <div>
            <label htmlFor="trapper">Trapper</label>
            <select
              id="trapper"
              name="trapper"
              defaultValue=""
              className="text-gray-400"
              onChange={(e) => {
                handlePlaceholderColorChange(e.target);
              }}
            >
              <option value="" disabled hidden>
                Select a trapper
              </option>
              {trappers.map((trapper) => (
                <option
                  key={trapper.id}
                  value={trapper.id}
                  className="text-primaryGray"
                >
                  {trapper.id} - {trapper.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pickup Date */}
          <div>
            <label htmlFor="intakeDate">Intake / Pickup Date</label>
            <input
              id="intakeDate"
              name="intakeDate"
              type="text"
              placeholder="12/15/2024"
            />
          </div>

          {/* Service */}
          <div>
            <label htmlFor="service">Service</label>
            <select
              id="service"
              name="service"
              defaultValue=""
              className="text-gray-400"
              onChange={(e) => {
                setSelectedService(e.target.value);
                handlePlaceholderColorChange(e.target);
              }}
            >
              <option value="" disabled hidden>
                Select a service
              </option>
              {services.map((service, index) => (
                <option
                  key={index}
                  value={service}
                  className="text-primaryGray"
                >
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* Cat ID */}
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
        <div className="flex gap-6 mb-6">
          <div className="w-3/5 flex flex-col">
            <div className="flex gap-6">
              {/* TNR - Cross Street */}
              <div className="w-full min-w-[143px]">
                <label htmlFor="crossStreet">TNR - Cross Street</label>
                <input
                  id="crossStreet"
                  name="crossStreet"
                  type="text"
                  placeholder="310 N 68th Ave, Hollywood"
                />
              </div>

              {/* Zip Code */}
              <div className="min-w-28">
                <label htmlFor="crossZipCode">Zip Code</label>
                <input
                  id="crossZipCode"
                  name="crossZipCode"
                  type="text"
                  placeholder="33025"
                />
              </div>

              {/* Microchip */}
              <div className="min-w-40">
                <div className="flex items-center">
                  <label className="pr-3" htmlFor="microchip">
                    Microchip
                  </label>
                  <label className="custom-checkbox">
                    <input type="checkbox" className="hidden" />
                    <span className="checkbox">
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
                <label className="custom-checkbox">
                  <input type="checkbox" className="hidden" />
                  <span className="checkbox mt-[2px]">
                    <Checkmark />
                  </span>
                </label>
              </div>
              <div className="flex items-start">
                <p className="label mr-1">Rabies</p>
                <NoCert />
                <label className="custom-checkbox">
                  <input type="checkbox" className="hidden" />
                  <span className="checkbox mt-[2px]">
                    <Checkmark />
                  </span>
                </label>
              </div>
              <div className="flex items-start">
                <p className="label">FVRCP</p>
                <label className="custom-checkbox">
                  <input type="checkbox" className="hidden" />
                  <span className="checkbox mt-[2px]">
                    <Checkmark />
                  </span>
                </label>
              </div>
            </div>

            {/* FelV/FIV Options */}
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
        <div className="flex gap-6 mb-6">
          <div className="w-3/5">
            {/* Surgeries Performed */}
            <MultiSelect
              label="Surgeries Performed"
              options={surgeriesPerformed}
              placeholder="Select surgeries"
            />
          </div>
          <div className="w-2/5 flex gap-6">
            {/* Weight */}
            <div className="min-w-28">
              <label htmlFor="weight" className="block">
                Weight
              </label>
              <div className="relative">
                <input id="weight" name="weight" type="text" />
                <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500">
                  lbs
                </span>
              </div>
            </div>

            {/* Additional Drugs */}
            <div className="w-full min-w-[130px]">
              <label htmlFor="additionalDrugs">Additional Drugs</label>
              <select
                id="additionalDrugs"
                name="additionalDrugs"
                defaultValue=""
                className="text-gray-400"
                onChange={(e) => {
                  handlePlaceholderColorChange(e.target);
                }}
              >
                <option value="" disabled hidden>
                  Select a drug
                </option>
                {additionalDrugs.map((drug, index) => (
                  <option key={index} value={drug} className="text-primaryGray">
                    {drug}
                  </option>
                ))}
              </select>
            </div>

            {/* Dosage */}
            <div className="min-w-28">
              <label htmlFor="dosage" className="block">
                Dosage
              </label>
              <div className="relative">
                <input id="dosage" name="dosage" type="text" />
                <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500">
                  mls
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fourth Row */}
        <div className="flex gap-6 mb-6">
          {/* Surgical Notes */}
          <div className="w-3/5">
            <label htmlFor="surgicalNotes" className="block">
              Surgical Notes
            </label>
            <EditableSelect options={surgicalNotes} />
          </div>
          <div className="w-2/5 flex gap-6">
            {/* Cat's Name */}
            <div className="w-full">
              <label htmlFor="catName">Cat's Name</label>
              <input
                id="catName"
                name="catName"
                type="text"
                placeholder="Enter Name"
                defaultValue="Unnamed"
                onFocus={(e) => e.target.select()}
              />
            </div>

            {/* Age */}
            <div className="w-full">
              <label htmlFor="age">Age (Estimate)</label>
              <select
                id="age"
                name="age"
                defaultValue=""
                className="text-gray-400"
                onChange={(e) => {
                  handlePlaceholderColorChange(e.target);
                }}
              >
                <option value="" disabled hidden>
                  Estimate age
                </option>
                {estimatedAges.map((age, index) => (
                  <option key={index} value={age} className="text-primaryGray">
                    {age}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fifth Row */}
        <div className="flex gap-6 mb-6">
          <div className="w-3/5">
            <div className="w-full h-[132px]">
              <label htmlFor="additionalNotes">
                Additional Notes / Medications
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                type="text"
                placeholder="Enter additonal notes or medications here"
                className="h-full"
              />
            </div>
          </div>
          <div className="w-2/5 flex flex-col">
            <div className="flex w-full gap-6 mb-6">
              <div className="min-w-24">
                <label htmlFor="sex">Sex</label>
                <select id="sex" name="sex">
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div className="w-full">
                <label htmlFor="breed">Breed</label>
                <select
                  id="breed"
                  name="breed"
                  defaultValue=""
                  className="text-gray-400"
                  onChange={(e) => {
                    handlePlaceholderColorChange(e.target);
                  }}
                >
                  <option value="" disabled hidden>
                    Select a breed
                  </option>
                  {breeds.map((breed, index) => (
                    <option
                      key={index}
                      value={breed}
                      className="text-primaryGray"
                    >
                      {breed}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              {/* Surgeries Performed */}
              <MultiSelect
                label="Color"
                options={catColors}
                placeholder="Select color(s)"
              />
            </div>
          </div>
        </div>

        {/* Sixth Row */}
        <div className="flex gap-6 justify-between">
          <div className="w-40">
            <label>Veterinarian</label>
            <input
              id="veterinarian"
              name="veterinarian"
              type="text"
              defaultValue="Toscano-17161"
              onFocus={(e) => e.target.select()}
            />
          </div>
          <div className="flex-grow">
            <label htmlFor="outcome">Outcome</label>
            <select
              id="outcome"
              name="outcome"
              defaultValue=""
              className="text-gray-400"
              onChange={(e) => {
                handlePlaceholderColorChange(e.target);
              }}
            >
              <option value="" disabled hidden>
                Select an outcome
              </option>
              {outcomes.map((outcome, index) => (
                <option
                  key={index}
                  value={outcome}
                  className="text-primaryGray"
                >
                  {outcome}
                </option>
              ))}
            </select>
          </div>

          {/* Trapper Qualification */}
          <div className="flex-grow">
            <label>Qualifies for TIP?</label>
            <div className="flex h-[38px] items-center gap-2">
              <img src={qualified} />
              <p className="text-xs text-primaryGreen">
                Trapper qualifies for TIP
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button className="flex gap-3 items-center text-lg bg-primaryGreen text-primaryWhite px-6 py-2 rounded-lg">
            <NewEntryIcon />
            Submit New Entry
          </button>
        </div>
      </section>
    </>
  );
}
