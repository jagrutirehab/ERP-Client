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
  getBills,
  getBillsAddmissions,
  getDraftBills,
  postAdvancePayment,
  postDeposit,
  postDraftInvoice,
  postDraftToInvoice,
  postInvoice,
} from "../../../helpers/backend_helper";
import { IPD, OPD } from "../../../Components/constants/patient";
import { togglePrint } from "../print/printSlice";
import { removeEventBill, setEventBill } from "../booking/bookingSlice";

const initialState = {
  data: [],
  draftData: [],
  opdData: [],
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
          message: "Advance Payment Saved Successfully",
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
          message: "Advance Payment Updated Successfully",
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

    setBillDate: (state, { payload }) => {
      state.billDate = payload;
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
          if (findAdmissionIndex !== -1) {
            const admission = state.data[findAdmissionIndex];
            admission.totalBills = (admission?.totalBills || 0) + 1;
            admission.bills = payload.bills;
          }
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
        state.draftData = payload.payload;
      })
      .addCase(updateDraftInvoice.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(addInvoice.fulfilled, (state, { payload }) => {
        console.log(payload, "payload");

        if (payload?.bill?.type === OPD) {
          state.opdData = [payload.bill, ...state.opdData];
        } else {
          if (payload.isAddmissionAvailable) {
            const findIndex = state.data.findIndex(
              (el) => el._id === payload.addmission
            );

            state.totalInvoicePayment += payload.bill?.invoice?.payable ?? 0;
            state.totalRefund += payload.bill?.invoice?.refund ?? 0;
            state.totalAmount = Math.abs(
              state.totalInvoicePayment +
                state.totalRefund -
                state.totalAdvancePayment
            );

            if (findIndex !== -1) {
              state.data[findIndex].bills = payload.payload;
            } else {
              const admission = {
                ...payload.addmissionData,
                bills: payload.payload,
                totalBills: 1,
              };
              state.data = [admission, ...state.data];
            }
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
        } else {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.addmission
          );
          const findBillIndex = state.data[findIndex].bills.findIndex(
            (bill) => bill._id === payload.bill?._id
          );
          const currentBillInAddmission =
            state.data[findIndex].bills[findBillIndex];
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
          state.data[findIndex].totalInvoicePayable =
            payload.addmissionData[0]?.totalInvoicePayable;
          state.data[findIndex].totalRefund =
            payload.addmissionData[0]?.totalRefund;
          state.data[findIndex].calculatedAmount =
            payload.addmissionData[0]?.calculatedAmount;
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

        const advanceAmount = payload.bill?.advancePayment?.totalAmount ?? 0;

        if (payload.isAddmissionAvailable) {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.addmission
          );

          state.totalAdvancePayment += advanceAmount;
          state.totalAmount = Math.abs(
            state.totalAdvancePayment -
              (state.totalInvoicePayment + state.totalRefund)
          );

          if (findIndex !== -1) {
            const admission = state.data[findIndex];

            admission.totalBills = (admission.totalBills || 0) + 1;
            admission.totalAdvancePayment =
              (admission.totalAdvancePayment || 0) + advanceAmount;

            admission.calculatedAmount = Math.abs(
              (admission.totalInvoicePayable || 0) +
                (admission.totalRefund || 0) -
                (admission.totalAdvancePayment || 0)
            );
            admission.bills = payload.payload;
          } else {
            const admission = {
              ...payload.bill.addmission,
              bills: payload.payload,
              totalBills: 1,
              totalAdvancePayment: advanceAmount,
              totalInvoicePayable: 0,
              totalRefund: 0,
              calculatedAmount: Math.abs(advanceAmount),
            };

            state.data = [admission, ...state.data];
          }
        } else {
          const newAdmission = payload.payload?.[0];

          state.totalAdvancePayment += newAdmission?.totalAdvancePayment ?? 0;
          state.totalInvoicePayment += newAdmission?.totalInvoicePayable ?? 0;
          state.totalRefund += newAdmission?.totalRefund ?? 0;

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
        state.data[findIndex].totalAdvancePayment =
          payload.addmissionData[0]?.totalAdvancePayment;
        state.data[findIndex].totalRefund =
          payload.addmissionData[0]?.totalRefund;
        state.data[findIndex].calculatedAmount =
          payload.addmissionData[0]?.calculatedAmount;
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

          if (findIndex !== -1) {
            const admission = state.data[findIndex];
            admission.totalBills = (admission.totalBills || 0) + 1;
            admission.bills = payload.payload;
          } else {
            // Fallback: insert admission if not found
            const admission = {
              ...payload.bill.addmission,
              bills: payload.payload,
              totalBills: 1,
            };

            state.data = [admission, ...state.data];
          }
        } else {
          // Completely new admission — safe to push directly
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
        const findBillIndex = state.data[findIndex]?.bills?.findIndex(
          (bill) => bill._id === payload.bill?._id
        );
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

          // 💥 Guard clause
          if (findIndex === -1) return;

          const admissionData = state.data[findIndex];

          if (payload?.payload?.invoice) {
            admissionData.totalInvoicePayable -=
              payload.payload.invoice.payable;

            admissionData.totalRefund -= payload.payload.invoice.refund || 0;

            admissionData.calculatedAmount = Math.abs(
              admissionData.totalAdvancePayment -
                admissionData.totalInvoicePayable +
                admissionData.totalRefund
            );

            state.totalInvoicePayment -= payload.payload.invoice.payable;
            state.totalRefund -= payload.payload.invoice.refund || 0;
          } else if (payload.payload?.advancePayment) {
            admissionData.totalAdvancePayment -=
              payload.payload.advancePayment.totalAmount;
          }

          state.totalAmount = Math.abs(
            state.totalAdvancePayment -
              state.totalInvoicePayment +
              state.totalRefund || 0
          );

          if (admissionData.bills?.length === 1) {
            state.data = state.data.filter(
              (item) => item._id !== payload.payload.addmission
            );
          } else {
            admissionData.bills = admissionData.bills.filter(
              (item) => item._id !== payload.payload._id
            );
            admissionData.totalBills -= 1;
          }
        }
      })
      .addCase(removeBill.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeDraft.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeDraft.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.draftData = state.draftData.filter(
          (d) => d._id !== payload.payload?._id
        );
      })
      .addCase(removeDraft.rejected, (state) => {
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
} = billSlice.actions;

export default billSlice.reducer;
