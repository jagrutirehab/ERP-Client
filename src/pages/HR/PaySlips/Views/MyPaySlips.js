import { useMemo, useState } from "react";
import { Button, CardBody } from "reactstrap";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import DataTableComponent from "../../../../Components/Common/DataTable";

const MyPaySlipsTab = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const dummyPayslips = useMemo(
    () => [
      {
        _id: "1",
        month: "January",
        year: 2026,
        grossSalary: 50000,
        deductions: 4500,
        netSalary: 45500,
        status: "Generated",
      },
      {
        _id: "2",
        month: "February",
        year: 2026,
        grossSalary: 50000,
        deductions: 4200,
        netSalary: 45800,
        status: "Generated",
      },
      {
        _id: "3",
        month: "March",
        year: 2026,
        grossSalary: 50000,
        deductions: 4800,
        netSalary: 45200,
        status: "Generated",
      },
    ],
    []
  );

  const handleDownload = (row) => {
    console.log("Download payslip:", row);
  };

  const columns = [
    {
      name: "S No.",
      selector: (row, index) => index + 1,
      width: "90px",
    },
    {
      name: "Month",
      selector: (row) => row.month,
      sortable: true,
    },
    {
      name: "Year",
      selector: (row) => row.year,
      sortable: true,
    },
    {
      name: "Gross Salary",
      selector: (row) => row.grossSalary,
      sortable: true,
      cell: (row) => `Rs. ${row.grossSalary}`,
    },
    {
      name: "Deductions",
      selector: (row) => row.deductions,
      sortable: true,
      cell: (row) => `Rs. ${row.deductions}`,
    },
    {
      name: "Net Salary",
      selector: (row) => row.netSalary,
      sortable: true,
      cell: (row) => `Rs. ${row.netSalary}`,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => (
        <span className="badge bg-success-subtle text-success">
          {row.status}
        </span>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <Button color="primary" size="sm" onClick={() => handleDownload(row)}>
          Download
        </Button>
      ),
      width: "140px",
    },
  ];

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "100%" }}
    >
      <div className="mb-4">
        <h4 className="fw-bold text-primary mb-0">MY PAY SLIPS</h4>
      </div>

      <DataTableComponent
        columns={columns}
        data={dummyPayslips}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        loading={false}
        pagination={{
          totalDocs: dummyPayslips.length,
          totalPages: 1,
          page: 1,
          limit,
        }}
      />
    </CardBody>
  );
};

export default MyPaySlipsTab;
