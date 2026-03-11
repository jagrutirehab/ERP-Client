import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Row, Col, Label, Input, Spinner } from "reactstrap";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import {
  editFinance,
  changeSalary,
} from "../../../../helpers/backend_helper";
import { getExitEmployeesBySearch } from "../../../../store/features/HR/hrSlice";
import {
  accountOptions,
  employeeGroupOptions,
} from "../../../../Components/constants/HR";
import { calculatePayroll } from "../../../../utils/calculatePayroll";

const changeTypeOptions = [
  { value: "INCREMENT", label: "Increment" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "CORRECTION", label: "Correction" },
  { value: "JOINING", label: "Joining" },
];

const salaryBreakupFields = [
  "basicAmount",
  "HRAAmount",
  "SPLAllowance",
  "conveyanceAllowance",
  "statutoryBonus",
];

const getNumericValue = (value) => Number(value || 0);

const getSalaryBreakupTotal = (values) =>
  salaryBreakupFields.reduce(
    (total, fieldName) => total + getNumericValue(values[fieldName]),
    0
  );

const buildNumberSchema = (label, { max } = {}) => {
  let schema = Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .typeError(`${label} must be a valid number`)
    .min(0, `${label} must be 0 or more`);

  if (typeof max === "number") {
    schema = schema.max(max, `${label} cannot be more than ${max}`);
  }

  return schema.optional();
};

const buildGrossBoundSchema = (label) =>
  buildNumberSchema(label)
    .test(
      "within-gross-salary",
      `${label} cannot be greater than Gross Salary`,
      function (value) {
        const grossSalary = getNumericValue(this.parent.grossSalary);
        const fieldValue = getNumericValue(value);

        if (!grossSalary || !fieldValue) return true;
        return fieldValue <= grossSalary;
      }
    )
    .test(
      "breakup-total-within-gross",
      "Salary breakup total cannot be greater than Gross Salary",
      function () {
        const grossSalary = getNumericValue(this.parent.grossSalary);
        const breakupTotal = getSalaryBreakupTotal(this.parent);

        if (!grossSalary || !breakupTotal) return true;
        return breakupTotal <= grossSalary;
      }
    );

const getFinanceInitialValues = (initialData) => ({
  employeeId: "",
  changeType: initialData?.changeType || "",
  note: initialData?.note || "",
  employeeGroups: initialData?.financeDetails?.employeeGroups || "",
  account: initialData?.financeDetails?.account || "",
  grossSalary: initialData?.financeDetails?.grossSalary || 0,
  basicAmount: initialData?.financeDetails?.basicAmount || 0,
  HRAAmount: initialData?.financeDetails?.HRAAmount || 0,
  SPLAllowance: initialData?.financeDetails?.SPLAllowance || 0,
  conveyanceAllowance: initialData?.financeDetails?.conveyanceAllowance || 0,
  statutoryBonus: initialData?.financeDetails?.statutoryBonus || 0,
  minimumWages: initialData?.financeDetails?.minimumWages || 0,
  ESICSalary: initialData?.financeDetails?.ESICSalary || 0,
  LWFSalary: initialData?.financeDetails?.LWFSalary || 0,
  LWFEmployee: initialData?.financeDetails?.LWFEmployee || 0,
  LWFEmployer: initialData?.financeDetails?.LWFEmployer || 0,
  insurance: initialData?.financeDetails?.insurance || 0,
  TDSRate: initialData?.financeDetails?.TDSRate || 0,
  debitStatementNarration:
    initialData?.financeDetails?.debitStatementNarration || "",
  basicPercentage: initialData?.financeDetails?.basicPercentage || 0,
  HRAPercentage: initialData?.financeDetails?.HRAPercentage || 0,
  shortWages: initialData?.financeDetails?.shortWages || 0,
  PFEmployee: initialData?.financeDetails?.PFEmployee || 0,
  PFEmployer: initialData?.financeDetails?.PFEmployer || 0,
  PFAmount: initialData?.financeDetails?.PFAmount || 0,
  PFSalary: initialData?.financeDetails?.PFSalary || 0,
  PT: initialData?.financeDetails?.PT || 0,
  ESICEmployee: initialData?.financeDetails?.ESICEmployee || 0,
  ESICEmployer: initialData?.financeDetails?.ESICEmployer || 0,
  inHandSalary: initialData?.financeDetails?.inHandSalary || 0,
});

const validationSchema = (isEdit, step) => {
  if (step === 1 && !isEdit) {
    return Yup.object().shape({
      employeeId: Yup.string().required("Employee is required"),
      changeType: Yup.string().required("Salary change type is required"),
      note: Yup.string().optional(),
    });
  }

  return Yup.object().shape({
    changeType: Yup.string().optional(),
    note: Yup.string().optional(),
    employeeGroups: Yup.string().nullable().optional(),
    account: Yup.string().nullable().optional(),
    minimumWages: buildNumberSchema("Minimum Wages"),
    grossSalary: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null ? undefined : value
      )
      .typeError("Gross Salary must be a valid number")
      .min(0, "Gross Salary must be 0 or more")
      .required("Gross Salary is required")
      .test(
        "gross-breakup-exact-match",
        "Basic + HRA + SPL + Conveyance + Statutory Bonus must be exactly equal to Gross Salary",
        function (gross) {
          const breakupTotal = getSalaryBreakupTotal(this.parent);

          if (gross === undefined || gross === null) return true;
          return getNumericValue(gross) === breakupTotal;
        }
      ),
    basicAmount: buildGrossBoundSchema("Basic Amount"),
    HRAAmount: buildGrossBoundSchema("HRA"),
    SPLAllowance: buildGrossBoundSchema("SPL Allowance"),
    conveyanceAllowance: buildGrossBoundSchema("Conveyance Allowance"),
    statutoryBonus: buildGrossBoundSchema("Statutory Bonus"),
    insurance: buildNumberSchema("Insurance"),
    TDSRate: buildNumberSchema("TDS Rate", { max: 100 }),
    ESICSalary: buildNumberSchema("ESIC Salary"),
    LWFSalary: buildNumberSchema("LWF Salary"),
    LWFEmployee: buildNumberSchema("LWF Employee"),
    LWFEmployer: buildNumberSchema("LWF Employer"),
    debitStatementNarration: Yup.string().nullable().optional(),
  });
};

const FinanceForm = ({ initialData, onSuccess, onCancel, mode }) => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const { centerAccess } = useSelector((state) => state.User);

  const isEdit = mode === "EDIT";
  const [step, setStep] = useState(isEdit ? 2 : 1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const form = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    initialValues: getFinanceInitialValues(isEdit ? initialData : null),
    validationSchema: validationSchema(isEdit, step),
    onSubmit: async (values) => {
      if (step === 1 && !isEdit) {
        setStep(2);
        return;
      }

      try {
        const payload = {
          employeeGroups: values.employeeGroups || "",
          account: values.account || "",
          grossSalary: Number(values.grossSalary),
          basicAmount: Number(values.basicAmount),
          HRAAmount: Number(values.HRAAmount),
          SPLAllowance: Number(values.SPLAllowance),
          conveyanceAllowance: Number(values.conveyanceAllowance),
          statutoryBonus: Number(values.statutoryBonus),
          minimumWages: Number(values.minimumWages),
          ESICSalary: Number(values.ESICSalary),
          LWFSalary: Number(values.LWFSalary),
          LWFEmployee: Number(values.LWFEmployee),
          LWFEmployer: Number(values.LWFEmployer),
          insurance: Number(values.insurance),
          TDSRate: Number(values.TDSRate),
          debitStatementNarration: values.debitStatementNarration || "",
        };

        if (isEdit) {
          if (values.changeType) payload.changeType = values.changeType;
          if (values.note) payload.note = values.note;
          await editFinance(initialData._id, payload);
          toast.success("Finance details updated successfully");
        } else {
          payload.employeeId = values.employeeId;
          payload.changeType = values.changeType;
          if (values.note) payload.note = values.note;
          await changeSalary(payload);
          toast.success("Salary changed successfully");
        }

        onSuccess?.();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error?.message || "Failed to save finance details");
        }
      }
    },
  });

  const employeeData = useMemo(
    () => (isEdit ? initialData?.employee : selectedEmployee?.raw),
    [initialData, isEdit, selectedEmployee]
  );

  useEffect(() => {
    const payroll = calculatePayroll({
      ...form.values,
      pfApplicable: employeeData?.pfApplicable ?? false,
      gender: employeeData?.gender || "",
      joinningDate: employeeData?.joinningDate || "",
    });

    Object.entries(payroll).forEach(([key, value]) => {
      if (form.values[key] !== value) {
        form.setFieldValue(key, value, false);
      }
    });
  }, [
    employeeData,
    form,
    form.values.ESICSalary,
    form.values.HRAAmount,
    form.values.LWFEmployee,
    form.values.SPLAllowance,
    form.values.basicAmount,
    form.values.conveyanceAllowance,
    form.values.grossSalary,
    form.values.insurance,
    form.values.minimumWages,
    form.values.TDSRate,
  ]);

  const loadEmployeeOptions = (inputValue) => {
    if (!inputValue) return Promise.resolve([]);

    return dispatch(
      getExitEmployeesBySearch({
        query: inputValue,
        centers: centerAccess,
        view: "FINANCE",
      })
    )
      .unwrap()
      .then((response) =>
        (response?.data || []).map((emp) => ({
          value: emp._id,
          label: `${emp.name} (${emp.eCode || "N/A"})`,
          raw: emp,
        }))
      )
      .catch(() => []);
  };

  const selectedChangeTypeOption =
    changeTypeOptions.find((opt) => opt.value === form.values.changeType) || null;

  const errorText = (fieldName) => {
    if (form.touched[fieldName] && form.errors[fieldName]) {
      return <div className="text-danger small mt-1">{form.errors[fieldName]}</div>;
    }

    return null;
  };

  const markGrossBreakupFieldsTouched = (changedFieldName) => {
    form.setFieldTouched("grossSalary", true, false);

    salaryBreakupFields.forEach((fieldName) => {
      if (
        fieldName === changedFieldName ||
        getNumericValue(form.values[fieldName]) > 0
      ) {
        form.setFieldTouched(fieldName, true, false);
      }
    });
  };

  const handleNumericFieldChange = (event) => {
    const { name, value } = event.target;

    form.setFieldValue(name, value);
    form.setFieldTouched(name, true, false);

    if (salaryBreakupFields.includes(name) || name === "grossSalary") {
      markGrossBreakupFieldsTouched(name);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const submitDisabled =
    form.isSubmitting || !form.isValid || (isEdit && !initialData?._id);

  if (step === 1 && !isEdit) {
    return (
      <div>
        <Row className="g-3 mx-2">
          <Col md={12}>
            <Label htmlFor="employeeSearch">
              Search Employee <span className="text-danger">*</span>
            </Label>
            <AsyncSelect
              inputId="employeeSearch"
              placeholder="Search by name or eCode..."
              loadOptions={loadEmployeeOptions}
              defaultOptions
              value={selectedEmployee}
              onChange={(opt) => {
                setSelectedEmployee(opt);
                form.setFieldValue("employeeId", opt ? opt.value : "");
              }}
              onBlur={() => form.setFieldTouched("employeeId", true)}
              isClearable
            />
            {errorText("employeeId")}
          </Col>

          {selectedEmployee && (
            <Col md={12}>
              <div className="p-3 border rounded bg-light">
                <Row className="g-2">
                  <Col md={4}>
                    <strong>Name:</strong> {selectedEmployee.raw?.name || "-"}
                  </Col>
                  <Col md={4}>
                    <strong>ECode:</strong> {selectedEmployee.raw?.eCode || "-"}
                  </Col>
                  <Col md={4}>
                    <strong>Current Location:</strong>{" "}
                    {selectedEmployee.raw?.currentLocation || "-"}
                  </Col>
                  <Col md={4}>
                    <strong>PF Applicable:</strong>{" "}
                    {selectedEmployee.raw?.pfApplicable ? "Yes" : "No"}
                  </Col>
                  <Col md={4}>
                    <strong>Gender:</strong>{" "}
                    {selectedEmployee.raw?.gender || "-"}
                  </Col>
                  <Col md={4}>
                    <strong>Joining Date:</strong>{" "}
                    {selectedEmployee.raw?.joinningDate
                      ? new Date(
                          selectedEmployee.raw.joinningDate
                        ).toLocaleDateString("en-IN")
                      : "-"}
                  </Col>
                </Row>
              </div>
            </Col>
          )}

          <Col md={12}>
            <Label htmlFor="changeType">
              Salary Change Type <span className="text-danger">*</span>
            </Label>
            <Select
              inputId="changeType"
              options={changeTypeOptions}
              value={selectedChangeTypeOption}
              onChange={(opt) =>
                form.setFieldValue("changeType", opt ? opt.value : "")
              }
              onBlur={() => form.setFieldTouched("changeType", true)}
              placeholder="Select change type..."
              isClearable
            />
            {errorText("changeType")}
          </Col>

          <Col md={12}>
            <Label htmlFor="note">Note</Label>
            <textarea
              id="note"
              name="note"
              className="form-control"
              rows={3}
              value={form.values.note}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              placeholder="Optional note..."
            />
          </Col>
        </Row>

        <div className="d-flex gap-2 justify-content-end my-4 mx-3">
          <Button color="secondary" className="text-white" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            color="primary"
            className="text-white"
            onClick={form.handleSubmit}
            disabled={form.isSubmitting || !form.isValid}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!isEdit && (
        <div className="mx-3 mb-3 p-3 border rounded bg-light">
          <Row className="g-2">
            <Col md={4}>
              <strong>Employee:</strong> {selectedEmployee?.label}
            </Col>
            <Col md={4}>
              <strong>PF Applicable:</strong>{" "}
              {selectedEmployee?.raw?.pfApplicable ? "Yes" : "No"}
            </Col>
            <Col md={4}>
              <strong>Gender:</strong> {selectedEmployee?.raw?.gender || "-"}
            </Col>
            <Col md={4}>
              <strong>Joining Date:</strong>{" "}
              {selectedEmployee?.raw?.joinningDate
                ? new Date(selectedEmployee.raw.joinningDate).toLocaleDateString(
                    "en-IN"
                  )
                : "-"}
            </Col>
            <Col md={4}>
              <strong>Change Type:</strong> {selectedChangeTypeOption?.label}
            </Col>
            {form.values.note && (
              <Col md={4}>
                <strong>Note:</strong> {form.values.note}
              </Col>
            )}
          </Row>
        </div>
      )}

      {isEdit && (
        <>
          <div className="mx-3 mb-3 p-3 border rounded bg-light">
            <Row className="g-2">
              <Col md={4}>
                <strong>Employee:</strong>{" "}
                {initialData?.employee?.name || "-"} (
                {initialData?.employee?.eCode || "-"})
              </Col>
              <Col md={4}>
                <strong>Department:</strong>{" "}
                {initialData?.employee?.department || "-"}
              </Col>
              <Col md={4}>
                <strong>Current Location:</strong>{" "}
                {initialData?.employee?.center?.title || "-"}
              </Col>
              <Col md={4}>
                <strong>PF Applicable:</strong>{" "}
                {initialData?.employee?.pfApplicable ? "Yes" : "No"}
              </Col>
              <Col md={4}>
                <strong>Gender:</strong> {initialData?.employee?.gender || "-"}
              </Col>
              <Col md={4}>
                <strong>Joining Date:</strong>{" "}
                {initialData?.employee?.joinningDate
                  ? new Date(
                      initialData.employee.joinningDate
                    ).toLocaleDateString("en-IN")
                  : "-"}
              </Col>
            </Row>
          </div>

          <Row className="g-3 mx-2 mb-3">
            <Col md={12}>
              <Label htmlFor="editChangeType">Change Type</Label>
              <Select
                inputId="editChangeType"
                options={changeTypeOptions}
                value={selectedChangeTypeOption}
                onChange={(opt) =>
                  form.setFieldValue("changeType", opt ? opt.value : "")
                }
                placeholder="Select change type (optional)..."
                isClearable
                isDisabled
              />
            </Col>
            <Col md={12}>
              <Label htmlFor="editNote">Note</Label>
              <textarea
                id="editNote"
                name="note"
                className="form-control"
                rows={3}
                value={form.values.note}
                onChange={form.handleChange}
                placeholder="Optional note..."
              />
            </Col>
          </Row>
        </>
      )}

      <Col xs={12} className="mt-2 mx-3">
        <h5 className="fw-semibold mb-1">Finance Details</h5>
        <hr className="mt-0" />
      </Col>

      <Row className="g-3 mx-2">
        <Col md={6}>
          <Label htmlFor="employeeGroups">Employee Group</Label>
          <Select
            inputId="employeeGroups"
            options={employeeGroupOptions}
            value={
              employeeGroupOptions.find(
                (opt) => opt.value === form.values.employeeGroups
              ) || null
            }
            onChange={(opt) =>
              form.setFieldValue("employeeGroups", opt ? opt.value : "")
            }
          />
        </Col>

        <Col md={6}>
          <Label htmlFor="account">Account</Label>
          <Select
            inputId="account"
            options={accountOptions}
            value={
              accountOptions.find((opt) => opt.value === form.values.account) ||
              null
            }
            onChange={(opt) =>
              form.setFieldValue("account", opt ? opt.value : "")
            }
          />
        </Col>

        <Col md={6}>
          <Label htmlFor="minimumWages">Minimum Wages</Label>
          <Input
            id="minimumWages"
            name="minimumWages"
            type="number"
            value={form.values.minimumWages}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.minimumWages && !!form.errors.minimumWages}
          />
          {errorText("minimumWages")}
        </Col>

        <Col md={6}>
          <Label htmlFor="shortWages">Short Wages</Label>
          <Input
            disabled
            id="shortWages"
            name="shortWages"
            type="number"
            value={form.values.shortWages}
          />
        </Col>

        <Col md={6}>
          <Label htmlFor="grossSalary">Gross Salary</Label>
          <Input
            id="grossSalary"
            name="grossSalary"
            type="number"
            value={form.values.grossSalary}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.grossSalary && !!form.errors.grossSalary}
          />
          {errorText("grossSalary")}
        </Col>

        <Col md={6}>
          <Label htmlFor="basicAmount">Basic Amount</Label>
          <Input
            id="basicAmount"
            name="basicAmount"
            type="number"
            value={form.values.basicAmount}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.basicAmount && !!form.errors.basicAmount}
          />
          {errorText("basicAmount")}
        </Col>

        <Col md={6}>
          <Label htmlFor="basicPercentage">Basic Percentage</Label>
          <Input
            disabled
            id="basicPercentage"
            name="basicPercentage"
            type="number"
            value={form.values.basicPercentage}
          />
        </Col>

        <Col md={6}>
          <Label htmlFor="HRAAmount">HRA</Label>
          <Input
            id="HRAAmount"
            name="HRAAmount"
            type="number"
            value={form.values.HRAAmount}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.HRAAmount && !!form.errors.HRAAmount}
          />
          {errorText("HRAAmount")}
        </Col>

        <Col md={6}>
          <Label htmlFor="HRAPercentage">HRA Percentage</Label>
          <Input
            disabled
            id="HRAPercentage"
            name="HRAPercentage"
            type="number"
            value={form.values.HRAPercentage}
          />
        </Col>

        <Col md={6}>
          <Label htmlFor="SPLAllowance">SPL Allowance</Label>
          <Input
            id="SPLAllowance"
            name="SPLAllowance"
            type="number"
            value={form.values.SPLAllowance}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.SPLAllowance && !!form.errors.SPLAllowance}
          />
          {errorText("SPLAllowance")}
        </Col>

        <Col md={6}>
          <Label htmlFor="conveyanceAllowance">Conveyance Allowance</Label>
          <Input
            id="conveyanceAllowance"
            name="conveyanceAllowance"
            type="number"
            value={form.values.conveyanceAllowance}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={
              form.touched.conveyanceAllowance &&
              !!form.errors.conveyanceAllowance
            }
          />
          {errorText("conveyanceAllowance")}
        </Col>

        <Col md={6}>
          <Label htmlFor="statutoryBonus">Statutory Bonus</Label>
          <Input
            id="statutoryBonus"
            name="statutoryBonus"
            type="number"
            value={form.values.statutoryBonus}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.statutoryBonus && !!form.errors.statutoryBonus}
          />
          {errorText("statutoryBonus")}
        </Col>

        <Col md={6}>
          <Label htmlFor="insurance">Insurance</Label>
          <Input
            id="insurance"
            name="insurance"
            type="number"
            value={form.values.insurance}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.insurance && !!form.errors.insurance}
          />
          {errorText("insurance")}
        </Col>

        <Col md={6}>
          <Label htmlFor="LWFSalary">LWF Salary</Label>
          <Input
            id="LWFSalary"
            name="LWFSalary"
            type="number"
            value={form.values.LWFSalary}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.LWFSalary && !!form.errors.LWFSalary}
          />
          {errorText("LWFSalary")}
        </Col>

        <Col md={6}>
          <Label htmlFor="LWFEmployee">LWF Employee</Label>
          <Input
            id="LWFEmployee"
            name="LWFEmployee"
            type="number"
            value={form.values.LWFEmployee}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.LWFEmployee && !!form.errors.LWFEmployee}
          />
          {errorText("LWFEmployee")}
        </Col>

        <Col md={6}>
          <Label htmlFor="LWFEmployer">LWF Employer</Label>
          <Input
            id="LWFEmployer"
            name="LWFEmployer"
            type="number"
            value={form.values.LWFEmployer}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.LWFEmployer && !!form.errors.LWFEmployer}
          />
          {errorText("LWFEmployer")}
        </Col>

        <Col md={6}>
          <Label htmlFor="ESICSalary">ESIC Salary</Label>
          <Input
            id="ESICSalary"
            name="ESICSalary"
            type="number"
            value={form.values.ESICSalary}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.ESICSalary && !!form.errors.ESICSalary}
          />
          {errorText("ESICSalary")}
        </Col>

        <Col md={6}>
          <Label htmlFor="ESICEmployee">ESIC Employee</Label>
          <Input
            disabled
            id="ESICEmployee"
            type="number"
            value={form.values.ESICEmployee}
          />
        </Col>

        <Col md={6}>
          <Label htmlFor="ESICEmployer">ESIC Employer</Label>
          <Input
            disabled
            id="ESICEmployer"
            type="number"
            value={form.values.ESICEmployer}
          />
        </Col>

        <Col md={6}>
          <Label htmlFor="TDSRate">TDS Rate</Label>
          <Input
            id="TDSRate"
            name="TDSRate"
            type="number"
            value={form.values.TDSRate}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.TDSRate && !!form.errors.TDSRate}
          />
          {errorText("TDSRate")}
        </Col>

        <Col md={6}>
          <Label htmlFor="PT">PT</Label>
          <Input disabled id="PT" type="number" value={form.values.PT} />
        </Col>

        <Col md={6}>
          <Label htmlFor="PFAmount">PF Amount</Label>
          <Input disabled id="PFAmount" type="number" value={form.values.PFAmount} />
        </Col>

        <Col md={6}>
          <Label htmlFor="PFEmployee">PF Employee Contribution</Label>
          <Input
            disabled
            id="PFEmployee"
            type="number"
            value={form.values.PFEmployee}
          />
        </Col>

        <Col md={6}>
          <Label htmlFor="PFEmployer">PF Employer Contribution</Label>
          <Input
            disabled
            id="PFEmployer"
            type="number"
            value={form.values.PFEmployer}
          />
        </Col>

        <Col md={6}>
          <Label htmlFor="inHandSalary">In Hand Salary</Label>
          <Input
            disabled
            id="inHandSalary"
            type="number"
            value={form.values.inHandSalary}
          />
        </Col>

        <Col md={6}>
          <Label htmlFor="debitStatementNarration">
            Debit Statement Narration
          </Label>
          <Input
            id="debitStatementNarration"
            name="debitStatementNarration"
            value={form.values.debitStatementNarration}
            onChange={(e) =>
              form.setFieldValue(
                "debitStatementNarration",
                e.target.value.toUpperCase()
              )
            }
            onBlur={form.handleBlur}
          />
        </Col>
      </Row>

      <div className="d-flex gap-2 justify-content-end my-4 mx-3">
        {!isEdit && (
          <Button color="secondary" className="text-white" onClick={handleBack}>
            Back
          </Button>
        )}
        <Button
          color="secondary"
          className="text-white"
          onClick={onCancel}
          disabled={form.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          className="text-white"
          onClick={form.handleSubmit}
          disabled={submitDisabled}
        >
          {form.isSubmitting ? (
            <Spinner size="sm" />
          ) : isEdit ? (
            "Update Finance"
          ) : (
            "Save Salary"
          )}
        </Button>
      </div>
    </div>
  );
};

FinanceForm.propTypes = {
  initialData: PropTypes.object,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  mode: PropTypes.oneOf(["EDIT", "CHANGE"]),
};

export default FinanceForm;
