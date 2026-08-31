import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Badge, Card, CardBody, CardHeader } from "reactstrap";
import moment from "moment";
import { toast } from "react-toastify";
import {
  getCurrentMedicines,
  updateMedicineEntry,
} from "../../../helpers/backend_helper";
import { getCurrentUserId, drugIdentity } from "../../../helpers/currentMedicines";
import { capitalizeWords } from "../../../utils/toCapitalize";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { useDispatch } from "react-redux";
import { markChartsStale } from "../../../store/features/chart/chartSlice";
import {
  getMedicineFrequencyLabel,
  formatDosage,
} from "../../../helpers/prescriptionFrequency";

const CurrentMedicinesPanel = ({
  patientId,
  type = "IPD",
  existingMedicines,
  onAddMedicine,
}) => {
  const currentUserId = getCurrentUserId();
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [pendingStop, setPendingStop] = useState(null);
  const [stopping, setStopping] = useState(false);

  const load = useCallback(() => {
    if (!patientId) return Promise.resolve();
    return getCurrentMedicines(patientId, type)
      .then((res) => setRows(res?.payload || []))
      .catch(() => setRows([]));
  }, [patientId, type]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDiscontinue = async () => {
    if (!pendingStop) return;
    setStopping(true);
    try {
      await updateMedicineEntry(
        pendingStop.prescriptionId,
        pendingStop.medicine._id,
        { discontinue: true },
      );
      toast.success("Medicine discontinued");
      setPendingStop(null);
      load();
      // The IPD timeline caches its charts — mark them stale so the medicine
      // shows as discontinued there without a full page reload.
      dispatch(markChartsStale());
    } catch (err) {
      toast.error(err?.message || "Failed to discontinue medicine");
    } finally {
      setStopping(false);
    }
  };

  const pendingDrug = pendingStop?.medicine?.medicine;
  const pendingName = pendingDrug
    ? [pendingDrug.type, pendingDrug.name, pendingDrug.strength]
      .filter(Boolean)
      .join(" ")
    : "";

  if (!rows.length) return null;

  const isAlreadyAdded = (entry) =>
    (existingMedicines || []).some(
      (m) => drugIdentity(m.medicine) === drugIdentity(entry.medicine),
    );

  return (
    <Card className="mb-4">
      <CardHeader className="mb-0">
        <h6 className="mb-1">Current Medicines</h6>
        <small className="text-muted">
          Everything the patient is currently on. These keep running on their
          own — add one here only to reissue it under you with a fresh date
          range.
        </small>
      </CardHeader>
      <CardBody className="p-0">
        <div className="table-responsive">
          <table className="table table-sm mb-0 align-middle">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage &amp; Frequency</th>
                <th>Intake</th>
                <th>Duration</th>
                <th>Frequency</th>
                <th>From</th>
                <th>To</th>
                <th>Prescribed by</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const entry = row.medicine;
                const isOwn =
                  String(entry.prescribedBy) === String(currentUserId);
                const freq = entry.dosageAndFrequency || {};
                return (
                  <tr key={entry._id}>
                    <td className="text-uppercase">
                      {entry.medicine?.type} {entry.medicine?.name}{" "}
                      {entry.medicine?.strength}
                    </td>
                    <td>
                      {formatDosage(freq.morning, freq.unit) || 0}-
                      {formatDosage(freq.evening, freq.unit) || 0}-
                      {formatDosage(freq.night, freq.unit) || 0}
                    </td>
                    <td>
                      {entry.instructions ? `${entry.instructions}, ` : ""}
                      {entry.intake || ""}
                    </td>
                    <td>
                      {entry.duration} {entry.unit}
                    </td>
                    <td>{getMedicineFrequencyLabel(entry)}</td>
                    <td>
                      {entry.startDate
                        ? moment(entry.startDate).format("DD MMM, YYYY")
                        : "-"}
                    </td>
                    <td>
                      {entry.endDate
                        ? moment(entry.endDate).format("DD MMM, YYYY")
                        : "Ongoing"}
                    </td>
                    <td>
                      {/* Only your own rows get a badge — everyone else's
                          prescriber is shown as plain text. */}
                      {isOwn ? (
                        <Badge color="success">You</Badge>
                      ) : (
                        <span>
                          {capitalizeWords(row.prescribedByUser?.name) || "-"}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* Both actions are open to every doctor: reissuing a
                            colleague's medicine writes a new row owned by you
                            and leaves their order untouched, and stopping one
                            is recorded against whoever did it. */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary text-nowrap"
                          disabled={isAlreadyAdded(entry)}
                          onClick={() => onAddMedicine(entry)}
                        >
                          {isAlreadyAdded(entry) ? "Added" : "Add to Rx"}
                        </button>
                        <CheckPermission permission={"edit"} subAccess="Charting">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger text-nowrap"
                            onClick={() => setPendingStop(row)}
                          >
                            Discontinue
                          </button>
                        </CheckPermission>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>

      <ConfirmationModal
        isOpen={!!pendingStop}
        toggle={() => !stopping && setPendingStop(null)}
        title="Discontinue medicine?"
        message={`${pendingName} will stop immediately, even if you don't save this prescription. This is recorded against you. Only this order is stopped. If the same medicine is running on another prescription, stop it there too.`}
        confirmText={stopping ? "Discontinuing..." : "Discontinue"}
        cancelText="Cancel"
        confirmColor="danger"
        onConfirm={confirmDiscontinue}
        onCancel={() => setPendingStop(null)}
      />
    </Card>
  );
};

CurrentMedicinesPanel.propTypes = {
  patientId: PropTypes.string,
  type: PropTypes.oneOf(["IPD", "OPD"]),
  existingMedicines: PropTypes.array,
  onAddMedicine: PropTypes.func.isRequired,
};

export default CurrentMedicinesPanel;
