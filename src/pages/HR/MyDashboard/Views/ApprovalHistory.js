import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuthError } from '../../../../Components/Hooks/useAuthError';
import { usePermissions } from '../../../../Components/Hooks/useRoles';
import { fetchApprovalInbox } from '../../../../store/features/HR/hrSlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Button } from 'reactstrap';
import Select from 'react-select';
import RefreshButton from '../../../../Components/Common/RefreshButton';
import { renderStatusBadge } from '../../../../Components/Common/renderStatusBadge';
import PropTypes from 'prop-types';
import { capitalizeWords } from '../../../../utils/toCapitalize';
import DataTableComponent from '../../../../Components/Common/DataTable';
import { myDashboardTypeOptions } from '../../../../Components/constants/HR';

const ApprovalHistory = ({ activeTab }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { centerAccess, userCenters } = useSelector((state) => state.User);
  const { data, pagination, loading } = useSelector((state) => state.HR);
  const handleAuthError = useAuthError();
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [limit, setLimit] = useState(10);

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "MY_PENDING_APPROVALS", "READ");

  const centerOptions = [
    ...(centerAccess?.length > 1
      ? [{
        value: "ALL",
        label: "All Centers",
        isDisabled: false,
      }]
      : []
    ),
    ...(
      centerAccess?.map(id => {
        const center = userCenters?.find(c => c._id === id);
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

  const selectedTypeOption = myDashboardTypeOptions.find(
    opt => opt.value === type
  ) || myDashboardTypeOptions[0];

  useEffect(() => {
    if (
      selectedCenter !== "ALL" &&
      !centerAccess?.includes(selectedCenter)
    ) {
      setSelectedCenter("ALL");
      setPage(1);
    }
  }, [selectedCenter, centerAccess]);

  const fetchApprovalHistory = async () => {
    try {
      const centers =
        selectedCenter === "ALL"
          ? centerAccess
          : !centerAccess.length ? [] : [selectedCenter];

      await dispatch(fetchApprovalInbox({
        page,
        limit,
        centers,
        status: "DONE",
        ...(type !== "" && { type })
      })).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch data");
      }
    }
  };

  useEffect(() => {
    if (activeTab === "HISTORY" && hasUserPermission) {
      fetchApprovalHistory();
    }
  }, [page, limit, selectedCenter, type, centerAccess, activeTab]);

  const columns = [
    {
      name: <div>Center</div>,
      selector: row => capitalizeWords(row?.center?.title) || "-",
      wrap: true,
      minWidth: "120px",
    },
    {
      name: <div>Type</div>,
      selector: row => renderStatusBadge(row?.type),
      sortable: false,
    },
    {
      name: <div>Summary</div>,
      selector: row => row?.summary || "-",
      wrap: true,
      minWidth: "350px",
    },
    {
      name: <div>Action</div>,
      selector: row => renderStatusBadge(row?.action),
      wrap: true
    },
    {
      name: <div>Acted By</div>,
      selector: row => (
        <div>
          <div>{capitalizeWords(row?.actedBy?.name || "-")}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {row?.actedBy?.email || "-"}
          </div>
        </div>
      ),
      wrap: true,
      minWidth: "200px"
    },
    {
      name: <div>Acted At</div>,
      selector: row => {
        if (!row?.actedAt) return "-";
        const date = new Date(row.actedAt);
        if (isNaN(date)) return "-";
        return format(date, "dd MMM yyyy, hh:mm a");
      },
      wrap: true,
      minWidth: "120",
    },
    {
      name: <div>Action</div>,
      cell: row => (
        <div className="d-flex gap-2">
          {row?.detailPagePath ? (
            <Button
              color='primary'
              size='sm'
              className="text-white"
              onClick={() => {
                if (row.type === "LEAVE") {
                  const leaveTab = row.action === "APPROVED" ? "approved" : "rejected";
                  const path = row.detailPagePath.includes('?')
                    ? `${row.detailPagePath}&tab=${leaveTab}`
                    : `${row.detailPagePath}?tab=${leaveTab}`;
                  navigate(path);
                } else if (row.type === "REGULARIZATION") {
                  const regTab = row.action === "REGULARIZED" ? "regularized" : "rejected";
                  const path = row.detailPagePath.includes('?')
                    ? `${row.detailPagePath}&tab=${regTab}`
                    : `${row.detailPagePath}?tab=${regTab}`;
                  navigate(path);
                } else {
                  const pathWithTab = row.detailPagePath.includes('?')
                    ? `${row.detailPagePath}&tab=HISTORY`
                    : `${row.detailPagePath}?tab=HISTORY`;
                  navigate(pathWithTab);
                }
              }}
            >
              View
            </Button>
          ) : "-"}
        </div>
      ),
      minWidth: "100px",
      center: true,
    },
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

            <div style={{ width: "200px" }}>
              <Select
                value={selectedTypeOption}
                onChange={(option) => {
                  setType(option?.value);
                  setPage(1);
                }}
                options={myDashboardTypeOptions}
                placeholder="All Types"
                classNamePrefix="react-select"
              />
            </div>
          </div>

          <RefreshButton loading={loading} onRefresh={fetchApprovalHistory} />
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
            <Select
              value={selectedTypeOption}
              onChange={(option) => {
                setType(option?.value);
                setPage(1);
              }}
              options={myDashboardTypeOptions}
              placeholder="All Types"
              classNamePrefix="react-select"
            />
          </div>
          <div className="d-flex justify-content-end">
            <RefreshButton loading={loading} onRefresh={fetchApprovalHistory} />
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
    </>
  )
}

ApprovalHistory.propTypes = {
  activeTab: PropTypes.string
}

export default ApprovalHistory