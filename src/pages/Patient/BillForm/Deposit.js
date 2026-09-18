import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Input, Label, Button, Form } from "reactstrap";
import Divider from "../../../Components/Common/Divider";
import Payment from "./Components/Payment";

//data
import {
  BANK,
  CARD,
  CASH,
  CHEQUE,
  UPI,
  IPD,
  DEPOSIT,
} from "../../../Components/constants/patient";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { connect, useDispatch } from "react-redux";
import {
  addDeposit,
  createEditBill,
  fetchPaymentAccounts,
  updateDeposit,
} from "../../../store/actions";

// Each paymentModes row may carry a transient `evidenceFile` (a File, never sent as-is).
// Strip it before the array goes out as JSON, and collect it separately for FormData.
const stripEvidenceFiles = (modes) =>
  (modes || []).map(({ evidenceFile, ...rest }) => rest);

const collectEvidenceFiles = (modes) =>
  (modes || [])
    .filter((mode) => mode.evidenceFile)
    .map((mode) => ({ file: mode.evidenceFile, mode: mode.paymentMode }));

const buildTransactionProofFormData = (payload, evidenceEntries) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, key === "paymentModes" ? JSON.stringify(value) : value);
  });
  evidenceEntries.forEach(({ file }) => formData.append("transactionProof", file));
  formData.append(
    "transactionProofModes",
    JSON.stringify(evidenceEntries.map((entry) => entry.mode))
  );
  return formData;
};

const Deposit = ({
  toggleForm,
  author,
  patient,
  billDate,
  editBillData,
  paymentAgainstBillNo,
  type,
  admission,
  paymentAccounts,
}) => {
  console.log(admission, "admission");

  const dispatch = useDispatch();
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
  };

  useEffect(() => {
    let amount = 0;
    paymentModes?.forEach((p) => {
      amount += p.amount;
    });
    setTotalAmount(amount);
  }, [paymentModes]);

  const editData = editBillData?.deposit;
  const existingTransactionProof = editData?.transactionProof;

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      author: author._id,
      patient: patient._id,
      center: patient.center._id,
      addmission: admission || patient.addmission._id,
      paymentAgainstBillNo: editData
        ? editData.paymentAgainstBillNo
        : paymentAgainstBillNo
        ? paymentAgainstBillNo
        : "",
      remarks: editData ? editData.remarks : "",
      date: billDate,
      type,
      bill: DEPOSIT,
    },
    validationSchema: Yup.object({
      totalAmount: Yup.number().moreThan(0),
    }),
    onSubmit: (values) => {
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
        dispatch(
          updateDeposit(
            evidenceEntries.length > 0
              ? buildTransactionProofFormData(payload, evidenceEntries)
              : payload
          )
        );
      } else {
        const payload = {
          totalAmount: totalAmount,
          paymentModes: cleanPaymentModes,
          ...values,
        };
        dispatch(
          addDeposit(
            evidenceEntries.length > 0
              ? buildTransactionProofFormData(payload, evidenceEntries)
              : payload
          )
        );
      }
      dispatch(createEditBill({ data: null, bill: null, isOpen: false }));
      validation.resetForm();
    },
  });

  useEffect(() => {
    if (editBillData) {
      const deposit = editBillData.deposit;
      setPaymentModes(deposit?.paymentModes);
    }
  }, [editBillData]);

  useEffect(() => {
      if (patient.center._id) {
        dispatch(
          fetchPaymentAccounts({
            centerIds: [patient.center._id],
            page: 1,
            limit: 1000,
          })
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
            // toggle();
            return false;
          }}
          className="needs-validation"
          action="#"
        >
          <div className="d-flex flex-wrap gap-5">
            <div>
              <Label>
                Deposit <span className="text-danger">*</span>
              </Label>
              <p className="text-info mb-0 fs-5">{totalAmount || 0}</p>
            </div>
            <div>
              <Label>
                Mode Of Payment <span className="text-danger">*</span>
              </Label>
              <Input
                // bsSize='sm'
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
            />
          </div>
          <div className="mb-3 w-50 mt-5">
            <Label>Payment Against Bill Number</Label>
            <Input
              style={{ width: "200px" }}
              size={"sm"}
              type="text"
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
              >
                Cancel
              </Button>
              <Button size="sm" type="submit">
                Save
                {/* {chart ? "Update" : "Save"} */}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </React.Fragment>
  );
};

Deposit.propTypes = {
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
  paymentAccounts: state.Setting.paymentAccounts,
});

export default connect(mapStateToProps)(Deposit);
