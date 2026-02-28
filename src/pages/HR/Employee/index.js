import { useEffect, useState } from "react";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { Button, CardBody, Input, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import Select from "react-select";
import { Pencil, Trash2 } from "lucide-react";
import { fetchDesignations, getMasterEmployees } from "../../../store/features/HR/hrSlice";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import { capitalizeWords } from "../../../utils/toCapitalize";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { deleteEmployee, getDepartments, getEmployeeDetailsById } from "../../../helpers/backend_helper";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { useNavigate, useSearchParams } from "react-router-dom";
import { downloadFile } from "../../../Components/Common/downloadFile";
import EmployeeModal from "../components/EmployeeModal";
import { renderStatusBadge } from "../../../Components/Common/renderStatusBadge";
import { getFilePreviewMeta } from "../../../utils/isPreviewable";
import PreviewFile from "../../../Components/Common/PreviewFile";
import { FILE_PREVIEW_CUTOFF, filterEmploymentOptions, statusOptions } from "../../../Components/constants/HR";
import RefreshButton from "../../../Components/Common/RefreshButton";
import DataTableComponent from "../../../Components/Common/DataTable";

const Employee = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User);
  const { data, pagination, loading } = useSelector((state) => state.HR);
  const handleAuthError = useAuthError();
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get("q") || "";
  const [search, setSearch] = useState(querySearch);
  const [debouncedSearch, setDebouncedSearch] = useState(querySearch);
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [selectedEmploymentType, setSelectedEmploymentType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const { designations, designationLoading } = useSelector((state) => state.HR);

  const isMobile = useMediaQuery("(max-width: 1000px)");

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const {
    hasPermission,
    loading: permissionLoader,
    roles,
  } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "MASTER_EMPLOYEE", "READ");


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

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const deptRes = await getDepartments();
        setDepartmentOptions(
          (deptRes?.data || []).map((d) => ({
            label: d.department,
            value: d._id,
          }))
        );
        dispatch(fetchDesignations({ status: ["PENDING", "APPROVED"] }));
      } catch (error) {
        console.error("Failed to fetch dropdowns", error);
      }
    };
    fetchDropdowns();
  }, [dispatch]);

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
          ...(selectedDepartment && { department: selectedDepartment.value }),
          ...(selectedDesignation && { designation: selectedDesignation.value }),
          ...(selectedEmploymentType && { employmentType: selectedEmploymentType.value }),
          ...(selectedStatus && { status: selectedStatus.value }),
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
  }, [
    page,
    limit,
    selectedCenter,
    debouncedSearch,
    user?.centerAccess,
    roles,
    selectedDepartment,
    selectedDesignation,
    selectedEmploymentType,
    selectedStatus,
  ]);

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

  const handleEditEmployee = async (row) => {
    setSelectedEmployee(row);
    setModalLoading(true);
    try {
      const res = await getEmployeeDetailsById(row._id);

      setSelectedEmployee({
        ...row,
        financeDetails: res?.data?.financeDetails,
        users: res?.data?.users,
      });

      setModalOpen(true);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch employee finance details");
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleFilePreview = (file, updatedAt) => {
    if (!file?.url) return;

    const meta = getFilePreviewMeta(file, updatedAt, FILE_PREVIEW_CUTOFF);

    if (meta.action === "preview") {
      setPreviewFile(file);
      setPreviewOpen(true);
    } else {
      downloadFile(file);
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
      selector: (row) => filterEmploymentOptions.find(opt => opt.value === row?.employmentType)?.label || capitalizeWords(row?.employmentType || "-"),
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
      selector: (row) => {
        if (!row?.adhar?.url) return "-";

        const meta = getFilePreviewMeta(
          { url: row?.adhar?.url },
          row?.updatedAt,
          FILE_PREVIEW_CUTOFF
        );

        return (
          <span
            style={{
              color: meta.canPreview ? "#007bff" : "#28a745",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
            onClick={() =>
              handleFilePreview(
                { url: row?.adhar?.url },
                row?.updatedAt,
                FILE_PREVIEW_CUTOFF
              )
            }
          >
            {meta.action === "preview" ? "Preview" : "Download"}
          </span>
        );
      },
    },
    {
      name: <div>PAN No</div>,
      selector: (row) => row?.pan?.number || "-",
      wrap: true,
      minWidth: "140px",
    },
    {
      name: <div>PAN File</div>,
      selector: (row) => {
        if (!row?.pan?.url) return "-";

        const meta = getFilePreviewMeta(
          { url: row?.pan?.url },
          row?.updatedAt,
          FILE_PREVIEW_CUTOFF
        );

        return (
          <span
            style={{
              color: meta.canPreview ? "#007bff" : "#28a745",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
            onClick={() =>
              handleFilePreview(
                { url: row?.pan?.url },
                row?.updatedAt,
                FILE_PREVIEW_CUTOFF
              )
            }
          >
            {meta.action === "preview" ? "Preview" : "Download"}
          </span>
        );
      },
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
      selector: (row) => {
        if (!row?.offerLetter) return "-";

        const meta = getFilePreviewMeta(
          { url: row?.offerLetter },
          row?.updatedAt,
          FILE_PREVIEW_CUTOFF
        );

        return (
          <span
            style={{
              color: meta.canPreview ? "#007bff" : "#28a745",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
            onClick={() =>
              handleFilePreview(
                { url: row?.offerLetter },
                row?.updatedAt,
                FILE_PREVIEW_CUTOFF
              )
            }
          >
            {meta.action === "preview" ? "Preview" : "Download"}
          </span>
        );
      },
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
                    handleEditEmployee(row);
                  }}
                >
                  {(modalLoading && selectedEmployee?._id === row?._id) ? <Spinner size={"sm"} /> : <Pencil size={16} />}
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
        <div className="row g-2 mb-2">
          <div className="col-md-3">
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
          <div className="col-md-3">
            <Input
              type="text"
              className="form-control"
              placeholder="Search by name or Ecode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <Select
              value={selectedStatus}
              onChange={(option) => {
                setSelectedStatus(option);
                setPage(1);
              }}
              options={statusOptions}
              placeholder="Filter by Status"
              classNamePrefix="react-select"
              isClearable
            />
          </div>
          <div className="col-md-3">
            <Select
              value={selectedEmploymentType}
              onChange={(option) => {
                setSelectedEmploymentType(option);
                setPage(1);
              }}
              options={filterEmploymentOptions}
              placeholder="Filter by Employment"
              classNamePrefix="react-select"
              isClearable
            />
          </div>
        </div>

        <div className="row g-2 mb-2">
          <div className="col-md-3">
            <Select
              value={selectedDepartment}
              onChange={(option) => {
                setSelectedDepartment(option);
                setPage(1);
              }}
              options={departmentOptions}
              placeholder="Filter by Department"
              classNamePrefix="react-select"
              isClearable
            />
          </div>
          <div className="col-md-3">
            <Select
              value={selectedDesignation}
              onChange={(option) => {
                setSelectedDesignation(option);
                setPage(1);
              }}
              options={designations}
              placeholder="Filter by Designation"
              classNamePrefix="react-select"
              isClearable
              isLoading={designationLoading}
            />
          </div>
          <div className="col-md-6 d-flex justify-content-end gap-2 align-items-center">
            <RefreshButton loading={loading} onRefresh={fetchMasterEmployeeList} />
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
        </div>
      </div>

      <DataTableComponent
        columns={columns}
        data={data}
        loading={loading}
        pagination={pagination}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
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
      <PreviewFile
        title="Attachment Preview"
        file={previewFile}
        isOpen={previewOpen}
        toggle={() => {
          setPreviewOpen(false);
          setPreviewFile(null);
        }}
      />
    </CardBody>
  );
};

export default Employee;
