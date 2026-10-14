import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { Button, Form, FormGroup, Label, Input, Spinner } from "reactstrap";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { useCenterOptions } from "../../../../Components/Hooks/useCenterOptions";
import { toast } from "react-toastify";
import { fetchDesignations } from "../../../../store/features/HR/hrSlice";
import { HiringPreferredGenderOptions } from "../../../../Components/constants/HR";
import {
  editHiring,
  getEmployeesBySearch,
  getPositions,
  postHiring,
} from "../../../../helpers/backend_helper";
import PhoneInputWithCountrySelect from "react-phone-number-input";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const validationSchema = Yup.object({
  center: Yup.string()
    .required("Center is required")
    .matches(objectIdRegex, "Invalid Center"),

  contactNumber: Yup.string().required("Contact number is required"),

  designation: Yup.string()
    .required("Designation is required")
    .matches(objectIdRegex, "Invalid Designation"),

  preferredGender: Yup.string()
    .oneOf(
      ["MALE", "FEMALE", "OTHER", "NO_PREFERENCE"],
      "Preferred Gender must be MALE, FEMALE, OTHER, or NO PREFERENCE",
    )
    .required("Preferred Gender is required"),

  requiredCount: Yup.number()
    .typeError("Required count must be a number")
    .integer("Required count must be an integer")
    .min(1, "At least 1 position is required")
    .required("Required count is required"),

  position: Yup.string()
    .required("Position is required")
    .matches(objectIdRegex, "Invalid Position"),
});

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

const HiringForm = ({
  initialData,
  onSuccess,
  onCancel,
  view,
  hasCreatePermission,
}) => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const { designations: designationOptions, designationLoading } = useSelector(
    (state) => state.HR,
  );
  const { user } = useSelector((state) => state.User);
  const isEdit = !!initialData?._id;

  const [positionOptions, setPositionOptions] = useState([]);
  const [positionLoading, setPositionLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchText, setSearchText] = useState("");

  const centerOptions = useCenterOptions({ includeAll: false });

  useEffect(() => {
    const loadDesignations = async () => {
      try {
        dispatch(
          fetchDesignations({ status: ["PENDING", "APPROVED"], version: 2 }),
        ).unwrap();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error("Something went wrong while getting the designations");
        }
      }
    };

    loadDesignations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    const loadPositions = async () => {
      try {
        setPositionLoading(true);
        const res = await getPositions();
        const rawData = res?.data || [];
        const mapped = rawData.flatMap((p) =>
          (p.positions || [])
            .filter((pos) => !pos.deleted && pos.version === 2)
            .map((pos) => ({
              label: pos.name,
              value: pos._id.toString(),
            })),
        );
        mapped.sort((a, b) => a.label.localeCompare(b.label));
        setPositionOptions(mapped);
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error("Failed to fetch positions");
        }
      } finally {
        setPositionLoading(false);
      }
    };

    loadPositions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    initialValues: {
      center: initialData?.center?._id || "",
      contactNumber: initialData?.contactNumber || user?.phoneNumber || "",
      designation: initialData?.designation?._id || "",
      preferredGender: initialData?.preferredGender || "",
      requiredCount: initialData?.requiredCount || 1,
      centerManager: initialData?.centerManager || "",
      position: initialData?.position?._id?.toString() || initialData?.position?.toString() || "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = { ...values };

        if (!payload.centerManager) {
          delete payload.centerManager;
        }
        if (isEdit) {
          await editHiring(initialData?._id, payload);
          toast.success("Request updated successfully");
        } else {
          await postHiring(payload);
          toast.success("Request submitted successfully");
        }

        if (view === "PAGE") {
          form.resetForm();
        } else {
          onSuccess?.();
        }
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error?.message || "Failed to submit the request");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fetchEmployees = async (searchText) => {
    if (!searchText || searchText.length < 2) {
      setEmployees([]);
      return;
    }

    try {
      setLoadingEmployees(true);

      const params = {
        type: "employee",
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
    if (!isEdit) {
      fetchEmployees();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  const debouncedFetchEmployees = useMemo(() => {
    return debounce(fetchEmployees, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { setFieldValue } = form;

  useEffect(() => {
    if (isEdit && initialData?.centerManager) {
      const existingOption = {
        value: initialData.centerManager._id,
        label: `${initialData.centerManager.name} (${initialData.centerManager.eCode})`,
      };

      setEmployees((prev) => {
        const alreadyExists = prev.some(
          (opt) => opt.value === existingOption.value,
        );
        return alreadyExists ? prev : [existingOption, ...prev];
      });

      setFieldValue("centerManager", existingOption.value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, initialData]);

  return (
    <Form onSubmit={form.handleSubmit}>
      <FormGroup>
        <Label for="center">
          Center <span className="text-danger">*</span>
        </Label>

        <Select
          inputId="center"
          options={centerOptions}
          value={
            form.values.center
              ? centerOptions.find((opt) => opt.value === form.values.center)
              : null
          }
          onChange={(option) => {
            form.setFieldValue("center", option ? option.value : "");
          }}
          onBlur={() => form.setFieldTouched("center", true)}
          placeholder="Select Center"
          classNamePrefix="react-select"
          isClearable
        />

        {form.touched.center && form.errors.center && (
          <div className="text-danger mt-1 small">{form.errors.center}</div>
        )}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="centerManager">
          Requirement Raising For
        </Label>

        <Select
          inputId="centerManager"
          placeholder="Search by name or employee code"
          isClearable
          isLoading={loadingEmployees}
          options={employees}
          onInputChange={(value, { action }) => {
            if (action === "input-change") {
              setSearchText(value);
              debouncedFetchEmployees(value);
            }
          }}
          onChange={(option) =>
            form.setFieldValue("centerManager", option ? option.value : "")
          }
          value={
            employees.find((opt) => opt.value === form.values.centerManager) ||
            null
          }
          noOptionsMessage={() => {
            if (loadingEmployees) return "Searching employees...";
            if (searchText.length < 2) return "Search with name or Ecode...";
            return "No employee found";
          }}
        />

        {form.touched.centerManager && form.errors.centerManager && (
          <div className="text-danger small mt-1">
            {form.errors.centerManager}
          </div>
        )}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="contactNumber">
          Contact Number <span className="text-danger">*</span>
        </Label>
        <PhoneInputWithCountrySelect
          name="contactNumber"
          id="contactNumber"
          min="10"
          value={form.values.contactNumber}
          onChange={(value) =>
            form.handleChange({
              target: {
                name: "contactNumber",
                value: value,
              },
            })
          }
          limitMaxLength={true}
          defaultCountry="IN"
          className="w-100"
          style={{
            width: "100%",
            height: "42px",
            padding: "0.5rem 0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            fontSize: "1rem",
          }}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="designation">
          Designation <span className="text-danger">*</span>
        </Label>

        <Select
          inputId="designation"
          placeholder="Select designation"
          isClearable
          isDisabled={designationLoading}
          isLoading={designationLoading}
          options={designationOptions}
          value={
            designationOptions.find(
              (opt) => opt.value === form.values.designation,
            ) || null
          }
          onChange={(option) =>
            form.setFieldValue("designation", option ? option.value : "")
          }
          onBlur={() => form.setFieldTouched("designation", true)}
        />

        {form.touched.designation && form.errors.designation && (
          <div className="text-danger small mt-1">
            {form.errors.designation}
          </div>
        )}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="position">
          Position <span className="text-danger">*</span>
        </Label>

        <Select
          inputId="position"
          placeholder="Select Position"
          isClearable
          isLoading={positionLoading}
          isDisabled={positionLoading}
          options={positionOptions}
          value={
            positionOptions.find((opt) => opt.value === form.values.position) ||
            null
          }
          onChange={(option) =>
            form.setFieldValue("position", option ? option.value : "")
          }
          onBlur={() => form.setFieldTouched("position", true)}
        />

        {form.touched.position && form.errors.position && (
          <div className="text-danger small mt-1">{form.errors.position}</div>
        )}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="preferredGender">
          Preferred Gender <span className="text-danger">*</span>
        </Label>

        <Select
          inputId="preferredGender"
          placeholder="Select gender"
          options={HiringPreferredGenderOptions}
          isClearable
          value={
            HiringPreferredGenderOptions.find(
              (opt) => opt.value === form.values.preferredGender,
            ) || null
          }
          onChange={(option) =>
            form.setFieldValue("preferredGender", option ? option.value : "")
          }
          onBlur={() => form.setFieldTouched("preferredGender", true)}
        />

        {form.touched.preferredGender && form.errors.preferredGender && (
          <div className="text-danger small mt-1">
            {form.errors.preferredGender}
          </div>
        )}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="requiredCount">
          Required Count <span className="text-danger">*</span>
        </Label>
        <Input
          type="number"
          name="requiredCount"
          id="requiredCount"
          min={1}
          value={form.values.requiredCount}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
        />

        {form.touched.requiredCount && form.errors.requiredCount && (
          <div className="text-danger small mt-1">
            {form.errors.requiredCount}
          </div>
        )}
      </FormGroup>

      <div className="d-flex justify-content-end gap-2">
        {view === "MODAL" && (
          <Button
            type="button"
            color="secondary"
            onClick={onCancel}
            disabled={form.isSubmitting}
          >
            Cancel
          </Button>
        )}

        {(view !== "PAGE" || hasCreatePermission) && (
          <Button
            className="text-white"
            onClick={form.handleSubmit}
            color="primary"
            disabled={form.isSubmitting || !form.isValid || !form.dirty}
          >
            {form.isSubmitting && <Spinner size="sm" className="me-2" />}
            Add Request
          </Button>
        )}
      </div>
    </Form>
  );
};

HiringForm.propTypes = {
  initialData: PropTypes.object,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  view: PropTypes.oneOf(["MODAL", "PAGE"]),
  hasCreatePermission: PropTypes.bool,
};

export default HiringForm;
