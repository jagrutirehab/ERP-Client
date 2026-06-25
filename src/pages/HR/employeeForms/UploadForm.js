import React, { useState, useMemo, useRef } from "react";
import Select from "react-select";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Container,
} from "reactstrap";
import { toast } from "react-toastify";
import {
  getEmployeesBySearch,
  postEmployeeForm,
} from "../../../helpers/backend_helper";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const VALID_FILE_TYPES = [
  { value: "Form26AS", label: "Form 26AS" },
  { value: "TDS", label: "TDS" },
  { value: "Form16", label: "Form 16" },
  { value: "Payslip", label: "Payslip" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((m) => ({ value: m, label: m }));

const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});

const isECodeLike = (v) => /^[A-Za-z]+[A-Za-z0-9]*\d+[A-Za-z0-9]*$/.test(v);

const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const emptyEntry = { fileType: "", year: "", month: "", file: null };

const entrySchema = Yup.object({
  fileType: Yup.string()
    .oneOf(["Form26AS", "TDS", "Form16", "Payslip"], "Invalid file type")
    .required("File type is required"),
  year: Yup.string()
    .matches(/^\d{4}$/, "Must be 4 digits like 2026")
    .required("Year is required"),
  month: Yup.string().when("fileType", {
    is: "Payslip",
    then: (s) => s.required("Month is required for Payslip"),
    otherwise: (s) => s.notRequired(),
  }),
  file: Yup.mixed().required("File is required"),
});

const validationSchema = Yup.object({
  employee: Yup.string().required("Employee is required"),
  entries: Yup.array()
    .of(entrySchema)
    .min(1, "Add at least one entry")
    .test("no-duplicates", "Duplicate entries found", function (entries) {
      if (!entries) return true;
      const seen = new Set();
      const errors = [];

      entries.forEach((entry, i) => {
        if (!entry.fileType || !entry.year) return;
        const key =
          entry.fileType === "Payslip"
            ? `${entry.fileType}-${entry.year}-${entry.month}`
            : `${entry.fileType}-${entry.year}`;

        if (seen.has(key)) {
          errors.push(
            new Yup.ValidationError(
              entry.fileType === "Payslip"
                ? `Duplicate: ${entry.fileType} for ${entry.month}/${entry.year} already added above`
                : `Duplicate: ${entry.fileType} for ${entry.year} already added above`,
              null,
              `entries[${i}].fileType`,
            ),
          );
        } else {
          seen.add(key);
        }
      });

      if (errors.length > 0) {
        return this.createError({
          message: errors[0].message,
          path: errors[0].path,
        });
      }

      return true;
    }),
});

const UploadForm = ({ onSuccess, onCancel }) => {
  const fileInputRefs = useRef([]);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchText, setSearchText] = useState("");

  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const user = JSON.parse(localStorage.getItem("micrologin"))?.user?._id;

  const { hasPermission, loading: isLoading } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "UPLOAD_EMPLOYEE_FORM", "READ");

  const hasWrite = hasPermission("HR", "UPLOAD_EMPLOYEE_FORM", "WRITE");
  const hasDelete = hasPermission("HR", "UPLOAD_EMPLOYEE_FORM", "DELETE");
  console.log("hasWrite:", hasWrite);
  console.log("isLoading:", isLoading);

  const fetchEmployees = async (text) => {
    if (!text || text.length < 2) return setEmployees([]);
    try {
      setLoadingEmployees(true);
      const params = {
        type: "employee",
        [/^\d+$/.test(text) || isECodeLike(text) ? "eCode" : "name"]: text,
      };
      const response = await getEmployeesBySearch(params);
      setEmployees(
        response?.data?.map((emp) => ({
          value: emp._id,
          label: `${emp.name} — ${emp.eCode}`,
        })) || [],
      );
    } catch {
      toast.error("Unable to fetch employees.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const debouncedFetch = useMemo(() => debounce(fetchEmployees, 400), []);

  const form = useFormik({
    initialValues: { employee: "", entries: [emptyEntry] },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("employee", values.employee);
        values.entries.forEach((entry, i) => {
          formData.append(`entries[${i}][fileType]`, entry.fileType);
          formData.append(`entries[${i}][year]`, entry.year);
          if (entry.month) formData.append(`entries[${i}][month]`, entry.month);
          formData.append(`entries[${i}][file]`, entry.file);
        });

        await postEmployeeForm(formData);
        toast.success("Forms uploaded successfully.");
        resetForm();
        fileInputRefs.current.forEach((ref) => {
          if (ref) ref.value = "";
        });
        onSuccess?.();
      } catch (error) {
        toast.error(error?.message || "Failed to upload forms.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const isSubmitting = form.isSubmitting;

  const touchedError = (i, field) => {
    const touched = form.touched.entries?.[i]?.[field];
    const error = form.errors.entries?.[i]?.[field];
    return touched && error ? (
      <div className="text-danger small mt-1">{error}</div>
    ) : null;
  };

  const isInvalid = (i, field) =>
    !!form.touched.entries?.[i]?.[field] && !!form.errors.entries?.[i]?.[field];

  return (
    <Container fluid className="py-3 px-4">
      <Row className="justify-content-center min-vh-100">
        <Col xl={8} lg={10} md={12} xs={12}>
          <Card className="shadow-sm">
            <CardHeader className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-semibold">Upload Employee Forms</h5>
            </CardHeader>

            <CardBody className="p-4">
              <FormikProvider value={form}>
                <Form onSubmit={form.handleSubmit}>
                  <FormGroup>
                    <Label htmlFor="employee">
                      Employee <span className="text-danger">*</span>
                    </Label>
                    <Select
                      inputId="employee"
                      placeholder="Search by name or eCode..."
                      isClearable
                      isLoading={loadingEmployees}
                      isDisabled={isSubmitting}
                      options={employees}
                      classNamePrefix="react-select"
                      onInputChange={(value, { action }) => {
                        if (action === "input-change") {
                          setSearchText(value);
                          debouncedFetch(value);
                        }
                      }}
                      onChange={(option) =>
                        form.setFieldValue("employee", option?.value || "")
                      }
                      value={
                        employees.find(
                          (o) => o.value === form.values.employee,
                        ) || null
                      }
                      noOptionsMessage={() => {
                        if (loadingEmployees) return "Searching...";
                        if (searchText.length < 2)
                          return "Type at least 2 characters...";
                        return "No employee found";
                      }}
                      onBlur={() => form.setFieldTouched("employee", true)}
                    />
                    {form.touched.employee && form.errors.employee && (
                      <div className="text-danger small mt-1">
                        {form.errors.employee}
                      </div>
                    )}
                  </FormGroup>

                  <div className="border-top pt-3 mt-2">
                    {form.values.entries.map((entry, i) => (
                      <div key={i} className="border rounded p-3 mb-3 bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="fw-medium text-muted small">
                            Entry {i + 1}
                          </span>
                          {form.values.entries.length > 1 && hasWrite && (
                            <Button
                              type="button"
                              color="danger"
                              size="sm"
                              outline
                              disabled={isSubmitting}
                              onClick={() =>
                                form.setFieldValue(
                                  "entries",
                                  form.values.entries.filter(
                                    (_, idx) => idx !== i,
                                  ),
                                )
                              }
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <Row>
                          <Col md={entry.fileType === "Payslip" ? 4 : 6}>
                            <FormGroup>
                              <Label>
                                File Type <span className="text-danger">*</span>
                              </Label>
                              <Select
                                placeholder="Select file type"
                                isClearable
                                isDisabled={isSubmitting}
                                options={VALID_FILE_TYPES}
                                classNamePrefix="react-select"
                                value={
                                  VALID_FILE_TYPES.find(
                                    (o) => o.value === entry.fileType,
                                  ) || null
                                }
                                onChange={(option) => {
                                  form.setFieldValue(
                                    `entries[${i}].fileType`,
                                    option?.value || "",
                                  );
                                  form.setFieldValue(`entries[${i}].month`, "");
                                }}
                                onBlur={() =>
                                  form.setFieldTouched(
                                    `entries[${i}].fileType`,
                                    true,
                                  )
                                }
                                styles={{
                                  control: (base) => ({
                                    ...base,
                                    borderColor: isInvalid(i, "fileType")
                                      ? "#dc3545"
                                      : base.borderColor,
                                    "&:hover": {
                                      borderColor: isInvalid(i, "fileType")
                                        ? "#dc3545"
                                        : base["&:hover"]?.borderColor,
                                    },
                                  }),
                                }}
                              />
                              {touchedError(i, "fileType")}
                            </FormGroup>
                          </Col>

                          <Col md={entry.fileType === "Payslip" ? 4 : 6}>
                            <FormGroup>
                              <Label>
                                Year <span className="text-danger">*</span>
                              </Label>
                              <Select
                                placeholder="Select year"
                                isClearable
                                isDisabled={isSubmitting}
                                options={YEAR_OPTIONS}
                                classNamePrefix="react-select"
                                value={
                                  YEAR_OPTIONS.find(
                                    (o) => o.value === entry.year,
                                  ) || null
                                }
                                onChange={(option) =>
                                  form.setFieldValue(
                                    `entries[${i}].year`,
                                    option?.value || "",
                                  )
                                }
                                onBlur={() =>
                                  form.setFieldTouched(
                                    `entries[${i}].year`,
                                    true,
                                  )
                                }
                                styles={{
                                  control: (base) => ({
                                    ...base,
                                    borderColor: isInvalid(i, "year")
                                      ? "#dc3545"
                                      : base.borderColor,
                                    "&:hover": {
                                      borderColor: isInvalid(i, "year")
                                        ? "#dc3545"
                                        : base["&:hover"]?.borderColor,
                                    },
                                  }),
                                }}
                              />
                              {touchedError(i, "year")}
                            </FormGroup>
                          </Col>

                          {entry.fileType === "Payslip" && (
                            <Col md={4}>
                              <FormGroup>
                                <Label>
                                  Month <span className="text-danger">*</span>
                                </Label>
                                <Select
                                  placeholder="Select month"
                                  isClearable
                                  isDisabled={isSubmitting}
                                  options={MONTHS}
                                  classNamePrefix="react-select"
                                  value={
                                    MONTHS.find(
                                      (o) => o.value === entry.month,
                                    ) || null
                                  }
                                  onChange={(option) =>
                                    form.setFieldValue(
                                      `entries[${i}].month`,
                                      option?.value || "",
                                    )
                                  }
                                  onBlur={() =>
                                    form.setFieldTouched(
                                      `entries[${i}].month`,
                                      true,
                                    )
                                  }
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      borderColor: isInvalid(i, "month")
                                        ? "#dc3545"
                                        : base.borderColor,
                                      "&:hover": {
                                        borderColor: isInvalid(i, "month")
                                          ? "#dc3545"
                                          : base["&:hover"]?.borderColor,
                                      },
                                    }),
                                  }}
                                />
                                {touchedError(i, "month")}
                              </FormGroup>
                            </Col>
                          )}
                        </Row>

                        <FormGroup className="mb-0">
                          <Label>
                            File <span className="text-danger">*</span>
                          </Label>
                          <Input
                            type="file"
                            disabled={isSubmitting}
                            innerRef={(el) => (fileInputRefs.current[i] = el)}
                            onChange={(e) =>
                              form.setFieldValue(
                                `entries[${i}].file`,
                                e.currentTarget.files[0] || null,
                              )
                            }
                            onBlur={() =>
                              form.setFieldTouched(`entries[${i}].file`, true)
                            }
                            invalid={isInvalid(i, "file")}
                          />
                          {touchedError(i, "file")}
                        </FormGroup>
                      </div>
                    ))}

                    {hasWrite && (
                      <Button
                        type="button"
                        color="primary"
                        outline
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() =>
                          form.setFieldValue("entries", [
                            ...form.values.entries,
                            { ...emptyEntry },
                          ])
                        }
                      >
                        + Add Another Form
                      </Button>
                    )}
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    {onCancel && (
                      <Button
                        type="button"
                        color="secondary"
                        onClick={onCancel}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    )}
                    {hasWrite && (
                      <Button
                        type="submit"
                        color="primary"
                        className="text-white"
                        disabled={isSubmitting || !form.isValid || !form.dirty}
                      >
                        {isSubmitting && <Spinner size="sm" className="me-2" />}
                        Upload Forms
                      </Button>
                    )}
                  </div>
                </Form>
              </FormikProvider>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UploadForm;
