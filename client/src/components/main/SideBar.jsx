import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaBullseye,
  FaBars,
  FaCalendarAlt,
  FaHome,
  FaClipboardList,
  FaChartLine,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Sidebar({ onToggle }) {
  const [collapsed, setCollapsed] = useState(() => {
    // Initialize from localStorage
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState === "true";
  });
  const { logout } = useAuth();
  const location = useLocation();
  const { isDark } = useTheme();

  // Notify other components about the initial state on mount
  useEffect(() => {
    if (onToggle) {
      onToggle(collapsed);
    }

    // Also dispatch the event for other components
    const event = new CustomEvent("sidebar-collapse", {
      detail: { collapsed },
    });
    window.dispatchEvent(event);
  }, []);

  const sidebarItems = [
    {
      itemName: "Dashboard",
      icon: <FaHome />,
      link: "/dashboard",
    },
    {
      itemName: "Goals",
      icon: <FaClipboardList />,
      link: "/goals",
    },
    {
      itemName: "Calendar",
      icon: <FaCalendarAlt />,
      link: "/calendar",
    },
    {
      itemName: "Analytics",
      icon: <FaChartLine />,
      link: "/analytics",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);

    // Save to localStorage
    localStorage.setItem("sidebar-collapsed", newCollapsedState);

    // Call the onToggle prop if provided
    if (onToggle) {
      onToggle(newCollapsedState);
    }

    // Also dispatch a custom event for other components to listen to
    const event = new CustomEvent("sidebar-collapse", {
      detail: { collapsed: newCollapsedState },
    });
    window.dispatchEvent(event);
  };

  return (
    <aside
      className={`
        ${
          isDark
            ? "bg-zinc-900 text-white border-r border-zinc-800"
            : "bg-white text-gray-800 border-r border-gray-200"
        }
        flex flex-col 
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
        h-screen fixed left-0 top-0 z-30 shadow-xl
      `}
    >
      <div className="flex items-center justify-between py-6 px-4 border-b border-indigo-500/10">
        {!collapsed && (
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            SkillSync
          </h2>
        )}
        <button
          onClick={toggleSidebar}
          className={`${
            collapsed ? "mx-auto" : "ml-auto"
          } p-2.5 rounded-full bg-zinc-800 hover:bg-indigo-700 transition-colors duration-200`}
          aria-label="Toggle sidebar"
        >
          <FaBars size={16} className="text-indigo-200" />
        </button>
      </div>

      <nav className="flex-1 py-8 px-3">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.link;
            return (
              <Link
                key={item.itemName}
                to={item.link}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg"
                      : "hover:bg-zinc-800 text-gray-300 hover:text-white"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
                title={item.itemName}
              >
                <div
                  className={`${isActive ? "text-white" : "text-indigo-400"}`}
                >
                  {item.icon}
                </div>
                {!collapsed && (
                  <span className="font-medium">{item.itemName}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto border-t border-indigo-500/10 py-4 px-3">
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 p-3 rounded-xl w-full
            text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors duration-200
            ${collapsed ? "justify-center" : ""}
          `}
          title="Logout"
        >
          <FaSignOutAlt />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
