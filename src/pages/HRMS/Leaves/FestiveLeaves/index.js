import React, { useEffect, useState } from "react";
import {
  addFestiveLeavesList,
  getFestiveLeavesList,
} from "../../../../helpers/backend_helper";
import { CardBody, Spinner } from "reactstrap";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import DataTable from "react-data-table-component";
import { festiveLeavesListColumn } from "../../components/Table/Columns/festiveLeavesLists";
import NewList from "./Modals/NewList";
import { toast } from "react-toastify";
import Select from "react-select";

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 16 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year };
  });
};

const FestiveLeaves = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [list, setList] = useState([]);
  const yearOptions = getYearOptions();

  const [selectedYear, setSelectedYear] = useState(yearOptions[0]);
  const [listYear, setListYear] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const fetchFestiveLists = async (year = selectedYear?.value) => {
    try {
      setLoading(true);
      const response = await getFestiveLeavesList({ year });
      setList(response?.data?.festiveLeaves || []);
      setListYear(response?.data?.year || year);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFestiveLists(selectedYear?.value);
  }, [selectedYear]);

  const handleAddFestiveList = async (payload) => {
    try {
      setLoading(true);
      const response = await addFestiveLeavesList(payload);
      console.log("Response", response);
      await fetchFestiveLists();
      toast.success(response?.data?.message || "ADDED");
    } catch (err) {
      console.log("err", err);
      toast.error(err?.message || "FAILED");
    } finally {
      setLoading(false);
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

          <button className="btn btn-primary" onClick={toggleModal}>
            + Add List
          </button>
        </div>
      </div>

      <div
        style={{
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <DataTable
          columns={festiveLeavesListColumn()}
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
        onSubmit={handleAddFestiveList}
      />
    </CardBody>
  );
};

export default FestiveLeaves;
