import React, { useEffect, useState } from "react";
import { Row } from "reactstrap";
import { toast } from "react-toastify";
import GeneralCard from "../../Patient/Views/Components/GeneralCard";
import MedicineChart from "../../Patient/Tables/MedicineChart";
import Placeholder from "../../Patient/Views/Components/Placeholder";
import { getCurrentMedicines } from "../../../helpers/backend_helper";
import { useParams } from "react-router-dom";

const Medications = () => {
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || id === "*") return;

    let cancelled = false;
    setLoading(true);
    getCurrentMedicines(id)
      .then((res) => {
        if (!cancelled) setRows(res?.payload || []);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(err?.message || "Failed to load current medicines");
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const medicines = rows.map((row) => ({
    ...row.medicine,
    prescriptionId: row.prescriptionId,
    chartId: row.chartId,
    prescribedByUser: row.prescribedByUser,
  }));

  return (
    <div>
      <Row className="timeline-right" style={{ rowGap: "2rem" }}>
        <GeneralCard data="Medications">
          {loading ? (
            <Placeholder />
          ) : (
            <div
              style={{
                paddingTop: "2rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
            >
              {medicines.length > 0 ? (
                <MedicineChart medicines={medicines} showDates showOwner />
              ) : (
                <p style={{ color: "#888", fontStyle: "italic" }}>
                  No medication data available
                </p>
              )}
            </div>
          )}
        </GeneralCard>
      </Row>
    </div>
  );
};

export default Medications;
