import React, { useEffect, useState } from "react";
import { get, del } from "../services/ApiEndpoint"; // Assume `del` for delete request
import { MdDelete, MdEdit } from "react-icons/md";
import { AiOutlineCopy } from "react-icons/ai";
import axios from "axios";

const ShowUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await get("/api/auth/get-users");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email).then(() => {
      alert("Email copied to clipboard!");
    });
  };
  const handleDeleteUser = async () => {
    try {
      await del(`/api/auth/deleteUser`, {
        data: { id: userToDelete?._id }, // Correctly pass the body using `data`
      });
      alert("User deleted successfully.");
      // Optionally refresh the users list or update the UI
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userToDelete?._id)
      );
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsModalOpen(false);
      setUserToDelete(null);
    }
  };

  const sortedUsers = React.useMemo(() => {
    let sortedUsers = [...users];
    if (sortConfig.key) {
      sortedUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortedUsers;
  }, [users, sortConfig]);

  const filteredUsers = sortedUsers.filter((user) =>
    Object.values(user).some((val) =>
      val.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setUserToDelete(null);
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="container mx-auto p-2 md:p-6 dark:bg-gray-800 text-gray-900 dark:text-gray-400 rounded-lg select-none h-screen">
      <h1 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-300">
        User Lists
      </h1>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="w-[50%] outline-none px-4 py-1 dark:bg-gray-600 dark:text-gray-300 border rounded-md focus:border focus:border-brandYellow"
          value={search}
          onChange={handleSearch}
        />
      </div>

      <div className="table-wrapper w-full overflow-x-auto custom-scrollbar">
        <table className="min-w-full border-collapse rounded-md">
          <thead>
            <tr>
              {["Employee ID", "Name", "Email", "Phone", "Role", "Action"].map(
                (header, index) => (
                  <th
                    key={index}
                    onClick={() =>
                      handleSort(header.toLowerCase().replace(" ", ""))
                    }
                    className="py-1 text-sm px-2 bg-brandYellow text-left font-medium text-gray-100 hover:border-l-2 hover:border-r-2 cursor-pointer"
                  >
                    {header}{" "}
                    {sortConfig.key === header.toLowerCase().replace(" ", "")
                      ? sortConfig.direction === "ascending"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr
                key={user._id}
                className="bg-white dark:bg-gray-600 dark:text-gray-300 text-gray-800 hover:bg-gray-100 even:bg-gray-50 dark:hover:bg-gray-600 dark:even:bg-gray-700"
              >
                <td className="py-1 px-3">{user.employeeId}</td>
                <td className="py-1 px-3">{user.name}</td>
                <td className="py-1 px-3 flex items-center">
                  {user.email}
                  <AiOutlineCopy
                    className="ml-2 cursor-pointer text-gray-500 dark:text-gray-300 hover:text-gray-800"
                    onClick={() => handleCopyEmail(user.email)}
                  />
                </td>
                <td className="py-1 px-3">{user.phone}</td>
                <td className="py-1 px-3">{user.role}</td>
                <td className="flex px-2 py-1 text-lg space-x-2 justify-center">
                  <span>
                    <MdEdit />
                  </span>
                  <span
                    className="text-red-600 cursor-pointer"
                    onClick={() => handleDeleteClick(user)}
                  >
                    <MdDelete />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-md shadow-lg text-center">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Are you sure you want to delete this user?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={handleDeleteUser}
              >
                Yes
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={handleModalClose}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowUsers;
