import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "reactstrap";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { useDispatch, useSelector } from "react-redux";
import { getExitEmployeesBySearch } from "../../../../store/features/HR/hrSlice";
import { debounce } from "lodash";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Trash2 } from "lucide-react";

import { detectShift } from "../detectShift";
import {
  allViewPermissionRoles,
  SHIFT_CONFIG,
  leaveTypeOptions,
} from "../../../../Components/constants/HRMS";
import {
  postEmployeeReporting,
  editEmployeeReporting,
  setRotationalShifts,
  getEmployeeLeaves,
} from "../../../../helpers/backend_helper";
import { minutesToDate, timeToMinutes } from "../../../../utils/time";
import { usePermissions } from "../../../../Components/Hooks/useRoles";

const baseTimePickerConfig = {
  enableTime: true,
  noCalendar: true,
  dateFormat: "H:i",
  time_24hr: true,
  minuteIncrement: 5,
};

const datepickerConfig = {
  dateFormat: "Y-m-d",
};

const detectRotationalShiftName = (start, end) => {
  if (start == null || end == null) return "";
  if (start >= 360 && start <= 660 && end <= 1200) return "NORMAL";
  if (start < 720 && end <= 960) return "MORNING";
  if (start >= 720 && end <= 1320) return "AFTERNOON";
  if (start >= 1320) return "NIGHT";
  return "";
};

const emptyShiftRow = () => ({ date: "", start: null, end: null });
const emptyLeaveRow = () => ({ date: "", leaveType: "", reason: "" });

const validationSchema = Yup.object({
  employee: Yup.string().required("Employee is required"),
  manager: Yup.string().required("Manager is required"),
  shiftType: Yup.string().oneOf(["FIXED", "ROTATIONAL"]),
  timing: Yup.object({
    start: Yup.number().nullable(),
    end: Yup.number().nullable(),
  }),
});

const EmployeeReportingForm = ({
  initialData = null,
  onSuccess,
  onCancel,
  view,
  hasCreatePermission = true,
}) => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const isEdit = Boolean(initialData?._id);

  const { centerAccess } = useSelector((state) => state.User);
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { roles, loading: permissionLoader } = usePermissions(token);

  const [employeeCache, setEmployeeCache] = useState([]);
  const [managerCache, setManagerCache] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [managerSearch, setManagerSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leavesExpanded, setLeavesExpanded] = useState(false);
  const [confirmCopyNextMonth, setConfirmCopyNextMonth] = useState(false);
  const [existingLeaves, setExistingLeaves] = useState([]);
  const [existingLeavesLoading, setExistingLeavesLoading] = useState(false);

  const canEditManager =
    !permissionLoader && allViewPermissionRoles.includes(roles?.name);

  const managerDisplayValue = initialData?.manager
    ? `${initialData.manager.name} (${initialData.manager.eCode})`
    : "";

  const searchEmployees = async (text, searchView = "ASSIGN_MANAGER") => {
    if (!text) return;
    setSearching(true);
    try {
      const res = await dispatch(
        getExitEmployeesBySearch({
          query: text,
          centers: centerAccess,
          view: searchView,
        })
      ).unwrap();
      const results = res?.data || res || [];
      if (searchView === "ASSIGN_MANAGER_EMPLOYEE") {
        setEmployeeCache(results);
      } else {
        setManagerCache(results);
      }
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to search employees");
      }
    } finally {
      setSearching(false);
    }
  };

  const debouncedSearch = useMemo(
    () => debounce(searchEmployees, 400),
    []
  );

  useEffect(() => {
    if (employeeSearch.trim()) debouncedSearch(employeeSearch, "ASSIGN_MANAGER_EMPLOYEE");
  }, [employeeSearch]);

  useEffect(() => {
    if (managerSearch.trim()) debouncedSearch(managerSearch, "ASSIGN_MANAGER");
  }, [managerSearch]);

  useEffect(() => {
    return () => {
      setEmployeeCache([]);
      setManagerCache([]);
      setEmployeeSearch("");
      setManagerSearch("");
      setSearching(false);
      debouncedSearch.cancel();
    };
  }, []);

  const fetchExistingLeaves = useMemo(
    () =>
      debounce(async (employeeId, from, to) => {
        setExistingLeavesLoading(true);
        try {
          const res = await getEmployeeLeaves(employeeId, { from, to });
          setExistingLeaves(res?.data || []);
        } catch {
          setExistingLeaves([]);
        } finally {
          setExistingLeavesLoading(false);
        }
      }, 600),
    []
  );

  useEffect(() => {
    return () => fetchExistingLeaves.cancel();
  }, []);

  const safeTimeToMinutes = (val) => {
    if (val == null) return null;
    if (typeof val === "number") return val;
    if (typeof val === "string" && val.includes(":")) return timeToMinutes(val);
    return null;
  };

  const initialRotationalShifts = useMemo(() => {
    if (
      initialData?.shiftType === "ROTATIONAL" &&
      initialData?.rotationalShifts?.length
    ) {
      return initialData.rotationalShifts.map((s) => ({
        date: s.date ? s.date.substring(0, 10) : "",
        start: safeTimeToMinutes(s.start),
        end: safeTimeToMinutes(s.end),
      }));
    }
    return [emptyShiftRow()];
  }, [initialData]); // eslint-disable-line react-hooks/exhaustive-deps

  const initialLeaves = useMemo(() => {
    if (initialData?.leaves?.length) {
      return initialData.leaves.map((l) => ({
        date: l.date || "",
        leaveType: l.leaveType || "",
        leaveReason: l.reason || "",
      }));
    }
    return [];
  }, [initialData]);

  const form = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    initialValues: {
      employee: initialData?.employee?._id || "",
      manager: initialData?.manager?._id || "",
      shiftType: initialData?.shiftType || "FIXED",
      timing: {
        start: initialData?.timing?.start
          ? timeToMinutes(initialData.timing.start)
          : null,
        end: initialData?.timing?.end
          ? timeToMinutes(initialData.timing.end)
          : null,
      },
      rotationalShifts: initialRotationalShifts,
      leaves: initialLeaves,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (values.shiftType === "FIXED") {
          const { error } = detectShift(values.timing.start, values.timing.end);
          if (
            (values.timing.start != null || values.timing.end != null) &&
            error
          ) {
            toast.error(error);
            return;
          }

          const payload = {
            ...(!isEdit ? { employee: values.employee } : {}),
            manager: values.manager,
            shiftType: "FIXED",
          };

          const hasStart = values.timing.start != null;
          const hasEnd = values.timing.end != null;

          if (hasStart && hasEnd) {
            payload.timing = values.timing;
          } else if (!hasStart && !hasEnd && isEdit) {
            payload.timing = null;
          }

          if (isEdit) {
            await editEmployeeReporting(initialData._id, payload);
            toast.success("Reporting updated successfully");
          } else {
            await postEmployeeReporting(payload);
            toast.success("Manager assigned successfully");
          }

          if (view === "PAGE") {
            resetForm();
          } else {
            onSuccess?.();
          }
        } else {
          // ROTATIONAL + new record — just register the employee with ROTATIONAL type.
          // Actual shift schedule is assigned separately via the Shift Roster page.
          const payload = {
            employee: values.employee,
            manager: values.manager,
            shiftType: "ROTATIONAL",
          };
          await postEmployeeReporting(payload);
          toast.success("Manager assigned successfully");

          if (view === "PAGE") {
            resetForm();
          } else {
            onSuccess?.();
          }
        }
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error?.message || "Something went wrong");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const shiftsChanged = () => {
    const current = form.values.rotationalShifts.filter(
      (s) => s.date && s.start != null && s.end != null
    );
    const original = (initialData?.rotationalShifts || []).map((s) => ({
      date: s.date ? s.date.substring(0, 10) : "",
      start: safeTimeToMinutes(s.start),
      end: safeTimeToMinutes(s.end),
    }));
    if (current.length !== original.length) return true;
    return current.some((s, i) => (
      s.date !== original[i]?.date ||
      s.start !== original[i]?.start ||
      s.end !== original[i]?.end
    ));
  };

  const handleRotationalEditClick = () => {
    const validShifts = form.values.rotationalShifts.filter(
      (s) => s.date && s.start != null && s.end != null
    );
    if (validShifts.length === 0) {
      toast.error("Please add at least one valid rotational shift");
      return;
    }
    if (shiftsChanged()) {
      setConfirmOpen(true);
    } else {
      handleConfirmUpdate();
    }
  };

  const handleConfirmUpdate = async () => {
    setConfirmOpen(false);
    const values = form.values;
    try {
      form.setSubmitting(true);
      const validShifts = values.rotationalShifts.filter(
        (s) => s.date && s.start != null && s.end != null
      );
      const validLeaves = values.leaves.filter((l) => l.date && l.leaveType);

      const managerChanged = values.manager !== initialData?.manager?._id;
      if (managerChanged) {
        await editEmployeeReporting(initialData._id, { manager: values.manager });
      }

      await setRotationalShifts(initialData._id, {
        shifts: validShifts.map((s) => ({
          date: s.date,
          start: s.start,
          end: s.end,
        })),
        leaves: validLeaves.map((l) => ({
          date: l.date,
          leaveType: l.leaveType,
          ...(l.reason ? { leaveReason: l.reason } : {}),
        })),
      });

      toast.success("Rotational schedule updated successfully");
      if (view === "PAGE") {
        form.resetForm();
      } else {
        onSuccess?.();
      }
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Something went wrong");
      }
    } finally {
      form.setSubmitting(false);
    }
  };

  // ---- Existing leaves fetch (depends on form, so placed after useFormik) ----
  const employeeId = initialData?.employee?._id;
  const shiftDateKey = form.values.rotationalShifts
    .map((s) => s.date)
    .filter(Boolean)
    .sort()
    .join(",");

  useEffect(() => {
    if (!isEdit || !employeeId) return;
    if (form.values.shiftType !== "ROTATIONAL") {
      setExistingLeaves([]);
      return;
    }

    const dates = shiftDateKey ? shiftDateKey.split(",") : [];
    if (dates.length === 0) {
      setExistingLeaves([]);
      return;
    }

    fetchExistingLeaves(employeeId, dates[0], dates[dates.length - 1]);
  }, [isEdit, employeeId, form.values.shiftType, shiftDateKey, fetchExistingLeaves]);

  // ---- Rotational shift row handlers ----
  const addShiftRow = () => {
    form.setFieldValue("rotationalShifts", [
      ...form.values.rotationalShifts,
      emptyShiftRow(),
    ]);
  };

  const copyToNextMonth = () => {
    const shifts = form.values.rotationalShifts.filter(
      (s) => s.date && s.start != null && s.end != null
    );
    if (shifts.length === 0) return;

    const firstDate = new Date(shifts[0].date);
    const daysInMonth = new Date(
      firstDate.getFullYear(),
      firstDate.getMonth() + 1,
      0
    ).getDate();

    const advanced = shifts.map((s) => {
      const d = new Date(s.date);
      d.setDate(d.getDate() + daysInMonth);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return { date: `${yyyy}-${mm}-${dd}`, start: s.start, end: s.end };
    });

    form.setFieldValue("rotationalShifts", advanced);
    setConfirmCopyNextMonth(false);
  };

  const addShiftRowLikePrevious = () => {
    const shifts = form.values.rotationalShifts;
    const prev = shifts[shifts.length - 1];

    let nextDate = "";
    if (prev?.date) {
      const d = new Date(prev.date);
      d.setDate(d.getDate() + 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      nextDate = `${yyyy}-${mm}-${dd}`;
    }

    form.setFieldValue("rotationalShifts", [
      ...shifts,
      { date: nextDate, start: prev?.start ?? null, end: prev?.end ?? null },
    ]);
  };

  const removeShiftRow = (idx) => {
    const updated = form.values.rotationalShifts.filter((_, i) => i !== idx);
    form.setFieldValue(
      "rotationalShifts",
      updated.length ? updated : [emptyShiftRow()]
    );
  };

  const updateShiftRow = (idx, field, value) => {
    const updated = form.values.rotationalShifts.map((row, i) =>
      i === idx ? { ...row, [field]: value } : row
    );
    form.setFieldValue("rotationalShifts", updated);
  };

  // ---- Leave row handlers ----
  const addLeaveRow = () => {
    form.setFieldValue("leaves", [...form.values.leaves, emptyLeaveRow()]);
  };

  const removeLeaveRow = (idx) => {
    form.setFieldValue(
      "leaves",
      form.values.leaves.filter((_, i) => i !== idx)
    );
  };

  const updateLeaveRow = (idx, field, value) => {
    const updated = form.values.leaves.map((row, i) =>
      i === idx ? { ...row, [field]: value } : row
    );
    form.setFieldValue("leaves", updated);
  };

  // ---- Employee / manager options ----
  const employeeOptions = useMemo(
    () =>
      employeeCache.map((e) => ({
        value: e._id,
        label: `${e.name} (${e.eCode})`,
      })),
    [employeeCache]
  );

  const managerOptions = useMemo(() => {
    const allManagerOpts = managerCache.map((e) => ({
      value: e._id,
      label: `${e.name} (${e.eCode})`,
    }));

    if (isEdit && form.values.manager && !managerSearch.trim()) {
      const selected = allManagerOpts.find(
        (o) => o.value === form.values.manager
      );
      return selected ? [selected] : [];
    }

    if (!managerSearch.trim()) return [];

    return allManagerOpts.filter((o) => o.value !== form.values.employee);
  }, [isEdit, managerSearch, managerCache, form.values]);

  useEffect(() => {
    if (isEdit) return;
    if (form.values.manager && form.values.manager === form.values.employee) {
      setManagerSearch("");
      form.setFieldValue("manager", "");
    }
  }, [form.values.employee]);

  // ---- Fixed shift detection ----
  const hasTiming =
    form.values.timing.start != null || form.values.timing.end != null;

  const shiftResult = useMemo(() => {
    const { start, end } = form.values.timing;
    if (start == null && end == null) return { shift: null, error: null };
    if (start == null || end == null)
      return { shift: null, error: "Please select both start and end time" };
    return detectShift(start, end);
  }, [form.values.timing]);

  useEffect(() => {
    if (initialData?.manager) {
      setManagerCache([initialData.manager]);
    }
  }, [initialData]);

  const isRotational = form.values.shiftType === "ROTATIONAL";

  // Dates already used for shifts — blocked from leave picker
  const shiftDates = form.values.rotationalShifts
    .map((s) => s.date)
    .filter(Boolean);

  const leaveDatepickerConfig = {
    ...datepickerConfig,
    disable: shiftDates,
  };

  const handleSubmitButtonClick = () => {
    form.handleSubmit();
  };

  const isSubmitDisabled =
    form.isSubmitting ||
    !form.isValid ||
    (!isRotational && !!shiftResult.error);

  return (
    <>
      <Form onSubmit={(e) => e.preventDefault()}>
        {/* SHIFT TYPE TOGGLE */}
        <FormGroup>
          <Label className="mb-1">Shift Type</Label>
          <div className="d-flex gap-3">
            {["FIXED", "ROTATIONAL"].map((type) => (
              <div className="form-check" key={type}>
                <input
                  className="form-check-input"
                  type="radio"
                  id={`shiftType-${type}`}
                  name="shiftType"
                  value={type}
                  checked={form.values.shiftType === type}
                  onChange={() => form.setFieldValue("shiftType", type)}
                />
                <label className="form-check-label" htmlFor={`shiftType-${type}`}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </label>
              </div>
            ))}
          </div>
        </FormGroup>

        {/* EMPLOYEE */}
        <FormGroup>
          <Label>
            Employee <span className="text-danger">*</span>
          </Label>

          {isEdit ? (
            <input
              className="form-control"
              disabled
              value={`${initialData.employee.name} (${initialData.employee.eCode})`}
            />
          ) : (
            <Select
              isLoading={searching}
              options={employeeSearch.trim() ? employeeOptions : []}
              onInputChange={(val, meta) => {
                if (meta.action === "input-change") setEmployeeSearch(val);
              }}
              value={
                employeeOptions.find((o) => o.value === form.values.employee) ||
                null
              }
              onChange={(opt) =>
                form.setFieldValue("employee", opt?.value || "")
              }
              placeholder="Search employee..."
              noOptionsMessage={({ inputValue }) =>
                inputValue
                  ? "No employee found"
                  : "Start typing to search employee"
              }
              menuIsOpen={employeeSearch.trim() ? undefined : false}
              cacheOptions={false}
            />
          )}
        </FormGroup>

        {/* MANAGER */}
        <FormGroup>
          <Label>
            Manager <span className="text-danger">*</span>
          </Label>

          {isEdit && !canEditManager ? (
            <input
              className="form-control"
              disabled
              value={managerDisplayValue}
            />
          ) : (
            <Select
              isLoading={searching}
              options={managerOptions}
              value={
                managerOptions.find((o) => o.value === form.values.manager) ||
                null
              }
              onInputChange={(val, meta) => {
                if (meta.action === "input-change") setManagerSearch(val);
              }}
              onChange={(opt) =>
                form.setFieldValue("manager", opt?.value || "")
              }
              placeholder="Search manager..."
              noOptionsMessage={({ inputValue }) =>
                inputValue ? "No manager found" : "Start typing to search manager"
              }
              menuIsOpen={
                isEdit && !managerSearch.trim()
                  ? false
                  : managerSearch.trim()
                  ? undefined
                  : false
              }
              cacheOptions={false}
            />
          )}
        </FormGroup>

        {/* FIXED SHIFT */}
        {!isRotational && (
          <FormGroup>
            <Label className="mb-1">
              Shift Timing{" "}
              <span className="text-muted">
                (Day: 11:00–22:00 · Night: 22:00–11:00)
              </span>
            </Label>

            <div className="d-flex gap-2">
              <Flatpickr
                options={baseTimePickerConfig}
                value={minutesToDate(form.values.timing.start)}
                onChange={([d]) =>
                  form.setFieldValue(
                    "timing.start",
                    d ? d.getHours() * 60 + d.getMinutes() : null
                  )
                }
                className="form-control"
                placeholder="Start"
              />

              <Flatpickr
                options={baseTimePickerConfig}
                value={minutesToDate(form.values.timing.end)}
                onChange={([d]) =>
                  form.setFieldValue(
                    "timing.end",
                    d ? d.getHours() * 60 + d.getMinutes() : null
                  )
                }
                className="form-control"
                placeholder="End"
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mt-1">
              {shiftResult.error ? (
                <small className="text-danger">{shiftResult.error}</small>
              ) : shiftResult.shift ? (
                <span
                  className={`badge bg-${SHIFT_CONFIG[shiftResult.shift].color}`}
                >
                  {SHIFT_CONFIG[shiftResult.shift].label}
                </span>
              ) : null}

              {hasTiming && (
                <Button
                  color="link"
                  className="text-danger p-0"
                  type="button"
                  onClick={() => {
                    form.setFieldValue("timing.start", null);
                    form.setFieldValue("timing.end", null);
                  }}
                >
                  Clear timing
                </Button>
              )}
            </div>
          </FormGroup>
        )}

        <div className="d-flex justify-content-end gap-2 mt-3">
          {view === "MODAL" && (
            <Button color="secondary" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}

          {(view !== "PAGE" || hasCreatePermission) && (
            <Button
              color="primary"
              className="text-white"
              type="button"
              disabled={isSubmitDisabled}
              onClick={handleSubmitButtonClick}
            >
              {form.isSubmitting && <Spinner size="sm" className="me-2" />}
              {isEdit ? "Update" : "Submit"}
            </Button>
          )}
        </div>
      </Form>

      {/* Confirmation modal for rotational schedule update */}
      <Modal isOpen={confirmOpen} toggle={() => setConfirmOpen(false)} centered>
        <ModalHeader toggle={() => setConfirmOpen(false)}>
          Confirm Schedule Update
        </ModalHeader>
        <ModalBody>
          <p className="mb-1">
            Updating the rotational schedule will{" "}
            <strong>deactivate the current record</strong> and create a new one.
          </p>
          <p className="text-muted small mb-0">
            This action cannot be undone. Are you sure you want to continue?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button color="primary" className="text-white" onClick={handleConfirmUpdate}>
            Yes, Update
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default EmployeeReportingForm;
