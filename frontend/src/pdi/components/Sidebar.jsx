import React, { useState, useEffect } from 'react';
import {
  HomeIcon,
  WalletIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { IoIosCall } from 'react-icons/io';
import { MdPeopleAlt, MdLocalFireDepartment } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { post } from '../../services/ApiEndpoint';
import { useDispatch } from 'react-redux';
import { clearUser } from '../../features/authSlice';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const dispatch = useDispatch();
  // Retrieve the saved state from localStorage on mount, default to false if not present
  const savedExpandedState = localStorage.getItem('sidebarExpanded') === 'true';
  const [isExpanded, setIsExpanded] = useState(savedExpandedState);
  const [sidebarWidth, setSidebarWidth] = useState(
    savedExpandedState ? 240 : 60
  );

  const handleMouseDown = e => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = e => {
      const newWidth = Math.min(
        Math.max(startWidth + e.clientX - startX, 80),
        240 // Maximum width is reduced to 240px for a more compact sidebar
      );
      setSidebarWidth(newWidth);
      setIsExpanded(newWidth > 120); // Adjust the threshold for expansion
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const handleLogout = async () => {
    try {
      const response = await post('/api/auth/logout');
      if (response && response.status === 200) {
        toast.success(response.data.message);
      }
      await dispatch(clearUser());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Update localStorage whenever isExpanded changes
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', isExpanded);
  }, [isExpanded]);

  return (
    <div
      className={`relative h-screen overflow-hidden bg-gradient-to-b from-blue-800 to-indigo-900 text-white flex flex-col p-4 transition-all duration-300 ease-in-out shadow-lg sm:w-16 md:w-24 lg:w-48 ${
        isExpanded ? 'w-[240px]' : 'w-[60px]'
      }`}
      style={{ width: sidebarWidth }}
    >
      {/* Sidebar Header */}
      <h2
        className={`text-2xl font-bold mb-8 transition-opacity duration-300 ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        PDI
      </h2>

      {/* Sidebar Navigation */}
      <nav className="flex-1 space-y-6">
        <Link
          to="/inspector"
          className={`flex ${
            isExpanded ? 'justify-start' : 'justify-center'
          } items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 hover:bg-indigo-700 hover:px-3 py-2 rounded-md`}
        >
          <HomeIcon className="h-6 w-6" />
          {isExpanded && (
            <span className="opacity-100 transition-opacity duration-300">
              Dashboard
            </span>
          )}
        </Link>
        <Link
          to="/inspector/inspector-list"
          className={`flex ${
            isExpanded ? 'justify-start' : 'justify-center'
          } items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 hover:bg-indigo-700 hover:px-3 py-2 rounded-md`}
        >
          <MdPeopleAlt className="h-6 w-6" />
          {isExpanded && (
            <span className="opacity-100 transition-opacity duration-300">
              Inspector List
            </span>
          )}
        </Link>
        <Link
          to="/inspector/equipment-list"
          className={`flex ${
            isExpanded ? 'justify-start' : 'justify-center'
          } items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 hover:bg-indigo-700 hover:px-3 py-2 rounded-md`}
        >
          <MdLocalFireDepartment className="h-6 w-6" />
          {isExpanded && (
            <span className="opacity-100 transition-opacity duration-300">
              Equipment List
            </span>
          )}
        </Link>
        <Link
          to="/inspector/call-list"
          className={`flex ${
            isExpanded ? 'justify-start' : 'justify-center'
          } items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 hover:bg-indigo-700 hover:px-3 py-2 rounded-md`}
        >
          <IoIosCall className="h-6 w-6" />
          {isExpanded && (
            <span className="opacity-100 transition-opacity duration-300">
              Call List
            </span>
          )}
        </Link>

        <Link
          to="/inspector/settings"
          className={`flex ${
            isExpanded ? 'justify-start' : 'justify-center'
          } items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 hover:bg-indigo-700 hover:px-3 py-2 rounded-md`}
        >
          <Cog6ToothIcon className="h-6 w-6" />
          {isExpanded && (
            <span className="opacity-100 transition-opacity duration-300">
              Settings
            </span>
          )}
        </Link>
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className={`mt-auto flex items-center space-x-3  py-2  rounded-lg text-white hover:bg-indigo-600 transition-all duration-300 ${
          isExpanded
            ? 'justify-start bg-indigo-700 px-4'
            : 'justify-center px-0'
        }`}
      >
        <ArrowLeftOnRectangleIcon className="h-6 w-6" />
        {isExpanded && (
          <span className="opacity-100 transition-opacity duration-300">
            Logout
          </span>
        )}
      </button>

      {/* Drag Handle */}
      <div
        className="absolute top-0 right-0 h-full w-2 cursor-ew-resize bg-transparent"
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  );
};

export default Sidebar;
