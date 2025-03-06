import React from "react";
import { NavLink } from "react-router-dom";
import Logo from "./svgs/Logo";
import {
  FormsIcon,
  NewEntryIcon,
  RecordsIcon,
  SettingsIcon,
  TrappersIcon,
  UsersIcon,
} from "./svgs/NavIcons";
import { useAuth } from "../contexts/AuthContext";

function NavItem({ to, label, icon }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center px-4 md:px-8 py-3 md:py-4 gap-2 ${
            isActive
              ? "bg-primaryGreen"
              : "hover:bg-primaryGreen active:bg-secondaryGreen"
          }`
        }
      >
        <span>{icon}</span>
        <span className="text-sm md:text-lg">{label}</span>
      </NavLink>
    </li>
  );
}

export default function NavPanel() {
  const { user } = useAuth();

  return (
    <nav className="w-16 md:w-56 fixed h-screen bg-primaryGray font-accent text-primaryWhite flex flex-col justify-between overflow-y-auto">
      <div>
        {/* Logo */}
        <div className="flex p-4 md:p-8 justify-center items-center">
          <Logo className="w-8 md:w-auto" />
        </div>
        {/* Tabs */}
        <ul className="flex flex-col">
          <NavItem to="/" label="New Entry" icon={<NewEntryIcon />} />
          <NavItem to="/trappers" label="Trappers" icon={<TrappersIcon />} />
          <NavItem to="/records" label="Records" icon={<RecordsIcon />} />
          <NavItem to="/forms" label="Forms" icon={<FormsIcon />} />
          {user?.role === "admin" && (
            <>
              <NavItem to="/accounts" label="Accounts" icon={<UsersIcon />} />
              <NavItem
                to="/settings"
                label="Settings"
                icon={<SettingsIcon />}
              />
            </>
          )}
        </ul>
      </div>
      {/* Profile */}
      <div className="border-t border-t-primaryGray">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex p-4 md:p-8 items-center gap-2 ${
              isActive
                ? "bg-primaryGreen"
                : "hover:bg-primaryGreen active:bg-secondaryGreen"
            }`
          }
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primaryWhite flex justify-center items-center rounded-full">
            <p className="text-sm md:text-xl text-primaryGreen font-bold">
              {`${user?.firstName.charAt(0).toUpperCase()}${user?.lastName
                .charAt(0)
                .toUpperCase()}`}
            </p>
          </div>
          <div className="hidden md:block">
            <p className="text-sm md:text-lg">{`${user?.firstName
              .charAt(0)
              .toUpperCase()}. ${user?.lastName}`}</p>
            <p className="text-xs md:text-sm text-secondaryGray">
              {user?.title}
            </p>
          </div>
        </NavLink>
      </div>
    </nav>
  );
}
