import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Form,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Button,
  CardHeader,
} from "reactstrap";
import FileCard from "../../../Components/Common/FileCard";
import Divider from "../../../Components/Common/Divider";
import DeleteModal from "../../../Components/Common/DeleteModal";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  CLINICAL_NOTE,
  clinicalNoteFields,
} from "../../../Components/constants/patient";
import { connect, useDispatch } from "react-redux";
import {
  createEditChart,
  removeClinicalNoteFile,
} from "../../../store/actions";
import PreviewFile from "../../../Components/Common/PreviewFile";
import axios from "axios";
import AudioRecorder from "./AaudioRecorder";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

const UploadedFiles = ({ id, chartId, files, appointment }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState({ img: null, isOpen: false });
  const [deleteFile, setDeleteFile] = useState({ img: null, isOpen: false });

  const deleteFilePermanently = () => {
    dispatch(
      removeClinicalNoteFile({
        id,
        chartId,
        fileId: deleteFile.img._id,
        appointment,
      })
    );
    setDeleteFile({ img: null, isOpen: false });
  };

  return (
    <Row className="row-gap-3">
      <Col xs={12}>
        <div className="d-flex align-items-center gap-3">
          <h6 className="display-6 fs-5 text-nowrap">Uploaded Files</h6>
          <Divider />
        </div>
      </Col>
      {(files || []).map((file, id) => (
        <Col key={id} xs={12} md={4}>
          <FileCard
            file={file}
            showDeleteButton
            onDelete={() => setDeleteFile({ img: file, isOpen: true })}
            onPreview={() => setFile({ img: file, isOpen: true })}
          />
        </Col>
      ))}
      <PreviewFile
        file={file.img}
        isOpen={file.isOpen}
        toggle={() => setFile({ img: null, isOpen: false })}
      />
      <DeleteModal
        onDeleteClick={deleteFilePermanently}
        onCloseClick={() => setDeleteFile({ img: null, isOpen: false })}
        show={deleteFile.isOpen}
      />
    </Row>
  );
};

const ClinicalNote = ({
  author,
  patient,
  chartDate,
  editChartData,
  appointment,
  populatePreviousAppointment = false,
  shouldPrintAfterSave = false,
  type,
  onSubmitClinicalForm,
}) => {
  const dispatch = useDispatch();
  const [files, setFiles] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [fetchedNote, setFetchedNote] = useState(null);

  const editClinicalNote = editChartData?.clinicalNote;

  useEffect(() => {
    const fetchOPDPrescription = async () => {
      try {
        const id = appointment?.patient?._id || patient?._id;
        if (!id || editClinicalNote) return;

        const response = await axios.get(`/chart/opd/clinicalnote`, {
          params: { id },
        });

        const clinicalNote = response?.payload?.clinicalNote;
        setFetchedNote(clinicalNote || null);
      } catch (error) {
        console.error("Error fetching OPD Prescription:", error);
        setFetchedNote(null);
      }
    };

    fetchOPDPrescription();
  }, [appointment, patient, populatePreviousAppointment, editClinicalNote]);

  const noteSource = editClinicalNote || fetchedNote;

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      author: author._id,
      patient: patient._id,
      center: patient.center._id || patient.center,
      centerAddress: patient.center.title,
      appointment: appointment?._id,
      addmission: patient.addmission?._id,
      chart: CLINICAL_NOTE,
      complaints: noteSource?.complaints || "",
      observations: noteSource?.observations || "",
      diagnosis: noteSource?.diagnosis || "",
      notes: noteSource?.notes || "",
      type,
      date: chartDate,
      shouldPrintAfterSave,
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      const allFiles = [...files];
      if (audioFile) {
        allFiles.push(audioFile);
      }
      onSubmitClinicalForm(values, files, editChartData, editClinicalNote);
    },
  });

  useEffect(() => {
    if (!editClinicalNote) {
      validation.resetForm();
    }
  }, [dispatch, editClinicalNote]);

  const closeForm = () => {
    validation.resetForm();
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
  };

  const clinicalFiles = useMemo(() => {
    return (
      editClinicalNote?.files?.length > 0 && (
        <UploadedFiles
          id={editChartData._id}
          chartId={editClinicalNote._id}
          files={editClinicalNote.files}
          appointment={appointment?._id}
        />
      )
    );
  }, [editChartData, editClinicalNote, appointment]);

  const dropFiles = useMemo(() => {
    return (
      <CardBody>
        <FilePond
          files={files}
          onupdatefiles={setFiles}
          allowMultiple={true}
          maxFiles={10}
          name="files"
          acceptedFileTypes={["image/*", "application/pdf"]}
          className="filepond filepond-input-multiple"
          labelFileTypeNotAllowed={true}
        />
      </CardBody>
    );
  }, [files]);

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        validation.handleSubmit();
        return false;
      }}
      className="needs-validation"
      action="#"
      encType="multipart/form-data"
    >
      <Row className="mt-3">
        {(clinicalNoteFields || []).map((item, idx) => (
          <Col xs={12} md={6} key={idx}>
            <Card className="ribbon-box border shadow-none mb-3">
              <CardBody className="position-relative p-0">
                <div className="ribbon ribbon-primary w-75 ribbon-shape">
                  {item.label}
                </div>
                <Input
                  type="textarea"
                  name={item.name}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values[item.name] || ""}
                  className="form-control presc-border pt-5 rounded"
                  aria-label="With textarea"
                  rows="2"
                />
              </CardBody>
            </Card>
          </Col>
        ))}
        <Col xs={12} className="mt-3">
          <h5>Audio Recording</h5>
          <AudioRecorder onReady={(file) => setAudioFile(file)} />
        </Col>
        <Col xs={12} className="mt-3 mb-4">
          {clinicalFiles}
        </Col>
        <Col>
          <Card>
            <CardHeader>
              <h4 className="card-title mb-0">Multiple File Upload</h4>
            </CardHeader>
            {dropFiles}
          </Card>
        </Col>
        <Col xs={12} className="mt-3">
          <div className="d-flex gap-3 justify-content-end">
            <Button onClick={closeForm} size="sm" color="danger" type="button">
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

ClinicalNote.propTypes = {
  patient: PropTypes.object,
  author: PropTypes.object,
  chartDate: PropTypes.any,
  editChartData: PropTypes.object,
  type: PropTypes.string.isRequired,
  onSubmitClinicalForm: PropTypes.func,
};

const mapStateToProps = (state) => ({
  patient: state.Chart.chartForm?.patient,
  author: state.User.user,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
  populatePreviousAppointment:
    state.Chart.chartForm.populatePreviousAppointment,
  shouldPrintAfterSave: state.Chart.chartForm.shouldPrintAfterSave,
  appointment: state.Chart.chartForm.appointment,
});

export default connect(mapStateToProps)(ClinicalNote);
