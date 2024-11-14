import React, { useState, useEffect, useRef } from "react";
import { FiMenu, FiX, FiUser, FiSun, FiMoon } from "react-icons/fi";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { post } from "../services/ApiEndpoint";
import { toast } from "react-hot-toast";
import { RiLogoutCircleRLine } from "react-icons/ri";

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isDarkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("isDarkMode") === "true";
  });

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("isDarkMode", newMode);
      document.documentElement.classList.toggle("dark", newMode); // Toggle dark class on the root element
      return newMode;
    });
  };

  // Initialize dark mode based on localStorage value on page load
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleUserClick = () => setIsDropdownOpen(!isDropdownOpen);
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await post("/api/auth/logout");
      if (response && response.status === 200) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const linkClasses = (path) => {
    const isActive = location.pathname === path;
    return `block px-4 py-4  rounded-e-[50px] me-4 text-base font-medium transition-colors  ${
      isActive ? "bg-gray-800 text-gray-100 " : "text-gray-600 dark:text-white"
    } hover:text-gray-100 hover:bg-gray-800`;
  };

  return (
    <div className="flex  ">
      {/* Sidebar */}
      {isSidebarOpen && (
        <aside className="fixed top-0  left-0 h-full w-48 sm:w-64 border-r border-gray-200 dark:border-none bg-gray-100 dark:bg-gray-900 text-black dark:text-white shadow-lg transition-transform duration-300 ease-in-out  z-50">
          <div className="text-md m-4 flex flex-col ">
            <span className="text-md sm:text-lg font-bold">{user?.role} </span>{" "}
            <span className="font-extrabold text-brandYellow text-xl sm:text-3xl">
              Dashboard
            </span>
          </div>

          <nav className="mt-8">
            <ul className="flex flex-col gap-y-1 ">
              {user?.role === "admin" && (
                <>
                  <li className="">
                    <Link to="/admin" className={linkClasses("/admin")}>
                      Home
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      to="/create-user"
                      className={linkClasses("/create-user")}
                    >
                      Create User
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      to="/show-users"
                      className={linkClasses("/show-users")}
                    >
                      Show Users
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      to="/service-requests"
                      className={linkClasses("/service-requests")}
                    >
                      Service Requests
                    </Link>
                  </li>
                </>
              )}
              {user?.role === "user" && (
                <>
                  <li className="">
                    <Link to="/" className={linkClasses("/")}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/create-service-request"
                      className={linkClasses("/create-service-request")}
                    >
                      Create Service Request
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      to="/user-service-requests"
                      className={linkClasses("/user-service-requests")}
                    >
                      All Requests
                    </Link>
                  </li>
                </>
              )}
              {user?.role === "manager" && (
                <>
                  <li className="">
                    <Link to="/" className={linkClasses("/manager")}>
                      Home
                    </Link>
                  </li>
                  <li className="">
                    <Link
                      to="/all-requests"
                      className={linkClasses("/all-requests")}
                    >
                      All Requests
                    </Link>
                  </li>
                </>
              )}
              {user?.role === "spc" && (
                <>
                  <li className="">
                    <Link to="/spc" className={linkClasses("/spc")}>
                      Home
                    </Link>
                  </li>
                </>
              )}

              <li className="">
                <Link to="/billed" className={linkClasses("/billed")}>
                  Billed
                </Link>
              </li>
              <li className="">
                <Link to="/profile" className={linkClasses("/profile")}>
                  Profile
                </Link>
              </li>
            </ul>
          </nav>
          <button
            onClick={handleLogout}
            className="fixed bottom-4 left-5 flex justify-center gap-2 "
          >
            <RiLogoutCircleRLine className="text-gray-600 dark:text-white text-[1.5rem]" />{" "}
            <span>Logout</span>
          </button>
        </aside>
      )}

      {/* Main content */}
      <div
        className={`relative flex-1 overflow-hidden p-2 sm:p-3 md:p-4   ${
          isSidebarOpen ? "ml-48 sm:ml-64" : ""
        } transition-all duration-300`}
      >
        <header className="flex items-center justify-between py-2 px-3 rounded-lg">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="text-3xl font-bold text-gray-800 dark:text-gray-100"
            >
              {isSidebarOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="text-2xl text-gray-800 dark:text-gray-100"
            >
              {isDarkMode ? (
                <FiSun className="dark:text-yellow-500 transition-opacity" />
              ) : (
                <FiMoon />
              )}
            </button>

            {/* Profile Icon */}
            <div className="relative">
              <button
                onClick={handleUserClick}
                className="text-2xl text-gray-800 dark:text-white"
              >
                <FiUser />
              </button>
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2  bg-gray-100 dark:bg-gray-800 dark:border dark:border-gray-400 shadow-lg rounded-lg p-3 overflow-hidden"
                >
                  <p className="text-gray-700 dark:text-gray-200 text-sm">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="mt-2 sm:mt-3 border border-gray-300 bg-white rounded-lg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
