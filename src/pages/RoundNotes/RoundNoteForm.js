import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import Flatpickr from "react-flatpickr";
import moment from "moment";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useSelector } from "react-redux";
import SearchPatient from "../Booking/Components/SearchPatient";
import { getRoundNoteStaff } from "../../helpers/backend_helper";
import { setHours, setMinutes } from "date-fns";

export const CarryForwardStrip = ({ notes, onUse, onCloseCarryForward }) => {
  if (!notes?.length) return null;
  return (
    <Card className="mb-3 border-warning">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="text-warning mb-0">Previous carried forward notes</h6>
          <small className="text-muted">
            Use a note to pre-fill the form or close it if resolved.
          </small>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {notes.map((note) => (
            <div
              key={note._id}
              className="border rounded p-2 flex-grow-1"
              style={{ minWidth: 230 }}
            >
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <strong>{moment(note.occursAt).format("MMM D, YYYY")}</strong>
                  <div className="text-muted small">
                    {note.patient?.name || "General Round"}
                  </div>
                </div>
                <Badge color="warning" pill>
                  Open
                </Badge>
              </div>
              <p
                className="text-muted small mb-2 mt-2"
                style={{ minHeight: 40 }}
              >
                {note.notes?.slice(0, 90)}
                {note.notes?.length > 90 ? "..." : ""}
              </p>
              <div className="d-flex gap-2">
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => onUse(note)}
                  className="flex-grow-1"
                >
                  Use in new note
                </Button>
                <Button
                  color="light"
                  size="sm"
                  onClick={() => onCloseCarryForward(note)}
                >
                  Close
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

const RoundNoteForm = ({
  isOpen,
  mode,
  data,
  carryForwardSource,
  staffLoading,
  staffOptions = [],
  floors = [],
  onClose,
  onSubmit,
  setCenterIds,
  loadPatientOptions,
  carryForwardNotes,
  onCloseCarryForward,
}) => {
  function getCurrentSession() {
    const hour = new Date().getHours();

    console.log({ hour });

    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night"; // 21–4
  }

  console.log("-------------------------");
  console.log("-------------------------");
  console.log("-------------------------");
  console.log(getCurrentSession());
  console.log("-------------------------");
  console.log("-------------------------");
  console.log("-------------------------");

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {
    getValues,
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date(),
      session: getCurrentSession(), //{ lable: getCurrentSession(), value: getCurrentSession() },
      roundTakenBy: "",
      center: "",
      notes: Array.from({ length: 5 }).map(() => ({
        floor: "",
        patient: { _id: null, name: "" },
        patientsCategory: "All Patients",
        note: "",
      })),
    },
  });

  const centers = useSelector((state) => state.Center?.data || []);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "notes",
  });

  // watch date
  const selectedDate = watch("date");

  // Reset form when editing or carryForwardSource provided
  useEffect(() => {
    if (mode === "edit" && data) {
      // transform data.notes to fields format
      const transformedNotes = (data.notes || []).map((n) => ({
        floor: n.floor || "",
        patient: n.patient
          ? {
              name: `${n.patient.name}`,
              _id: n.patient._id,
            }
          : null,
        patientsCategory: n.patientsCategory || "All Patients",
        note: n.note || "",
      }));

      // if less than 5 rows, pad to 5
      // while (transformedNotes.length < 5) {
      //   transformedNotes.push({
      //     floor: "",
      //     patient: null,
      //     patientsCategory: "All Patients",
      //     roundTakenBy: [],
      //     note: "",
      //   });
      // }

      reset({
        date: data.roundDate
          ? new Date(data.roundDate)
          : new Date(data.occursAt || new Date()),
        session: data.roundSession || "Morning",
        center: { value: data.center._id, label: data.center.title } || "",
        roundTakenBy:
          data.roundTakenBy?.map((member) => ({
            label: `${member.name} (${member.role || ""})`,
            value: member._id,
          })) || [],
        notes: transformedNotes,
      });
    } else {
      // create mode: use carryForwardSource if provided to prefill first row(s)
      const baseNotes = Array.from({ length: 5 }).map(() => ({
        floor: "",
        patient: { name: "", _id: "" },
        patientsCategory: "All Patients",
        roundTakenBy: [],
        note: "",
      }));

      // if (carryForwardSource) {
      //   // If carryForwardSource is a single note object, prefill first row
      //   baseNotes[0] = {
      //     floor: carryForwardSource.floor || "",
      //     patient: carryForwardSource.patient
      //       ? {
      //           label: `${carryForwardSource.patient.name} (${
      //             carryForwardSource.patient.patientId || ""
      //           })`,
      //           value: carryForwardSource.patient._id,
      //         }
      //       : null,
      //     patientsCategory:
      //       carryForwardSource.patientsCategory || "All Patients",
      //     roundTakenBy:
      //       (carryForwardSource.roundTakenBy || []).map((m) => ({
      //         label: `${m.name} (${m.role || ""})`,
      //         value: m._id,
      //       })) || [],
      //     note: carryForwardSource.note || carryForwardSource.notes || "",
      //   };
      // }

      reset({
        date: new Date(),
        session: getCurrentSession(),
        notes: baseNotes,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mode, carryForwardSource, reset]);

  const submit = handleSubmit((values) => {
    console.log({ values });
    // Build payload matching your mongoose schema
    const date = new Date(values.date);
    setHours(date, new Date().getHours());
    setMinutes(date, new Date().getMinutes());
    // date.setHours(new Date().getHours());
    // date.setMinutes(new Date().getMinutes());

    const payload = {
      roundDate: date.toISOString(),
      roundSession: values.session,
      roundTakenBy: values.roundTakenBy?.map((item) => item.value),
      center: values.center?.value,
      occursAt: values.date
        ? new Date(values.date).toISOString()
        : new Date().toISOString(),
      notes: (values.notes || [])
        .filter(
          (n) =>
            (n.note && n.note.trim().length > 0 && n.patientsCategory) ||
            n.patient?._id ||
            n.floor
        ) // Only include rows with actual content
        .map((n) => ({
          floor: n.floor || "",
          patient: n.patient?._id || null,
          patientsCategory: n.patientsCategory || "All Patients",
          note: n.note,
        })),
    };

    onSubmit(payload);
    reset({
      date: new Date(),
      session: getCurrentSession(), //{ lable: getCurrentSession(), value: getCurrentSession() },
      roundTakenBy: "",
      center: "",
      notes: Array.from({ length: 5 }).map(() => ({
        floor: "",
        patient: { _id: null, name: "" },
        patientsCategory: "All Patients",
        note: "",
      })),
    });
  });

  return (
    <Modal size="xl" toggle={onClose} isOpen={isOpen} direction="end">
      <ModalHeader toggle={onClose}>
        {mode === "edit" ? "Edit Round Note" : "Create Round Note"}
      </ModalHeader>
      <ModalBody>
        <CarryForwardStrip
          notes={carryForwardNotes}
          onUse={(note) => {
            // fill first row with this note
            setValue("notes", [
              {
                floor: note.floor || "",
                patient: note.patient
                  ? {
                      label: `${note.patient.name} (${
                        note.patient.patientId || ""
                      })`,
                      value: note.patient._id,
                    }
                  : null,
                patientsCategory: note.patientsCategory || "All Patients",
                roundTakenBy:
                  (note.roundTakenBy || []).map((m) => ({
                    label: `${m.name} (${m.role || ""})`,
                    value: m._id,
                  })) || [],
                note: note.note || note.notes || "",
              },
              // keep the rest as empty rows (pad to at least 5)
              ...Array.from({ length: Math.max(0, Math.max(5 - 1, 0)) }).map(
                () => ({
                  floor: "",
                  patient: null,
                  patientsCategory: "All Patients",
                  roundTakenBy: [],
                  note: "",
                })
              ),
            ]);
          }}
          onCloseCarryForward={(note) => onCloseCarryForward(note)}
        />

        <Form onSubmit={submit}>
          <div className="d-flex flex-wrap gap-3">
            <FormGroup
              className="mb-0"
              style={{ minWidth: 220, flex: "0 0 220px" }}
            >
              <Label>Date</Label>
              <Controller
                name="date"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Flatpickr
                    className="form-control"
                    options={{ dateFormat: "d-m-Y" }}
                    value={field.value}
                    onChange={(dates) => {
                      field.onChange(dates[0]);
                    }}
                  />
                )}
              />
              {errors.date && (
                <small className="text-danger">Date is required</small>
              )}
            </FormGroup>

            <FormGroup
              className="mb-0"
              style={{ minWidth: 220, flex: "0 0 220px" }}
            >
              <Label>Round Session</Label>
              <Controller
                name="session"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    {...field}
                    isMulti={false}
                    options={[
                      { label: "Whole Day", value: "Whole Day" },
                      { label: "Morning", value: "Morning" },
                      { label: "Afternoon", value: "Afternoon" },
                      { label: "Evening", value: "Evening" },
                      { label: "Night", value: "Night" },
                    ]}
                    classNamePrefix="select2"
                    onChange={(opt) => field.onChange(opt.value)}
                    value={
                      field.value
                        ? { label: field.value, value: field.value }
                        : null
                    }
                  />
                )}
              />
              {errors.session && (
                <small className="text-danger">Round session is required</small>
              )}
            </FormGroup>

            <FormGroup
              className="mb-0"
              style={{ minWidth: 220, flex: "0 0 220px" }}
            >
              <Label>Center</Label>
              <Controller
                name={`center`}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    {...field}
                    isMulti={false}
                    options={centers.map((cn) => ({
                      label: cn.title,
                      value: cn._id,
                    }))}
                    classNamePrefix="select2"
                    onChange={(val) => {
                      field.onChange(val);
                      console.log({ val });

                      setCenterIds([val.value]);
                    }}
                    value={field.value}
                  />
                )}
              />
              {errors.roundTakenBy && (
                <small className="text-danger d-block">
                  Select at least one staff
                </small>
              )}
            </FormGroup>

            <FormGroup
              className="mb-0"
              style={{ minWidth: 220, flex: "0 0 220px" }}
            >
              <Label>Round Taken by</Label>
              <Controller
                name={`roundTakenBy`}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <AsyncSelect
                    {...field}
                    isMulti
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      const currentCenter = getValues("center");
                      const centerId = currentCenter?.value;
                      const response = await getRoundNoteStaff({
                        search: inputValue,
                        centerAccess: centerId
                          ? JSON.stringify([centerId])
                          : JSON.stringify([]),
                      });
                      return response.data.map((member) => ({
                        label: `${member.name} (${member.role})`,
                        value: member._id,
                      }));
                    }}
                    classNamePrefix="select2"
                    onChange={(val) => field.onChange(val)}
                    value={field.value}
                    placeholder="Type to search staff..."
                    noOptionsMessage={({ inputValue }) =>
                      inputValue ? "No staff found" : "Type to search..."
                    }
                  />
                )}
              />
              {errors.roundTakenBy && (
                <small className="text-danger d-block">
                  Select at least one staff
                </small>
              )}
            </FormGroup>

            <div className="ms-auto d-flex align-items-end">
              <ButtonDropdown
                isOpen={dropdownOpen}
                toggle={() => setDropdownOpen(!dropdownOpen)}
              >
                <Button
                  id="caret"
                  color="success"
                  onClick={() =>
                    append({
                      floor: "",
                      patient: null,
                      patientsCategory: "All Patients",
                      roundTakenBy: [],
                      note: "",
                    })
                  }
                >
                  + Add Row
                </Button>
                <DropdownToggle split color="success" />
                <DropdownMenu>
                  <DropdownItem
                    onClick={() =>
                      append(
                        Array.from({ length: 5 }).map(() => ({
                          floor: "",
                          patient: null,
                          patientsCategory: "All Patients",
                          roundTakenBy: [],
                          note: "",
                        }))
                      )
                    }
                  >
                    Add 5 Rows
                  </DropdownItem>
                  <DropdownItem
                    onClick={() =>
                      append(
                        Array.from({ length: 10 }).map(() => ({
                          floor: "",
                          patient: null,
                          patientsCategory: "All Patients",
                          roundTakenBy: [],
                          note: "",
                        }))
                      )
                    }
                  >
                    Add 10 Rows
                  </DropdownItem>
                </DropdownMenu>
              </ButtonDropdown>
            </div>
          </div>

          {/* Table */}
          <div
            className="mt-3"
            style={{
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <table className="table align-middle" style={{ minWidth: "900px" }}>
              <thead>
                <tr>
                  <th style={{ width: 140, minWidth: 140 }}>Floor / Ward</th>
                  <th style={{ width: 240, minWidth: 240 }}>
                    Patient (optional)
                  </th>
                  <th style={{ width: 180, minWidth: 180 }}>
                    Notes Applicable To
                  </th>
                  {/* <th>Round Taken By</th> */}
                  <th style={{ width: 320, minWidth: 320 }}>
                    Note / Observation
                  </th>
                  <th style={{ width: 90, minWidth: 90 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((fieldItem, index) => (
                  <tr key={fieldItem.id}>
                    <td>
                      <Controller
                        name={`notes.${index}.floor`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="text"
                            list="floor-options"
                            placeholder=""
                            {...field}
                          />
                        )}
                      />
                      {floors?.length ? (
                        <datalist id="floor-options">
                          {floors.map((floor) => (
                            <option value={floor} key={floor} />
                          ))}
                        </datalist>
                      ) : null}
                    </td>

                    <td>
                      <div
                        style={{ minHeight: "100%" }}
                        className="d-flex align-items-centerflex-shrink-0 mb-3"
                      >
                        <SearchPatient
                          dropdownKey={`search-${index}`}
                          validation={{
                            setFieldValue: (name, value) => {
                              if (name === "patient") {
                                setValue(`notes.${index}.patient._id`, value);
                                if (value) {
                                  // Patient selected
                                  setValue(
                                    `notes.${index}.patientsCategory`,
                                    "Selected Patients"
                                  );
                                } else {
                                  // Patient cleared
                                  setValue(
                                    `notes.${index}.patientsCategory`,
                                    "All Patients"
                                  );
                                }
                              }
                              if (name === "patientName") {
                                setValue(`notes.${index}.patient.name`, value);
                              }
                            },
                            values: {
                              patient:
                                watch(`notes.${index}.patient._id`) || "",
                              patientName:
                                watch(`notes.${index}.patient.name`) || "",
                            },
                          }}
                          showNewTag={false}
                        />
                        {errors.notes?.[index]?.patient && (
                          <small className="text-danger">Required</small>
                        )}
                      </div>

                      {/* <Controller
                        name={`notes.${index}.patientName`}
                        control={control}
                        render={({ field }) => (
                          <div
                            style={{ minHeight: "100%" }}
                            className="d-flex align-items-centerflex-shrink-0 mb-3"
                          >
                            <SearchPatient
                              dropdownKey={`search-${index}`} // unique control per row
                              searchValue={field.value || ""}
                              onSearchChange={(val) => {
                                setValue(`notes.${index}.patientName`, val);
                              }}
                              onSelectPatient={(patient) => {
                                // Save visible name for UI
                                setValue(
                                  `notes.${index}.patientName`,
                                  patient.name
                                );

                                // Save actual patient id
                                setValue(`notes.${index}.patient`, patient._id);

                                // Optional: save readable patientId
                                setValue(
                                  `notes.${index}.patientId`,
                                  patient.patientId || ""
                                );
                              }}
                            />

                            {errors.notes?.[index]?.patient && (
                              <small className="text-danger">Required</small>
                            )}
                          </div>
                        )}
                      /> */}
                    </td>

                    <td>
                      <Controller
                        name={`notes.${index}.patientsCategory`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            isMulti={false}
                            isDisabled={!!watch(`notes.${index}.patient._id`)}
                            options={[
                              {
                                label: "Selected Patients",
                                value: "Selected Patients",
                              },
                              { label: "All Patients", value: "All Patients" },
                              {
                                label: "All Female Patients",
                                value: "All Female Patients",
                              },
                              {
                                label: "All Male Patients",
                                value: "All Male Patients",
                              },
                            ]}
                            classNamePrefix="select2"
                            onChange={(opt) => field.onChange(opt.value)}
                            value={
                              field.value
                                ? { label: field.value, value: field.value }
                                : null
                            }
                          />
                        )}
                      />
                      {errors.notes?.[index]?.patientsCategory && (
                        <small className="text-danger">Required</small>
                      )}
                    </td>

                    {/* <td>
                      <Controller
                        name={`notes.${index}.roundTakenBy`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            isMulti
                            options={staffOptions}
                            classNamePrefix="select2"
                            onChange={(val) => field.onChange(val)}
                            value={field.value}
                          />
                        )}
                      />
                      {errors.notes?.[index]?.roundTakenBy && (
                        <small className="text-danger d-block">
                          Select at least one staff
                        </small>
                      )}
                    </td> */}

                    <td>
                      <Controller
                        name={`notes.${index}.note`}
                        control={control}
                        rules={{}}
                        render={({ field }) => (
                          <Input
                            type="textarea"
                            rows="3"
                            placeholder="Detailed observation..."
                            {...field}
                          />
                        )}
                      />
                      {errors.notes?.[index]?.note && (
                        <small className="text-danger d-block">
                          Must be atleast 3 characters
                        </small>
                      )}
                    </td>

                    <td className="text-center">
                      <div className="d-flex flex-column gap-2 align-items-center">
                        <Button
                          color="danger"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form actions */}
          <div className="d-flex gap-2 justify-content-end mt-3">
            <Button color="light" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button color="primary" type="submit">
              {mode === "edit" ? "Update" : "Save"}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default RoundNoteForm;
