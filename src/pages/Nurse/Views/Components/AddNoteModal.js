import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Button,
  Badge,
  Spinner,
  Alert
} from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { addNotes } from "../../../../store/features/nurse/nurseSlice";

const validationSchema = Yup.object().shape({
  note: Yup.string()
    .required("Note content is required")
    .min(5, "Note must be at least 5 characters"),
    flag: Yup.string().oneOf(["urgent", "attention", ""], "Invalid flag")
});

const AddNoteModal = ({ isOpen, toggle, patientId }) => {
  const dispatch = useDispatch();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(addNotes({
        patientId,
        note: values.note,
        flag: values.flag || undefined
      })).unwrap();
      
      resetForm();
      toggle();
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <Formik
        initialValues={{ note: "", flag: "attention" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => (
          <Form>
            <ModalHeader toggle={toggle}>Add New Note</ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label for="note">Note Content</Label>
                <Field
                  name="note"
                  as="textarea"
                  className={`form-control ${touched.note && errors.note ? "is-invalid" : ""}`}
                  rows="6"
                  placeholder="Enter your note here..."
                />
                <ErrorMessage name="note" component="div" className="invalid-feedback" />
              </FormGroup>

              <FormGroup>
                <Label>Flag (Optional)</Label>
                <div className="d-flex gap-2">
                  <Button
                    type="button"
                    color={values.flag === "urgent" ? "danger" : "outline-danger"}
                    onClick={() => setFieldValue("flag", values.flag === "urgent" ? "" : "urgent")}
                    className="d-flex align-items-center gap-1"
                  >
                    <i className="ri-alarm-warning-line"></i>
                    Urgent
                  </Button>
                  <Button
                    type="button"
                    color={values.flag === "attention" ? "warning" : "outline-warning"}
                    onClick={() => setFieldValue("flag", values.flag === "attention" ? "" : "attention")}
                    className="d-flex align-items-center gap-1"
                  >
                    <i className="ri-error-warning-line"></i>
                    Attention
                  </Button>
                </div>
                <ErrorMessage name="flag" component="div" className="text-danger small mt-1" />
              </FormGroup>

              {values.flag && (
                <div className="mt-2">
                  <Badge color={values.flag === "urgent" ? "danger" : "warning"} pill>
                    {values.flag === "urgent" ? (
                      <>
                        <i className="ri-alarm-warning-line me-1"></i>
                        This note will be marked as Urgent
                      </>
                    ) : (
                      <>
                        <i className="ri-error-warning-line me-1"></i>
                        This note will be marked as Needs Attention
                      </>
                    )}
                  </Badge>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggle} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  "Save Note"
                )}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default AddNoteModal;