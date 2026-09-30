import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Row, Button } from "reactstrap";
import { toast } from "react-toastify";
import GeneralCard from "./Components/GeneralCard";
import MedicineChart from "../Tables/MedicineChart";
import {
  getCurrentMedicines,
  updateMedicineEntry,
} from "../../../helpers/backend_helper";
import { getCurrentUserId } from "../../../helpers/currentMedicines";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";
import { useDispatch, useSelector } from "react-redux";
import { markChartsStale } from "../../../store/features/chart/chartSlice";
import { togglePrint } from "../../../store/actions";
import { PRESCRIPTION } from "../../../Components/constants/patient";


const CurrentMedicines = ({ patient }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingStop, setPendingStop] = useState(null);
  const [stopping, setStopping] = useState(false);
  const currentUserId = getCurrentUserId();
  const dispatch = useDispatch();
  const doctor = useSelector((state) => state.User.user);

  const medicineType = patient?.isAdmit ? "IPD" : "OPD";

  const load = useCallback(() => {
    if (!patient?._id) return Promise.resolve();
    setLoading(true);
    return getCurrentMedicines(patient._id, medicineType)
      .then((res) => setRows(res?.payload || []))
      .catch((err) => {
        toast.error(err?.message || "Failed to load current medicines");
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [patient?._id, medicineType]);

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

  const handlePrint = () => {
    if (!medicines.length) return;
    const now = new Date();
    const printChart = {
      _id: `current-medicines-${patient?._id}`,
      chart: PRESCRIPTION,
      type: medicineType,
      date: now,
      createdAt: now,
      author: doctor,
      center: patient?.center,
      // Marks this as the Current Medicines print, not a regular
      // prescription — shows From/To + Prescribed By per medicine, drops the
      // single-doctor signature block (rows can span several prescribers),
      // and labels the page so it can't be mistaken for a real prescription.
      isCurrentMedicinesPrint: true,
      prescription: { medicines },
    };
    dispatch(
      togglePrint({
        data: printChart,
        modal: true,
        patient,
        center: patient?.center,
        doctor,
      }),
    );
  };

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
      <GeneralCard data={`${medicineType} Current Medicines`}>
        <div className="d-flex justify-content-end w-100">
          <Button
            color="primary"
            size="sm"
            disabled={!medicines.length}
            onClick={handlePrint}
            className="text-white"
          >
            Print
          </Button>
        </div>
        <div className="mt-3 w-100">
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
        </div>
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
