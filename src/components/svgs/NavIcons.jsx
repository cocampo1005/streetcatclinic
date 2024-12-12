import NewEntrySVG from "../../assets/icons/new-entry-icon.svg";
import TrappersSVG from "../../assets/icons/trappers-icon.svg";
import RecordsSVG from "../../assets/icons/records-icon.svg";
import FormsSVG from "../../assets/icons/forms-icon.svg";

export function NewEntryIcon() {
  return (
    <img src={NewEntrySVG} alt="New Entry Button Icon" className="h-10 w-10" />
  );
}

export function TrappersIcon() {
  return (
    <img src={TrappersSVG} alt="Trappers Button Icon" className="h-10 w-10" />
  );
}

export function RecordsIcon() {
  return (
    <img src={RecordsSVG} alt="Records Button Icon" className="h-10 w-10" />
  );
}

export function FormsIcon() {
  return <img src={FormsSVG} alt="Forms Button Icon" className="h-10 w-10" />;
}
