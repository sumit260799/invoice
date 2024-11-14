import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { get, post } from "../services/ApiEndpoint";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaFilePdf, FaTimes } from "react-icons/fa";
import { MdFolderZip, MdPreview, MdAssignmentAdd } from "react-icons/md";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ServiceRequestDetails from "./ServiceRequestDetails";
import SideBar from "./SideBar";

const AllRequests = () => {
  const { user } = useSelector((state) => state.auth);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  console.log("🚀 ~ AllRequests ~ selectedInvoice:", selectedInvoice);
  const [emailList, setEmailList] = useState([]);
  const [inputValue, setInputValue] = useState([
    { name: "", email: "", remarks: "" },
  ]);
  const [suggestions, setSuggestions] = useState([]);
  const itemsPerPage = 12;
  const url = "http://localhost:5000";

  const fetchInvoices = async () => {
    try {
      const response = await get("/api/user/get-service-request");
      if (response.status === 200) {
        setInvoices(response.data.serviceRequests); // Updated to match your data structure
      } else {
        toast.error("Failed to fetch invoices.");
      }
    } catch (error) {
      toast.error(`Error fetching invoices: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchInvoices();
  }, []);
  const fetchAllEmail = async () => {
    try {
      const response = await get("/api/user/v1/names");
      console.log("response", response.data);
      setEmailList(response.data?.empList);
    } catch (error) {}
  };

  useEffect(() => {
    fetchAllEmail();
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedInvoices = React.useMemo(() => {
    let sortableInvoices = [...invoices];
    if (sortConfig.key) {
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

  const tableHeaders = [
    { label: "SrID", key: "serviceRequestId" },
    { label: "QuoteNo", key: "quotationNo" },
    { label: "QuoteStatus", key: "quoteStatus" },
    { label: "SrStatus", key: "srStatus" },
    { label: "Zone", key: "zone" },
    { label: "EquipSlNo", key: "equipmentSerialNo" },
    { label: "ModelNo", key: "modelNo" },
    { label: "IndustryDiv", key: "industryDiv" },
    { label: "BillingPlant", key: "billingPlant" },
    { label: "CustomerName", key: "customerName" },
    { label: "Files", key: "attachments" },
    { label: "Actions", key: "actions" },
  ];

  const openRightSidebar = (invoice) => {
    setSelectedInvoice(invoice);
    setShowSidebar(true);
  };
  const closeSidebar = () => {
    setShowSidebar(false);
  };

  const openModal = (invoice) => {
    setSelectedInvoice(invoice);
    console.log("hiiiii");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };
  // Handle input change for name or email search
  const handleInputChange = (e) => {
    const { value } = e.target;

    // Update the name field in inputValue
    setInputValue((prevInput) => ({
      ...prevInput,
      name: value, // Update `name` with the search value
    }));

    // Filter suggestions based on name or email
    setSuggestions(
      emailList.filter(
        (data) =>
          data.name.toLowerCase().includes(value.toLowerCase()) ||
          data.email.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputValue({
      name: suggestion.name,
      email: suggestion.email,
      remarks: inputValue.remarks, // Keep existing remarks if any
    });
    setSuggestions([]); // Clear suggestions after selection
  };

  // Handle remarks change
  const handleRemarksChange = (e) => {
    const { value } = e.target;
    setInputValue((prevInput) => ({
      ...prevInput,
      remarks: value,
    }));
  };

  // Clear input
  const clearInput = () => {
    setInputValue({ name: "", email: "", remarks: "" });
    setSuggestions([]);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!inputValue.name) {
      toast.error("Please enter a name.");
      return;
    }

    const selectedUser = emailList.find(
      (item) => item.name === inputValue.name
    );
    if (!selectedUser) {
      toast.error("Selected name is not valid.");
      return;
    }

    // Set the action based on `srStatus`
    const action =
      selectedInvoice?.srStatus === "PendingForQuotationAllocation"
        ? "AllocationforQuotation"
        : "ReallocationforQuotation";

    try {
      const response = await post("/api/user/v1/allocate", {
        serviceRequestId: selectedInvoice?.serviceRequestId,
        email: inputValue.email,
        name: inputValue.name,
        remarks: inputValue.remarks,
        action: action, // Use the dynamic action here
      });

      if (response.status === 200) {
        toast.success(response?.data?.message);
        fetchInvoices();
        setInputValue({ name: "", email: "", remarks: "" });
        closeSidebar();
      } else {
        toast.error("Failed to assign email.");
      }
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error);
      toast.error(`Error assigning email: ${error.message}`);
    }
  };

  const handleDownloadZip = async (fileNames) => {
    const zip = new JSZip();
    const baseUrl = "http://localhost:5000/uploads/";

    // Fetch each file and add it to the zip
    const fetchFilePromises = fileNames.map(async (fileName) => {
      const fileUrl = `${baseUrl}${fileName}`;
      console.log("Fetching file:", fileUrl);

      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${fileName}`);
        }
        const blob = await response.blob();
        zip.file(fileName, blob);
      } catch (error) {
        console.error(`Error fetching file ${fileName}:`, error);
      }
    });

    // Wait for all files to be fetched and added to the zip
    await Promise.all(fetchFilePromises);

    // Generate the zip and prompt the user to download it
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "files.zip");
    });
  };

  return (
    <div className="w-full py-1 px-2  bg-gray-100 dark:bg-gray-800 border-1 rounded-lg min-h-screen">
      <div className="my-2 flex items-center justify-between">
        <input
          type="text"
          placeholder="Search..."
          className="w-[50%] border bg-gray-50 dark:bg-gray-800 dark:text-brandYellow text-gray-900 border-gray-300 p-2 rounded-lg focus:outline-none focus:border-brandYellow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className=" w-[100%] overflow-x-scroll custom-scrollbar">
        {loading ? (
          <p className="text-gray-700">Loading invoices...</p>
        ) : (
          <table className="w-full  bg-brandYellow  select-none text-sm">
            <thead>
              <tr>
                {tableHeaders.map(({ label, key }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`p-2  text-left font-medium text-gray-700 cursor-pointer hover:border-r-2 hover:border-l-2 hover:border-gray-100`}
                  >
                    {label}
                    {sortConfig.key === key
                      ? sortConfig.direction === "asc"
                        ? " ▲"
                        : " ▼"
                      : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className=" bg-gray-50 dark:bg-gray-800  text-gray-900 dark:text-gray-100">
              {paginatedInvoices.map((invoice, index) => {
                return (
                  <tr
                    key={index}
                    className="border dark:hover:bg-gray-700 hover:bg-gray-200"
                  >
                    <td
                      onClick={() => openModal(invoice)}
                      className="p-2 text-blue-500 hover:underline"
                    >
                      {invoice.serviceRequestId}
                    </td>
                    <td className="p-2">{invoice.quotationNo}</td>
                    <td className="p-2">{invoice.quoteStatus}</td>
                    <td className="p-2">{invoice.srStatus}</td>
                    <td className="p-2">{invoice.zone}</td>
                    <td className="p-2">{invoice.equipmentSerialNo}</td>
                    <td className="p-2">{invoice.modelNo}</td>
                    <td className="p-2">{invoice.industryDiv}</td>
                    <td className="p-2">{invoice.billingPlant}</td>
                    <td className="p-2">{invoice.customerName}</td>
                    <td className="p-2">
                      <button onClick={() => handleDownloadZip(invoice.files)}>
                        <MdFolderZip className="text-xl" />
                      </button>{" "}
                    </td>
                    <td className="p-2">
                      <button>
                        <span className="flex gap-2">
                          <MdPreview
                            onClick={() => openRightSidebar(invoice)}
                            className="text-xl"
                          />
                          <MdAssignmentAdd
                            onClick={() => openModal(invoice)}
                            className="text-xl"
                          />
                        </span>
                      </button>{" "}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-brandYellow text-white rounded-lg disabled:opacity-50"
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
          className="px-4 py-2 bg-brandYellow text-white rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
      {/* Modal to show invoice details */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="relative bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300  rounded-lg w-[85vw]  h-[95vh] overflow-y-scroll custom-scrollbar shadow-lg border border-gray-300 dark:border-gray-700">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-200 dark:hover:text-gray-100"
            >
              <FaTimes className="text-2xl" />
            </button>

            <ServiceRequestDetails selectedInvoice={selectedInvoice} />
          </div>
        </div>
      )}

      {/* Right Sidebar */}
      <div>
        {showSidebar && (
          <SideBar
            closeSidebar={closeSidebar}
            handleInputChange={handleInputChange}
            handleRemarksChange={handleRemarksChange}
            selectedInvoice={selectedInvoice}
            suggestions={suggestions}
            handleSubmit={handleSubmit}
            handleSuggestionClick={handleSuggestionClick}
            inputValue={inputValue}
            clearInput={clearInput}
          />
        )}
      </div>
    </div>
  );
};

export default AllRequests;
