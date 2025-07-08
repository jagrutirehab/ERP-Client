import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Input, Label, Button, Form } from "reactstrap";
import Divider from "../../../Components/Common/Divider";
import Payment from "./component/Payment";
import {
  RECEIPT,
  BANK,
  CARD,
  CASH,
  CHEQUE,
  UPI,
} from "../../../Components/constants/intern";
import * as Yup from "yup";
import { useFormik } from "formik";
import { connect, useDispatch } from "react-redux";
import {
  addInternBillReceipt,
  createUpdate,
  editInternReceipt,
} from "../../../store/actions";

const InternReceipt = ({
  toggleForm,
  author,
  intern,
  billDate,
  editBillData,
  type,
  center
}) => {
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

  const editData = editBillData?.receipt;

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      author: author._id,
      intern: intern._id || "",
      center: center._id || "",
      remarks: editData ? editData.remarks : "",
      date: billDate,
      type,
      bill: RECEIPT,
    },
    validationSchema: Yup.object({
      totalAmount: Yup.number().moreThan(0),
    }),
    onSubmit: (values) => {
      console.log(values, "values");
      console.log(paymentModes, "paymentModes");
      console.log(totalAmount, "totalAmount");

      if (editData) {
        dispatch(
          editInternReceipt({
            id: editBillData._id,
            billId: editData._id,
            totalAmount: totalAmount,
            paymentModes: paymentModes,
            ...values,
          })
        );
      } else {
        dispatch(
          addInternBillReceipt({
            totalAmount: totalAmount,
            paymentModes: paymentModes,
            ...values,
          })
        );
      }

      dispatch(createUpdate({ data: null, bill: null, isOpen: false }));
      validation.resetForm();
    },
  });

  useEffect(() => {
    if (editBillData) {
      const internReceipt = editBillData.receipt;
      setPaymentModes(internReceipt?.paymentModes);
    }
  }, [editBillData]);

  return (
    <React.Fragment>
      <div>
        <Divider />
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
          }}
          className="needs-validation"
          action="#"
        >
          <div className="d-flex flex-wrap gap-5">
            <div>
              <Label>
                Intern Receipt <span className="text-danger">*</span>
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

InternReceipt.propTypes = {
  toggleForm: PropTypes.func,
  author: PropTypes.object.isRequired,
  intern: PropTypes.object.isRequired,
  billDate: PropTypes.any.isRequired,
  editBillData: PropTypes.object,
};

const mapStateToProps = (state) => ({
  author: state.User.user,
  intern: state.Intern.intern,
  billDate: state.Intern.billDate,
  editBillData: state.Intern.billForm?.data,
  center: state.Intern.intern.center,
  paymentAccounts: state.Setting.paymentAccounts,
});

export default connect(mapStateToProps)(InternReceipt);
