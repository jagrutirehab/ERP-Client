import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setAlert } from "../alert/alertSlice";
import {
  convertDepositToAdvance,
  deleteBill,
  deleteDraftBill,
  editAdvancePayment,
  editDeposit,
  editDraftInvoice,
  editInvoice,
  editProformaInvoice,
  getBills,
  getBillsAddmissions,
  getDraftBills,
  postAdvancePayment,
  postDeposit,
  postDraftInvoice,
  postDraftToInvoice,
  postInvoice,
  postProformaInvoice,

} from "../../../helpers/backend_helper";
import { IPD, OPD } from "../../../Components/constants/patient";
import { togglePrint } from "../print/printSlice";
import { removeEventBill, setEventBill } from "../booking/bookingSlice";
// import { extraAction } from "../extraAction";

const initialState = {
  data: [],
  draftData: [],
  opdData: [],
  proforma_invoice: [],
  billForm: {
    bill: null,
    isOpen: false,
  },
  billDate: new Date().toISOString(),
  loading: false,
  billLoading: false,
  totalAdvancePayment: 0,
  totalInvoicePayment: 0,
  totalDeposit: 0,
  totalRefund: 0,
  totalAmount: 0,
  billType: "",
};

export const fetchBillsAddmissions = createAsyncThunk(
  "getBillsAddmissions",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getBillsAddmissions(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchBills = createAsyncThunk(
  "getBills",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getBills(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchDraftBills = createAsyncThunk(
  "getDraftBills",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getDraftBills(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addInvoice = createAsyncThunk(
  "postInvoice",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postInvoice(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Invoice Saved Successfully",
        })
      );
      const payload = response?.bill;
      const patient = response?.patient;
      const appointment = response?.appointment;
      if (data?.type === OPD) {
        dispatch(setEventBill({ bill: payload, appointment }));
        dispatch(togglePrint({ modal: true, data: payload, patient: patient }));
      }

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);


export const addDraftInvoice = createAsyncThunk(
  "postDraftInvoice",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postDraftInvoice(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Invoice Draft Saved Successfully",
        })
      );

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateDraftInvoice = createAsyncThunk(
  "editDraftInvoice",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editDraftInvoice(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Invoice Draft Updated Successfully",
        })
      );

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const draftToInvoice = createAsyncThunk(
  "draftToInvoice",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postDraftToInvoice(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Invoice Saved Successfully",
        })
      );

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

// export const addOPDInvoice = createAsyncThunk(
//   "postInvoice",
//   async (data, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await postInvoice(data);
//       dispatch(
//         setAlert({
//           type: "success",
//           message: "Invoice Saved Successfully",
//         })
//       );

//       const payload = response?.bill;
//       const patient = response?.patient;
//       const appointment = response?.appointment;
//       if (payload.type === OPD) {
//         dispatch(setEventBill({ bill: payload, appointment }));
//         dispatch(togglePrint({ modal: true, data: payload, patient: patient }));
//       }

//       return response;
//     } catch (error) {
//       dispatch(setAlert({ type: "error", message: error.message }));
//       return rejectWithValue("something went wrong");
//     }
//   }
// );

export const updateInvoice = createAsyncThunk(
  "editInvoice",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editInvoice(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Invoice Updated Successfully",
        })
      );

      const payload = response?.payload;
      const appointment = response?.appointment;
      if (payload.type === OPD) {
        dispatch(setEventBill({ bill: payload, appointment }));
        if (data.shouldPrintAfterSave)
          dispatch(
            togglePrint({
              modal: true,
              data: payload,
              patient: payload.patient,
            })
          );
      }
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addAdvancePayment = createAsyncThunk(
  "postAdvancePayment",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postAdvancePayment(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Payment Saved Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateAdvancePayment = createAsyncThunk(
  "editAdvancePayment",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editAdvancePayment(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Payment Updated Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addDeposit = createAsyncThunk(
  "postDeposit",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postDeposit(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Deposit Saved Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateDeposit = createAsyncThunk(
  "editDeposit",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editDeposit(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Deposit Updated Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const depositToAdvance = createAsyncThunk(
  "convertDepositToAdvance",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await convertDepositToAdvance(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Deposit Converted to Advance Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeDraft = createAsyncThunk(
  "deleteDraft",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteDraftBill(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Invoice Draft Deleted Successfully",
        })
      );

      if (response.payload?.type === OPD) {
        dispatch(removeEventBill(response.payload));
      }

      if (response) return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeBill = createAsyncThunk(
  "deleteBill",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteBill(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Bill Deleted Successfully",
        })
      );

      if (response.payload?.type === OPD) {
        dispatch(removeEventBill(response.payload));
      }

      if (response) return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);


export const addProformaInvoice = createAsyncThunk(
  "postProformaInvoice",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postProformaInvoice({ ...data, bill: "PROFORMA_INVOICE" });
      dispatch(
        setAlert({
          type: "success",
          message: "Proforma Invoice Saved Successfully",
        })
      );
      const payload = response?.bill;
      const patient = response?.patient;
      const appointment = response?.appointment;
      if (data?.type === OPD) {
        dispatch(setEventBill({ bill: payload, appointment }));
        dispatch(togglePrint({ modal: true, data: payload, patient: patient }));
      }

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateProformaInvoice = createAsyncThunk(
  "updateProformaInvoice",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editProformaInvoice({ ...data, bill: "PROFORMA_INVOICE" });
      dispatch(
        setAlert({
          type: "success",
          message: "Proforma Invoice Saved Successfully",
        })
      );
      const payload = response?.bill;
      const patient = response?.patient;
      const appointment = response?.appointment;
      if (data?.type === OPD) {
        dispatch(setEventBill({ bill: payload, appointment }));
        dispatch(togglePrint({ modal: true, data: payload, patient: patient }));
      }

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);



export const billSlice = createSlice({
  name: "Bill",
  initialState,
  reducers: {
    updateBillAdmission: (state, { payload }) => {
      const index = state.data?.findIndex((d) => d._id === payload._id);

      if (index >= 0) {
        state.data[index]["addmissionDate"] = payload.addmissionDate;
        state.data[index]["dischargeDate"] = payload.dischargeDate;
      }
    },
    createEditBill: (state, { payload }) => {
      state.billForm = payload;
    },
    createProformaBill: (state, { payload }) => {
      state.billForm = payload;
    },
    setBillDate: (state, { payload }) => {
      state.billDate = payload;
    },
    setBillType: (state, { payload }) => {
      state.billType = payload;
    },
    setBillAdmission: (state, { payload }) => {
      const index = state.data?.findIndex((d) => d._id === payload._id);
      state.data[index] = payload;
    },
    resetOpdPatientBills: (state) => {
      state.data = [];
      state.totalAdvancePayment = 0;
      state.totalInvoicePayment = 0;
      state.totalAmount = 0;
    },
    setTotalAmount: (state, { payload }) => {
      state.calculatedPayable = payload.calculatedPayable;
      state.calculatedAdvance = payload.calculatedAdvance;
      state.totalPayable = payload.totalPayable;
      state.totalAdvance = payload.totalAdvance;
      state.totalDeposit = payload.totalDeposit;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillsAddmissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBillsAddmissions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
        state.totalAdvancePayment = payload.totalAdvancePayment;
        state.totalInvoicePayment = payload.totalInvoicePayment;
        state.totalRefund = payload.totalRefund;
        state.totalAmount = payload.totalAmount;
      })
      .addCase(fetchBillsAddmissions.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchBills.pending, (state) => {
        state.billLoading = true;
      })
      .addCase(fetchBills.fulfilled, (state, { payload }) => {
        state.billLoading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.addmission
        );
        state.data[findIndex].bills = payload.payload;
      })
      .addCase(fetchBills.rejected, (state) => {
        state.billLoading = false;
      });

    builder
      .addCase(fetchDraftBills.pending, (state) => {
        // state.billLoading = true;
      })
      .addCase(fetchDraftBills.fulfilled, (state, { payload }) => {
        // state.billLoading = false;
        state.draftData = payload.payload;
      })
      .addCase(fetchDraftBills.rejected, (state) => {
        // state.billLoading = false;
      });

    builder
      .addCase(addDraftInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(addDraftInvoice.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.draftData = payload.payload;
      })
      .addCase(addDraftInvoice.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(draftToInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(draftToInvoice.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.draftData = state.draftData.filter(
          (d) => d._id !== payload.payload
        );
        if (payload.newAdmission) {
          state.data = [payload.newAdmission, ...state.data];
        } else {
          const findAdmissionIndex = state.data.findIndex(
            (el) => el._id === payload.admission
          );
          state.data[findAdmissionIndex].totalBills += 1;
          state.data[findAdmissionIndex].bills = payload.bills;
        }
      })
      .addCase(draftToInvoice.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateDraftInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDraftInvoice.fulfilled, (state, { payload }) => {
        state.loading = false;
        // const findIndex = state.draftData.findIndex(
        //   (el) => el._id === payload.payload._id
        // );
        state.draftData = payload.payload; //[findIndex]
      })
      .addCase(updateDraftInvoice.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(addInvoice.fulfilled, (state, { payload }) => {

        if (payload?.bill?.type === OPD) {
          state.opdData = [payload.bill, ...state.opdData];
        } else {
          if (payload.isAddmissionAvailable) {
            const findIndex = state.data.findIndex(
              (el) => el._id === payload.addmission
            );
            // state.data[findIndex].totalBills += 1;
            /* ------ Global Calculations ------- */
            state.totalInvoicePayment += payload.bill?.invoice?.payable ?? 0;
            state.totalRefund += payload.bill?.invoice?.refund ?? 0;
            state.totalAmount = Math.abs(
              state.totalInvoicePayment +
              state.totalRefund -
              state.totalAdvancePayment
            );
            // if (state.totalInvoicePayment > state.totalAdvancePayment) state.totalAmount +=
            /* ------update calculations when new invoice is created------ */
            // state.data[findIndex].totalInvoicePayable +=
            //   payload.bill.invoice?.payable ?? 0;
            // state.data[findIndex].totalRefund +=
            //   payload.bill.invoice?.refund ?? 0;
            // state.data[findIndex].calculatedAmount += Math.abs(
            //   state.data[findIndex].totalInvoicePayable +
            //     (state.data[findIndex].totalRefund || 0) -
            //     state.data[findIndex].totalAdvancePayment
            // );
            /* ------update calculations when new invoice is created------ */
            state.data[findIndex].bills = payload.payload;
          } else {
            state.totalAdvancePayment +=
              payload.payload[0]?.totalAdvancePayment ?? 0;
            state.totalInvoicePayment +=
              payload.payload[0]?.totalInvoicePayable ?? 0;
            state.totalRefund += payload.payload[0]?.totalRefund ?? 0;
            state.totalAmount = Math.abs(
              state.totalInvoicePayment +
              (state.totalRefund || 0) -
              state.totalAdvancePayment
            );

            const admission = {
              ...payload.addmissionData,
              bills: payload.payload,
              totalBills: 1,
            };
            state.data = [admission, ...state.data];
          }
        }
        state.loading = false;
      })
      .addCase(addInvoice.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateInvoice.fulfilled, (state, { payload }) => {
        state.loading = false;

        if (payload?.payload?.type === OPD) {
          //OPD BILLS
          // const findIndex = state.opdData.findIndex(
          //   (el) => el._id === payload.payable._id
          // );
          // state.opdData[findIndex] = payload.payload;
        } else {
          //IPD BILLS
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.addmission
          );
          /* ------update calculations when invoice is updated------ */
          const findBillIndex = state.data[findIndex].bills.findIndex(
            (bill) => bill._id === payload.bill?._id
          );
          const currentBillInAddmission =
            state.data[findIndex].bills[findBillIndex];
          /* ------ Global Calculations ------- */
          state.totalInvoicePayment -=
            state.data[findIndex]?.totalInvoicePayable;
          state.totalInvoicePayment +=
            payload.addmissionData[0]?.totalInvoicePayable;
          state.totalRefund -= state.data[findIndex]?.totalRefund;
          state.totalRefund += payload.addmissionData[0]?.totalRefund;
          state.totalAmount = Math.abs(
            state.totalInvoicePayment -
            state.totalAdvancePayment +
            state.totalRefund
          );
          // state.totalInvoicePayment -=
          //   currentBillInAddmission?.invoice?.payable;
          // state.totalInvoicePayment += payload?.bill?.invoice?.payable;

          // state.totalRefund -= currentBillInAddmission?.invoice?.refund || 0;
          // state.totalRefund += payload?.bill?.invoice?.refund || 0;

          // state.totalAmount = Math.abs(
          //   state.totalInvoicePayment +
          //     state.totalRefund -
          //     state.totalAdvancePayment
          // );
          /* ------ Global Calculations ------- */
          state.data[findIndex].totalInvoicePayable =
            payload.addmissionData[0]?.totalInvoicePayable;
          state.data[findIndex].totalRefund =
            payload.addmissionData[0]?.totalRefund;
          state.data[findIndex].calculatedAmount =
            payload.addmissionData[0]?.calculatedAmount;
          /* subtract bill previous amount so that new amount is computed with it */
          // state.data[findIndex].totalInvoicePayable -=
          //   currentBillInAddmission?.invoice?.payable;
          // state.data[findIndex].totalInvoicePayable +=
          //   payload.bill.invoice?.payable ?? 0;

          // state.data[findIndex].totalRefund -=
          //   currentBillInAddmission?.invoice?.refund || 0;
          // state.data[findIndex].totalRefund +=
          //   payload.bill?.invoice?.refund || 0;
          /* subtract bill previous amount so that new amount is computed with it */

          // state.data[findIndex].calculatedAmount += Math.abs(
          //   state.data[findIndex].totalInvoicePayable -
          //     state.data[findIndex].totalAdvancePayment
          // );
          /* ------update calculations when new invoice is updated------ */
          state.data[findIndex].bills = payload.payload;
        }
      })
      .addCase(updateInvoice.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addAdvancePayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAdvancePayment.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.isAddmissionAvailable) {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.addmission
          );
          state.data[findIndex].totalBills += 1;
          /* ------ Global Calculations ------- */
          state.totalAdvancePayment +=
            payload.bill?.advancePayment?.totalAmount ?? 0;
          state.totalAmount = Math.abs(
            state.totalAdvancePayment -
            (state.totalInvoicePayment + state.totalRefund)
          );
          /* ------update calculations when new advance payament is created------ */
          state.data[findIndex].totalAdvancePayment +=
            payload.bill.advancePayment?.totalAmount ?? 0;
          state.data[findIndex].calculatedAmount = Math.abs(
            state.data[findIndex].totalInvoicePayable +
            state.data[findIndex].totalRefund -
            state.data[findIndex].totalAdvancePayment
          );
          /* ------update calculations when new advance payament is created------ */
          state.data[findIndex].bills = payload.payload;
        } else {
          state.totalAdvancePayment +=
            payload.payload[0]?.totalAdvancePayment ?? 0;
          state.totalInvoicePayment +=
            payload.payload[0]?.totalInvoicePayable ?? 0;
          state.totalRefund += payload.payload[0]?.totalRefund ?? 0;
          state.totalAmount = Math.abs(
            state.totalInvoicePayment +
            state.totalRefund -
            state.totalAdvancePayment
          );
          state.data = [...payload.payload, ...state.data];
        }
      })
      .addCase(addAdvancePayment.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateAdvancePayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAdvancePayment.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.addmission
        );
        /* ------update calculations when advance payament is updated------ */
        const findBillIndex = state.data[findIndex]?.bills?.findIndex(
          (bill) => bill._id === payload.bill?._id
        );
        /* ------ Global Calculations ------- */
        state.totalAdvancePayment -= state.data[findIndex]?.totalAdvancePayment;
        state.totalAdvancePayment +=
          payload.addmissionData[0]?.totalAdvancePayment;
        state.totalRefund -= state.data[findIndex]?.totalRefund;
        state.totalRefund += payload.addmissionData[0]?.totalRefund;
        state.totalAmount = Math.abs(
          state.totalInvoicePayment -
          state.totalAdvancePayment +
          state.totalRefund
        );
        // state.totalAdvancePayment -=
        //   state.data[findIndex]?.bills[
        //     findBillIndex
        //   ]?.advancePayment?.totalAmount;
        // state.totalAdvancePayment += payload?.bill.advancePayment?.totalAmount;

        // const availableBalance =
        //   state.totalAdvancePayment - state.totalInvoicePayment;
        // const totalRefund = Math.min(availableBalance, state.totalRefund);
        // state.data[findIndex].totalRefund = totalRefund;

        // state.totalAmount = Math.abs(
        //   state.totalAdvancePayment + totalRefund - state.totalInvoicePayment
        // );
        /* ------ Global Calculations ------- */
        state.data[findIndex].totalAdvancePayment =
          payload.addmissionData[0]?.totalAdvancePayment;
        state.data[findIndex].totalRefund =
          payload.addmissionData[0]?.totalRefund;
        state.data[findIndex].calculatedAmount =
          payload.addmissionData[0]?.calculatedAmount;

        // const currentBillInAddmission =
        //   state.data[findIndex].bills[findBillIndex];
        // /* subtract bill previous amount so that new amount is computed with it */
        // state.data[findIndex].totalAdvancePayment -=
        //   currentBillInAddmission?.advancePayment?.totalAmount;
        // /* subtract bill previous amount so that new amount is computed with it */
        // state.data[findIndex].totalAdvancePayment +=
        //   payload.bill.advancePayment?.totalAmount ?? 0;
        // state.data[findIndex].calculatedAmount = Math.abs(
        //   state.data[findIndex].totalInvoicePayable -
        //     state.data[findIndex].totalAdvancePayment +
        //     state.data[findIndex].totalRefund
        // );
        /* ------update calculations when new advance payament is created------ */
        state.data[findIndex].bills = payload.payload;
      })
      .addCase(updateAdvancePayment.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addDeposit.pending, (state) => {
        state.loading = true;
      })
      .addCase(addDeposit.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.isAddmissionAvailable) {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.addmission
          );
          state.data[findIndex].totalBills += 1;
          /* ------update calculations when new advance payament is created------ */
          state.data[findIndex].bills = payload.payload;
        } else {
          state.data = [...payload.payload, ...state.data];
        }
      })
      .addCase(addDeposit.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateDeposit.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDeposit.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.addmission
        );
        /* ------update calculations when advance payament is updated------ */
        const findBillIndex = state.data[findIndex]?.bills?.findIndex(
          (bill) => bill._id === payload.bill?._id
        );
        /* ------ Global Calculations ------- */
        /* ------ Global Calculations ------- */
        /* ------update calculations when new advance payament is created------ */
        state.data[findIndex].bills = payload.payload;
      })
      .addCase(updateDeposit.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(depositToAdvance.pending, (state) => {
        state.loading = true;
      })
      .addCase(depositToAdvance.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.addmission
        );
        state.data[findIndex].totalBills += 1;
        /* ------update calculations when new advance payament is created------ */
        state.data[findIndex].bills = payload.payload;
      })
      .addCase(depositToAdvance.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeBill.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeBill.fulfilled, (state, { payload }) => {
        state.loading = false;

        if (payload.payload.type === IPD) {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.payload.addmission
          );
          if (payload?.payload?.invoice) {
            state.data[findIndex].totalInvoicePayable =
              state.data[findIndex].totalInvoicePayable -
              payload.payload?.invoice?.payable;
            state.data[findIndex].totalRefund =
              state.data[findIndex].totalRefund -
              payload.payload?.invoice?.refund || 0;

            state.data[findIndex].calculatedAmount = Math.abs(
              state.data[findIndex].totalAdvancePayment -
              state.data[findIndex].totalInvoicePayable +
              state.data[findIndex].totalRefund
            );
            state.totalInvoicePayment -= payload.payload?.invoice?.payable;
            state.totalRefund -= payload.payload?.invoice?.refund || 0;
          } else if (payload.payload?.advancePayment) {
            state.data[findIndex].totalAdvancePayment =
              state.data[findIndex].totalAdvancePayment -
              payload.payload?.advancePayment?.totalAmount;
            // state.data[findIndex].calculatedAmount = Math.abs(
            //   state.data[findIndex].totalAdvancePayment -
            //     state.data[findIndex].totalInvoicePayable +
            //     state.data[findIndex].totalRefund || 0
            // );
            // state.totalAdvancePayment -=
            //   payload.payload?.advancePayment?.totalAmount;
          }
          state.totalAmount = Math.abs(
            state.totalAdvancePayment -
            state.totalInvoicePayment +
            state.totalRefund || 0
          );

          if (state?.data[findIndex]?.bills?.length === 1) {
            state.data = state.data.filter(
              (item) => item._id !== payload.payload.addmission
            );
          } else {
            state.data[findIndex].bills = state.data[findIndex].bills.filter(
              (item) => item._id !== payload.payload._id
            );
            state.data[findIndex].totalBills -= 1;
          }
        }
      })
      .addCase(removeBill.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addProformaInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProformaInvoice.fulfilled, (state, { payload }) => {

        if (payload?.bill?.type === OPD) {
          // state.proforma_invoice = [payload.bill, ...state.proforma_invoice];
        } else {
          if (payload.isAddmissionAvailable) {
            const findIndex = state.data.findIndex(
              (el) => el._id === payload.addmission
            );

            state.data[findIndex].bills = payload.payload;
          } else {

            const admission = {
              ...payload.addmissionData,
              bills: payload.payload,
              totalBills: 1,
            };
            state.data = [admission, ...state.data];
          }
        }
        state.loading = false;
      })
      .addCase(addProformaInvoice.rejected, (state) => {
        state.loading = false;
      });
    builder
      .addCase(updateProformaInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProformaInvoice.fulfilled, (state, { payload }) => {
        

        if (payload?.bill?.type === OPD) {
          // state.proforma_invoice = [payload.bill, ...state.proforma_invoice];
        } else {
          if (payload.isAddmissionAvailable) {
            const findIndex = state.data.findIndex(
              (el) => el._id === payload.addmission
            );
            /* ------update calculations when new proforma invoice is created------ */
            state.data[findIndex].bills = payload.payload;
          } else {
            const admission = {
              ...payload.addmissionData,
              bills: payload.payload,
              totalBills: 1,
            };
            
            state.data = [admission, ...state.data];
          }
        }
        state.loading = false;
      })
      .addCase(updateProformaInvoice.rejected, (state) => {
        state.loading = false;
      });

  },
});

export const {
  updateBillAdmission,
  createEditBill,
  setBillDate,
  setBillAdmission,
  setTotalAmount,
  resetOpdPatientBills,
  createProformaBill,
  setBillType
} = billSlice.actions;

export default billSlice.reducer;
