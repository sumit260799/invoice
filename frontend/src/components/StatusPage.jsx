import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInvoices,
  setSelectedZone,
} from '../features/serviceRequestSlice';

const StatusPage = () => {
  const dispatch = useDispatch();
  const { statusCounts, selectedZone, invoices } = useSelector(
    state => state.serviceRequest
  );
  const zones = [
    'All',
    'Zone1',
    'Zone2',
    'Zone3',
    'Zone4',
    'Zone5',
    'Zone6',
    'Zone7',
    'Zone8',
  ];

  // console.log('🚀 ~ StatusPage ~ invoices:', invoices);
  const navigate = useNavigate();
  const handleZoneChange = zone => {
    dispatch(setSelectedZone(zone));
  };

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  const handleCardClick = (status, type) => {
    navigate(`/status/${status}`);
  };

  const handleQuoteClick = (status, type) => {
    navigate(`/quoteStatus/${status}`);
  };

  const srStatusColors = {
    PendingForQuotationAllocation: {
      bg: 'bg-yellow-400',
      border: 'border-yellow-500',
      shadow: 'shadow-yellow-300 dark:shadow-[rgba(250,200,50,0.2)]',
    },
    QuotationInProgress: {
      bg: 'bg-green-500',
      border: 'border-green-600',
      shadow: 'shadow-green-300 dark:shadow-[rgba(100,255,150,0.2)]',
    },
    PendingforInvoiceAllocation: {
      bg: 'bg-blue-500',
      border: 'border-blue-600',
      shadow: 'shadow-blue-300 dark:shadow-[rgba(80,170,250,0.2)]',
    },
    InvoicingInProgress: {
      bg: 'bg-indigo-500',
      border: 'border-indigo-600',
      shadow: 'shadow-indigo-300 dark:shadow-[rgba(120,100,255,0.2)]',
    },
    OnHold: {
      bg: 'bg-purple-500',
      border: 'border-purple-600',
      shadow: 'shadow-purple-300 dark:shadow-[rgba(200,100,250,0.2)]',
    },
    Rejected: {
      bg: 'bg-red-500',
      border: 'border-red-600',
      shadow: 'shadow-red-300 dark:shadow-[rgba(250,100,100,0.2)]',
    },
  };

  const quoteStatusColors = {
    PendingRelease: {
      bg: 'bg-yellow-400',
      border: 'border-yellow-500',
      shadow: 'shadow-yellow-300 dark:shadow-[rgba(250,200,50,0.2)]',
    },
    ApprovalPending: {
      bg: 'bg-green-500',
      border: 'border-green-600',
      shadow: 'shadow-green-300 dark:shadow-[rgba(100,255,150,0.2)]',
    },
    BillingPending: {
      bg: 'bg-blue-500',
      border: 'border-blue-600',
      shadow: 'shadow-blue-300 dark:shadow-[rgba(80,170,250,0.2)]',
    },
    Rejected: {
      bg: 'bg-red-500',
      border: 'border-red-600',
      shadow: 'shadow-red-300 dark:shadow-[rgba(250,100,100,0.2)]',
    },
  };

  const statusLabels = {
    PendingForQuotationAllocation: 'Pending for Quotation Allocation',
    QuotationInProgress: 'Quotation In Progress',
    PendingforInvoiceAllocation: 'Pending for Invoice Allocation',
    InvoicingInProgress: 'Invoicing In Progress',
    OnHold: 'On Hold',
    PendingRelease: 'Pending Release',
    ApprovalPending: 'Approval Pending',
    BillingPending: 'Billing Pending',
    Rejected: 'Rejected',
  };

  return (
    <div className="min-h-screen p-4  flex flex-col items-center  rounded-lg">
      <div className="w-full py-4 mb-6">
        <div className="w-[50%]  mb-4">
          <label
            htmlFor="zone-select"
            className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2"
          >
            Select Zone
          </label>
          <select
            id="zone-select"
            value={selectedZone}
            onChange={e => handleZoneChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all"
          >
            {zones.map(zone => (
              <option
                key={zone}
                value={zone}
                className="text-gray-700 dark:text-gray-300"
              >
                {zone === 'All' ? 'All' : zone.replace(/\D/g, '')}
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-start text-2xl font-extrabold mb-6 text-gray-700 dark:text-gray-100">
          Billing Request Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-10">
          {Object.keys(srStatusColors).map(status => (
            <div
              key={status}
              onClick={() => handleCardClick(status, 'srStatus')}
              className={`px-1 py-6 bg-white text-gray-800 ${srStatusColors[status].border}  border-b-4  shadow-lg backdrop-blur-md transition-transform transform   hover:shadow-2xl flex flex-col items-center cursor-pointer`}
            >
              <p
                className={`text-md font-semibold ${srStatusColors[status].text} text-center`}
              >
                {statusLabels[status]}
              </p>
              <p
                className={`text-3xl font-bold ${srStatusColors[status].text} text-center`}
              >
                {statusCounts.srStatusCounts[status] || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full py-4 mb-4">
        <h2 className="text-start text-2xl font-extrabold mb-6 text-gray-700 dark:text-gray-100">
          Quotation Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-10">
          {Object.keys(quoteStatusColors).map(status => (
            <div
              key={status}
              onClick={() => handleQuoteClick(status, 'quoteStatus')}
              className={`px-3 py-6 bg-white text-gray-800 ${quoteStatusColors[status].border}  border-b-4  shadow-lg backdrop-blur-md transition-transform transform   hover:shadow-2xl flex flex-col items-center cursor-pointer`}
            >
              <p
                className={`text-md font-semibold ${quoteStatusColors[status].text} text-center`}
              >
                {statusLabels[status]}
              </p>
              <p
                className={`text-3xl font-bold ${quoteStatusColors[status].text} text-center`}
              >
                {statusCounts.quoteStatusCounts[status] || 0}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
