import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get, post } from "../services/ApiEndpoint";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { FaEdit } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";

const ServiceRequestDetails = ({ selectedInvoice }) => {
  const invoice = selectedInvoice;
  console.log("🚀 ------------------------------------------🚀");
  console.log("🚀  ServiceRequestDetails  invoice", invoice);
  console.log("🚀 ------------------------------------------🚀");

  const { serviceRequestId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(""); // Change email to name
  const handleEditClick = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    if (invoice) {
      setLoading(false); // Set loading to false when invoice data is available
    }
  }, [invoice]);

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Please enter a name.");
      return;
    }

    const selectedUser = emailList.find((item) => item.name === name);
    if (!selectedUser) {
      toast.error("Selected name is not valid.");
      return;
    }

    try {
      const response = await post("/api/user/allocate", {
        serviceRequestId,
        email: selectedUser.email,
        name: selectedUser.name,
        ...invoice,
      });

      if (response.status === 200) {
        toast.success(response?.data?.message);
        setName("");
      } else if (response.status === 202) {
        toast.error(response?.data?.message);
        setName("");
      } else {
        toast.error("Failed to assign email.");
      }
    } catch (error) {
      toast.error(`Error assigning email: ${error.message}`);
    }
  };
  const handleStatusSubmit = () => {};
  const handleReallocateSubmit = async () => {};
  return (
    <div className="flex flex-col items-center  rounded-lg min-h-screen">
      <div className="w-full  p-6">
        {loading ? (
          <p className="dark:text-gray-300 text-gray-800 ">Loading...</p>
        ) : invoice ? (
          <div className="grid grid-cols-1 md:grid-cols-2  gap-4 p-4">
            {/* Service Request ID and Quotation No */}
            <div className="p-2 ">
              <span className="underline font-semibold text-gray-700 dark:text-gray-300">
                Service Request ID
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.serviceRequestId}
              </p>

              <span className="underline font-semibold text-gray-700 dark:text-gray-300 mt-2 block">
                Quotation No
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.quotationNo}
              </p>
            </div>

            {/* Quote Status and Billing Plant */}
            <div className="p-2 ">
              <span className="underline font-semibold text-gray-700 dark:text-gray-300">
                Quote Status
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.quoteStatus}
              </p>

              <span className="underline font-semibold text-gray-700 dark:text-gray-300 mt-2 block">
                Billing Plant
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.billingPlant}
              </p>
            </div>

            {/* Customer Name and Equipment Serial No */}
            <div className="p-2 ">
              <span className="underline font-semibold text-gray-700 dark:text-gray-300">
                Customer Name
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.customerName}
              </p>

              <span className="underline font-semibold text-gray-700 dark:text-gray-300 mt-2 block">
                Equipment Serial No
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.equipmentSerialNo}
              </p>
            </div>

            {/* Model No and SrStatus with Editable Option */}
            <div className="p-2 ">
              <span className="underline font-semibold text-gray-700 dark:text-gray-300">
                Model No
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.modelNo}
              </p>

              <span className="underline font-semibold text-gray-700 dark:text-gray-300 mt-2 block">
                SrStatus
              </span>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                {!isEditing ? (
                  <>
                    <span>{invoice.srStatus}</span>
                    {invoice.srStatus !== "Closed" && (
                      <FaEdit
                        className="text-gray-500 dark:hover:text-gray-300 hover:text-gray-800 cursor-pointer"
                        onClick={handleEditClick}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <select
                      className="p-1 outline-none border-none rounded dark:bg-gray-700 dark:text-gray-300"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="OnHold">OnHold</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <button
                      className="px-2 py-1 bg-brandYellow text-white rounded hover:scale-105"
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                    <button onClick={() => setIsEditing(false)}>
                      <MdOutlineClose className="text-xl font-semibold" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Allocated To and Allocated At */}
            <div className="p-2 ">
              <span className="underline font-semibold text-gray-700 dark:text-gray-300">
                Allocation For Quotation
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.allocatedTo_name} / {invoice.allocatedTo_email}
              </p>
            </div>

            {/* Allocated To For Invoice and Approved At */}
            <div className="p-2 ">
              <span className="underline font-semibold text-gray-700 dark:text-gray-300">
                Allocation For Invoice
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.reallocatedTo_name} / {invoice.reallocatedTo_email}
              </p>
            </div>
          </div>
        ) : (
          <p className="dark:text-gray-300 text-gray-800 ">
            No service request found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ServiceRequestDetails;
