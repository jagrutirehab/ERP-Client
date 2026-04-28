import { useEffect, useMemo, useState } from "react";
import { Button, CardBody, Input } from "reactstrap";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import Select from "react-select";
import { Calendar, CheckCheck, XCircle } from "lucide-react";
import Flatpickr from "react-flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import "flatpickr/dist/themes/material_blue.css";
import "flatpickr/dist/plugins/monthSelect/style.css";
import DataTableComponent from "../../../../Components/Common/DataTable";
import RefreshButton from "../../../../Components/Common/RefreshButton";

const EmployeePaySlipsTab = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [approvalStatus, setApprovalStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);

  const centerOptions = [
    { value: "ALL", label: "All Centers" },
    { value: "CENTER_1", label: "Center 1" },
    { value: "CENTER_2", label: "Center 2" },
  ];

  const approvalStatusOptions = [
    { value: "ALL", label: "All Status" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const selectedCenterOption =
    centerOptions.find((opt) => opt.value === selectedCenter) || centerOptions[0];

  const selectedApprovalStatusOption =
    approvalStatusOptions.find((opt) => opt.value === approvalStatus) ||
    approvalStatusOptions[0];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  const allRows = useMemo(
    () => [
      {
        _id: "1",
        employeeCode: "EMP001",
        employeeName: "Aman Sharma",
        center: "CENTER_1",
        fixedSalary: 42000,
        earnedSalary: 40000,
        pfEsicSalary: 1800,
        employeeDeduction: 2500,
        employerDeduction: 2200,
        approvalStatus: "PENDING",
      },
      {
        _id: "2",
        employeeCode: "EMP002",
        employeeName: "Priya Verma",
        center: "CENTER_2",
        fixedSalary: 48000,
        earnedSalary: 45500,
        pfEsicSalary: 2100,
        employeeDeduction: 3000,
        employerDeduction: 2600,
        approvalStatus: "APPROVED",
      },
      {
        _id: "3",
        employeeCode: "EMP003",
        employeeName: "Rohit Kumar",
        center: "CENTER_1",
        fixedSalary: 53000,
        earnedSalary: 50000,
        pfEsicSalary: 2400,
        employeeDeduction: 4000,
        employerDeduction: 3200,
        approvalStatus: "REJECTED",
      },
    ],
    []
  );

  const filteredRows = useMemo(() => {
    return allRows.filter((item) => {
      const q = debouncedSearch.trim().toLowerCase();

      const matchesSearch =
        !q ||
        item.employeeName.toLowerCase().includes(q) ||
        item.employeeCode.toLowerCase().includes(q);

      const matchesCenter =
        selectedCenter === "ALL" || item.center === selectedCenter;

      const matchesStatus =
        approvalStatus === "ALL" || item.approvalStatus === approvalStatus;

      return matchesSearch && matchesCenter && matchesStatus;
    });
  }, [allRows, debouncedSearch, selectedCenter, approvalStatus]);

  const handleRefresh = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const handleApproveAll = () => {
    console.log("Approve all clicked", filteredRows);
  };

  const handleRejectAll = () => {
    console.log("Reject all clicked", filteredRows);
  };

  const handleDownload = (row) => {
    console.log("Download payslip", row);
  };

  const statusBadge = (status) => {
    if (status === "APPROVED") {
      return <span className="badge bg-success-subtle text-success">Approved</span>;
    }
    if (status === "REJECTED") {
      return <span className="badge bg-danger-subtle text-danger">Rejected</span>;
    }
    return <span className="badge bg-warning-subtle text-warning">Pending</span>;
  };

  const columns = [
    {
      name: "S No.",
      cell: (row, index) => index + 1,
      width: "90px",
    },
    {
      name: "Employee Code",
      selector: (row) => row.employeeCode,
      sortable: true,
      minWidth: "140px",
    },
    {
      name: "Employee Name",
      selector: (row) => row.employeeName,
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Fixed Salary",
      selector: (row) => row.fixedSalary,
      sortable: true,
      minWidth: "140px",
      cell: (row) => `Rs. ${row.fixedSalary}`,
    },
    {
      name: "Earned Salary",
      selector: (row) => row.earnedSalary,
      sortable: true,
      minWidth: "140px",
      cell: (row) => `Rs. ${row.earnedSalary}`,
    },
    {
      name: "PF / ESIC Salary",
      selector: (row) => row.pfEsicSalary,
      sortable: true,
      minWidth: "150px",
      cell: (row) => `Rs. ${row.pfEsicSalary}`,
    },
    {
      name: "Employee Deduction",
      selector: (row) => row.employeeDeduction,
      sortable: true,
      minWidth: "170px",
      cell: (row) => `Rs. ${row.employeeDeduction}`,
    },
    {
      name: "Employer Deduction",
      selector: (row) => row.employerDeduction,
      sortable: true,
      minWidth: "170px",
      cell: (row) => `Rs. ${row.employerDeduction}`,
    },
    {
      name: "Status",
      selector: (row) => row.approvalStatus,
      minWidth: "120px",
      cell: (row) => statusBadge(row.approvalStatus),
    },
    {
      name: "Action",
      minWidth: "130px",
      cell: (row) => (
        <Button color="primary" size="sm" onClick={() => handleDownload(row)}>
          Download
        </Button>
      ),
    },
  ];

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "100%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">EMPLOYEES PAY SLIPS</h1>
      </div>

      <div className="mb-3">
        <div className="mb-3 d-none d-md-block">
          <div className="d-flex gap-3 align-items-center mb-2">
            <div style={{ width: "200px" }}>
              <Select
                value={selectedCenterOption}
                onChange={(opt) => setSelectedCenter(opt.value)}
                options={centerOptions}
                classNamePrefix="react-select"
              />
            </div>

            <div style={{ width: "170px" }}>
              <Select
                value={selectedApprovalStatusOption}
                onChange={(opt) => setApprovalStatus(opt.value)}
                options={approvalStatusOptions}
                classNamePrefix="react-select"
              />
            </div>

            <div style={{ minWidth: "220px" }}>
              <Input
                type="text"
                placeholder="Search by name, ECode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ minWidth: "150px" }}>
              <div className="position-relative month-picker">
                <Calendar
                  size={14}
                  className="position-absolute calendar-icon"
                />
                <Flatpickr
                  value={selectedMonth}
                  options={{
                    plugins: [
                      monthSelectPlugin({
                        shorthand: false,
                        dateFormat: "Y-m",
                        altFormat: "F Y",
                      }),
                    ],
                    altInput: true,
                    disableMobile: true,
                  }}
                  onChange={([date]) => setSelectedMonth(date)}
                  className="form-control form-control-sm"
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <RefreshButton loading={loading} onRefresh={handleRefresh} />

            <Button
              color="success"
              className="d-flex align-items-center gap-1 text-white"
              onClick={handleApproveAll}
              disabled={loading || filteredRows.length === 0}
            >
              <CheckCheck size={16} />
              Approve All
            </Button>

            <Button
              color="danger"
              className="d-flex align-items-center gap-1 text-white"
              onClick={handleRejectAll}
              disabled={loading || filteredRows.length === 0}
            >
              <XCircle size={16} />
              Reject All
            </Button>
          </div>
        </div>

        <div className="mb-3 d-flex d-md-none flex-column gap-3">
          <Select
            value={selectedCenterOption}
            onChange={(opt) => setSelectedCenter(opt.value)}
            options={centerOptions}
            classNamePrefix="react-select"
          />

          <Select
            value={selectedApprovalStatusOption}
            onChange={(opt) => setApprovalStatus(opt.value)}
            options={approvalStatusOptions}
            classNamePrefix="react-select"
          />

          <Input
            type="text"
            placeholder="Search by name, ECode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="position-relative month-picker">
            <Calendar
              size={14}
              className="position-absolute calendar-icon"
            />
            <Flatpickr
              value={selectedMonth}
              options={{
                plugins: [
                  monthSelectPlugin({
                    shorthand: false,
                    dateFormat: "Y-m",
                    altFormat: "F Y",
                  }),
                ],
                altInput: true,
                disableMobile: true,
              }}
              onChange={([date]) => setSelectedMonth(date)}
              className="form-control form-control-sm"
            />
          </div>

          <div className="d-flex flex-wrap justify-content-end gap-2">
            <RefreshButton loading={loading} onRefresh={handleRefresh} />

            <Button
              color="success"
              className="d-flex align-items-center gap-1 text-white"
              onClick={handleApproveAll}
              disabled={loading || filteredRows.length === 0}
            >
              <CheckCheck size={16} />
              Approve All
            </Button>

            <Button
              color="danger"
              className="d-flex align-items-center gap-1 text-white"
              onClick={handleRejectAll}
              disabled={loading || filteredRows.length === 0}
            >
              <XCircle size={16} />
              Reject All
            </Button>
          </div>
        </div>

        <DataTableComponent
          columns={columns}
          data={filteredRows}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          loading={loading}
          pagination={{
            totalDocs: filteredRows.length,
            totalPages: Math.ceil(filteredRows.length / limit) || 1,
            page,
            limit,
          }}
        />
      </div>
    </CardBody>
  );
};

export default EmployeePaySlipsTab;
