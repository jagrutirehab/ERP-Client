import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Spinner,
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

import { detectShift } from "../detectShift";
import { managerUpdatePermissionRoles, SHIFT_CONFIG } from "../../../../Components/constants/HRMS";
import {
  postEmployeeReporting,
  editEmployeeReporting,
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

const validationSchema = Yup.object({
  employee: Yup.string().required("Employee is required"),
  manager: Yup.string().required("Manager is required"),
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

  const { employees } = useSelector((state) => state.HR);
  const { centerAccess } = useSelector((state) => state.User);
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { roles, loading: permissionLoader } = usePermissions(token);

  const [employeeCache, setEmployeeCache] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [managerSearch, setManagerSearch] = useState("");
  const [searching, setSearching] = useState(false);

  const canEditManager =
    !permissionLoader &&
    managerUpdatePermissionRoles.includes(roles?.name);

  const managerDisplayValue =
    initialData?.manager
      ? `${initialData.manager.name} (${initialData.manager.eCode})`
      : "";


  useEffect(() => {
    if (employees?.length) {
      setEmployeeCache((prev) => {
        const map = new Map(prev.map(e => [e._id, e]));
        employees.forEach(e => map.set(e._id, e));
        return Array.from(map.values());
      });
    }
  }, [employees]);

  const searchEmployees = async (text) => {
    if (!text) return;
    setSearching(true);
    try {
      await dispatch(
        getExitEmployeesBySearch({
          query: text,
          centers: centerAccess,
          view: "ASSIGN_MANAGER",
        })
      ).unwrap();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to search employees");
      }
    }
    finally {
      setSearching(false);
    }
  };

  const debouncedSearch = useMemo(
    () => debounce(searchEmployees, 400),
    []
  );

  useEffect(() => {
    if (employeeSearch.trim()) debouncedSearch(employeeSearch);
  }, [employeeSearch]);

  useEffect(() => {
    if (managerSearch.trim()) debouncedSearch(managerSearch);
  }, [managerSearch]);

  useEffect(() => {
    return () => {
      setEmployeeCache([]);
      setEmployeeSearch("");
      setManagerSearch("");
      setSearching(false);
      debouncedSearch.cancel();
    };
  }, []);

  const form = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    initialValues: {
      employee: initialData?.employee?._id || "",
      manager: initialData?.manager?._id || "",
      timing: {
        start: initialData?.timing?.start
          ? timeToMinutes(initialData.timing.start)
          : null,
        end: initialData?.timing?.end
          ? timeToMinutes(initialData.timing.end)
          : null,
      },
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const { error } = detectShift(
          values.timing.start,
          values.timing.end
        );

        if (
          (values.timing.start != null ||
            values.timing.end != null) &&
          error
        ) {
          toast.error(error);
          return;
        }

        const payload = {
          ...(!isEdit ? { employee: values.employee } : {}),
          manager: values.manager,
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
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error?.message || "Something went wrong");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const employeeOptions = useMemo(() => {
    return employeeCache.map(e => ({
      value: e._id,
      label: `${e.name} (${e.eCode})`,
    }));
  }, [employeeCache]);

  const managerOptions = useMemo(() => {
    if (isEdit && form.values.manager) {
      const selected = employeeOptions.find(
        o => o.value === form.values.manager
      );

      if (!managerSearch.trim()) {
        return selected ? [selected] : [];
      }
    }

    if (!managerSearch.trim()) return [];

    return employeeOptions.filter(
      o => o.value !== form.values.employee
    );
  }, [isEdit, managerSearch, employeeOptions, form.values]);

  useEffect(() => {
    if (isEdit) return;

    setManagerSearch("");
    form.setFieldValue("manager", "");
  }, [form.values.employee]);

  const hasTiming =
    form.values.timing.start != null ||
    form.values.timing.end != null;

  const shiftResult = useMemo(() => {
    const { start, end } = form.values.timing;
    if (start == null && end == null) return { shift: null, error: null };
    if (start == null || end == null)
      return { shift: null, error: "Please select both start and end time" };
    return detectShift(start, end);
  }, [form.values.timing]);

  useEffect(() => {
    if (initialData) {
      setEmployeeCache((prev) => {
        const map = new Map(prev.map(employee => [employee._id, employee]));

        if (initialData.employee) {
          map.set(initialData.employee._id, initialData.employee);
        }

        if (initialData.manager) {
          map.set(initialData.manager._id, initialData.manager);
        }

        return Array.from(map.values());
      });
    }
  }, [initialData]);

  return (
    <Form onSubmit={form.handleSubmit}>
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
              if (meta.action === "input-change") {
                setEmployeeSearch(val);
              }
            }}
            value={
              employeeOptions.find(
                o => o.value === form.values.employee
              ) || null
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
              employeeOptions.find(
                o => o.value === form.values.manager
              ) || null
            }
            onInputChange={(val, meta) => {
              if (meta.action === "input-change") {
                setManagerSearch(val);
              }
            }}
            onChange={(opt) =>
              form.setFieldValue("manager", opt?.value || "")
            }
            placeholder="Search manager..."
            noOptionsMessage={({ inputValue }) =>
              inputValue
                ? "No manager found"
                : "Start typing to search manager"
            }
            menuIsOpen={
              isEdit && !managerSearch.trim()
                ? false
                : managerSearch.trim()
                  ? undefined
                  : false
            }
          />
        )}
      </FormGroup>

      {/* SHIFT */}
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

      <div className="d-flex justify-content-end gap-2">
        {view === "MODAL" && (
          <Button color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}

        {(view !== "PAGE" || hasCreatePermission) && (
          <Button
            color="primary"
            className="text-white"
            disabled={
              form.isSubmitting ||
              !form.isValid ||
              !form.dirty ||
              !!shiftResult.error
            }
          >
            {form.isSubmitting && (
              <Spinner size="sm" className="me-2" />
            )}
            {isEdit ? "Update" : "Submit"}
          </Button>
        )}
      </div>
    </Form>
  );
};

export default EmployeeReportingForm;
