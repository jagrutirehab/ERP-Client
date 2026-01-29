import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
} from "reactstrap";
import Select from "react-select";
import ButtonLoader from "../../../Components/Common/ButtonLoader.js";
import { getEmployeesBySearch } from "../../../helpers/backend_helper";

const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const isECodeLike = (value) => {
  return /^[A-Za-z]+[A-Za-z0-9]*\d+[A-Za-z0-9]*$/.test(value);
};

const EditHiringRequestModal = ({
  isOpen,
  toggle,
  selectedRow,
  formData,
  setFormData,
  onSubmit,
  loading,
}) => {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);

  const fetchEmployees = async (searchText) => {
    if (!searchText || searchText.length < 2) {
      setEmployees([]);
      return;
    }

    try {
      setLoadingEmployees(true);

      const params = {
        type: "interviewer",
      };

      if (/^\d+$/.test(searchText) || isECodeLike(searchText)) {
        params.eCode = searchText;
      } else {
        params.name = searchText;
      }

      const response = await getEmployeesBySearch(params);

      const options =
        response?.data?.map((emp) => ({
          value: emp._id,
          label: `${emp.name} (${emp.eCode})`,
        })) || [];

      setEmployees(options);
    } catch (error) {
      console.log("Error loading employees", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const debouncedFetchEmployees = useMemo(() => {
    return debounce(fetchEmployees, 400);
  }, []);

  useEffect(() => {
    if (!selectedRow) return;

    setFormData({
      updateStatus: selectedRow?.updateStatus || "",
      priority: selectedRow?.priority || "",
      remarks: selectedRow?.remarks || "",
      interviewer: selectedRow?.interviewer?._id || null,
    });

    if (selectedRow?.interviewer) {
      setSelectedInterviewer({
        value: selectedRow.interviewer._id,
        label: `${selectedRow.interviewer.name} (${selectedRow.interviewer.eCode})`,
      });
    } else {
      setSelectedInterviewer(null);
    }
  }, [selectedRow]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Edit Hiring Request</ModalHeader>

      <ModalBody>
        <Form>
          {/* INterviwer */}

          <div className="mb-3">
            <Label className="fw-bold">Interviewer</Label>

            <Select
              placeholder="Search interviewer by name or E-code"
              isClearable
              isLoading={loadingEmployees}
              options={employees}
              value={selectedInterviewer}
              onInputChange={(value, { action }) => {
                if (action === "input-change") {
                  setSearchText(value);
                  debouncedFetchEmployees(value);
                }
              }}
              onChange={(option) => {
                setSelectedInterviewer(option);
                setFormData((prev) => ({
                  ...prev,
                  interviewer: option?.value || null,
                }));
              }}
            />
          </div>

          {/* Status */}
          <FormGroup>
            <Label>Status</Label>
            <Input
              type="select"
              value={formData.updateStatus || ""}
              onChange={(e) =>
                setFormData({ ...formData, updateStatus: e.target.value })
              }
            >
              <option value="">Select Status</option>
              <option value="WIP">WIP</option>
              <option value="HOLD">HOLD</option>
              <option value="CLOSED">CLOSED</option>
            </Input>
          </FormGroup>

          {/* Priority */}
          <FormGroup>
            <Label>Priority</Label>
            <Input
              type="select"
              value={formData.priority || ""}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
            >
              <option value="">Select Priority</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
              <option value="P5">P5</option>
            </Input>
          </FormGroup>

          {/* Remarks */}
          <FormGroup>
            <Label>Remarks</Label>
            <Input
              type="textarea"
              placeholder="Enter remarks"
              value={formData.remarks || ""}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
            />
          </FormGroup>

          {/* Read-only info */}
          <FormGroup>
            <Label className="text-muted">
              Hiring For:{" "}
              <strong>{selectedRow?.designation?.name || "-"}</strong>
            </Label>
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button color="primary" onClick={onSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Updating...
            </>
          ) : (
            "Update"
          )}
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditHiringRequestModal;
