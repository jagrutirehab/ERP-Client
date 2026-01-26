import { useEffect, useState } from "react";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { Button, CardBody, Input, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import DataTable from "react-data-table-component";
import Select from "react-select";
// import { employees } from '../dummyData';
import { Pencil, Trash2 } from "lucide-react";
import { getMasterEmployees } from "../../../store/features/HR/hrSlice";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import { capitalizeWords } from "../../../utils/toCapitalize";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { deleteEmployee } from "../../../helpers/backend_helper";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { useNavigate } from "react-router-dom";
import { downloadFile } from "../../../Components/Common/downloadFile";
import EmployeeModal from "../components/EmployeeModal";
import { renderStatusBadge } from "../../../Components/Common/renderStatusBadge";

const customStyles = {
  table: {
    style: {
      minHeight: "450px",
    },
  },
  headCells: {
    style: {
      backgroundColor: "#f8f9fa",
      fontWeight: "600",
      borderBottom: "2px solid #e9ecef",
    },
  },
  rows: {
    style: {
      minHeight: "60px",
      borderBottom: "1px solid #f1f1f1",
    },
  },
};

const Employee = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User);
  const { data, pagination, loading } = useSelector((state) => state.HR);
  const handleAuthError = useAuthError();
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const isMobile = useMediaQuery("(max-width: 1000px)");

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const {
    hasPermission,
    loading: permissionLoader,
    roles,
  } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "MASTER_EMPLOYEE", "READ");

  console.log("data", data);

  const centerOptions = [
    ...(user?.centerAccess?.length > 1
      ? [
          {
            value: "ALL",
            label: "All Centers",
            isDisabled: false,
          },
        ]
      : []),
    ...(user?.centerAccess?.map((id) => {
      const center = user?.userCenters?.find((c) => c._id === id);
      return {
        value: id,
        label: center?.title || "Unknown Center",
      };
    }) || []),
  ];

  const selectedCenterOption =
    centerOptions.find((opt) => opt.value === selectedCenter) ||
    centerOptions[0];

  useEffect(() => {
    if (
      selectedCenter !== "ALL" &&
      !user?.centerAccess?.includes(selectedCenter)
    ) {
      setSelectedCenter("ALL");
      setPage(1);
    }
  }, [selectedCenter, user?.centerAccess]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchMasterEmployeeList = async () => {
    try {
      const centers =
        selectedCenter === "ALL"
          ? user?.centerAccess
          : !user?.centerAccess.length
            ? []
            : [selectedCenter];

      await dispatch(
        getMasterEmployees({
          page,
          limit,
          centers,
          view: "MASTER",
          ...(search.trim() !== "" && { search: debouncedSearch }),
        }),
      ).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch master employee list");
      }
    }
  };

  useEffect(() => {
    if (hasUserPermission) {
      fetchMasterEmployeeList();
    }
  }, [page, limit, selectedCenter, debouncedSearch, user?.centerAccess, roles]);

  const handleDelete = async () => {
    setModalLoading(true);
    try {
      await deleteEmployee(selectedEmployee._id);
      toast.success("Employee deleted successfully");
      setPage(1);
      fetchMasterEmployeeList();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to delete employee");
      }
    } finally {
      setDeleteModalOpen(false);
      setModalLoading(false);
    }
  };

  const columns = [
    {
      name: <div>ECode</div>,
      selector: (row) => row?.eCode || "-",
      sortable: true,
    },
    {
      name: <div>Name</div>,
      selector: (row) => row?.name?.toUpperCase() || "-",
      wrap: true,
      minWidth: "160px",
    },
    {
      name: <div>Biometric ID</div>,
      selector: (row) => row?.biometricId || "-",
    },
    {
      name: <div>Department</div>,
      selector: (row) => capitalizeWords(row?.department || "-"),
      wrap: true,
      minWidth: "120px",
    },
    {
      name: <div>Designation</div>,
      selector: (row) =>
        capitalizeWords(row?.designation?.name?.replace(/_/g, " ") || "-"),
      wrap: true,
      minWidth: "120px",
    },
    {
      name: <div>Current Manager</div>,
      selector: (row) => {
        const manager = row?.currentManager;
        if (!manager) return "-";
        const name = manager.name?.toUpperCase();
        const eCode = manager.eCode;

        return `${name}${eCode ? ` (${eCode})` : ""}`;
      },
      wrap: true,
      minWidth: "160px",
    },
    {
      name: <div>Employment</div>,
      selector: (row) => capitalizeWords(row?.employmentType || "-"),
      wrap: true,
      minWidth: "100px",
    },
    {
      name: <div>First Location</div>,
      selector: (row) => capitalizeWords(row?.firstLocation?.title || "-"),
      wrap: true,
      minWidth: "120px",
    },

    {
      name: <div>Transferred From</div>,
      selector: (row) => capitalizeWords(row?.transferredFrom?.title || "-"),
      wrap: true,
      minWidth: "120px",
    },

    {
      name: <div>Current Location</div>,
      selector: (row) => capitalizeWords(row?.currentLocation?.title || "-"),
      wrap: true,
      minWidth: "120px",
    },
    {
      name: <div>State</div>,
      selector: (row) => capitalizeWords(row?.state || "-"),
      wrap: true,
      minWidth: "120px",
    },
    {
      name: <div>Payroll</div>,
      selector: (row) =>
        row?.payrollType === "ON_ROLL" ? "On Roll" : "Off Roll",
      wrap: true,
    },
    {
      name: <div>Joining Date</div>,
      selector: (row) => row?.joinningDate || "-",
      wrap: true,
    },

    {
      name: <div>Last Working Day</div>,
      selector: (row) => row?.exitDate || "-",
      wrap: true,
    },

    {
      name: <div>Current Status</div>,
      selector: (row) =>
        row?.status === "ACTIVE"
          ? "Active"
          : row?.status === "FNF_CLOSED"
            ? "FNF Closed"
            : "Resigned",
      wrap: true,
    },

    {
      name: <div>Exit Status</div>,
      selector: (row) => renderStatusBadge(row?.exitStatus) || "-",
      wrap: true,
      minWidth: "150px",
      center: true,
    },

    {
      name: <div>FNF Status</div>,
      selector: (row) => renderStatusBadge(row?.fnfStatus) || "-",
      wrap: true,
      minWidth: "150px",
      center: true,
    },

    {
      name: <div>IT Status</div>,
      selector: (row) => renderStatusBadge(row?.itStatus) || "-",
      wrap: true,
      minWidth: "150px",
      center: true,
    },

    {
      name: <div>Transfer Status</div>,
      selector: (row) => renderStatusBadge(row?.transferStatus) || "-",
      wrap: true,
      minWidth: "150px",
      center: true,
    },

    {
      name: <div>Gender</div>,
      selector: (row) => capitalizeWords(row?.gender || "-"),
      wrap: true,
    },
    {
      name: <div>Date of Birth</div>,
      selector: (row) => row?.dateOfBirth || "-",
      wrap: true,
    },
    {
      name: <div>Bank Name</div>,
      selector: (row) => capitalizeWords(row?.bankDetails?.bankName || "-"),
      wrap: true,
      minWidth: "160px",
    },
    {
      name: <div>Bank Account No</div>,
      selector: (row) => row?.bankDetails?.accountNo || "-",
      wrap: true,
      minWidth: "180px",
    },
    {
      name: <div>IFSC Code</div>,
      selector: (row) => row?.bankDetails?.IFSCCode || "-",
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>PF Applicable</div>,
      selector: (row) =>
        row?.pfApplicable === true
          ? "Yes"
          : row?.pfApplicable === false
            ? "No"
            : "-",
      wrap: true,
    },
    {
      name: <div>UAN No</div>,
      selector: (row) => row?.uanNo || "-",
      wrap: true,
      minWidth: "160px",
    },
    {
      name: <div>PF No</div>,
      selector: (row) => row?.pfNo || "-",
      wrap: true,
      minWidth: "160px",
    },
    {
      name: <div>ESIC IP Code</div>,
      selector: (row) => row?.esicIpCode || "-",
      wrap: true,
      minWidth: "160px",
    },
    {
      name: <div>Aadhaar No</div>,
      selector: (row) => row?.adhar?.number || "-",
      wrap: true,
      minWidth: "180px",
    },
    {
      name: <div>Aadhaar File</div>,
      selector: (row) =>
        row?.adhar?.url ? (
          <span
            style={{
              color: "#007bff",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
            onClick={() =>
              downloadFile({
                url: row.adhar.url,
              })
            }
          >
            Download
          </span>
        ) : (
          "-"
        ),
    },
    {
      name: <div>PAN No</div>,
      selector: (row) => row?.pan?.number || "-",
      wrap: true,
      minWidth: "140px",
    },
    {
      name: <div>PAN File</div>,
      selector: (row) =>
        row?.pan?.url ? (
          <span
            style={{
              color: "#007bff",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
            onClick={() => downloadFile({ url: row.pan.url })}
          >
            Download
          </span>
        ) : (
          "-"
        ),
      wrap: true,
    },
    {
      name: <div>Father's Name</div>,
      selector: (row) => capitalizeWords(row?.father) || "-",
      wrap: true,
      minWidth: "180px",
    },
    {
      name: <div>Mobile No</div>,
      selector: (row) => row?.mobile || "-",
      wrap: true,
      minWidth: "140px",
    },
    {
      name: <div>Official Email ID</div>,
      selector: (row) => row?.officialEmail || "-",
      wrap: true,
      minWidth: "230px",
    },
    {
      name: <div>Email ID</div>,
      selector: (row) => row?.email || "-",
      wrap: true,
      minWidth: "230px",
    },
    // {
    //     name: <div>Monthly CTC</div>,
    //     selector: row => `₹${row?.monthlyCTC?.toLocaleString()}`,
    //     sortable: true,
    //     wrap: true,
    //     minWidth: "100px"
    // },
    {
      name: <div>Offer Letter</div>,
      selector: (row) =>
        row?.offerLetter ? (
          <span
            style={{
              color: "#007bff",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
            onClick={() => downloadFile({ url: row.offerLetter })}
          >
            Download
          </span>
        ) : (
          "-"
        ),
    },
    {
      name: <div>Created By</div>,
      selector: (row) => (
        <div>
          <div>{capitalizeWords(row?.author?.name || "-")}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {row?.author?.email || "-"}
          </div>
        </div>
      ),
      wrap: true,
      minWidth: "200px",
    },
    {
      name: <div>Created At</div>,
      selector: (row) => {
        const createdAt = row?.createdAt;
        if (!createdAt || isNaN(new Date(createdAt))) {
          return "-";
        }
        return format(new Date(createdAt), "dd MMM yyyy, hh:mm a");
      },
      sortable: true,
      wrap: true,
      minWidth: "180px",
    },
    ...(hasPermission("HR", "MASTER_EMPLOYEE", "WRITE")
      ? [
          {
            name: <div>Actions</div>,
            cell: (row) => (
              <div className="d-flex gap-2">
                <CheckPermission
                  accessRolePermission={roles?.permissions}
                  subAccess={"MASTER_EMPLOYEE"}
                  permission={"edit"}
                >
                  <button
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    onClick={() => {
                      setSelectedEmployee(row);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                </CheckPermission>

                <CheckPermission
                  accessRolePermission={roles?.permissions}
                  subAccess={"MASTER_EMPLOYEE"}
                  permission={"delete"}
                >
                  <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => {
                      setSelectedEmployee(row);
                      setDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </CheckPermission>
              </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            minWidth: "140px",
          },
        ]
      : []),
  ];

  if (!permissionLoader && !hasUserPermission) {
    navigate("/unathorized");
  }

  const isVendor =
    selectedEmployee?.employmentType?.trim().toLowerCase() === "vendor";

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">MASTER EMPLOYEE LIST</h1>
      </div>

      <div className="mb-3">
        {/*  DESKTOP VIEW */}
        <div className="d-none d-md-flex justify-content-between align-items-center">
          <div className="d-flex gap-3 align-items-center">
            <div style={{ width: "200px" }}>
              <Select
                value={selectedCenterOption}
                onChange={(option) => {
                  setSelectedCenter(option?.value);
                  setPage(1);
                }}
                options={centerOptions}
                placeholder="All Centers"
                classNamePrefix="react-select"
              />
            </div>

            <div style={{ width: "220px" }}>
              <Input
                type="text"
                className="form-control"
                placeholder="Search by name or Ecode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <CheckPermission
            accessRolePermission={roles?.permissions}
            subAccess={"MASTER_EMPLOYEE"}
            permission={"delete"}
          >
            <Button
              color={"primary"}
              className="d-flex align-items-center gap-2 text-white"
              onClick={() => setModalOpen(true)}
            >
              + Add Employee
            </Button>
          </CheckPermission>
        </div>

        {/*  MOBILE VIEW */}
        <div className="d-flex d-md-none flex-column gap-3">
          <div style={{ width: "100%" }}>
            <Select
              value={selectedCenterOption}
              onChange={(option) => {
                setSelectedCenter(option?.value);
                setPage(1);
              }}
              options={centerOptions}
              placeholder="All Centers"
              classNamePrefix="react-select"
            />
          </div>

          <div style={{ width: "100%" }}>
            <Input
              type="text"
              className="form-control"
              placeholder="Search by name or Ecode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex d-md-none justify-content-end mt-3">
          <CheckPermission
            accessRolePermission={roles?.permissions}
            subAccess={"MASTER_EMPLOYEE"}
            permission={"delete"}
          >
            <Button
              color="primary"
              className="d-flex align-items-center gap-2 text-white"
              onClick={() => setModalOpen(true)}
            >
              + Add Employee
            </Button>
          </CheckPermission>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        highlightOnHover
        pagination
        paginationServer
        paginationTotalRows={pagination?.totalDocs}
        paginationPerPage={limit}
        paginationDefaultPage={page}
        progressPending={loading}
        striped
        fixedHeader
        fixedHeaderScrollHeight="500px"
        dense={isMobile}
        responsive
        customStyles={customStyles}
        progressComponent={
          <div className="py-4 text-center">
            <Spinner className="text-primary" />
          </div>
        }
        onChangePage={(newPage) => setPage(newPage)}
        onChangeRowsPerPage={(newLimit) => setLimit(newLimit)}
      />

      <EmployeeModal
        isOpen={modalOpen}
        toggle={() => {
          setModalOpen(!modalOpen);
          setSelectedEmployee(null);
        }}
        initialData={selectedEmployee}
        onUpdate={() => {
          setPage(1);
          fetchMasterEmployeeList();
        }}
        loading={modalLoading}
        setLoading={setModalLoading}
        mode={"MASTER"}
        isVendor={isVendor}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        toggle={() => {
          setDeleteModalOpen(!deleteModalOpen);
          setSelectedEmployee(null);
        }}
        onConfirm={handleDelete}
        loading={modalLoading}
      />
    </CardBody>
  );
};

export default Employee;
