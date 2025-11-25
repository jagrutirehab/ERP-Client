import React, { useEffect } from "react";
import { Button, Form, } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { connect } from "react-redux";
import { useDispatch } from 'react-redux';
import { MENTAL_EXAMINATION, mentalExaminationFields } from '../../../Components/constants/patient';
import convertToFormData from "../../../utils/convertToFormData";
import RenderFields from "../../../Components/Common/RenderFields";
import { createEditChart } from "../../../store/actions";
import { addGeneralMentalExamination, addMentalExamination, updateMentalExamination } from "../../../store/features/chart/chartSlice";
import PropTypes from "prop-types";

const MentalExamination = ({ author, patient, chartDate, editChartData, type, shouldPrintAfterSave }) => {
    console.log(type)

    const dispatch = useDispatch();
    const editMentalExamination = editChartData?.mentalExamination;

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            author: author._id,
            patient: patient._id,
            center: patient.center._id,
            addmission: patient.addmission._id,

            grooming: editMentalExamination?.appearanceAndBehavior?.grooming || "",
            eyeContact: editMentalExamination?.appearanceAndBehavior?.eyeContact || "",
            psychomotorActivity: editMentalExamination?.appearanceAndBehavior?.psychomotorActivity || "",

            rate: editMentalExamination?.speech?.rate || "",
            volume: editMentalExamination?.speech?.volume || "",

            affect: editMentalExamination?.mood?.affect || "",
            affectNotes: editMentalExamination?.mood?.affectNotes || "",
            subjective: editMentalExamination?.mood?.subjective || "",

            delusions: editMentalExamination?.thought?.delusions || "",
            delusionNotes: editMentalExamination?.thought?.delusionNotes || "",
            content: editMentalExamination?.thought?.content || "",

            perception: editMentalExamination?.perception || "",
            orientation: editMentalExamination?.cognition?.orientation || "",
            memory: editMentalExamination?.cognition?.memory || "",

            grade: editMentalExamination?.insight?.grade || "",
            judgment: editMentalExamination?.judgment || "",
            remarks: editMentalExamination?.remarks || "",

            date: chartDate,
            shouldPrintAfterSave,
            chart: MENTAL_EXAMINATION,
            type
        },
        validationSchema: Yup.object({
            patient: Yup.string().required("Patient is required"),
            center: Yup.string().required("Center is required"),
            chart: Yup.string().required("Chart is required"),
        }),
        onSubmit: (values) => {
            if (editMentalExamination) {
                dispatch(updateMentalExamination({
                    id: editChartData._id,
                    chartId: editMentalExamination._id,
                    ...values
                }));
            } else if (type === "GENERAL") {
                dispatch(addGeneralMentalExamination(values));
            } else {
                dispatch(addMentalExamination(values));
            }
        }
    });

    useEffect(() => {
        if (!editMentalExamination) {
            validation.resetForm();
        }
    }, [dispatch, editMentalExamination]);

    const closeForm = () => {
        dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
        validation.resetForm();
    };

    return (
        <Form onSubmit={validation.handleSubmit}>
            <RenderFields fields={mentalExaminationFields} validation={validation} />

            <div className="mt-3">
                <div className="d-flex gap-3 justify-content-end">
                    <Button
                        onClick={closeForm}
                        size="sm"
                        color="danger"
                        type="button"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" size="sm">
                        Save
                    </Button>
                </div>
            </div>
        </Form>

    );
};

MentalExamination.propTypes = {
    patient: PropTypes.object,
    author: PropTypes.object,
    chartDate: PropTypes.any,
    editChartData: PropTypes.object,
    type: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
    patient: state.Patient.patient,
    author: state.User.user,
    chartDate: state.Chart.chartDate,
    editChartData: state.Chart.chartForm?.data,
});

export default connect(mapStateToProps)(MentalExamination);
