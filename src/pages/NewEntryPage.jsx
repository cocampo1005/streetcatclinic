import React, { useEffect, useState } from "react";
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
import { dosageChart } from "../data/dosageChart";
import { Checkmark, NoCert } from "../components/svgs/Icons";
import qualified from "../assets/icons/qualified-icon.png";
import notQualified from "../assets/icons/not-qualified-icon.png";
import MultiSelect from "../components/MultiSelectInput";
import EditableSelect from "../components/EditableSelect";
import { NewEntryIcon } from "../components/svgs/NavIcons";

const trappers = [
  { id: 1, name: "Tia Williams", qualifies: true },
  { id: 2, name: "John Smith", qualifies: false },
  { id: 3, name: "Angela Brown", qualifies: true },
  { id: 4, name: "Carlos Hernandez", qualifies: false },
];

const formatDateWithSlashes = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(d.getDate()).padStart(2, "0");
  return `${month}/${day}/${year}`;
};

export default function NewEntryPage() {
  const [selectedTrapper, setSelectedTrapper] = useState("");
  const [intakePickupDate, setIntakePickupDate] = useState(
    formatDateWithSlashes(new Date())
  );
  const [selectedService, setSelectedService] = useState("");
  const [catId, setCatId] = useState(`${formatDateWithSlashes(new Date())}-`);
  const [crossStreet, setCrossStreet] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [microchip, setMicrochip] = useState(false);
  const [microchipNumber, setMicrochipNumber] = useState("");
  const [rabies, setRabies] = useState(false);
  const [rabiesWithoutCertificate, setRabiesWithoutCertificate] =
    useState(false);
  const [FVRCP, setFVRCP] = useState(false);
  const [FeLVFIV, setFeLVFIV] = useState("");
  const [selectedSurgeriesPerformed, setSelectedSurgeriesPerformed] = useState(
    []
  );
  const [weight, setWeight] = useState("");
  const [selectedAdditionalDrug, setSelectedAdditionalDrug] = useState("");
  const [dosage, setDosage] = useState("");
  const [surgicalNotes, setSurgicalNotes] = useState("");
  const [catName, setCatName] = useState("");
  const [age, setAge] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [sex, setSex] = useState("");
  const [breed, setBreed] = useState("");
  const [color, setColor] = useState([]);
  const [veterinarian, setVeterinarian] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [qualifiesForTIP, setQualifiesForTIP] = useState(false);

  const createEntryObject = () => {
    const entry = {
      trapper: selectedTrapper,
      intakePickupDate,
      service: selectedService,
      catId,
      crossStreet,
      microchip,
      microchipNumber,
      rabies,
      rabiesWithoutCertificate,
      FVRCP,
      FeLVFIV,
      weight,
      selectedAdditionalDrug,
      dosage,
      catName,
      age,
      sex,
      breed,
      color,
      selectedSurgeriesPerformed,
      surgicalNotes,
      additionalNotes,
      veterinarian,
      selectedOutcome,
      qualifiesForTIP,
    };
    return entry;
  };

  // Log changes whenever any state is updated
  useEffect(() => {
    console.log("Form updated:", createEntryObject());
  }, [
    selectedTrapper,
    intakePickupDate,
    selectedService,
    catId,
    crossStreet,
    microchip,
    microchipNumber,
    rabies,
    rabiesWithoutCertificate,
    FVRCP,
    FeLVFIV,
    weight,
    selectedAdditionalDrug,
    dosage,
    catName,
    age,
    sex,
    breed,
    color,
    selectedSurgeriesPerformed,
    surgicalNotes,
    additionalNotes,
    veterinarian,
    selectedOutcome,
    qualifiesForTIP,
  ]);

  const handlePlaceholderColorChange = (element) => {
    element.classList.toggle("text-gray-400", element.value === "");
    element.classList.toggle("text-primaryGray", element.value !== "");
  };

  useEffect(() => {
    if (selectedSurgeriesPerformed.includes("Neuter (Male)")) {
      setSex("Male");
    } else if (selectedSurgeriesPerformed.includes("Spay (Female)")) {
      setSex("Female");
    }
  }, [selectedSurgeriesPerformed]);

  const handleCalculate = (inputWeight, selectedDrug) => {
    if (!inputWeight || !selectedDrug) return "";

    // Find the closest weight in the chart
    const closestEntry = dosageChart.reduce((prev, curr) => {
      return Math.abs(curr.weight - inputWeight) <
        Math.abs(prev.weight - inputWeight)
        ? curr
        : prev;
    });

    // Return the dosage for the selected drug
    return closestEntry[selectedDrug] || "No dosage available";
  };

  // useEffect to calculate dosage when weight or selected drug changes
  useEffect(() => {
    if (weight && selectedAdditionalDrug) {
      const calculatedDosage = handleCalculate(weight, selectedAdditionalDrug);
      setDosage(calculatedDosage); // Update dosage state
    } else {
      setDosage(""); // Reset dosage if inputs are missing
    }
  }, [weight, selectedAdditionalDrug]);

  useEffect(() => {
    const currTrapper = trappers.find(
      (trapper) => trapper.id === selectedTrapper
    );
    console.log(currTrapper);
    const trapperQualifies = currTrapper && currTrapper.qualifies;
    const serviceQualifies = selectedService === "MD-TNVR";
    setQualifiesForTIP(trapperQualifies && serviceQualifies);
  }, [selectedTrapper, selectedService]);

  const handleMicrochipChange = (e) => {
    setMicrochip(e.target.checked);
    if (!e.target.checked) {
      setMicrochipNumber("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!catName) {
      setCatName("Unnamed");
    }
    // Add form submission logic here
  };

  return (
    <>
      <header className="w-full border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent text-4xl">New Cat Entry</h1>
      </header>
      <form className="flex-grow p-8 overflow-auto" onSubmit={handleSubmit}>
        {/* First Row */}
        <div className="grid grid-flow-col gap-6 mb-6">
          {/* Trapper */}
          <div>
            <label htmlFor="trapper">Trapper</label>
            <select
              id="trapper"
              name="trapper"
              value={selectedTrapper}
              className={selectedTrapper ? "text-primaryGray" : "text-gray-400"}
              onChange={(e) => {
                setSelectedTrapper(e.target.value);
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
              value={intakePickupDate}
              placeholder="Enter Date"
              onChange={(e) => setIntakePickupDate(e.target.value)}
            />
          </div>

          {/* Service */}
          <div>
            <label htmlFor="service">Service</label>
            <select
              id="service"
              name="service"
              value={selectedService}
              className={selectedService ? "text-primaryGray" : "text-gray-400"}
              onChange={(e) => {
                setSelectedService(e.target.value);
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
              value={catId}
              placeholder="Enter Cat ID"
              onChange={(e) => setCatId(e.target.value)}
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
                  value={crossStreet}
                  placeholder="Enter cross street"
                  onChange={(e) => setCrossStreet(e.target.value)}
                />
              </div>
              {/* Zip Code */}
              <div className="min-w-28">
                <label htmlFor="zipCode">Zip Code</label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  value={zipCode}
                  placeholder="Enter zip"
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </div>
              {/* Microchip */}
              <div className="min-w-40">
                <div className="flex items-center">
                  <label className="pr-3" htmlFor="microchip">
                    Microchip
                  </label>
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={microchip}
                      onChange={handleMicrochipChange}
                    />
                    <span className="checkbox">
                      <Checkmark />
                    </span>
                  </label>
                </div>
                <input
                  id="microchip-number"
                  name="microchip-number"
                  type="text"
                  placeholder={microchip ? "Enter microchip #" : "No microchip"}
                  disabled={!microchip} // Disable if microchip checkbox is unchecked
                  value={microchipNumber}
                  onChange={(e) => setMicrochipNumber(e.target.value)}
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
                  <input
                    type="checkbox"
                    checked={rabies}
                    onChange={(e) => setRabies(e.target.checked)}
                    className="hidden"
                  />
                  <span className="checkbox mt-[2px]">
                    <Checkmark />
                  </span>
                </label>
              </div>
              <div className="flex items-start">
                <p className="label mr-1">Rabies</p>
                <NoCert />
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={rabiesWithoutCertificate}
                    onChange={(e) =>
                      setRabiesWithoutCertificate(e.target.checked)
                    }
                    className="hidden"
                  />
                  <span className="checkbox mt-[2px]">
                    <Checkmark />
                  </span>
                </label>
              </div>
              <div className="flex items-start">
                <p className="label">FVRCP</p>
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={FVRCP}
                    onChange={(e) => setFVRCP(e.target.checked)}
                    className="hidden"
                  />
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
                      className={`rounded-full px-4 text-sm font-bold border border-secondaryGray 
                        ${
                          FeLVFIV === text
                            ? "bg-primaryGreen text-white border-primaryGreen"
                            : "text-labelGray hover:border-primaryGreen hover:text-primaryGreen"
                        }
                        transition`}
                      type="button"
                      value={text}
                      onClick={(e) => setFeLVFIV(e.target.value)}
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
              onChange={(selected) => setSelectedSurgeriesPerformed(selected)}
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
              {/* Sex */}
              <div className="min-w-24">
                <label htmlFor="sex">Sex</label>
                <select
                  id="sex"
                  name="sex"
                  className={sex ? "text-primaryGray" : "text-gray-400"}
                  value={sex}
                  onChange={(e) => {
                    setSex(e.target.value);
                  }}
                >
                  <option value="" disabled hidden>
                    Select
                  </option>
                  <option className="text-primaryGray">Male</option>
                  <option className="text-primaryGray">Female</option>
                </select>
              </div>

              {/* Breed */}
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
              {/* Color */}
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
          {/* Vet */}
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

          {/* Outcome */}
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

            {qualifiesForTIP ? (
              <div className="flex h-[38px] items-center gap-2">
                <img src={qualified} />
                <p className="text-xs text-primaryGreen">
                  Trapper qualifies for TIP
                </p>
              </div>
            ) : (
              <div className="flex h-[38px] items-center gap-2">
                <img src={notQualified} />
                <p className="text-xs text-red-500">
                  Trapper does not qualify for TIP
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="flex gap-3 items-center text-lg bg-primaryGreen text-primaryWhite px-6 py-2 rounded-lg"
          >
            <NewEntryIcon />
            Submit New Entry
          </button>
        </div>
      </form>
    </>
  );
}
