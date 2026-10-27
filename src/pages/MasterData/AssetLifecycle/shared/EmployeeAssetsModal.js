import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
  Table,
} from "reactstrap";
import { toast } from "react-toastify";
import {
  getAssetsByEmployee,
  returnFixedAsset,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";

const CONDITIONS = [
  { value: "good", label: "Good" },
  { value: "needs_repair", label: "Needs repair" },
  { value: "damaged", label: "Damaged (write-off)" },
  { value: "lost", label: "Lost (write-off)" },
];

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

/**
 * Lists the company assets an employee still holds and lets the user take each one back.
 * onChange(remainingCount) fires after every load / return.
 */
const EmployeeAssetsModal = ({
  isOpen,
  toggle,
  employeeId,
  employeeName,
  canReturn = true,
  onChange,
}) => {
  const handleAuthError = useAuthError();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState({});
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    if (!employeeId) return;
    setLoading(true);
    setLoadError("");
    try {
      const res = await getAssetsByEmployee(employeeId);
      const list = res?.data || [];
      setAssets(list);
      onChange?.(list.length);
    } catch (error) {
      if (!handleAuthError(error)) {
        setLoadError(error?.response?.data?.message || error?.message || "Couldn't load assets.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) load();
    else setForm({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, employeeId]);

  const setField = (id, key, value) =>
    setForm((f) => ({ ...f, [id]: { ...f[id], [key]: value } }));

  const handleReturn = async (asset) => {
    const f = form[asset._id] || {};
    setBusyId(asset._id);
    try {
      await returnFixedAsset(asset._id, {
        condition: f.condition || "good",
        remarks: f.remarks || "",
      });
      toast.success(`${asset.assetTag || asset.assetName} received`);
      await load();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message || "Couldn't mark as returned.",
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="xl">
      <ModalHeader toggle={toggle}>
        Company assets with {employeeName || "employee"}
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center py-4">
            <Spinner className="text-primary" />
          </div>
        ) : loadError ? (
          <div className="p-3 d-flex align-items-center justify-content-between" style={{ background: "#fef3f2", border: "1px solid #fecdca", borderRadius: 10 }}>
            <span className="text-danger">{loadError}</span>
            <Button size="sm" color="light" onClick={load}>Try again</Button>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center text-success py-4">
            <p className="mb-0">
              No assets pending. Everything has been returned.
            </p>
          </div>
        ) : (
          <>
            <p className="text-muted">
              {assets.length} asset(s) still with this employee. Collect each
              one and mark it as received. Damaged or lost items raise a write-off
              request automatically.
            </p>
            <div className="table-responsive">
              <Table className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>Asset</th>
                    <th>Serial / IMEI / SIM</th>
                    <th>Given on</th>
                    {canReturn && <th style={{ minWidth: 150 }}>Condition</th>}
                    {canReturn && <th style={{ minWidth: 180 }}>Remarks</th>}
                    {canReturn && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr key={a._id}>
                      <td>{a.assetTag}</td>
                      <td>
                        {a.assetName}
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {a.category}
                        </div>
                      </td>
                      <td>{a.serialNumber || "—"}</td>
                      <td>{dateFmt(a.assignedAt)}</td>
                      {canReturn && (
                        <td>
                          <Input
                            type="select"
                            bsSize="sm"
                            value={form[a._id]?.condition || "good"}
                            onChange={(e) =>
                              setField(a._id, "condition", e.target.value)
                            }
                          >
                            {CONDITIONS.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </Input>
                        </td>
                      )}
                      {canReturn && (
                        <td>
                          <Input
                            bsSize="sm"
                            placeholder="Optional"
                            value={form[a._id]?.remarks || ""}
                            onChange={(e) =>
                              setField(a._id, "remarks", e.target.value)
                            }
                          />
                        </td>
                      )}
                      {canReturn && (
                        <td className="text-end">
                          <Button
                            size="sm"
                            color="success"
                            disabled={busyId === a._id}
                            onClick={() => handleReturn(a)}
                          >
                            {busyId === a._id ? (
                              <Spinner size="sm" />
                            ) : (
                              "Receive"
                            )}
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EmployeeAssetsModal;
