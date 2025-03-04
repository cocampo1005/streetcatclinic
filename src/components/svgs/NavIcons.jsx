import NewEntrySVG from "../../assets/icons/new-entry-icon.svg";
import TrappersSVG from "../../assets/icons/trappers-icon.svg";
import RecordsSVG from "../../assets/icons/records-icon.svg";
import FormsSVG from "../../assets/icons/forms-icon.svg";
import UsersSVG from "../../assets/icons/users-icon.svg";
import SettingsSVG from "../../assets/icons/settings-icon.svg";

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

export function UsersIcon() {
  return <img src={UsersSVG} alt="Users Button Icon" className="h-10 w-10" />;
}

export function SettingsIcon() {
  return (
    <img src={SettingsSVG} alt="Settings Button Icon" className="h-10 w-10" />
  );
}
