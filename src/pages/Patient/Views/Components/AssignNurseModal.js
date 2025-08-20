import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormGroup,
  Label,
  Spinner,
  FormFeedback,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { getNursesListByPatient } from "../../../../store/features/nurse/nurseSlice";
import { assignNurse } from "../../../../store/features/patient/patientSlice";
import { toast } from "react-toastify";
import RenderWhen from "../../../../Components/Common/RenderWhen";

const validationSchema = Yup.object({
  search: Yup.string(),
  selectedNurse: Yup.string().required("Please select a nurse"),
});

const initialValues = {
  search: "",
  selectedNurse: "",
};

const AssignNurseForm = ({
  isSubmitting,
  values,
  setFieldValue,
  resetForm,
  isOpen,
  nurses,
  loading,
  searchTerm,
  handleSearchChange,
  toggle,
}) => {
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    if (values.selectedNurse && nurses.length > 0) {
      const nurseExists = nurses.some(
        (nurse) => nurse._id === values.selectedNurse
      );
      if (!nurseExists) {
        setFieldValue("selectedNurse", "");
      }
    }
  }, [nurses, values.selectedNurse, setFieldValue]);

  const renderNurseSelect = (field, form, meta) => {
    if (loading) {
      return (
        <div className="d-flex align-items-center">
          <Spinner size="sm" /> <span className="ms-2">Loading nurses...</span>
        </div>
      );
    }

    if (!nurses || nurses.length === 0) {
      return (
        <div className="text-muted">
          {searchTerm
            ? "No nurses found matching your search."
            : "No nurses available."}
        </div>
      );
    }

    return (
      <>
        <Input
          {...field}
          id="nurseSelect"
          type="select"
          invalid={meta.touched && !!meta.error}
        >
          <option value="">-- Select Nurse --</option>
          {nurses.length > 0 &&
            nurses?.map((nurse) => (
              <option key={nurse?._id} value={nurse?._id}>
                {nurse?.name} ({nurse?.email})
              </option>
            ))}
        </Input>
        {meta.touched && meta.error && (
          <FormFeedback>{meta.error}</FormFeedback>
        )}
      </>
    );
  };

  const renderSearchInput = (field, form, meta) => (
    <>
      <Input
        id="nurseSearch"
        placeholder="Search by name or email"
        value={field.value}
        onChange={(e) => handleSearchChange(e.target.value, form.setFieldValue)}
        invalid={meta.touched && !!meta.error}
      />
      {meta.touched && meta.error && <FormFeedback>{meta.error}</FormFeedback>}
    </>
  );

  return (
    <Form>
      <ModalBody>
        <FormGroup>
          <Label for="nurseSearch">Search Nurse</Label>
          <Field name="search">
            {({ field, form, meta }) => renderSearchInput(field, form, meta)}
          </Field>
        </FormGroup>

        <FormGroup>
          <Label for="nurseSelect">Select Nurse</Label>
          <Field name="selectedNurse">
            {({ field, form, meta }) => renderNurseSelect(field, form, meta)}
          </Field>
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
        <Button
          color="primary"
          type="submit"
          className="d-flex align-items-center gap-2"
          disabled={loading || isSubmitting || !values.selectedNurse}
        >
          <RenderWhen isTrue={loading || isSubmitting}>
            <Spinner size="sm" />
          </RenderWhen>
          <span>Assign</span>
        </Button>{" "}
      </ModalFooter>
    </Form>
  );
};

const AssignNurseModal = ({ patientId, isOpen, toggle }) => {
  const dispatch = useDispatch();

  const { data: nurses = [], loading } = useSelector((state) => state.Nurse);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      dispatch(getNursesListByPatient({ patientId, search: searchTerm }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isOpen, searchTerm, dispatch, patientId]);

  const handleSearchChange = useCallback((value, setFieldValue) => {
    setFieldValue("search", value);
    setSearchTerm(value);
  }, []);

  const handleAssign = async (values, { setSubmitting }) => {
    await dispatch(
      assignNurse({ patientId, nurseId: values.selectedNurse })
    ).unwrap();
    toast.success("nurse assigned successfully");
    setSubmitting(false);
    toggle();
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Assign Nurse</ModalHeader>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleAssign}
        enableReinitialize={true}
      >
        {({ isSubmitting, values, setFieldValue, resetForm }) => (
          <AssignNurseForm
            isSubmitting={isSubmitting}
            values={values}
            setFieldValue={setFieldValue}
            resetForm={resetForm}
            isOpen={isOpen}
            nurses={nurses}
            loading={loading}
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
            toggle={toggle}
          />
        )}
      </Formik>
    </Modal>
  );
};

export default AssignNurseModal;
