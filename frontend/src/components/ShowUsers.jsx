import React, { useEffect, useState } from "react";
import { get } from "../services/ApiEndpoint";

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await get("http://localhost:5000/api/admin/get-users");
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
    setCurrentPage(1); // Reset to the first page on new search
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

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="container mx-auto  p-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-400 rounded-lg shadow-lg select-none">
      <h1 className="text-xl font-semibold mb-6 text-gray-700">User Lists</h1>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full px-4 py-2 border rounded-lg  focus:outline-none focus:ring-1 focus:ring-blue-300"
          value={search}
          onChange={handleSearch}
        />
      </div>

      <table className="min-w-full  rounded-lg overflow-hidden shadow-md">
        <thead className="">
          <tr>
            {["Employee ID", "Name", "Email", "Phone", "Role"].map(
              (header, index) => (
                <th
                  key={index}
                  onClick={() =>
                    handleSort(header.toLowerCase().replace(" ", ""))
                  }
                  className="py-3 px-4 text-left font-medium text-gray-800 dark:text- hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
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
              className="hover:bg-gray-100 even:bg-gray-50 dark:hover:bg-gray-600 dark:even:bg-gray-700"
            >
              <td className="py-3 px-4 border-b">{user.employeeId}</td>
              <td className="py-3 px-4 border-b">{user.name}</td>
              <td className="py-3 px-4 border-b">{user.email}</td>
              <td className="py-3 px-4 border-b">{user.phone}</td>
              <td className="py-3 px-4 border-b">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ShowUsers;
