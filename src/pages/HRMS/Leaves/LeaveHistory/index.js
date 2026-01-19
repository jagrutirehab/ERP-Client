import React, { useEffect, useState, useMemo } from "react";
import DataTableComponent from "../../components/Table/DataTable";
import { leaveColumns } from "../../components/Table/Columns/leave";
import { CardBody, Input } from "reactstrap";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { adminGetAllLeavesInfo } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const LeaveHistory = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [leavesData, setLeavesData] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleAuthError = useAuthError();
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const user = useSelector((state) => state.User);
  // const centerAccess = useSelector((state) => state.User.centerAccess);
  // // console.log("centerAccess", centerAccess);

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

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
    }
  }, [selectedCenter, user?.centerAccess]);

  const { hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "LEAVE_HISTORY", "READ");

  const fetchLeavesData = async () => {
    try {
      setLoading(true);
      const res = await adminGetAllLeavesInfo();
      setLeavesData(res?.data || []);
    } catch (error) {
      console.log(error);
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to fetch reportings");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasUserPermission) navigate("/unauthorized");
    fetchLeavesData();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // const filteredLeaves = useMemo(() => {
  //   if (!debouncedSearch) return leavesData;

  //   return leavesData.filter((item) => {
  //     console.log("item", item);
  //     const empId = item?.eCode?.toString().toLowerCase() || "";
  //     const name = item?.employeeId?.name?.toLowerCase() || "";

  //     return (
  //       empId.includes(debouncedSearch.toLowerCase()) ||
  //       name.includes(debouncedSearch.toLowerCase())
  //     );
  //   });
  // }, [debouncedSearch, leavesData]);

  const filteredLeaves = useMemo(() => {
    return leavesData.filter((item) => {
      const empId = item?.eCode?.toString().toLowerCase() || "";
      const name = item?.employeeId?.name?.toLowerCase() || "";

      const searchMatch =
        !debouncedSearch ||
        empId.includes(debouncedSearch.toLowerCase()) ||
        name.includes(debouncedSearch.toLowerCase());

      const centerMatch =
        selectedCenter === "ALL"
          ? true
          : item?.center?._id === selectedCenter ||
            item?.center === selectedCenter;

      return searchMatch && centerMatch;
    });
  }, [debouncedSearch, leavesData, selectedCenter]);

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary">LEAVE HISTORY</h3>

        <div className="d-flex align-items-center gap-3">
          {/* Center Dropdown */}
          <select
            className="form-select"
            style={{ width: "180px" }}
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            disabled={!centerOptions.length}
          >
            {centerOptions.length === 0 ? (
              <option value="">No Centers Available</option>
            ) : (
              centerOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))
            )}
          </select>

          {/* Search */}
          <Input
            type="text"
            placeholder="Search by Employee ID or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "260px" }}
          />
        </div>
      </div>

      <DataTableComponent
        columns={leaveColumns(navigate)}
        data={filteredLeaves}
        loading={loading}
        pagination={false}
      />
    </CardBody>
  );
};

export default LeaveHistory;
