import React, { useEffect, useState } from "react";
import {
  addFestiveLeavesList,
  addLeavesToExistingList,
  deleteFestiveLeave,
  getFestiveLeavesList,
  updateFestiveLeave,
} from "../../../../helpers/backend_helper";
import { CardBody, Spinner } from "reactstrap";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import DataTable from "react-data-table-component";
import { festiveLeavesListColumn } from "../../components/Table/Columns/festiveLeavesLists";
import NewList from "./Modals/NewList";
import { toast } from "react-toastify";
import Select from "react-select";
import DeleteModal from "./Modals/DeleteModal";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 16 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year };
  });
};

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d)) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

const toISODateStartOfDay = (dateValue) => {
  if (!dateValue) return dateValue;

  if (typeof dateValue === "string" && dateValue.includes("T")) {
    return dateValue;
  }

  const d = new Date(dateValue);
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()),
  ).toISOString();
};

const FestiveLeaves = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [list, setList] = useState([]);
  const yearOptions = getYearOptions();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(yearOptions[0]);
  const [listYear, setListYear] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState(null);
  const [fullData, setFullData] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editedRow, setEditedRow] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const toggleDeleteModal = () => setDeleteModalOpen(!deleteModalOpen);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const { hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "FESTIVE_LEAVES", "READ");
  const canRead = hasPermission("HR", "FESTIVE_LEAVES", "READ");
  const canWrite = hasPermission("HR", "FESTIVE_LEAVES", "WRITE");
  const canDelete = hasPermission("HR", "FESTIVE_LEAVES", "DELETE");
  const canEdit = canWrite;
  const canAdd = canWrite;
  console.log("hasUserPermission", hasUserPermission);

  const fetchFestiveLists = async (year = selectedYear?.value) => {
    try {
      setLoading(true);
      const response = await getFestiveLeavesList({ year });
      setList(response?.data?.festiveLeaves || []);
      setListYear(response?.data?.year || year);
      setFullData(response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasUserPermission) return navigate("/unauthorized");
  }, []);

  useEffect(() => {
    setSelectedListId(null);
    setList([]);
    fetchFestiveLists(selectedYear?.value);
  }, [selectedYear]);

  const handleAddFestiveList = async (payload) => {
    try {
      setLoading(true);
      const response = await addFestiveLeavesList(payload);
      // console.log("response for add", response);
      await fetchFestiveLists();
      toast.success(response?.message || "ADDED");
    } catch (err) {
      console.log("err", err);
      toast.error(err?.message || "FAILED");
    } finally {
      setLoading(false);
    }
  };

  console.log("fullData", fullData);

  const handleUpdateFestiveList = async (payload) => {
    try {
      setLoading(true);
      const response = await addLeavesToExistingList(selectedListId, payload);
      // console.log("response for update", response);
      await fetchFestiveLists();
      toast.success(response?.message || "UPDATED");
    } catch (err) {
      toast.error(err?.message || "FAILED");
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async (leaveId, editedRow) => {
    try {
      const response = await updateFestiveLeave({
        listId: fullData._id,
        leaveId,
        date: toISODateStartOfDay(editedRow.date),
        particulars: editedRow.particulars,
      });
      console.log("response update", response);
      fetchFestiveLists(selectedYear?.value);
      setEditingRowId(null);
      toast.success(response?.message || "Leave Updated");
    } catch (error) {
      console.error("Update failed", error);
      toast.error(error?.message || "Error Updating Data");
    }
  };

  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteFestiveLeave({
        listId: fullData._id,
        leaveId: selectedRow._id,
      });

      toast.success(response?.message || "Leave deleted successfully");
      fetchFestiveLists(selectedYear?.value);
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setSelectedRow(null);
    }
  };
  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      {/* Heading */}
      <div className="mb-3 d-flex align-items-center justify-content-between">
        <h1 className="h4 fw-bold mb-0">
          Festival / National Holiday List - {listYear}
        </h1>

        <div className="d-flex align-items-center gap-2">
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            options={yearOptions}
            isSearchable={false}
            styles={{
              container: (base) => ({
                ...base,
                width: "120px",
              }),
            }}
          />

          <div className="d-flex align-items-center gap-2">
            {canAdd && list.length === 0 && (
              <button
                className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                style={{ minWidth: "140px" }}
                onClick={() => {
                  setSelectedListId(null);
                  toggleModal();
                }}
              >
                + Add New List
              </button>
            )}

            {canAdd && list.length > 0 && (
              <button
                className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                style={{ minWidth: "140px" }}
                onClick={() => {
                  setSelectedListId(fullData?._id);
                  setIsModalOpen(true);
                }}
              >
                + Add in {listYear || "Existing"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <DataTable
          columns={festiveLeavesListColumn({
            editingRowId,
            setEditingRowId,
            editedRow,
            setEditedRow,
            onSave: handleSave,
            onDelete: handleDeleteClick,
            canEdit,
            canDelete,
          })}
          data={list}
          striped
          highlightOnHover
          responsive
          progressPending={loading}
          progressComponent={
            <div
              style={{
                height: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
                backgroundColor: "rgba(255, 255, 255, 0.6)",
              }}
            >
              <Spinner color="primary" />
            </div>
          }
        />
      </div>

      <NewList
        isOpen={isModalOpen}
        toggle={toggleModal}
        initialRows={[]}
        year={selectedYear?.value}
        onSubmit={
          selectedListId ? handleUpdateFestiveList : handleAddFestiveList
        }
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        toggle={toggleDeleteModal}
        onConfirm={handleConfirmDelete}
        date={formatDate(selectedRow?.date)}
      />
    </CardBody>
  );
};

export default FestiveLeaves;
