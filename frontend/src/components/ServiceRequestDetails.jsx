import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get, post } from '../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { FaEdit } from 'react-icons/fa';

const ServiceRequestDetails = () => {
  const { serviceRequestId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(''); // Change email to name
  const { user } = useSelector(state => state.auth);
  const [emailList, setEmailList] = useState([]);
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const fetchAllEmail = async () => {
    try {
      const response = await get('/api/user/v1/names');
      console.log('response', response.data);
      setEmailList(response.data?.empList);
    } catch (error) {}
  };

  useEffect(() => {
    fetchAllEmail();
  }, []);

  const fetchInvoice = async () => {
    try {
      const response = await get(
        `/api/user/display-report?serviceRequestId=${serviceRequestId}`
      );
      if (response.status === 200) {
        setInvoice(response?.data?.displayReport);
      } else {
        toast.error('Failed to fetch service request details.');
      }
    } catch (error) {
      toast.error(`Error fetching service request details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [serviceRequestId]);

  const handleSubmit = async () => {
    if (!name) {
      toast.error('Please enter a name.');
      return;
    }

    const selectedUser = emailList.find(item => item.name === name);
    if (!selectedUser) {
      toast.error('Selected name is not valid.');
      return;
    }

    try {
      const response = await post('/api/user/allocate', {
        serviceRequestId,
        email: selectedUser.email,
        name: selectedUser.name,
        ...invoice,
      });

      if (response.status === 200) {
        toast.success(response?.data?.message);
        setName('');
        fetchInvoice();
      } else if (response.status === 202) {
        toast.error(response?.data?.message);
        setName('');
        fetchInvoice();
      } else {
        toast.error('Failed to assign email.');
      }
    } catch (error) {
      toast.error(`Error assigning email: ${error.message}`);
    }
  };
  const handleStatusSubmit = () => {};
  const handleReallocateSubmit = async () => {};
  return (
    <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 rounded-lg min-h-screen">
      <div className="w-full  p-6">
        <h2 className="text-2xl font-bold mb-6 ">
          {invoice?.srStatus === 'Invoice In Progress' ||
          invoice?.srStatus === 'Allocated' ||
          invoice?.srStatus === 'PendingforInvoiceAllocation'
            ? 'Allocate for invoice'
            : 'Allocate To'}{' '}
        </h2>

        {user?.role === 'admin' && (
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block font-semibold text-gray-600 mb-2"
            >
              Enter Name:
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              list="emailSuggestions"
              autoComplete="off"
            />
            <datalist id="emailSuggestions">
              {emailList.map(item => (
                <option key={item.id} value={item.email} />
              ))}
            </datalist>
          </div>
        )}

        {user?.role === 'manager' && (
          <div className="mb-4 space-y-2">
            <label
              htmlFor="name"
              className="block font-semibold dark:text-gray-400 text-gray-800  text-sm"
            >
              Enter Name:
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                placeholder="Enter name"
                value={name}
                onChange={e => setName(e.target.value)}
                list="emailSuggestions"
                className="w-full border border-gray-300 rounded-md p-2 pr-10 transition duration-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-300 placeholder-gray-400 text-lg"
              />
              {name && (
                <button
                  onClick={() => setName('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              )}
            </div>
            <datalist id="emailSuggestions">
              {emailList.map(item => (
                <option key={item.email} value={item.name}>
                  {item.name} ({item.email})
                </option>
              ))}
            </datalist>
          </div>
        )}

        {name && (
          <div className="mb-4">
            <p className="font-semibold dark:text-gray-400 text-gray-800 ">
              Entered Name: {name}
            </p>
            <button
              onClick={handleSubmit}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            >
              Submit
            </button>
          </div>
        )}

        {loading ? (
          <p className="dark:text-gray-400 text-gray-800 ">Loading...</p>
        ) : invoice ? (
          <div className="overflow-x-auto">
            <table className="w-full  border border-gray-200 rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="p-4 text-left font-semibold text-gray-800 dark:text-gray-200">
                    Field
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-800 dark:text-gray-200">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800 ">
                    Service Request ID
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 ">
                    {invoice.serviceRequestId}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800 ">
                    Quotation No
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 ">
                    {invoice.quotationNo}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800 ">
                    QuoteStatus
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 ">
                    {invoice.quoteStatus}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800 ">
                    Billing Plant
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 ">
                    {invoice.billingPlant}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800 ">
                    Customer Name
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 ">
                    {invoice.customerName}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800 ">
                    Equipment Serial No
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 ">
                    {invoice.equipmentSerialNo}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800 ">
                    Model No
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 ">
                    {invoice.modelNo}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800">
                    SrStatus
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 flex items-center space-x-2">
                    {!isEditing ? (
                      <>
                        <span>{invoice.srStatus}</span>
                        {invoice?.srStatus !== 'Closed' && (
                          <FaEdit
                            className="text-gray-500 dark:hover:text-gray-300 hover:text-gray-800 cursor-pointer outline-none border-none"
                            onClick={handleEditClick}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <select
                          className="p-1 outline-none border-none  rounded dark:bg-gray-700 dark:text-gray-300"
                          value={selectedStatus}
                          onChange={e => setSelectedStatus(e.target.value)}
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
                      </>
                    )}
                  </td>
                </tr>

                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800 ">
                    Allocated To
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 ">
                    {invoice?.allocatedTo_name} / {invoice?.allocatedTo_email}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800 ">
                    Allocated At
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 ">
                    {invoice?.allocatedAt
                      ? new Date(invoice.allocatedAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          }
                        )
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800 ">
                    Allocated To For Invoice
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 ">
                    {invoice?.reallocatedTo_name} /{' '}
                    {invoice?.reallocatedTo_email}
                  </td>
                </tr>

                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800 ">
                    Approved At
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 ">
                    {invoice?.approved}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800 ">
                    Released At
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 ">
                    {invoice?.releasedAt}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-semibold dark:text-gray-400 text-gray-800 ">
                    Rejected At
                  </td>
                  <td className="p-4 dark:text-gray-400 text-gray-800 ">
                    {invoice?.rejectedAt}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dark:text-gray-400 text-gray-800 ">
            No service request found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ServiceRequestDetails;
