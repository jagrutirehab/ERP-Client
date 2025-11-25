import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import MedicineChart from "../../../Patient/Tables/MedicineChart";
import Divider from "../../../../Components/Common/Divider";
import CheckPermission from "../../../../Components/HOC/CheckPermission";

const PrescriptionForm = ({ data, startDate, onDispenseChanges, onRemarks, roles }) => {
    const [medicines, setMedicines] = useState(data?.medicines || []);
    const [updatedDispenseData, setUpdatedDispenseData] = useState([]);
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        const hasShortage = medicines.some(
            m => Number(m.dispensedCount ?? m.totalQuantity) > (m.availableStock ?? 0)
        );

        const hasZero = medicines.some(
            m => Number(m.dispensedCount ?? m.totalQuantity) === 0
        );
        onDispenseChanges({
            hasShortage,
            hasZero,
            updated: updatedDispenseData
        });
    }, [updatedDispenseData]);

    useEffect(() => {
        onRemarks(remarks);
    }, [remarks]);

    const handleDispensedCountChange = (rowId, value) => {
        const num = Number(value);
        console.log(medicines)
        setMedicines(prev =>
            prev.map(m =>
                m._id === rowId
                    ? { ...m, dispensedCount: num }
                    : m
            )
        );

        const selectedMed = medicines.find(m => m._id === rowId);
        const medId = selectedMed?.medicine?._id;

        setUpdatedDispenseData(prev => {
            const filtered = prev.filter(item => item.medicineId !== medId);
            return [...filtered, { medicineId: medId, dispensedCount: num }];
        });
    };


    return (
        <React.Fragment>
            <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div></div>
                    {startDate && (
                        <i className="mb-0 text-muted" style={{ fontSize: "13px" }}>
                            {moment(startDate).format("MMM D, YYYY")}
                        </i>
                    )}
                </div>
                {data?.drNotes && (
                    <div className="d-flex justify-content-between mb-2">
                        <p className="fs-xs-9 font-size-14 mb-0">
                            <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 font-size-20 me-3">
                                Dr Notes:-
                            </span>
                            <span className="fs-xs-9 fs-md-12">
                                {data.drNotes}
                            </span>
                        </p>
                    </div>
                )}
                {data?.diagnosis && (
                    <div className="d-flex justify-content-between mb-2">
                        <p className="fs-xs-9 font-size-14 mb-0">
                            <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 font-size-20 me-3">
                                Diagnosis:-
                            </span>
                            <span className="fs-xs-9 fs-md-12">
                                {data.diagnosis}
                            </span>
                        </p>
                    </div>
                )}
                {data?.observation && (
                    <div className="d-flex justify-content-between mb-2">
                        <p className="fs-xs-9 font-size-14 mb-0">
                            <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 font-size-20 me-3">
                                Observation:-
                            </span>
                            <span className="fs-xs-9 fs-md-12">
                                {data.observation}
                            </span>
                        </p>
                    </div>
                )}
                {data?.complaints && (
                    <div className="d-flex justify-content-between mb-2">
                        <p className="fs-xs-9 font-size-14 mb-0">
                            <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 font-size-20 me-3">
                                Complaints:-
                            </span>
                            <span className="fs-xs-9 fs-md-12">
                                {data.complaints}
                            </span>
                        </p>
                    </div>
                )}
                <div className="d-block text-center mt-3 mb-3">
                    <Divider />
                </div>
                <>
                    <MedicineChart
                        medicines={medicines}
                        handleDispensedCountChange={handleDispensedCountChange}
                        isPharmacy={true}
                    />
                    <div className="d-block text-center mt-3 mb-3">
                        <Divider />
                    </div>
                </>
                {data?.notes && (
                    <div className="d-flex justify-content-between mb-2">
                        <p className="fs-xs-9 font-size-14 mb-0">
                            <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 font-size-20 me-3">
                                Notes:-
                            </span>
                            <span className="fs-xs-9 fs-md-12">
                                {data.notes}
                            </span>
                        </p>
                    </div>
                )}
                {data?.investigationPlan && (
                    <div className="d-flex justify-content-between mb-2">
                        <p className="fs-xs-9 font-size-14 mb-0">
                            <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 font-size-20 me-3">
                                Investigation Plan:-
                            </span>
                            <span className="fs-xs-9 fs-md-12">
                                {data.investigationPlan}
                            </span>
                        </p>
                    </div>
                )}

                <CheckPermission accessRolePermission={roles?.permissions} permission={"create"} subAccess={"MEDICINEAPPROVAL"}>
                    <div className="mt-4">
                        <div className="d-flex justify-content-between mb-2">
                            <p className="fs-xs-9 font-size-14 mb-0">
                                <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 font-size-20 me-3">
                                    Remarks:-
                                </span>
                            </p>
                        </div>
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Add any remarks or comments here..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            style={{
                                fontSize: "14px",
                                border: "1px solid #dee2e6",
                                borderRadius: "0.375rem",
                                padding: "0.75rem"
                            }}
                        />
                    </div>
                </CheckPermission>
            </div>
        </React.Fragment>
    );
};

PrescriptionForm.propTypes = {
    data: PropTypes.object.isRequired,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
};

export default PrescriptionForm;