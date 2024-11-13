import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { get } from '../services/ApiEndpoint';

const StatusPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    srStatusCounts: {},
    quoteStatusCounts: {},
  });
  const [loading, setLoading] = useState(false);

  const handleCardClick = (status, type) => {
    navigate(`/status/${status}`);
  };
  const handleQuoteClick = (status, type) => {
    navigate(`/quoteStatus/${status}`);
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const response = await get('/api/user/get-service-request');
        if (response.status === 200) {
          const fetchedInvoices = response.data?.serviceRequests || [];
          setInvoices(fetchedInvoices);

          const srCounts = {};
          const quoteCounts = {};

          fetchedInvoices.forEach(invoice => {
            const srStatus = invoice.srStatus;
            srCounts[srStatus] = (srCounts[srStatus] || 0) + 1;

            const quoteStatus = invoice.quoteStatus;
            quoteCounts[quoteStatus] = (quoteCounts[quoteStatus] || 0) + 1;
          });

          setStatusCounts({
            srStatusCounts: srCounts,
            quoteStatusCounts: quoteCounts,
          });
        } else {
          toast.error('Failed to fetch invoices.');
        }
      } catch (error) {
        toast.error(`Error fetching invoices: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const srStatusColors = {
    PendingForQuotationAllocation: {
      bg: 'bg-blue-700',
      text: 'text-white',
      boldText: 'text-white',
    },
    QuotationInprogress: {
      bg: 'bg-green-700',
      text: 'text-white',
      boldText: 'text-white',
    },
    PendingforInvoiceAllocation: {
      bg: 'bg-indigo-700',
      text: 'text-white',
      boldText: 'text-white',
    },
    InvoicingInProgress: {
      bg: 'bg-yellow-700',
      text: 'text-white',
      boldText: 'text-white',
    },
    OnHold: {
      bg: 'bg-purple-700',
      text: 'text-white',
      boldText: 'text-white',
    },
  };

  const quoteStatusColors = {
    PendingRelease: {
      bg: 'bg-blue-700',
      text: 'text-white',
      boldText: 'text-white',
    },
    ApprovalPending: {
      bg: 'bg-green-700',
      text: 'text-white',
      boldText: 'text-white',
    },
    BillingPending: {
      bg: 'bg-yellow-700',
      text: 'text-white',
      boldText: 'text-white',
    },
    Rejected: {
      bg: 'bg-red-700',
      text: 'text-white',
      boldText: 'text-white',
    },
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-8 flex flex-col items-center border-none outline-none rounded-md bg-gray-100 dark:bg-gray-800">
      <div className="w-full p-2  mb-6">
        <h2 className="text-start text-2xl sm:text-3xl font-semibold  mb-4 sm:mb-6 text-gray-800 dark:text-gray-100 ">
          SR Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.keys(srStatusColors).map(status => (
            <div
              key={status}
              onClick={() => handleCardClick(status, 'srStatus')}
              className={`px-3 py-4 ${srStatusColors[status].bg} backdrop-blur-md bg-opacity-70 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex flex-col items-center cursor-pointer break-words overflow-hidden`}
            >
              <p
                className={`text-md font-semibold ${srStatusColors[status].text} whitespace-normal break-words break-all text-center`}
              >
                {status}
              </p>
              <p className={`text-3xl ${srStatusColors[status].boldText}`}>
                {statusCounts.srStatusCounts[status] || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full p-2  mb-6">
        <h2 className="text-start text-2xl sm:text-3xl font-semibold  mb-4 sm:mb-8 text-gray-800 dark:text-gray-100 ">
          Quotation Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(quoteStatusColors).map(status => (
            <div
              key={status}
              onClick={() => handleQuoteClick(status, 'quoteStatus')}
              className={`px-3 py-4 ${quoteStatusColors[status].bg} bg-opacity-70 rounded-lg shadow-lg backdrop-blur-md transition-transform transform hover:scale-105 flex flex-col items-center cursor-pointer overflow-hidden`}
            >
              <p
                className={`text-md font-semibold ${quoteStatusColors[status].text} text-center braek-words whitespace-normal`}
              >
                {status}
              </p>
              <p
                className={`text-3xl ${quoteStatusColors[status].boldText} text-center break-words whitespace-normal`}
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
