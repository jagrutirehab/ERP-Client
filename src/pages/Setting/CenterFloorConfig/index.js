import React, { useEffect, useState } from "react";
import { Row, Col, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getFloors,
  getAreas,
  getCenterFloorsConfigurationSummary,
} from "../../../helpers/backend_helper";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import FloorListCard from "./components/FloorListCard";
import AreaListCard from "./components/AreaListCard";
import CentersOverviewCard from "./components/CentersOverviewCard";
import AddFloorsModal from "./components/AddFloorsModal";
import EditFloorModal from "./components/EditFloorModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import AddAreasModal from "./components/AddAreasModal";
import EditAreaModal from "./components/EditAreaModal";
import DeleteAreaConfirmModal from "./components/DeleteAreaConfirmModal";

const CenterFloorConfig = () => {
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasRead = hasPermission("SETTING", "CENTERFLOORCONFIG", "READ");
  const hasWrite = hasPermission("SETTING", "CENTERFLOORCONFIG", "WRITE");
  const hasDelete = hasPermission("SETTING", "CENTERFLOORCONFIG", "DELETE");

  const centers = useSelector((state) => state.Center.data);

  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [summary, setSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [centerSearch, setCenterSearch] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);

  const [areas, setAreas] = useState([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");
  const [addAreaModalOpen, setAddAreaModalOpen] = useState(false);
  const [editAreaModalOpen, setEditAreaModalOpen] = useState(false);
  const [deleteAreaModalOpen, setDeleteAreaModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  const fetchAreas = async () => {
    try {
      setAreasLoading(true);
      const res = await getAreas();
      setAreas(res?.data || []);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to fetch areas";
      toast.error(message);
    } finally {
      setAreasLoading(false);
    }
  };

  const fetchFloors = async () => {
    try {
      setLoading(true);
      const res = await getFloors();
      setFloors(res?.data || []);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to fetch floors";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await getCenterFloorsConfigurationSummary();
      setSummary(res?.data || []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch center configurations";
      toast.error(message);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors();
    fetchAreas();
    fetchSummary();
  }, []);

  if (permissionLoader) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
      </div>
    );
  }

  if (!hasRead) {
    navigate("/unauthorized");
    return null;
  }

  const filteredFloors = floors.filter((floor) =>
    (floor.floorName || "").toLowerCase().includes(search.toLowerCase()),
  );

  const filteredAreas = areas.filter((area) =>
    (area.areaName || "").toLowerCase().includes(areaSearch.toLowerCase()),
  );

  const summaryByCenter = summary.reduce(
    (acc, item) => ({ ...acc, [item.center]: item }),
    {},
  );

  const centerRows = (centers || [])
    .filter((center) => !center.deleted)
    .map((center) => ({
      _id: center._id,
      centerName: center.title || center.name || "Unknown Center",
      city: center.city?.city || "—",
      totalFloors: summaryByCenter[center._id]?.totalFloors || 0,
      totalSlots: summaryByCenter[center._id]?.totalSlots || 0,
      mandatorySlots: summaryByCenter[center._id]?.mandatorySlots || 0,
      maxDepth: summaryByCenter[center._id]?.maxDepth || 0,
    }));

  const filteredCenters = centerRows.filter(
    (center) =>
      center.centerName.toLowerCase().includes(centerSearch.toLowerCase()) ||
      center.city.toLowerCase().includes(centerSearch.toLowerCase()),
  );

  const handleEditClick = (floor) => {
    setSelectedFloor(floor);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (floor) => {
    setSelectedFloor(floor);
    setDeleteModalOpen(true);
  };

  const handleAreaEditClick = (area) => {
    setSelectedArea(area);
    setEditAreaModalOpen(true);
  };

  const handleAreaDeleteClick = (area) => {
    setSelectedArea(area);
    setDeleteAreaModalOpen(true);
  };

  return (
    <div className="container-fluid px-3 py-4">
      <div className="mb-4">
        <h4 className="fw-semibold mb-1">Center Floor Configuration</h4>
        <p className="text-muted small mb-0">
          Manage the floors and sub-locations available across centers, then
          build each center's location tree
        </p>
      </div>

      <Row className="g-4">
        <Col lg={6}>
          <FloorListCard
            loading={loading}
            floors={floors}
            filteredFloors={filteredFloors}
            search={search}
            setSearch={setSearch}
            onAddClick={() => setAddModalOpen(true)}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            hasWrite={hasWrite}
            hasDelete={hasDelete}
          />
        </Col>
        <Col lg={6}>
          <AreaListCard
            loading={areasLoading}
            areas={areas}
            filteredAreas={filteredAreas}
            search={areaSearch}
            setSearch={setAreaSearch}
            onAddClick={() => setAddAreaModalOpen(true)}
            onEditClick={handleAreaEditClick}
            onDeleteClick={handleAreaDeleteClick}
            hasWrite={hasWrite}
            hasDelete={hasDelete}
          />
        </Col>
      </Row>

      <Row className="mt-4">
        <Col xs={12}>
          <CentersOverviewCard
            loading={summaryLoading}
            centerRows={centerRows}
            filteredCenters={filteredCenters}
            centerSearch={centerSearch}
            setCenterSearch={setCenterSearch}
            hasWrite={hasWrite}
            onConfigured={fetchSummary}
          />
        </Col>
      </Row>

      <AddFloorsModal
        isOpen={addModalOpen}
        toggle={() => setAddModalOpen((prev) => !prev)}
        onSuccess={fetchFloors}
      />

      <EditFloorModal
        isOpen={editModalOpen}
        toggle={() => setEditModalOpen((prev) => !prev)}
        floor={selectedFloor}
        onSuccess={fetchFloors}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        toggle={() => setDeleteModalOpen((prev) => !prev)}
        floor={selectedFloor}
        onSuccess={() => {
          fetchFloors();
          fetchSummary();
        }}
      />

      <AddAreasModal
        isOpen={addAreaModalOpen}
        toggle={() => setAddAreaModalOpen((prev) => !prev)}
        onSuccess={fetchAreas}
      />

      <EditAreaModal
        isOpen={editAreaModalOpen}
        toggle={() => setEditAreaModalOpen((prev) => !prev)}
        area={selectedArea}
        onSuccess={fetchAreas}
      />

      <DeleteAreaConfirmModal
        isOpen={deleteAreaModalOpen}
        toggle={() => setDeleteAreaModalOpen((prev) => !prev)}
        area={selectedArea}
        onSuccess={() => {
          fetchAreas();
          fetchSummary();
        }}
      />
    </div>
  );
};

export default CenterFloorConfig;
