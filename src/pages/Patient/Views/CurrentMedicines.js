import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Row } from "reactstrap";
import { toast } from "react-toastify";
import GeneralCard from "./Components/GeneralCard";
import MedicineChart from "../Tables/MedicineChart";
import {
  getCurrentMedicines,
  updateMedicineEntry,
} from "../../../helpers/backend_helper";
import { getCurrentUserId } from "../../../helpers/currentMedicines";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";
import { useDispatch } from "react-redux";
import { markChartsStale } from "../../../store/features/chart/chartSlice";

// Everything the patient is currently on, across all prescriptions of the
// running admission — medicines that were discontinued or whose To date has
// passed are already filtered out server-side. A doctor can stop a medicine
// they prescribed from here; everyone else's rows are read-only.
const CurrentMedicines = ({ patient }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingStop, setPendingStop] = useState(null);
  const [stopping, setStopping] = useState(false);
  const currentUserId = getCurrentUserId();
  const dispatch = useDispatch();

  const load = useCallback(() => {
    if (!patient?._id) return Promise.resolve();
    setLoading(true);
    return getCurrentMedicines(patient._id)
      .then((res) => setRows(res?.payload || []))
      .catch((err) => {
        toast.error(err?.message || "Failed to load current medicines");
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [patient?._id]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDiscontinue = async () => {
    if (!pendingStop) return;
    setStopping(true);
    try {
      await updateMedicineEntry(pendingStop.prescriptionId, pendingStop._id, {
        discontinue: true,
      });
      toast.success("Medicine discontinued");
      setPendingStop(null);
      load();
      // The IPD timeline caches its charts, so tell it the copy it holds is
      // out of date — otherwise the medicine keeps showing as running there
      // until a full page reload.
      dispatch(markChartsStale());
    } catch (err) {
      toast.error(err?.message || "Failed to discontinue medicine");
    } finally {
      setStopping(false);
    }
  };

  const medicines = rows.map((row) => ({
    ...row.medicine,
    prescriptionId: row.prescriptionId,
    chartId: row.chartId,
    prescribedByUser: row.prescribedByUser,
  }));

  const pendingName = pendingStop
    ? [
      pendingStop.medicine?.type,
      pendingStop.medicine?.name,
      pendingStop.medicine?.strength,
    ]
      .filter(Boolean)
      .join(" ")
    : "";

  return (
    <Row className="timeline-right" style={{ rowGap: "2rem" }}>
      <GeneralCard data="Current Medicines">
        {loading ? (
          <p className="px-2">Loading...</p>
        ) : medicines.length > 0 ? (
          <MedicineChart
            medicines={medicines}
            currentUserId={currentUserId}
            onDiscontinue={setPendingStop}
            showDates
            showOwner
          />
        ) : (
          <p style={{ color: "#888", fontStyle: "italic" }} className="px-2">
            No medicines currently applicable to this patient.
          </p>
        )}
      </GeneralCard>

      <ConfirmationModal
        isOpen={!!pendingStop}
        toggle={() => !stopping && setPendingStop(null)}
        title="Discontinue medicine?"
        message={`${pendingName} will stop immediately, and is recorded against you. Only this order is stopped. If the same medicine is running on another prescription, stop it there too.`}
        confirmText={stopping ? "Discontinuing..." : "Discontinue"}
        cancelText="Cancel"
        confirmColor="danger"
        onConfirm={confirmDiscontinue}
        onCancel={() => setPendingStop(null)}
      />
    </Row>
  );
};

CurrentMedicines.propTypes = {
  patient: PropTypes.object,
};

export default CurrentMedicines;
