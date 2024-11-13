import React, { useState } from 'react';
import { post } from '../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { MdOutlineAttachFile } from 'react-icons/md';
import { RxCross2 } from 'react-icons/rx';

const CreateInvoice = () => {
  const [formData, setFormData] = useState({
    quotationNo: '',
    industryDiv: '',
    zone: '',
    equipmentSerialNo: '',
    modelNo: '',
    customerName: '',
    billingPlant: '',
    salesUserOnBehalfOf: '',
    remarks: '',
  });
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = e => {
    const selectedFiles = Array.from(e.target.files);
    // Check total files after adding new ones
    if (selectedFiles.length + files.length > 8) {
      toast.error('You can only select up to 8 files.');
    } else {
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    }

    e.target.value = '';
  };

  const removeFile = index => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.quotationNo)
      newErrors.quotationNo = 'Quotation No is required';
    if (!formData.industryDiv)
      newErrors.industryDiv = 'Industry Division is required';
    if (!formData.zone) newErrors.zone = 'Zone is required';
    if (!formData.equipmentSerialNo)
      newErrors.equipmentSerialNo = 'Equipment Serial No is required';
    if (!formData.modelNo) newErrors.modelNo = 'Model No is required';
    if (!formData.customerName)
      newErrors.customerName = 'Customer Name is required';
    if (!formData.billingPlant)
      newErrors.billingPlant = 'Billing Plant is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = new FormData();
    Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
    for (let i = 0; i < files.length; i++) {
      submitData.append('files', files[i]);
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/user/create-service-request',
        submitData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      const result = response.data;

      if (result) {
        toast.success('Service Request created successfully!');
        setFormData({
          quotationNo: '',
          industryDiv: '',
          zone: '',
          equipmentSerialNo: '',
          modelNo: '',
          customerName: '',
          billingPlant: '',
          salesUserOnBehalfOf: '',
          remarks: '',
        });
        setFiles([]);
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(error?.response?.data?.message || 'Submission failed.');
    }
  };

  return (
    <div className="mx-auto p-6 bg-gray-100 dark:bg-gray-800 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold dark:text-white text-gray-800 mb-4">
        Service Request Form
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 dark:text-gray-400 text-gray-800"
        encType="multipart/form-data"
        autoComplete="off"
      >
        {/* Quotation No */}
        <div className="mb-4">
          <label
            htmlFor="quotationNo"
            className="block text-sm font-semibold mb-2"
          >
            Quotation No
          </label>
          <input
            type="text"
            id="quotationNo"
            name="quotationNo"
            value={formData.quotationNo}
            onChange={handleInputChange}
            className={`border dark:border-gray-500 border-gray-300 focus:border-gray-400 dark:focus:border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-gray-900 outline-none   w-full ${
              errors.quotationNo ? 'border-red-500' : ''
            }`}
            autoComplete="off"
          />
          {errors.quotationNo && (
            <p className="text-red-500 text-sm">{errors.quotationNo}</p>
          )}
        </div>

        {/* Industry Division */}
        <div className="mb-4">
          <label
            htmlFor="industryDiv"
            className="block text-sm font-semibold mb-2"
          >
            Industry Division
          </label>
          <select
            id="industryDiv"
            name="industryDiv"
            value={formData.industryDiv}
            onChange={handleInputChange}
            className={`border dark:border-gray-500 border-gray-300 focus:border-gray-400 dark:focus:border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-gray-900 outline-none  w-full ${
              errors.industryDiv ? 'border-red-500' : ''
            }`}
          >
            <option value="" disabled>
              Select Industry Division
            </option>
            <option value="BCP">BCP</option>
            <option value="GCI">GCI</option>
            <option value="SEM">SEM</option>
            <option value="Mining">Mining</option>
          </select>
          {errors.industryDiv && (
            <p className="text-red-500 text-sm">{errors.industryDiv}</p>
          )}
        </div>

        {/* Zone */}
        <div className="mb-4">
          <label htmlFor="zone" className="block text-sm font-semibold mb-2">
            Zone
          </label>
          <select
            id="zone"
            name="zone"
            value={formData.zone}
            onChange={handleInputChange}
            className={`border dark:border-gray-500 border-gray-300 focus:border-gray-400 dark:focus:border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-gray-900 outline-none  w-full ${
              errors.zone ? 'border-red-500' : ''
            }`}
          >
            <option value="" disabled>
              Select Zone
            </option>
            <option value="Zone1">Zone1</option>
            <option value="Zone2">Zone2</option>
            <option value="Zone3">Zone3</option>
            <option value="Zone4">Zone4</option>
            <option value="Zone5">Zone5</option>
            <option value="Zone6">Zone6</option>
            <option value="Zone7">Zone7</option>
            <option value="Zone8">Zone8</option>
          </select>
          {errors.zone && <p className="text-red-500 text-sm">{errors.zone}</p>}
        </div>

        {/* Equipment Serial No */}
        <div className="mb-4">
          <label
            htmlFor="equipmentSerialNo"
            className="block text-sm font-semibold mb-2"
          >
            Equipment Serial No
          </label>
          <input
            type="text"
            id="equipmentSerialNo"
            name="equipmentSerialNo"
            value={formData.equipmentSerialNo}
            onChange={handleInputChange}
            className={`border dark:border-gray-500 border-gray-300 focus:border-gray-400 dark:focus:border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-gray-900 outline-none  w-full ${
              errors.equipmentSerialNo ? 'border-red-500' : ''
            }`}
            autoComplete="off"
          />
          {errors.equipmentSerialNo && (
            <p className="text-red-500 text-sm">{errors.equipmentSerialNo}</p>
          )}
        </div>

        {/* Model No */}
        <div className="mb-4">
          <label htmlFor="modelNo" className="block text-sm font-semibold mb-2">
            Model No
          </label>
          <input
            type="text"
            id="modelNo"
            name="modelNo"
            value={formData.modelNo}
            onChange={handleInputChange}
            className={`border dark:border-gray-500 border-gray-300 focus:border-gray-400 dark:focus:border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-gray-900 outline-none  w-full ${
              errors.modelNo ? 'border-red-500' : ''
            }`}
            autoComplete="off"
          />
          {errors.modelNo && (
            <p className="text-red-500 text-sm">{errors.modelNo}</p>
          )}
        </div>

        {/* Customer Name */}
        <div className="mb-4">
          <label
            htmlFor="customerName"
            className="block text-sm font-semibold mb-2"
          >
            Customer Name
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            className={`border dark:border-gray-500 border-gray-300 focus:border-gray-400 dark:focus:border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-gray-900 outline-none w-full ${
              errors.customerName ? 'border-red-500' : ''
            }`}
            autoComplete="off"
          />
          {errors.customerName && (
            <p className="text-red-500 text-sm">{errors.customerName}</p>
          )}
        </div>

        {/* Billing Plant */}
        <div className="mb-4">
          <label
            htmlFor="billingPlant"
            className="block text-sm font-semibold mb-2"
          >
            Billing Plant
          </label>
          <input
            type="text"
            id="billingPlant"
            name="billingPlant"
            value={formData.billingPlant}
            onChange={handleInputChange}
            className={`border dark:border-gray-500 border-gray-300 focus:border-gray-400 dark:focus:border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-gray-900 outline-none w-full ${
              errors.billingPlant ? 'border-red-500' : ''
            }`}
            autoComplete="off"
          />
          {errors.billingPlant && (
            <p className="text-red-500 text-sm">{errors.billingPlant}</p>
          )}
        </div>

        {/* Sales User On Behalf Of */}
        <div className="mb-4">
          <label
            htmlFor="salesUserOnBehalfOf"
            className="block text-sm font-semibold mb-2"
          >
            Sales User On Behalf Of
          </label>
          <input
            type="text"
            id="salesUserOnBehalfOf"
            name="salesUserOnBehalfOf"
            value={formData.salesUserOnBehalfOf}
            onChange={handleInputChange}
            className="border dark:border-gray-500 border-gray-300 focus:border-gray-400 dark:focus:border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-gray-900 outline-none  w-full "
            autoComplete="off"
          />
        </div>

        {/* Remarks */}
        <div className="mb-4 col-span-2">
          <label htmlFor="remarks" className="block text-sm font-semibold mb-2">
            Remarks
          </label>
          <textarea
            id="remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            className="border dark:border-gray-500 border-gray-300 focus:border-gray-400 dark:focus:border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-gray-900 outline-none  w-full "
          />
        </div>

        {/* Attachments with Preview */}
        <div className="mb-4 col-span-2 ">
          <div>
            <label htmlFor="files" className="block text-sm font-semibold mb-2">
              Attachments
            </label>
            <input
              type="file"
              id="files"
              className="hidden" // Hide default file input
              multiple
              onChange={handleFileChange}
            />
            <label
              htmlFor="files"
              className="inline-flex items-center cursor-pointer p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
            >
              <MdOutlineAttachFile />
            </label>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {files.map((file, index) => (
              <div key={index} className="relative group w-20 break-words">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-20 h-20 object-cover rounded border dark:border-gray-500"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-[-5px] right-[-5px] bg-red-600 w-5 h-5 flex justify-center items-center text-white rounded-full px-1 py-0 text-sm opacity-85 group-hover:opacity-100"
                >
                  <RxCross2 className="text-md" />
                </button>
                <p className="text-xs text-center mt-1 dark:text-gray-100">
                  {file.name.substring(0, 40)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm dark:border-gray-500 border-gray-300 dark:text-gray-100 mt-1">
            {files.length} file(s) selected
          </p>
        </div>

        <button
          type="submit"
          className="col-span-1 md:col-span-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateInvoice;
