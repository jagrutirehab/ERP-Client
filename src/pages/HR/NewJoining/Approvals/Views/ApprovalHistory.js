import { useDispatch, useSelector } from "react-redux";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { useEffect, useState } from "react";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import { getMasterEmployees } from "../../../../../store/features/HR/hrSlice";
import { toast } from "react-toastify";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import { downloadFile } from "../../../../../Components/Common/downloadFile";
import { Badge, Input, Spinner } from "reactstrap";
import { format } from "date-fns";
import { ExpandableText } from "../../../../../Components/Common/ExpandableText";
import DataTable from "react-data-table-component";
import Select from "react-select";
import { getFilePreviewMeta } from "../../../../../utils/isPreviewable";
import PreviewFile from "../../../../../Components/Common/PreviewFile";
import { FILE_PREVIEW_CUTOFF } from "../../../../../Components/constants/HR";
import RefreshButton from "../../../../../Components/Common/RefreshButton";


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

const ApprovalHistory = ({ activeTab, hasUserPermission, roles }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User);
  const { data, pagination, loading } = useSelector((state) => state.HR);
  const handleAuthError = useAuthError();
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const isMobile = useMediaQuery("(max-width: 1000px)");

  const centerOptions = [
    ...(user?.centerAccess?.length > 1
      ? [{
        value: "ALL",
        label: "All Centers",
        isDisabled: false,
      }]
      : []
    ),
    ...(
      user?.centerAccess?.map(id => {
        const center = user?.userCenters?.find(c => c._id === id);
        return {
          value: id,
          label: center?.title || "Unknown Center"
        };
      }) || []
    )
  ];

  const selectedCenterOption = centerOptions.find(
    opt => opt.value === selectedCenter
  ) || centerOptions[0];

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
          : !user?.centerAccess.length ? [] : [selectedCenter];

      await dispatch(getMasterEmployees({
        page,
        limit,
        centers,
        view: "NEW_JOINING_HISTORY",
        ...search.trim() !== "" && { search: debouncedSearch }
      })).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch master employee list");
      }
    }
  };

  useEffect(() => {
    if (activeTab === "HISTORY" && hasUserPermission) {
      fetchMasterEmployeeList();
    }
  }, [page, limit, selectedCenter, debouncedSearch, user?.centerAccess, activeTab, roles]);

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
      selector: row => row?.eCode || "-",
      sortable: true,
    },
    {
      name: <div>Name</div>,
      selector: row => row?.name?.toUpperCase() || "-",
      wrap: true,
      minWidth: "160px"
    },
    {
      name: <div>Biometric ID</div>,
      selector: row => row?.biometricId || "-",
    },
    {
      name: <div>Department</div>,
      selector: row => capitalizeWords(row?.department || "-"),
      wrap: true,
      minWidth: "130px"
    },
    {
      name: <div>Designation</div>,
      selector: row => capitalizeWords(row.designation?.name
        ?.toLowerCase()
        .replace(/_/g, " ") || "-"),
      wrap: true,
      minWidth: "100px"
    },
    {
      name: <div>Employment</div>,
      selector: row => capitalizeWords(row?.employmentType || "-"),
      wrap: true,
      minWidth: "130px"
    },
    {
      name: <div>First Location</div>,
      selector: row => capitalizeWords(row?.firstLocation?.title || "-"),
      wrap: true,
      minWidth: "120px"
    },

    {
      name: <div>Current Location</div>,
      selector: row => capitalizeWords(row?.currentLocation?.title || "-"),
      wrap: true,
      minWidth: "120px"
    },
    {
      name: <div>State</div>,
      selector: row => capitalizeWords(row?.state || "-"),
      wrap: true,
      minWidth: "120px"
    },
    {
      name: <div>Payroll</div>,
      selector: row => row?.payrollType === "ON_ROLL" ? "On Roll" : "Off Roll",
      wrap: true,
    },
    {
      name: <div>Joining Date</div>,
      selector: row => row?.joinningDate || "-",
      wrap: true,
    },
    {
      name: <div>Gender</div>,
      selector: row => capitalizeWords(row?.gender || "-"),
      wrap: true,
    },
    {
      name: <div>Date of Birth</div>,
      selector: row => row?.dateOfBirth || "-",
      wrap: true,
    },
    {
      name: <div>Bank Name</div>,
      selector: row =>
        capitalizeWords(row?.bankDetails?.bankName || "-"),
      wrap: true,
      minWidth: "160px"
    },
    {
      name: <div>Bank Account No</div>,
      selector: row => row?.bankDetails?.accountNo || "-",
      wrap: true,
      minWidth: "180px"
    },
    {
      name: <div>IFSC Code</div>,
      selector: row => row?.bankDetails?.IFSCCode || "-",
      wrap: true,
      minWidth: "150px"
    },
    {
      name: <div>PF Applicable</div>,
      selector: row =>
        row?.pfApplicable === true
          ? "Yes"
          : row?.pfApplicable === false
            ? "No"
            : "-",
      wrap: true
    },
    {
      name: <div>UAN No</div>,
      selector: row => row?.uanNo || "-",
      wrap: true,
      minWidth: "160px"
    },
    {
      name: <div>PF No</div>,
      selector: row => row?.pfNo || "-",
      wrap: true,
      minWidth: "160px"
    },
    {
      name: <div>ESIC IP Code</div>,
      selector: row => row?.esicIpCode || "-",
      wrap: true,
      minWidth: "160px"
    },
    {
      name: <div>Aadhaar No</div>,
      selector: row => row?.adhar?.number || "-",
      wrap: true,
      minWidth: "180px"
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
      selector: row => row?.pan?.number || "-",
      wrap: true,
      minWidth: "140px"
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
      selector: row => row?.father || "-",
      wrap: true,
      minWidth: "180px"
    },
    {
      name: <div>Mobile No</div>,
      selector: row => row?.mobile || "-",
      wrap: true,
      minWidth: "140px"
    },
    {
      name: <div>Official Email ID</div>,
      selector: row => row?.officialEmail || "-",
      wrap: true,
      minWidth: "200px"
    },

    {
      name: <div>Email ID</div>,
      selector: row => row?.email || "-",
      wrap: true,
      minWidth: "200px"
    },
    {
      name: <div>Monthly CTC</div>,
      selector: row => `₹${row?.monthlyCTC?.toLocaleString()}`,
      sortable: true,
      wrap: true,
      minWidth: "100px"
    },
    {
      name: <div>Offer Letter</div>,
      cell: row => {
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
      }
    },
    {
      name: <div>Approval Status</div>,
      selector: row => {
        const status = row?.newJoiningWorkflow?.status;

        if (status === "APPROVED") {
          return <Badge color="success">Approved</Badge>;
        }

        if (status === "REJECTED") {
          return <Badge color="danger">Rejected</Badge>;
        }

        return "-";
      },
      wrap: true,
    },
    {
      name: <div>Filled By</div>,
      selector: row => (
        <div>
          <div>{capitalizeWords(row?.newJoiningWorkflow?.filledBy?.name || "-")}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {row?.newJoiningWorkflow?.filledBy?.email || "-"}
          </div>
        </div>
      ),
      wrap: true,
      minWidth: "200px"
    },
    {
      name: <div>Filled At</div>,
      selector: row => {
        const filledAt = row?.newJoiningWorkflow?.filledAt;

        if (!filledAt || isNaN(new Date(filledAt))) {
          return "-";
        }

        return format(new Date(filledAt), "dd MMM yyyy, hh:mm a");
      },
      wrap: true,
      minWidth: "180px"
    },
    {
      name: <div>Acted By</div>,
      selector: row => (
        <div>
          <div>{capitalizeWords(row?.newJoiningWorkflow?.actedBy?.name || "-")}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {row?.newJoiningWorkflow?.actedBy?.email || "-"}
          </div>
        </div>
      ),
      wrap: true,
      minWidth: "200px"
    },
    {
      name: <div>Acted At</div>,
      selector: row => {
        const actedAt = row?.newJoiningWorkflow?.actedAt;

        if (!actedAt || isNaN(new Date(actedAt))) {
          return "-";
        }

        return format(new Date(actedAt), "dd MMM yyyy, hh:mm a");
      },
      wrap: true,
      minWidth: "180px"
    },
    {
      name: <div>Note</div>,
      selector: row => <ExpandableText text={row?.newJoiningWorkflow?.reason || "-"} />,
      wrap: true,
      minWidth: "200px"
    }
  ];

  return (
    <>
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

          <RefreshButton loading={loading} onRefresh={fetchMasterEmployeeList} />
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
              placeholder="Search by name name or Ecode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="d-flex justify-content-end">
              <RefreshButton loading={loading} onRefresh={fetchMasterEmployeeList} />
          </div>
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

      <PreviewFile
        title="Attachment Preview"
        file={previewFile}
        isOpen={previewOpen}
        toggle={() => {
          setPreviewOpen(false);
          setPreviewFile(null);
        }}
      />

    </>
  )
}

export default ApprovalHistory;
