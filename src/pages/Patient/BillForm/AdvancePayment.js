import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Input, Label, Button, Form, Alert } from "reactstrap";
import Divider from "../../../Components/Common/Divider";
import Payment from "./Components/Payment";
import {
  evaluateEvidenceGuard,
  evaluatePosGuards,
  usePosTerminal,
} from "./Components/billGuards";

// data
import {
  ADVANCE_PAYMENT,
  BANK,
  CARD,
  CASH,
  CHEQUE,
  UPI,
} from "../../../Components/constants/patient";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  addAdvancePayment,
  createEditBill,
  updateAdvancePayment,
  fetchPaymentAccounts,
} from "../../../store/actions";
import { setBillingStatus } from "../../../store/features/patient/patientSlice";

// Each paymentModes row may carry a transient `evidenceFiles` array (Files, never sent as-is).
// Strip it before the array goes out as JSON, and collect it separately for FormData —
// one entry per file, with the mode repeated so the backend can pair them positionally.
const stripEvidenceFiles = (modes) =>
  (modes || []).map(({ evidenceFiles, ...rest }) => rest);

const collectEvidenceFiles = (modes) =>
  (modes || []).flatMap((mode) =>
    (mode.evidenceFiles || []).map((file) => ({ file, mode: mode.paymentMode }))
  );

// IDs of Pine Labs charges already approved on the terminal. The server
// re-reads each one from its own record before it will bill them, so sending
// the id is enough — the tender details are never trusted from here.
const collectPosTransactionIds = (modes) =>
  (modes || []).map((mode) => mode.posTransaction).filter(Boolean);

const buildTransactionProofFormData = (payload, evidenceEntries) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    // Only these two are structured; everything else (dates included) must go
    // across as its plain string form.
    const isJsonField = key === "paymentModes" || key === "posTransactionIds";
    formData.append(key, isJsonField ? JSON.stringify(value) : value);
  });
  evidenceEntries.forEach(({ file }) => formData.append("transactionProof", file));
  formData.append(
    "transactionProofModes",
    JSON.stringify(evidenceEntries.map((entry) => entry.mode))
  );
  return formData;
};

const AdvancePayment = ({
  toggleForm,
  author,
  patient,
  billDate,
  editBillData,
  paymentAgainstBillNo,
  type,
  admission,
  paymentAccounts,
  posPrefill,
  onCloseLockChange,
}) => {
  console.log(admission, "admission");

  const dispatch = useDispatch();
  const userCenters = useSelector((state) => state?.User?.centerAccess);

  const [paymentModes, setPaymentModes] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const addPaymentMode = (e) => {
    const value = e.target.value;
    const isIncluded = paymentModes.find((mode) => mode.paymentMode === value);

    if (isIncluded) return;

    const newPaymentModes = [
      ...paymentModes,
      {
        amount: 0,
        paymentMode: value,
      },
    ];
    setPaymentModes(newPaymentModes);

    // Trigger fetchPaymentAccounts if BANK is selected
    // if (value === BANK) {
    //   dispatch(fetchPaymentAccounts({ centerIds: userCenters }));
    // }
  };

  useEffect(() => {
    let amount = 0;
    paymentModes.forEach((p) => {
      amount += p.amount;
    });
    setTotalAmount(amount);
  }, [paymentModes]);

  // Opened from the POS dashboard to bill a payment the terminal already took.
  // The tender is rebuilt from Pine Labs' own response and locked — the whole
  // point is that nothing here is retyped, so the receipt matches the money.
  const isPosRecovery = !!posPrefill && !editBillData;

  useEffect(() => {
    if (!isPosRecovery) return;
    const result = posPrefill.result || {};
    setPaymentModes([
      {
        amount: posPrefill.amount,
        paymentMode: result.paymentMode || posPrefill.requestedMode,
        transactionId: result.rrn || result.transactionId || "",
        cardNumber: String(result.cardNumber || "").replace(/\D/g, "").slice(-4),
        // The account picked when the charge was sent. Empty on older charges,
        // which then fall back to the Pine Labs default.
        bankAccount: posPrefill.bankAccount || "",
        posTransaction: posPrefill._id,
        posApprovalCode: result.approvalCode,
        posReferenceId: posPrefill.plutusTransactionReferenceId,
        posPayerVpa: result.upiPayerVpa,
      },
    ]);
  }, [isPosRecovery, posPrefill]);

  const editData = editBillData?.advancePayment;
  const existingTransactionProof = editData?.transactionProof;

  // Guards: a card/UPI row on a POS centre must carry an approved charge
  // before the bill may be saved, and once one is approved the form cannot be
  // abandoned — the money is already gone.
  const { posAvailable } = usePosTerminal(patient?.center?._id);
  const posGuard = evaluatePosGuards(paymentModes, {
    posAvailable,
    tenderKey: "paymentMode",
    readOnly: isPosRecovery,
  });
  // Evidence is required for every non-cash tender that was not collected on
  // a terminal — see billGuards.js.
  const evidenceGuard = evaluateEvidenceGuard(paymentModes, {
    tenderKey: "paymentMode",
    existingTransactionProof,
    readOnly: isPosRecovery,
  });

  const blockSave = posGuard.blockSave || evidenceGuard.blockSave;
  const saveReason = posGuard.saveReason || evidenceGuard.saveReason;
  const { blockCancel, cancelReason } = posGuard;

  // Hide the modal's ✕ while Cancel is blocked; release it on unmount.
  useEffect(() => {
    onCloseLockChange?.(blockCancel);
  }, [blockCancel, onCloseLockChange]);
  useEffect(() => () => onCloseLockChange?.(false), [onCloseLockChange]);


  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      author: author._id,
      patient: patient._id,
      center: patient.center._id,
      addmission: admission || patient.addmission._id,
      paymentAgainstBillNo: editData
        ? editData.paymentAgainstBillNo
        : paymentAgainstBillNo ||
          (isPosRecovery ? posPrefill.paymentAgainstBillNo : "") ||
          "",
      remarks: editData
        ? editData.remarks
        : isPosRecovery
          ? `Recovered from POS payment ${posPrefill.transactionNumber} — collected ${new Date(
              posPrefill.createdAt,
            ).toLocaleString()}${
              posPrefill.result?.rrn ? `, RRN ${posPrefill.result.rrn}` : ""
            }`
          : "",
      date: billDate,
      type,
      bill: ADVANCE_PAYMENT,
    },
    validationSchema: Yup.object({
      totalAmount: Yup.number().moreThan(0),
    }),
    onSubmit: async (values) => {
      const evidenceEntries = collectEvidenceFiles(paymentModes);
      const cleanPaymentModes = stripEvidenceFiles(paymentModes);

      if (editData) {
        const payload = {
          id: editBillData._id,
          billId: editData._id,
          totalAmount: totalAmount,
          paymentModes: cleanPaymentModes,
          ...values,
        };
        const response = await dispatch(
          updateAdvancePayment(
            evidenceEntries.length > 0
              ? buildTransactionProofFormData(payload, evidenceEntries)
              : payload
          ),
        ).unwrap();
        dispatch(
          setBillingStatus({
            patientId: patient._id,
            billingStatus: response.billingStatus,
          }),
        );
      } else {
        const posTransactionIds = collectPosTransactionIds(paymentModes);
        const payload = {
          totalAmount: totalAmount,
          paymentModes: cleanPaymentModes,
          ...(posTransactionIds.length ? { posTransactionIds } : {}),
          ...values,
        };
        const response = await dispatch(
          addAdvancePayment(
            evidenceEntries.length > 0
              ? buildTransactionProofFormData(payload, evidenceEntries)
              : payload
          ),
        ).unwrap();
        dispatch(
          setBillingStatus({
            patientId: patient._id,
            billingStatus: response.billingStatus,
          }),
        );
      }
      dispatch(createEditBill({ data: null, bill: null, isOpen: false }));
      validation.resetForm();
    },
  });

  useEffect(() => {
    if (editBillData) {
      const advancePayment = editBillData.advancePayment;
      setPaymentModes(advancePayment?.paymentModes || []);
    }
  }, [editBillData]);

  useEffect(() => {
    if (patient.center._id) {
      dispatch(
        fetchPaymentAccounts({
          centerIds: [patient.center._id],
          page: 1,
          limit: 1000,
        }),
        // fetchPaymentAccounts({ centerIds: userCenters, page: 1, limit: 1000 })
      );
    }
  }, [dispatch, patient.center._id]);

  return (
    <React.Fragment>
      <div>
        <Divider />
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            return false;
          }}
          className="needs-validation"
          action="#"
        >
          {isPosRecovery && (
            <Alert color="info" className="fs-12 py-2">
              <i className="ri-bank-card-line me-1"></i>
              Billing a payment the terminal already took on{" "}
              <strong>
                {new Date(posPrefill.createdAt).toLocaleString()}
              </strong>
              {posPrefill.result?.rrn ? ` (RRN ${posPrefill.result.rrn})` : ""}.
              The tender is locked to what Pine Labs reported — nobody is
              charged again. Press Save to record it.
            </Alert>
          )}

          <div className="d-flex flex-wrap gap-5">
            <div>
              <Label>
                Advance Payment <span className="text-danger">*</span>
              </Label>
              <p className="text-info mb-0 fs-5">{totalAmount || 0}</p>
            </div>
            <div className={isPosRecovery ? "d-none" : ""}>
              <Label>
                Mode Of Payment <span className="text-danger">*</span>
              </Label>
              <Input
                className="w-100"
                size={"sm"}
                name="modeOfPayment"
                onChange={(e) => addPaymentMode(e)}
                type="select"
              >
                <option style={{ display: "none" }} value=""></option>
                <option value={CASH}>Cash</option>
                <option value={CARD}>Card</option>
                <option value={CHEQUE}>Cheque</option>
                <option value={BANK}>Bank</option>
                <option value={UPI}>UPI</option>
              </Input>
            </div>
          </div>

          <div className="mt-3">
            <Payment
              paymentModes={paymentModes}
              setPaymentModes={setPaymentModes}
              existingTransactionProof={existingTransactionProof}
              readOnly={isPosRecovery}
              // Enables "Charge on POS" on card/UPI rows when this centre has
              // a Pine Labs machine configured. Editing an existing bill does
              // not re-charge, and neither does billing a charge that already
              // happened, so neither offers the action.
              posContext={
                editData
                  ? undefined
                  : {
                      center: patient.center._id,
                      patient: patient._id,
                      addmission: admission || patient.addmission?._id,
                      purpose: "ADVANCE_PAYMENT",
                      billType: type,
                      // Carried so a recovered charge reopens against the same
                      // invoice the cashier was paying.
                      paymentAgainstBillNo:
                        validation.values.paymentAgainstBillNo || undefined,
                    }
              }
            />
          </div>

          <div className="mb-3 w-50 mt-5">
            <Label>Payment Against Bill Number</Label>
            <Input
              style={{ width: "200px" }}
              size={"sm"}
              type="text"
              disabled={true}
              name="paymentAgainstBillNo"
              value={validation.values.paymentAgainstBillNo || ""}
              onChange={validation.handleChange}
            />
          </div>

          <div className="mt-3 w-75">
            <Label>Remarks</Label>
            <Input
              type="textarea"
              name="remarks"
              value={validation.values.remarks || ""}
              onChange={validation.handleChange}
            />
          </div>

          <div className="mt-3">
            {(saveReason || cancelReason) && (
              <div className="text-danger fs-11 text-end mb-2">
                <i className="ri-error-warning-line me-1"></i>
                {saveReason || cancelReason}
              </div>
            )}
            <div className="d-flex gap-3 justify-content-end">
              <Button
                onClick={() => {
                  toggleForm();
                  validation.resetForm();
                  setTotalAmount(0);
                  setPaymentModes([]);
                }}
                size="sm"
                color="danger"
                type="button"
                disabled={blockCancel}
                title={cancelReason || undefined}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={blockSave}
                title={saveReason || undefined}
              >
                Save
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </React.Fragment>
  );
};

AdvancePayment.propTypes = {
  toggleForm: PropTypes.func,
  author: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  billDate: PropTypes.any.isRequired,
  editBillData: PropTypes.object,
  paymentAgainstBillNo: PropTypes.string,
};

const mapStateToProps = (state) => ({
  drugs: state.Medicine.data,
  author: state.User.user,
  patient: state.Patient.patient,
  billDate: state.Bill.billDate,
  editBillData: state.Bill.billForm.data,
  admission: state.Bill.billForm.admission,
  paymentAgainstBillNo: state.Bill.billForm.paymentAgainstBillNo,
  posPrefill: state.Bill.billForm.posPrefill,
  paymentAccounts: state.Setting.paymentAccounts,
});

export default connect(mapStateToProps)(AdvancePayment);
