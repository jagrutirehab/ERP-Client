import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Input, Label, Button, Form } from "reactstrap";
import Divider from "../../../Components/Common/Divider";
import Payment from "./Components/Payment";

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

  const editData = editBillData?.advancePayment;

  const validation = useFormik({
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
      bill: ADVANCE_PAYMENT,
    },
    validationSchema: Yup.object({
      totalAmount: Yup.number().moreThan(0),
    }),
    onSubmit: async (values) => {
      if (editData) {
        const response = await dispatch(
          updateAdvancePayment({
            id: editBillData._id,
            billId: editData._id,
            totalAmount: totalAmount,
            paymentModes: paymentModes,
            ...values,
          })
        ).unwrap();
        dispatch(
          setBillingStatus({
            patientId: patient._id,
            billingStatus: response.billingStatus,
          })
        );
      } else {
        const response = await dispatch(
          addAdvancePayment({
            totalAmount: totalAmount,
            paymentModes: paymentModes,
            ...values,
          })
        ).unwrap();
        dispatch(
          setBillingStatus({
            patientId: patient._id,
            billingStatus: response.billingStatus,
          })
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
            return false;
          }}
          className="needs-validation"
          action="#"
        >
          <div className="d-flex flex-wrap gap-5">
            <div>
              <Label>
                Advance Payment <span className="text-danger">*</span>
              </Label>
              <p className="text-info mb-0 fs-5">{totalAmount || 0}</p>
            </div>
            <div>
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
  paymentAccounts: state.Setting.paymentAccounts,
});

export default connect(mapStateToProps)(AdvancePayment);
