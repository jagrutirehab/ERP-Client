import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  annualToMonthly,
  annualFieldValue,
  annualBreakupGross,
} from "../../../../utils/salaryUnit";

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
  // Amount fields are entered/displayed YEARLY (read the persisted yearly
  // snapshot, falling back to monthly × 12 for records saved before yearly entry).
  grossSalary: annualBreakupGross(initialData?.financeDetails),
  basicAmount: annualFieldValue(initialData?.financeDetails, "basicAmount"),
  HRAAmount: annualFieldValue(initialData?.financeDetails, "HRAAmount"),
  SPLAllowance: annualFieldValue(initialData?.financeDetails, "SPLAllowance"),
  conveyanceAllowance: annualFieldValue(
    initialData?.financeDetails,
    "conveyanceAllowance"
  ),
  statutoryBonus: annualFieldValue(initialData?.financeDetails, "statutoryBonus"),
  // Minimum wages is a MONTHLY statutory floor (not converted).
  minimumWages: initialData?.financeDetails?.minimumWages || 0,
  ESICSalary: initialData?.financeDetails?.ESICSalary || 0,
  LWFSalary: annualFieldValue(initialData?.financeDetails, "LWFSalary"),
  LWFEmployee: annualFieldValue(initialData?.financeDetails, "LWFEmployee"),
  LWFEmployer: annualFieldValue(initialData?.financeDetails, "LWFEmployer"),
  insurance: annualFieldValue(initialData?.financeDetails, "insurance"),
  // variable & reimbursement are pure yearly CTC add-ons — stored as-is, not split.
  variable: initialData?.financeDetails?.annual?.variable ?? initialData?.financeDetails?.variable ?? 0,
  reimbursement: initialData?.financeDetails?.annual?.reimbursement ?? initialData?.financeDetails?.reimbursement ?? 0,
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
  gratuity: initialData?.financeDetails?.gratuity || 0,
  totalCostToCompany: initialData?.financeDetails?.totalCostToCompany || 0,
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
    variable: buildNumberSchema("Variable"),
    reimbursement: buildNumberSchema("Reimbursement"),
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
          variable: Number(values.variable),
          reimbursement: Number(values.reimbursement),
          TDSRate: Number(values.TDSRate),
          debitStatementNarration: values.debitStatementNarration || "",
          // Amount fields above are yearly; the server splits them into monthly.
          salaryUnit: "ANNUAL",
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

  const payrollInitializedRef = useRef(false);

  useEffect(() => {
    // form.values holds YEARLY amounts; calculatePayroll is monthly, so feed it
    // the monthly equivalents (the derived fields below are therefore monthly).
    const payroll = calculatePayroll({
      ...form.values,
      ...annualToMonthly(form.values),
      pfApplicable: employeeData?.newEmploymentType === "FULL_TIME",
      gender: employeeData?.gender || "",
      joinningDate: employeeData?.joinningDate || "",
      currentLocation: employeeData?.currentLocation || null,
    });

    const isFirstRunInEdit = isEdit && !payrollInitializedRef.current;
    payrollInitializedRef.current = true;

    Object.entries(payroll).forEach(([key, value]) => {
      if (isFirstRunInEdit && form.values[key]) return;
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
    form.values.variable,
    form.values.reimbursement,
    form.values.minimumWages,
    form.values.TDSRate,
  ]);

  // Gross is the sum of the breakup components (read-only). Keep it in sync as
  // HR edits the components so it can never drift from the breakup total.
  useEffect(() => {
    const total = getSalaryBreakupTotal(form.values);
    if (getNumericValue(form.values.grossSalary) !== total) {
      form.setFieldValue("grossSalary", total, false);
    }
  }, [
    form,
    form.values.basicAmount,
    form.values.HRAAmount,
    form.values.SPLAllowance,
    form.values.conveyanceAllowance,
    form.values.statutoryBonus,
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

  // Monthly equivalents of the yearly INPUT fields, shown under each amount field.
  const monthlyView = annualToMonthly(form.values);
  const monthlyHint = (fieldName) => (
    <div className="text-muted small mt-1">
      Monthly ≈ ₹{(monthlyView[fieldName] || 0).toLocaleString("en-IN")}
    </div>
  );

  // Calculated (disabled) fields hold MONTHLY values; show them yearly (× 12)
  // in the box with the monthly figure underneath, to match the input fields.
  const yearlyValue = (fieldName) =>
    Math.round(Number(form.values[fieldName]) || 0) * 12;
  const monthlyHintFrom = (fieldName) => (
    <div className="text-muted small mt-1">
      Monthly ≈ ₹{(Math.round(Number(form.values[fieldName]) || 0)).toLocaleString("en-IN")}
    </div>
  );

  // Professional Tax carries a February surcharge (₹300 vs ₹200 in the higher
  // slab), so its yearly total is 11 normal months + February, not PT × 12.
  const ptMonthly = Math.round(Number(form.values.PT) || 0);
  const ptIsBumpSlab = ptMonthly === 200 || ptMonthly === 300;
  const ptRegularMonthly = ptMonthly === 300 ? 200 : ptMonthly;
  const ptYearly = ptIsBumpSlab ? ptRegularMonthly * 11 + 300 : ptMonthly * 12;

  // Yearly deductions = monthly × 12, but the PT portion uses the true yearly PT
  // (which carries the February surcharge) instead of PT × 12.
  const deductionsYearly =
    yearlyValue("deductions") + ptYearly - ptMonthly * 12;

  // Yearly CTC = monthly recurring CTC × 12 + the pure-yearly add-ons
  // (variable, reimbursement), which are added once, not split into monthly.
  const ctcYearly =
    yearlyValue("totalCostToCompany") +
    Number(form.values.variable || 0) +
    Number(form.values.reimbursement || 0);

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
          <Label htmlFor="minimumWages">Minimum Wages (Monthly)</Label>
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
          <Label htmlFor="shortWages">Short Wages (Monthly)</Label>
          <Input
            disabled
            id="shortWages"
            name="shortWages"
            type="number"
            value={form.values.shortWages}
          />
        </Col>

        <Col md={6}>
          <Label htmlFor="grossSalary">Gross Salary (Yearly)</Label>
          <Input
            disabled
            id="grossSalary"
            name="grossSalary"
            type="number"
            value={form.values.grossSalary}
          />
          {errorText("grossSalary")}
          {monthlyHint("grossSalary")}
        </Col>

        <Col md={6}>
          <Label htmlFor="basicAmount">Basic Amount (Yearly)</Label>
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
          {monthlyHint("basicAmount")}
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
          <Label htmlFor="HRAAmount">HRA (Yearly)</Label>
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
          {monthlyHint("HRAAmount")}
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
          <Label htmlFor="SPLAllowance">SPL Allowance (Yearly)</Label>
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
          {monthlyHint("SPLAllowance")}
        </Col>

        <Col md={6}>
          <Label htmlFor="conveyanceAllowance">Conveyance Allowance (Yearly)</Label>
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
          {monthlyHint("conveyanceAllowance")}
        </Col>

        <Col md={6}>
          <Label htmlFor="statutoryBonus">Statutory Bonus (Yearly)</Label>
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
          {monthlyHint("statutoryBonus")}
        </Col>

        <Col md={6}>
          <Label htmlFor="insurance">Insurance (Yearly)</Label>
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
          {monthlyHint("insurance")}
        </Col>

        <Col md={6}>
          <Label htmlFor="variable">Variable (Yearly)</Label>
          <Input
            id="variable"
            name="variable"
            type="number"
            value={form.values.variable}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.variable && !!form.errors.variable}
          />
          {errorText("variable")}
          <div className="text-muted small mt-1">Added to yearly CTC</div>
        </Col>

        <Col md={6}>
          <Label htmlFor="reimbursement">Reimbursement (Yearly)</Label>
          <Input
            id="reimbursement"
            name="reimbursement"
            type="number"
            value={form.values.reimbursement}
            onChange={handleNumericFieldChange}
            onBlur={form.handleBlur}
            invalid={form.touched.reimbursement && !!form.errors.reimbursement}
          />
          {errorText("reimbursement")}
          <div className="text-muted small mt-1">Added to yearly CTC</div>
        </Col>

        <Col md={6}>
          <Label htmlFor="LWFSalary">LWF Salary (Yearly)</Label>
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
          {monthlyHint("LWFSalary")}
        </Col>

        <Col md={6}>
          <Label htmlFor="LWFEmployee">LWF Employee (Yearly)</Label>
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
          {monthlyHint("LWFEmployee")}
        </Col>

        <Col md={6}>
          <Label htmlFor="LWFEmployer">LWF Employer (Yearly)</Label>
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
          {monthlyHint("LWFEmployer")}
        </Col>

        <Col md={6}>
          <Label htmlFor="ESICSalary">ESIC Salary (Yearly)</Label>
          <Input
            disabled
            id="ESICSalary"
            name="ESICSalary"
            type="number"
            value={yearlyValue("ESICSalary")}
          />
          {monthlyHintFrom("ESICSalary")}
        </Col>

        <Col md={6}>
          <Label htmlFor="ESICEmployee">ESIC Employee (Yearly)</Label>
          <Input
            disabled
            id="ESICEmployee"
            type="number"
            value={yearlyValue("ESICEmployee")}
          />
          {monthlyHintFrom("ESICEmployee")}
        </Col>

        <Col md={6}>
          <Label htmlFor="ESICEmployer">ESIC Employer (Yearly)</Label>
          <Input
            disabled
            id="ESICEmployer"
            type="number"
            value={yearlyValue("ESICEmployer")}
          />
          {monthlyHintFrom("ESICEmployer")}
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
          <Label htmlFor="PT">PT (Yearly)</Label>
          <Input disabled id="PT" type="number" value={ptYearly} />
          <div className="text-muted small mt-1">
            Monthly ≈ ₹{ptRegularMonthly.toLocaleString("en-IN")}
            {ptIsBumpSlab ? " (₹300 in February)" : ""}
          </div>
        </Col>

        <Col md={6}>
          <Label htmlFor="PFAmount">PF Amount (Yearly)</Label>
          <Input disabled id="PFAmount" type="number" value={yearlyValue("PFAmount")} />
          {monthlyHintFrom("PFAmount")}
        </Col>

        <Col md={6}>
          <Label htmlFor="PFEmployee">PF Employee Contribution (Yearly)</Label>
          <Input
            disabled
            id="PFEmployee"
            type="number"
            value={yearlyValue("PFEmployee")}
          />
          {monthlyHintFrom("PFEmployee")}
        </Col>

        <Col md={6}>
          <Label htmlFor="PFEmployer">PF Employer Contribution (Yearly)</Label>
          <Input
            disabled
            id="PFEmployer"
            type="number"
            value={yearlyValue("PFEmployer")}
          />
          {monthlyHintFrom("PFEmployer")}
        </Col>

        <Col md={6}>
          <Label htmlFor="deductions">Total Deductions (Yearly)</Label>
          <Input
            disabled
            id="deductions"
            type="number"
            value={deductionsYearly}
          />
          {monthlyHintFrom("deductions")}
        </Col>

        <Col md={6}>
          <Label htmlFor="inHandSalary">In Hand Salary (Yearly)</Label>
          <Input
            disabled
            id="inHandSalary"
            type="number"
            value={yearlyValue("inHandSalary")}
          />
          {monthlyHintFrom("inHandSalary")}
        </Col>

        <Col md={6}>
          <Label htmlFor="gratuity">Gratuity (Yearly)</Label>
          <Input
            disabled
            id="gratuity"
            type="number"
            value={yearlyValue("gratuity")}
          />
          {monthlyHintFrom("gratuity")}
        </Col>

        <Col md={6}>
          <Label htmlFor="totalCostToCompany">Total Cost To Company (Yearly)</Label>
          <Input
            disabled
            id="totalCostToCompany"
            type="number"
            value={ctcYearly}
          />
          {monthlyHintFrom("totalCostToCompany")}
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
