import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaBullseye,
  FaBars,
} from "react-icons/fa";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarItems = [
    {
      itemName: "Dashboard",
      icon: <FaTachometerAlt />,
      link: "/dashboard",
    },
    {
      itemName: "Goals",
      icon: <FaBullseye />,
      link: "/goals",
    },
  ];

  return (
    <aside
      className={`bg-zinc-900 text-white flex flex-col pb-8 pt-3 px-4
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-64"}
        h-screen
      `}
    >
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className=" self-end p-2 rounded hover:bg-zinc-700"
          aria-label="Toggle sidebar"
        >
          <FaBars size={20} />
        </button>

        <h2
          className={`text-2xl font-bold transition-opacity duration-300 ${
            collapsed ? "opacity-0" : "opacity-100"
          }`}
        >
          SkillSync
        </h2>
      </div>

      <nav className="flex-1 space-y-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.itemName}
            to={item.link}
            className={
              collapsed
                ? `flex items-center p-2 rounded-[8px] justify-center gap-3 hover:bg-zinc-800 whitespace-nowrap`
                : `flex bg-zinc-800 p-3 rounded-[8px] items-center gap-3 hover:bg-zinc-900 whitespace-nowrap`
            }
            title={item.itemName}
          >
            {item.icon}
            {!collapsed && <span className="">{item.itemName}</span>}
          </Link>
        ))}
      </nav>

      <button
        className="mt-auto flex items-center gap-3 hover:text-red-400 whitespace-nowrap"
        title="Logout"
      >
        <FaSignOutAlt />
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}
