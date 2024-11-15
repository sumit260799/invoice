import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get, post } from '../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { FaEdit } from 'react-icons/fa';
import { MdOutlineClose } from 'react-icons/md';
import axios from 'axios';
import {
  fetchInvoices,
  fetchServiceRequest,
  updateServiceRequestStatus,
} from '../features/serviceRequestSlice';

const ServiceRequestDetails = ({ selectedInvoice }) => {
  const dispatch = useDispatch();
  const {
    details: invoice,
    loading,
    error,
  } = useSelector(state => state.serviceRequest);
  console.log('🚀 ~ ServiceRequestDetails ~ invoice:', invoice);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('OnHold');
  console.log('🚀 ~ ServiceRequestDetails ~ selectedStatus:', selectedStatus);
  const [remarks, setRemarks] = useState('');

  const [name, setName] = useState(''); // Change email to name
  const handleEditClick = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    if (selectedInvoice?.serviceRequestId) {
      dispatch(fetchServiceRequest(selectedInvoice.serviceRequestId));
    }
  }, [dispatch, selectedInvoice]);

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
    await dispatch(updateServiceRequestStatus(payload)).then(() =>
      setIsEditing(false)
    );
    await dispatch(fetchServiceRequest(selectedInvoice.serviceRequestId));
    await dispatch(fetchInvoices());
  };

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
            {/* Quote Status and Billing Plant */}
            <div className="p-2 ">
              <span className="underline font-semibold text-gray-700 dark:text-gray-300">
                Quote Status
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.quoteStatus}
              </p>
              <span className="underline font-semibold text-gray-700 dark:text-gray-300 mt-2 block">
                SrStatus
              </span>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                {!isEditing ? (
                  <>
                    <span>{invoice.srStatus}</span>
                    {invoice.srStatus !== 'Closed' && (
                      <FaEdit
                        className="text-gray-500 dark:hover:text-gray-300 hover:text-gray-800 cursor-pointer"
                        onClick={handleEditClick}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <select
                        className="p-2 outline-none border border-gray-300 rounded focus:ring-1 focus:ring-brandYellow dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                        value={selectedStatus}
                        onChange={e => setSelectedStatus(e.target.value)}
                      >
                        <option value="OnHold">OnHold</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <textarea
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brandYellow outline-none dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                        placeholder="Add remarks here..."
                        rows="2"
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                      ></textarea>

                      <div className="flex items-center gap-4">
                        <button
                          className="px-4 py-2 bg-brandYellow text-white rounded shadow hover:scale-105 hover:shadow-lg transition-transform duration-150"
                          onClick={handleStatusSubmit}
                        >
                          Submit
                        </button>
                        <button
                          className="px-4 py-2 bg-gray-300 text-gray-800 rounded shadow hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
                          onClick={() => setIsEditing(false)}
                        >
                          <MdOutlineClose className="text-xl font-semibold" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
                Billing Plant
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.billingPlant}
              </p>
            </div>

            {/* Allocated To and Allocated At */}
            <div className="p-2 ">
              <span className="underline font-semibold text-gray-700 dark:text-gray-300">
                Allocation For Quotation
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice.allocatedTo_name} / {invoice.allocatedTo_email}
              </p>
              <span className="underline font-semibold text-gray-700 dark:text-gray-300">
                Remarks
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                {invoice?.remarks}
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
