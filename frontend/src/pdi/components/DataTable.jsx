import React from "react";

const DataTable = () => {
  const data = [
    {
      slNo: 1,
      model: "Model A",
      grnNo: "GRN12345",
      grnStatus: "Pending",
      inventoryStatus: "In Stock",
      invoiceNo: "INV1001",
      invoiceDate: "2024-10-15",
      maintenanceDate: "2024-11-01",
      due: "2024-12-01",
    },
    {
      slNo: 2,
      model: "Model B",
      grnNo: "GRN12346",
      grnStatus: "Completed",
      inventoryStatus: "Out of Stock",
      invoiceNo: "INV1002",
      invoiceDate: "2024-09-10",
      maintenanceDate: "2024-10-25",
      due: "2024-11-30",
    },
    {
      slNo: 3,
      model: "Model C",
      grnNo: "GRN12347",
      grnStatus: "Pending",
      inventoryStatus: "In Stock",
      invoiceNo: "INV1003",
      invoiceDate: "2024-08-05",
      maintenanceDate: "2024-11-15",
      due: "2024-12-15",
    },
  ];

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100 text-sm text-gray-600">
          <tr>
            <th className="px-4 py-2 text-left">Sl No</th>
            <th className="px-4 py-2 text-left">Model</th>
            <th className="px-4 py-2 text-left">GRN No</th>
            <th className="px-4 py-2 text-left">GRN Status</th>
            <th className="px-4 py-2 text-left">Inventory Status</th>
            <th className="px-4 py-2 text-left">Invoice No</th>
            <th className="px-4 py-2 text-left">Invoice Date</th>
            <th className="px-4 py-2 text-left">Maintenance Date</th>
            <th className="px-4 py-2 text-left">Due</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.slNo}
              className="border-t border-b hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-2 text-sm text-gray-700">{item.slNo}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{item.model}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{item.grnNo}</td>
              <td className="px-4 py-2 text-sm text-gray-700">
                <span
                  className={`${
                    item.grnStatus === "Pending"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {item.grnStatus}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                <span
                  className={`${
                    item.inventoryStatus === "In Stock"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {item.inventoryStatus}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {item.invoiceNo}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {item.invoiceDate}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {item.maintenanceDate}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">{item.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
