import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaEdit } from 'react-icons/fa';
import { MdOutlineClose } from 'react-icons/md';
import {
  fetchInvoices,
  fetchServiceRequest,
  updateServiceRequestStatus,
} from '../features/serviceRequestSlice';

const ServiceRequestDetails = ({ selectedInvoice }) => {
  const dispatch = useDispatch();
  const { details: invoice, loading } = useSelector(
    state => state.serviceRequest
  );

  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('OnHold');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (selectedInvoice?.serviceRequestId) {
      dispatch(fetchServiceRequest(selectedInvoice.serviceRequestId));
    }
  }, [dispatch, selectedInvoice]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleStatusSubmit = async () => {
    if (!selectedStatus || !remarks.trim()) {
      alert('Both status and remarks are required.');
      return;
    }
    const payload = {
      serviceRequestId: invoice.serviceRequestId,
      srStatus: selectedStatus,
      remarks,
    };
    await dispatch(updateServiceRequestStatus(payload));
    await dispatch(fetchServiceRequest(selectedInvoice.serviceRequestId));
    await dispatch(fetchInvoices());
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col  items-center p-6 min-h-screen ">
      {loading ? (
        <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
      ) : invoice ? (
        <div className="w-full max-w-4xl  dark:bg-gray-800   p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
            Service Request Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Request ID & Quotation No */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Service Request ID
              </p>
              <p className="text-base text-gray-800 dark:text-gray-300 font-medium">
                {invoice.serviceRequestId}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Quotation No
              </p>
              <p className="text-base text-gray-800 dark:text-gray-300 font-medium">
                {invoice.quotationNo}
              </p>
            </div>

            {/* Customer Name & Equipment Serial No */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customer Name
              </p>
              <p className="text-base text-gray-800 dark:text-gray-300 font-medium">
                {invoice.customerName}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Equipment Serial No
              </p>
              <p className="text-base text-gray-800 dark:text-gray-300 font-medium">
                {invoice.equipmentSerialNo}
              </p>
            </div>

            {/* Quote Status & SrStatus */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Quote Status
              </p>
              <p className="text-base text-gray-800 dark:text-gray-300 font-medium">
                {invoice.quoteStatus}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Sr Status
              </p>
              <div className="flex items-center space-x-3">
                {!isEditing ? (
                  <>
                    <span className="text-base text-gray-800 dark:text-gray-300 font-medium">
                      {invoice.srStatus}
                    </span>
                    {invoice.srStatus !== 'Closed' && (
                      <FaEdit
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                        onClick={handleEditClick}
                      />
                    )}
                  </>
                ) : (
                  <div>
                    <select
                      className="p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring focus:ring-brandYellow"
                      value={selectedStatus}
                      onChange={e => setSelectedStatus(e.target.value)}
                    >
                      <option value="OnHold">OnHold</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <textarea
                      className="mt-2 w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring focus:ring-brandYellow"
                      placeholder="Add remarks..."
                      rows="2"
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                    ></textarea>

                    <div className="flex space-x-3 mt-3">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
                        onClick={handleStatusSubmit}
                      >
                        Submit
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded shadow hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300"
                        onClick={() => setIsEditing(false)}
                      >
                        <MdOutlineClose />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Model No & Billing Plant */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Model No
              </p>
              <p className="text-base text-gray-800 dark:text-gray-300 font-medium">
                {invoice.modelNo}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Billing Plant
              </p>
              <p className="text-base text-gray-800 dark:text-gray-300 font-medium">
                {invoice.billingPlant}
              </p>
            </div>

            {/* Allocation Details */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Allocation for Quotation
              </p>
              <p className="text-base text-gray-800 dark:text-gray-300 font-medium">
                {invoice.allocatedTo_name} / {invoice.allocatedTo_email}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Remarks
              </p>
              <p className="text-base text-gray-800 dark:text-gray-300 font-medium">
                {invoice.remarks || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Allocation for Invoice
              </p>
              <p className="text-base text-gray-800 dark:text-gray-300 font-medium">
                {invoice.reallocatedTo_name} / {invoice.reallocatedTo_email}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-lg text-gray-700 dark:text-gray-300">
          No service request found.
        </p>
      )}
    </div>
  );
};

export default ServiceRequestDetails;
