import React from "react";
import { NavLink } from "react-router-dom";
import Logo from "./svgs/Logo";
import {
  FormsIcon,
  NewEntryIcon,
  RecordsIcon,
  TrappersIcon,
} from "./svgs/NavIcons";

function NavItem({ to, label, icon }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center px-8 py-6 gap-2 ${
            isActive
              ? "bg-primaryGreen"
              : "hover:bg-primaryGreen active:bg-secondaryGreen"
          }`
        }
      >
        <span>{icon}</span>
        <span className="text-2xl">{label}</span>
      </NavLink>
    </li>
  );
}

export default function NavPanel() {
  return (
    <nav className="w-56 bg-primaryGray font-accent text-primaryWhite flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="flex p-8 justify-center items-center">
          <Logo />
        </div>
        {/* Tabs */}
        <ul className="flex flex-col">
          <NavItem to="/" label="New Entry" icon={<NewEntryIcon />} />
          <NavItem to="/trappers" label="Trappers" icon={<TrappersIcon />} />
          <NavItem to="/records" label="Records" icon={<RecordsIcon />} />
          <NavItem to="/forms" label="Forms" icon={<FormsIcon />} />
        </ul>
      </div>
      {/* Profile */}
      <div className="border-t border-t-primaryGray">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex p-8 items-center gap-2 ${
              isActive
                ? "bg-primaryGreen"
                : "hover:bg-primaryGreen active:bg-secondaryGreen"
            }`
          }
        >
          <div className="w-10 h-10 bg-primaryWhite flex justify-center items-center rounded-full">
            <p className="text-xl text-primaryGreen font-bold">MT</p>
          </div>
          <div>
            <p className="text-lg">Dr. Toscano</p>
            <p className="text-sm text-secondaryGray">Chief Surgeon</p>
          </div>
        </NavLink>
      </div>
    </nav>
  );
}
