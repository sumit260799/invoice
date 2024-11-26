import { useState } from "react";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="p-4 bg-white shadow flex justify-between items-center">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search"
        className="w-full max-w-xs p-2 rounded-md border border-gray-300 focus:ring focus:ring-blue-200"
      />

      {/* User Profile Section */}
      <div className="relative flex items-center space-x-4">
        <span className="text-gray-500 hidden sm:inline">Sumit Das</span>
        <img
          src="https://sumitdas-portfolio.netlify.app/static/media/profile.1d11ec380dfd04b9dbea.png"
          alt="Profile"
          className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-400"
          onClick={toggleDropdown}
        />

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute top-10 right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-md py-2 z-20 transition-all duration-200 ease-in-out transform">
            <a
              href="#"
              className="block px-4 py-1 border-b text-gray-700 hover:bg-gray-100  text-sm"
            >
              Profile
            </a>
            <a
              href="#"
              className="block px-4 py-1 border-b text-gray-700 hover:bg-gray-100  text-sm"
            >
              Settings
            </a>
            <a
              href="#"
              className="block px-4 py-1 border-b text-gray-700 hover:bg-gray-100  text-sm"
            >
              Help
            </a>
            <a
              href="#"
              className="block px-4 py-1 border-b text-gray-700 hover:bg-gray-100  text-sm"
            >
              Logout
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
