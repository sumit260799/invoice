import React, { useState } from 'react';
import { FaFilePdf, FaTimes } from 'react-icons/fa';

const SideBar = ({
  selectedInvoice,
  closeSidebar,
  handleInputChange,
  handleRemarksChange,
  suggestions,
  handleSubmit,
}) => {
  const [emailList, setEmailList] = useState([]);
  const [inputValue, setInputValue] = useState([
    { name: '', email: '', remarks: '' },
  ]);

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-50 dark:bg-gray-900 shadow-lg p-4 transition-transform duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">
          {selectedInvoice?.srStatus === 'InvoicingInProgress' ||
          selectedInvoice?.srStatus === 'PendingforInvoiceAllocation' ||
          selectedInvoice?.quoteStatus === 'BillingPending'
            ? 'Allocate For Invoice'
            : selectedInvoice?.srStatus === 'QuotationInProgress'
            ? 'ReAllocate For Quotation'
            : 'Allocate For Quotation'}
        </h2>

        <button
          onClick={closeSidebar}
          className="text-gray-500 dark:text-white"
        >
          <FaTimes className="text-2xl" />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            value={inputValue.name}
            onChange={handleInputChange}
            className="mt-1 p-2 w-full border border-gray-300 outline-none focus:border-gray-500 rounded-md dark:bg-gray-800 dark:text-gray-100"
            placeholder="Type name or email"
          />
          {inputValue.name && (
            <button
              onClick={clearInput}
              className="absolute right-3 top-4 text-gray-500 dark:text-gray-300"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Display suggestions */}
        {suggestions.length > 0 && (
          <div className="max-h-[100px] overflow-y-scroll mt-1 bg-white dark:bg-gray-800 rounded-md shadow-md">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="p-1 text-sm border-t hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {suggestion.name} ({suggestion.email})
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Remarks
        </label>
        <textarea
          value={inputValue.remarks}
          onChange={handleRemarksChange}
          className="mt-1 p-2 w-full border border-gray-300 outline-none focus:border-gray-500 rounded-md dark:bg-gray-800 dark:text-gray-100"
          placeholder="Enter remarks here..."
          rows="4"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-brandYellow text-white py-2 rounded-lg hover:bg-yellow-600"
      >
        Submit
      </button>
    </div>
  );
};

export default SideBar;