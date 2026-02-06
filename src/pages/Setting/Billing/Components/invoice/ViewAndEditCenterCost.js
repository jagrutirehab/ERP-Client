// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Table,
//   Button,
//   Input,
//   Spinner,
// } from "reactstrap";
// import { useDispatch } from "react-redux";
// import { updateBillItem } from "../../../../../store/actions";
// import {
//   addCentersToProcedure,
//   deleteCenterInProcedure,
//   editCenterCosts,
//   getProceduresByid,
// } from "../../../../../helpers/backend_helper";
// import { toast } from "react-toastify";
// import CentersModal from "./CentersModal";

// const ViewAndEditCenterCost = ({ isOpen, toggle, data }) => {
//   const dispatch = useDispatch();

//   const [editingId, setEditingId] = useState(null);
//   const [costValues, setCostValues] = useState({});
//   const [prodata, setproData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showCentersModal, setShowCentersModal] = useState(false);

//   const loadProcedures = async () => {
//     if (!data?._id) return;
//     setLoading(true);
//     try {
//       const response = await getProceduresByid(data._id);
//       setproData(response?.data || null);
//     } catch (error) {
//       console.error("Error Loading Data", error);
//       toast.error("Error Loading Data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isOpen) {
//       loadProcedures();
//     } else {
//       setEditingId(null);
//       setCostValues({});
//     }
//   }, [isOpen, data?._id]);

//   useEffect(() => {
//     document.body.style.overflow = isOpen ? "hidden" : "auto";
//     return () => (document.body.style.overflow = "auto");
//   }, [isOpen]);

//   const handleEdit = (row) => {
//     if (editingId && editingId !== row._id) return;

//     setEditingId(row.center._id);

//     const initialValues = {};
//     if (row.prices && Array.isArray(row.prices)) {
//       row.prices.forEach((p) => {
//         initialValues[p.unit] = p.price;
//       });
//     }

//     setCostValues({
//       [row._id]: initialValues,
//     });
//   };

//   const handleCancel = () => {
//     setEditingId(null);
//     setCostValues({});
//   };

//   const handleSave = async (row) => {
//     const payload = {
//       proId: prodata?._id,
//       centerId: row?.center?._id,
//     };

//     const rowCosts = costValues[row.center._id] || {};

//     Object.keys(rowCosts).forEach((unitKey) => {
//       payload[`${unitKey}Cost`] = rowCosts[unitKey];
//     });

//     try {
//       await editCenterCosts(payload)
//       toast.success("Costs updated successfully");
//       setEditingId(null);
//       setCostValues({});
//       loadProcedures();
//     } catch (err) {
//       console.error("Update failed", err);
//       toast.error("Error Updating Data");
//     }
//   };

//   const handleDelete = async (row) => {
//     if (!window.confirm("Are you sure you want to delete this center mapping?"))
//       return;

//     setLoading(true);
//     try {
//       const payload = {
//         proId: prodata?._id,
//         centerId: row?.center?._id,
//       };
//       const response = await deleteCenterInProcedure({ payload });
//       toast.success(response?.message || "Center Deleted Successfully");
//       loadProcedures();
//     } catch (error) {
//       console.error("Error", error);
//       toast.error("Error Deleting Center");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveCenters = async ({ centerIds, cost }) => {
//     try {
//       const response = await addCentersToProcedure({
//         proId: prodata?._id,
//         centerIds,
//         cost,
//       });

//       toast.success(response?.data?.message || "Centers added successfully");
//       setShowCentersModal(false);
//       loadProcedures();
//     } catch (err) {
//       toast.error(err?.message || "Failed to add centers");
//       throw err;
//     }
//   };

//   const priceColumns = prodata?.center?.[0]?.prices || [];

//   return (
//     <>
//       <div
//         className={`modal-backdrop bg-dark ${isOpen ? "show" : ""}`}
//         style={{
//           opacity: isOpen ? 0.12 : 0,
//           transition: "opacity 300ms ease",
//           pointerEvents: isOpen ? "auto" : "none",
//           zIndex: 1040,
//         }}
//       />

//       <Modal isOpen={isOpen} toggle={toggle} centered size="lg" backdrop={true}>
//         <ModalHeader toggle={toggle}>View & Edit Center Costs</ModalHeader>

//         <ModalBody style={{ maxHeight: "60vh", overflowY: "auto" }}>
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h6 className="mb-0">Centers & Category Units</h6>
//             <Button
//               size="sm"
//               color="primary"
//               outline
//               onClick={() => setShowCentersModal(true)}
//             >
//               Add Centers
//             </Button>
//           </div>

//           <CentersModal
//             isOpen={showCentersModal}
//             toggle={() => setShowCentersModal(false)}
//             onSave={handleSaveCenters}
//             proData={data}
//           />

//           {loading && !prodata ? (
//             <div
//               className="d-flex justify-content-center align-items-center"
//               style={{ minHeight: "200px" }}
//             >
//               <Spinner color="primary" />
//             </div>
//           ) : !prodata?.center || prodata.center.length === 0 ? (
//             <div
//               className="d-flex justify-content-center align-items-center text-muted"
//               style={{ minHeight: "200px" }}
//             >
//               No centers mapped to this procedure.
//             </div>
//           ) : (
//             <Table
//               bordered
//               responsive
//               className="align-middle mb-0 text-center"
//             >
//               <thead className="table-light sticky-top">
//                 <tr>
//                   <th className="text-start">Center</th>
//                   {priceColumns.map((p, idx) => (
//                     <th key={idx} style={{ width: "130px" }}>
//                       {p.unit.charAt(0).toUpperCase() + p.unit.slice(1)} Cost
//                     </th>
//                   ))}
//                   <th style={{ width: "120px" }}>Actions</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {[...prodata.center].reverse().map((row) => (
//                   <tr key={row.center._id}>
//                     <td className="text-start">
//                       <strong>{row?.center?.title || "N/A"}</strong>
//                     </td>

//                     {priceColumns.map((col, idx) => {
//                       const currentPriceObj = row.prices?.find(
//                         (p) => p.unit === col.unit,
//                       );

//                       return (
//                         <td key={idx}>
//                           {editingId === row.center._id ? (
//                             <Input
//                               bsSize="sm"
//                               type="number"
//                               placeholder={`${col.unit} cost`}
//                               value={costValues[row._id]?.[col.unit] ?? ""}
//                               onChange={(e) =>
//                                 setCostValues((prev) => ({
//                                   ...prev,
//                                   [row._id]: {
//                                     ...prev[row._id],
//                                     [col.unit]: e.target.value,
//                                   },
//                                 }))
//                               }
//                             />
//                           ) : (
//                             <span className="text-primary fw-medium">
//                               {currentPriceObj?.price || 0}
//                             </span>
//                           )}
//                         </td>
//                       );
//                     })}

//                     <td>
//                       {editingId === row.center._id ? (
//                         <div className="d-flex justify-content-center gap-2">
//                           <Button
//                             size="sm"
//                             color="success"
//                             onClick={() => handleSave(row)}
//                           >
//                             <i className="ri-check-line"></i>
//                           </Button>
//                           <Button
//                             size="sm"
//                             color="secondary"
//                             onClick={handleCancel}
//                           >
//                             <i className="ri-close-line"></i>
//                           </Button>
//                         </div>
//                       ) : (
//                         <div className="d-flex justify-content-center gap-2">
//                           <Button
//                             size="sm"
//                             color="info"
//                             outline
//                             onClick={() => handleEdit(row)}
//                           >
//                             <i className="ri-edit-2-line"></i>
//                           </Button>
//                           <Button
//                             size="sm"
//                             color="danger"
//                             outline
//                             onClick={() => handleDelete(row)}
//                           >
//                             <i className="ri-delete-bin-6-line"></i>
//                           </Button>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           )}
//         </ModalBody>

//         <ModalFooter>
//           <Button color="light" onClick={toggle}>
//             Close
//           </Button>
//         </ModalFooter>
//       </Modal>
//     </>
//   );
// };

// export default ViewAndEditCenterCost;

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
import {
  addCentersToProcedure,
  deleteCenterInProcedure,
  editCenterCosts,
  getProceduresByid,
} from "../../../../../helpers/backend_helper";
import { toast } from "react-toastify";
import CentersModal from "./CentersModal";

const ViewAndEditCenterCost = ({ isOpen, toggle, data }) => {
  const [editingId, setEditingId] = useState(null);
  const [costValues, setCostValues] = useState({});
  const [prodata, setproData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCentersModal, setShowCentersModal] = useState(false);

  const loadProcedures = async () => {
    if (!data?._id) return;
    setLoading(true);
    try {
      const response = await getProceduresByid(data._id);
      setproData(response?.data || null);
    } catch (error) {
      toast.error("Error Loading Data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadProcedures();
    } else {
      setEditingId(null);
      setCostValues({});
    }
  }, [isOpen, data?._id]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  const handleEdit = (row) => {
    setEditingId(row.center._id);

    const initialValues = {};
    row.prices?.forEach((p) => {
      initialValues[p.unit] = p.price;
    });

    setCostValues({
      [row.center._id]: initialValues,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setCostValues({});
  };

  const handleSave = async (row) => {
    const payload = {
      proId: prodata._id,
      centerId: row.center._id,
      costs: costValues[row.center._id],
    };

    try {
      await editCenterCosts(payload);
      toast.success("Center costs updated successfully");
      setEditingId(null);
      setCostValues({});
      loadProcedures();
    } catch (err) {
      console.error(err);
      toast.error("Error Updating Data");
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Are you sure you want to delete this center mapping?"))
      return;

    setLoading(true);
    try {
      const payload = {
        proId: prodata._id,
        centerId: row.center._id,
      };
      await deleteCenterInProcedure({ payload });
      toast.success("Center Deleted Successfully");
      loadProcedures();
    } catch (error) {
      toast.error("Error Deleting Center");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCenters = async (payload) => {
    console.log("payload from handle save centers function", payload);
    try {
      await addCentersToProcedure(payload);

      toast.success("Centers added successfully");
      setShowCentersModal(false);
      loadProcedures();
    } catch (err) {
      toast.error("Failed to add centers");
    }
  };

  const priceColumns = prodata?.center?.[0]?.prices || [];

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
        <ModalHeader toggle={toggle}>View & Edit Center Costs</ModalHeader>

        <ModalBody style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <div className="d-flex justify-content-between mb-3">
            <h6>Centers & Category Units</h6>
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
            proData={data}
          />

          {loading ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : (
            <Table bordered responsive className="text-center">
              <thead>
                <tr>
                  <th className="text-start">Center</th>
                  {priceColumns.map((p) => (
                    <th key={p.unit}>{p.unit.toUpperCase()} Cost</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {prodata?.center
                  ?.slice()
                  .reverse()
                  .map((row, idx) => {
                    const centerId = row?.center?._id || null;
                    const centerTitle = row?.center?.title || null;
                    const hasCenter = Boolean(centerId);

                    return (
                      <tr key={idx}>
                        {/* CENTER NAME */}
                        <td className="text-start">
                          {hasCenter ? (
                            <strong>{centerTitle}</strong>
                          ) : (
                            <strong className="text-danger">
                              No center present…
                            </strong>
                          )}
                        </td>

                        {/* PRICES */}
                        {priceColumns.map((col) => (
                          <td key={col.unit}>
                            {editingId === centerId && hasCenter ? (
                              <Input
                                type="number"
                                bsSize="sm"
                                value={costValues?.[centerId]?.[col.unit] ?? ""}
                                onChange={(e) =>
                                  setCostValues((prev) => ({
                                    ...prev,
                                    [centerId]: {
                                      ...prev?.[centerId],
                                      [col.unit]: e.target.value,
                                    },
                                  }))
                                }
                              />
                            ) : (
                              <span className="text-primary">
                                {row?.prices?.find((p) => p.unit === col.unit)
                                  ?.price || 0}
                              </span>
                            )}
                          </td>
                        ))}

                        {/* ACTIONS */}
                        <td>
                          {editingId === centerId && hasCenter ? (
                            <>
                              <Button
                                size="sm"
                                color="success"
                                onClick={() => handleSave(row)}
                              >
                                ✓
                              </Button>{" "}
                              <Button
                                size="sm"
                                color="secondary"
                                onClick={handleCancel}
                              >
                                ✕
                              </Button>
                            </>
                          ) : (
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                size="sm"
                                color="info"
                                outline
                                disabled={!hasCenter}
                                title={!hasCenter ? "Center missing" : "Edit"}
                                onClick={() => handleEdit(row)}
                              >
                                <i className="ri-edit-2-line"></i>
                              </Button>

                              <Button
                                size="sm"
                                color="danger"
                                outline
                                disabled={!hasCenter}
                                title={!hasCenter ? "Center missing" : "Delete"}
                                onClick={() => hasCenter && handleDelete(row)}
                              >
                                <i className="ri-delete-bin-6-line"></i>
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="light" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ViewAndEditCenterCost;

{
  /* <tbody>
                {prodata?.center
                  ?.slice()
                  .reverse()
                  .map((row, idx) => {
                    const centerId = row?.center?._id || `deleted-${idx}`;
                    const isDeleted = !row?.center;

                    return (
                      <tr
                        key={centerId}
                        className={isDeleted ? "table-warning" : ""}
                      >
                        <td className="text-start">
                          <strong>
                            {row.center?.title || "Center Deleted"}
                          </strong>
                        </td>

                        {priceColumns.map((col) => (
                          <td key={col.unit}>
                            {editingId === centerId && !isDeleted ? (
                              <Input
                                type="number"
                                bsSize="sm"
                                disabled={isDeleted}
                                value={costValues[centerId]?.[col.unit] ?? ""}
                                onChange={(e) =>
                                  setCostValues((prev) => ({
                                    ...prev,
                                    [centerId]: {
                                      ...prev[centerId],
                                      [col.unit]: e.target.value,
                                    },
                                  }))
                                }
                              />
                            ) : (
                              <span className="text-primary">
                                {row.prices?.find((p) => p.unit === col.unit)
                                  ?.price ?? 0}
                              </span>
                            )}
                          </td>
                        ))}

                        <td>
                          {isDeleted ? (
                            <span className="text-muted">N/A</span>
                          ) : editingId === centerId ? (
                            <>
                              <Button
                                size="sm"
                                color="success"
                                onClick={() => handleSave(row)}
                              >
                                ✓
                              </Button>{" "}
                              <Button
                                size="sm"
                                color="secondary"
                                onClick={handleCancel}
                              >
                                ✕
                              </Button>
                            </>
                          ) : (
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                size="sm"
                                color="info"
                                outline
                                onClick={() => handleEdit(row)}
                              >
                                <i className="ri-edit-2-line"></i>
                              </Button>

                              <Button
                                size="sm"
                                color="danger"
                                outline
                                onClick={() => handleDelete(row)}
                              >
                                <i className="ri-delete-bin-6-line"></i>
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody> */
}
