import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { get } from "../services/ApiEndpoint";
import { useSelector } from "react-redux";

const StatusDataPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { srStatus, quoteStatus } = useParams();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      const queryParams = new URLSearchParams();
      if (srStatus) queryParams.append("srStatus", srStatus);
      if (quoteStatus) queryParams.append("quoteStatus", quoteStatus);

      try {
        setLoading(true);
        const response = await get(
          `/api/user/get-service-status?${queryParams.toString()}`
        );
        if (response.status === 200) {
          setInvoices(response.data.serviceRequests);
        } else {
          throw new Error("Failed to fetch service requests");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [srStatus, quoteStatus]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedInvoices = React.useMemo(() => {
    let sortableInvoices = [...(invoices || [])];
    if (sortConfig.key !== null) {
      sortableInvoices.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableInvoices;
  }, [invoices, sortConfig]);

  const filteredInvoices = sortedInvoices.filter((invoice) =>
    Object.values(invoice).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  return (
    <div className="p-2 bg-gray-100 dark:bg-gray-800 border-1 border-gray-400 rounded-lg min-h-screen select-none">
      <div className="my-2 flex items-center justify-between">
        <input
          type="text"
          placeholder="Search..."
          className="w-[50%] border bg-gray-50 dark:bg-gray-800 dark:text-brandYellow text-gray-900  border-gray-300 p-2 rounded-lg focus:outline-none  focus:border-brandYellow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="">
        {loading ? (
          <p className="text-gray-700">Loading invoices...</p>
        ) : (
          <table className="w-full overflow-hidden   bg-brandYellow select-none text-sm">
            <thead>
              <tr className="">
                {[
                  "SrId",
                  "quoteNo",
                  "zone",
                  "equipSNo",
                  "modelNo",
                  "indDiv",
                  "billingPlant",
                  "customerName",
                  "SrStatus",
                  "QuoteStatus",
                  // 'attachments',
                ].map((key) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="p-2 text-left font-medium text-gray-700  cursor-pointer  hover:border-r-2 hover:border-l-2 hover:border-gray-100"
                  >
                    {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                    {sortConfig.key === key
                      ? sortConfig.direction === "asc"
                        ? " ▲"
                        : " ▼"
                      : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-50 dark:bg-gray-800 dark:text-brandYellow text-gray-900">
              {paginatedInvoices.map((invoice, index) => (
                <tr
                  key={index}
                  className="border dark:hover:bg-gray-700 hover:bg-gray-200"
                >
                  <td className="p-2 text-gray-700 dark:text-gray-100">
                    <Link
                      to={`/service-requests/${user?.role}/${invoice.serviceRequestId}`}
                      className="text-blue-500 hover:underline"
                    >
                      {invoice.serviceRequestId}
                    </Link>
                  </td>
                  <td className="p-2 text-gray-700 dark:text-gray-100">
                    {invoice.quotationNo}
                  </td>
                  <td className="p-2 text-gray-700 dark:text-gray-100">
                    {invoice.zone}
                  </td>
                  <td className="p-2 text-gray-700 dark:text-gray-100">
                    {invoice.equipmentSerialNo}
                  </td>
                  <td className="p-2 text-gray-700 dark:text-gray-100">
                    {invoice.modelNo}
                  </td>
                  <td className="p-2 text-gray-700 dark:text-gray-100">
                    {invoice.industryDiv}
                  </td>
                  <td className="p-2 text-gray-700 dark:text-gray-100">
                    {invoice.billingPlant}
                  </td>
                  <td className="p-2 text-gray-700 dark:text-gray-100">
                    {invoice.customerName}
                  </td>
                  <td className="p-2 text-gray-700 dark:text-gray-100">
                    {invoice.srStatus}
                  </td>
                  <td className="p-2 text-gray-700 dark:text-gray-100">
                    {invoice.quoteStatus}
                  </td>
                  <td className="p-2 text-gray-700 dark:text-gray-100">
                    {/* {invoice?.attachments[0]} */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <p className="text-gray-700 dark:text-gray-100">
          Page {currentPage} of {totalPages}
        </p>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StatusDataPage;
