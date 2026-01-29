import React, { useEffect, useState } from "react";
import { getManagementHiringRequests } from "../../../../helpers/backend_helper";
import { CardBody } from "reactstrap";
// import DataTableComponent from "../../../components/Table/DataTable";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { HiringActionColumns } from "../../../HRMS/components/Table/Columns/HiringManagementColumn";
import DataTableComponent from "../../../HRMS/components/Table/DataTable";
import EditHiringRequestModal from "../../components/EditHiringRequestModal";
import { editManagementRequests } from "../../../../helpers/backend_helper";
import { toast } from "react-toastify";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { fetchDesignations } from "../../../../store/features/HR/hrSlice";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { HiringPreferredGenderOptions } from "../../../../Components/constants/HR";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";

const HiringManagement = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    center: "ALL",
    designation: null,
    gender: null,
    updateStatus: null,
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [spagination, setsPagination] = useState({
    totalDocs: 0,
  });
  const handleAuthError = useAuthError();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User);
  const {
    data,
    pagination,
    loader,
    designations: designationOptions,
    designationLoading,
  } = useSelector((state) => state.HR);
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "MY_HIRING_STATUS", "READ");

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
    centerOptions.find((opt) => opt.value === filters.center) ||
    centerOptions[0];

  const selectedGenderOption =
    HiringPreferredGenderOptions.find((opt) => opt.value === filters.gender) ||
    null;

  const selectedDesignationOption =
    designationOptions.find((opt) => opt.value === filters.designation) || null;

  useEffect(() => {
    if (
      filters.center !== "ALL" &&
      !user?.centerAccess?.includes(filters.center)
    ) {
      setFilters("ALL");
      setPage(1);
    }
  }, [filters.center, user?.centerAccess]);

  const loadHiringManagementRequests = async () => {
    setLoading(true);
    try {
      const centers =
        filters.center === "ALL"
          ? user?.centerAccess
          : !user?.centerAccess.length
            ? []
            : [filters.center];

      const response = await getManagementHiringRequests({
        page,
        limit,
        centers,
        ...(filters.updateStatus ? { updateStatus: filters.updateStatus } : {}),
        ...(filters.designation ? { designation: filters.designation } : {}),
        ...(filters.gender ? { gender: filters.gender } : {}),
      });
      // console.log("response", response);
      setRequests(response?.data);
      setsPagination(response?.pagination);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasUserPermission) {
      navigate("/unauthorized");
    }
    loadHiringManagementRequests();
  }, [filters, page, limit, user?.centerAccess]);

  const handleActionClick = (row) => {
    setSelectedRow(row);
    setFormData({
      updateStatus: row?.updateStatus || "",
      priority: row?.priority || "",
      remarks: row?.remarks || "",
      interviewer: row?.interviewer || "",
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedRow?._id) return;

    try {
      setLoading(true);

      const payload = {
        updateStatus: formData.updateStatus,
        priority: formData.priority,
        remarks: formData.remarks,
        interviewer: formData.interviewer,
      };

      const response = await editManagementRequests(selectedRow._id, payload);
      // console.log("response", response);
      if (response.success === true) {
        toast.success(response?.message || "Successfully updated!");
      }

      setIsModalOpen(false);
      loadHiringManagementRequests();
    } catch (error) {
      console.log(error);
      toast.error(error?.message || "Error Updating Data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDesignations = async () => {
      try {
        dispatch(
          fetchDesignations({ status: ["PENDING", "APPROVED"] }),
        ).unwrap();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error("Something went wrong while getting the designations");
        }
      }
    };

    loadDesignations();
  }, []);

  const UpdateStatusOptions = [
    { value: "HOLD", label: "Hold" },
    { value: "WIP", label: "Work In Progress" },
    { value: "CLOSED", label: "Closed" },
    { value: "NOT_STARTED_WORKING_YET", label: "Not Started Working" },
  ];

  const selectedUpdateStatusOption =
    UpdateStatusOptions.find((opt) => opt.value === filters.updateStatus) ||
    null;

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">MY HIRING STATUS</h1>
      </div>

      <div className="d-flex flex-wrap gap-3 mb-3">
        {/* Center */}
        <div style={{ width: isMobile ? "100%" : "200px" }}>
          <Select
            options={centerOptions}
            value={selectedCenterOption}
            onChange={(opt) => {
              setFilters((prev) => ({
                ...prev,
                center: opt?.value || "ALL",
              }));
              setPage(1);
            }}
            placeholder="All Centers"
          />
        </div>

        <div style={{ width: isMobile ? "100%" : "180px" }}>
          <Select
            options={HiringPreferredGenderOptions}
            value={selectedGenderOption}
            onChange={(opt) => {
              setFilters((prev) => ({
                ...prev,
                gender: opt ? opt.value : null,
              }));
              setPage(1);
            }}
            placeholder="Gender"
            isClearable
          />
        </div>

        {/* Designation */}
        <div style={{ width: isMobile ? "100%" : "250px" }}>
          <Select
            options={designationOptions}
            value={selectedDesignationOption}
            onChange={(opt) => {
              setFilters((prev) => ({
                ...prev,
                designation: opt ? opt.value : null,
              }));
              setPage(1);
            }}
            isLoading={designationLoading || loading}
            placeholder="Designation"
            isClearable
          />
        </div>

        <div style={{ width: isMobile ? "100%" : "220px" }}>
          <Select
            options={UpdateStatusOptions}
            value={selectedUpdateStatusOption}
            onChange={(opt) => {
              setFilters((prev) => ({
                ...prev,
                updateStatus: opt ? opt.value : null,
              }));
              setPage(1);
            }}
            placeholder="Update Status"
            isClearable
          />
        </div>
      </div>

      <DataTableComponent
        columns={HiringActionColumns({ onActionClick: handleActionClick })}
        data={requests}
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

      <EditHiringRequestModal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(false)}
        selectedRow={selectedRow}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdate}
        loading={loading}
      />
    </CardBody>
  );
};

export default HiringManagement;
