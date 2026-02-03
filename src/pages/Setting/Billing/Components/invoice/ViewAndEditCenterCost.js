import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Button,
  Input,
  Spinner,
} from "reactstrap";
import { useDispatch } from "react-redux";
import { updateBillItem } from "../../../../../store/actions";
import {
  addCentersToProcedure,
  deleteCenterInProcedure,
  getProceduresByid,
} from "../../../../../helpers/backend_helper";
import { toast } from "react-toastify";
import CentersModal from "./CentersModal";

const ViewAndEditCenterCost = ({ isOpen, toggle, data }) => {
  const dispatch = useDispatch();

  const [editingId, setEditingId] = useState(null);
  const [costValue, setCostValue] = useState("");
  const [localCenters, setLocalCenters] = useState([]);
  const [prodata, setproData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCentersModal, setShowCentersModal] = useState(false);
  const [selectedCenters, setSelectedCenters] = useState([]);

  const loadProcedures = async () => {
    setLoading(true);
    try {
      const response = await getProceduresByid(data._id);
      console.log("response", response);
      setproData(response?.data);
    } catch (error) {
      console.log("Error Occured");
      toast.error("Error Loading Data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProcedures();
  }, []);

  console.log("prodata", prodata);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && data?.centers && localCenters.length === 0) {
      const snapshot = data.centers.map((c) => ({
        ...c,
        persistentTitle: c.center?.title || c.centerTitle || "N/A",
      }));
      setLocalCenters(snapshot);
    }

    if (!isOpen) {
      setLocalCenters([]);
    }
  }, [isOpen, data]);

  const handleEdit = (row) => {
    setEditingId(row._id);
    setCostValue(row.cost);
  };

  const handleCancel = () => {
    setEditingId(null);
    setCostValue("");
  };

  const handleSave = async (row) => {
    const payload = {
      proId: data?._id,
      centerId: row?.center?._id,
      cost: costValue,
    };

    try {
      await dispatch(updateBillItem(payload)).unwrap();

      setEditingId(null);
      loadProcedures();
      // toggle();
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Error Updating Data");
    }
  };

  const handleDelete = async (row) => {
    // console.log("row", row);
    setLoading(true);
    try {
      const payload = {
        proId: data?._id,
        centerId: row?.center?._id,
      };
      const response = await deleteCenterInProcedure({ payload });
      // console.log("response", response);
      toast.success(response?.message || "Center Deleted Successfully");
      loadProcedures();
    } catch (error) {
      console.log("Error", error);
      toast.error("Error Deleting Center");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCenters = async ({ centerIds, cost }) => {
    try {
      const response = await addCentersToProcedure({
        proId: data?._id,
        centerIds,
        cost,
      });

      toast.success(response?.data?.message || "Centers added successfully");
      setShowCentersModal(false);
      loadProcedures();
    } catch (err) {
      toast.error(err?.message || "Failed to add centers");
      throw err;
    }
  };

  return (
    <>
      <div
        className={`modal-backdrop bg-dark ${isOpen ? "show" : ""}`}
        style={{
          opacity: isOpen ? 0.12 : 0,
          transition: "opacity 300ms ease",
          pointerEvents: isOpen ? "auto" : "none",
          zIndex: 1040,
        }}
      />

      <Modal
        isOpen={isOpen}
        toggle={toggle}
        centered
        size="lg"
        backdrop={true}
      >
        <ModalHeader toggle={toggle}>Centers</ModalHeader>
        <ModalBody style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Add / Assign Centers</h6>

              <Button
                size="sm"
                color="primary"
                outline
                onClick={() => setShowCentersModal(true)}
              >
                Add Centers
              </Button>
            </div>

            <CentersModal
              isOpen={showCentersModal}
              toggle={() => setShowCentersModal(false)}
              onSave={handleSaveCenters}
            />
          </>

          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "200px" }}
            >
              <Spinner color="primary" />
            </div>
          ) : !prodata?.center || prodata.center.length === 0 ? (
            <div
              className="d-flex justify-content-center align-items-center text-muted"
              style={{ minHeight: "200px" }}
            >
              No centers found
            </div>
          ) : (
            <Table bordered responsive className="align-middle mb-0">
              <thead className="table-light sticky-top">
                <tr>
                  <th>Center</th>
                  <th style={{ width: "150px" }}>Cost</th>
                  <th style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...(prodata?.center || [])].reverse().map((row) => (
                  <tr key={row._id}>
                    {/* Improved title logic */}
                    <td>{row?.center?.title}</td>

                    <td>
                      {editingId === row._id ? (
                        <Input
                          bsSize="sm"
                          type="number"
                          value={costValue}
                          onChange={(e) => setCostValue(e.target.value)}
                        />
                      ) : (
                        row.cost
                      )}
                    </td>
                    <td>
                      {editingId === row._id ? (
                        <>
                          <Button
                            size="sm"
                            color="success"
                            className="me-2"
                            onClick={() => handleSave(row)}
                          >
                            <i className="ri-check-line"></i>
                          </Button>
                          <Button
                            size="sm"
                            color="secondary"
                            onClick={handleCancel}
                          >
                            <i className="ri-close-line"></i>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            color="info"
                            className="me-2"
                            onClick={() => handleEdit(row)}
                          >
                            <i className="ri-edit-2-line"></i>
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            onClick={() => handleDelete(row)}
                          >
                            <i className="ri-delete-bin-6-line"></i>
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ViewAndEditCenterCost;
