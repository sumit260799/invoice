import React, { useEffect, useState } from "react";
import { get } from "../services/ApiEndpoint"; // Ensure deleteRequest is defined in your API service
import { MdDelete, MdEdit } from "react-icons/md";

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
        const response = await get("http://localhost:5000/api/auth/get-users");
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
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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

  const handleDeleteConfirm = async () => {
    // try {
    //   await deleteRequest(
    //     `http://localhost:5000/api/admin/delete-user/${userToDelete._id}`
    //   );
    //   setUsers(users.filter(user => user._id !== userToDelete._id));
    //   setIsModalOpen(false);
    //   setUserToDelete(null);
    // } catch (error) {
    //   console.error('Failed to delete user:', error);
    // }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setUserToDelete(null);
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="container mx-auto p-6 dark:bg-gray-800 text-gray-900 dark:text-gray-400 rounded-lg select-none h-screen">
      <h1 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-300">
        User Lists
      </h1>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="w-[50%] outline-none  px-4 py-2 dark:bg-gray-600 dark:text-gray-300 border  rounded-md focus:border focus:border-brandYellow"
          value={search}
          onChange={handleSearch}
        />
      </div>

      <table className="min-w-full rounded-md overflow-hidden shadow-sm">
        <thead>
          <tr>
            {["Employee ID", "Name", "Email", "Phone", "Role", "Action"].map(
              (header, index) => (
                <th
                  key={index}
                  onClick={() =>
                    handleSort(header.toLowerCase().replace(" ", ""))
                  }
                  className="py-1 text-sm px-4 bg-brandYellow text-left font-medium text-gray-800 dark:text- hover:border-l-2 hover:border-r-2  cursor-pointer"
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
              <td className="py-2 px-3 border-b">{user.employeeId}</td>
              <td className="py-2 px-3 border-b">{user.name}</td>
              <td className="py-2 px-3 border-b">{user.email}</td>
              <td className="py-2 px-3 border-b">{user.phone}</td>
              <td className="py-2 px-3 border-b">{user.role}</td>
              <td className="flex px-2 py-3 text-lg space-x-2 justify-center">
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

      {/* Pagination Controls */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg shadow-md transition duration-200 ${
            currentPage === 1
              ? "bg-gray-100 dark:bg-gray-600 dark:text-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Previous
        </button>
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg shadow-md transition duration-200 ${
            currentPage === totalPages
              ? "bg-gray-100 dark:bg-gray-600 dark:text-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to delete this user?
            </h2>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-300 rounded-lg shadow hover:bg-gray-400"
              >
                No
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowUsers;
