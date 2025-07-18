import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  deleteBillItem,
  deletePaymentAccount,
  editBillItem,
  editCalenderDuration,
  editDoctorSchedule,
  getAllBillItems,
  getAllDoctorSchedule,
  getBillItems,
  getCalenderDuration,
  getDoctorSchedule,
  getPaymentAccounts,
  postBillItem,
  postCalenderDuration,
  postDoctorSchedule,
  postDoctorScheduleNew,
  postPaymentAccount,
  postUserSessionPricing,
  putUserSessionPricing,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  invoiceProcedures: [],
  allInvoiceProcedures: [],
  paymentAccounts: [],
  doctorSchedule: [],
  doctor: null,
  doctorAvailableSlots: null,
  appointmentsInRange: [],
  calender: null,
  data: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  itemsPerPage: 10,
  paymentTotalCount: 0,
  paymentTotalPages: 1,
  paymentCurrentPage: 1,
  paymentItemsPerPage: 10,
};

/* -------------------------------------------------------------------- */
/* ---------------------------- BILLING ------------------------------- */
/* -------------------------------------------------------------------- */
export const addBillItem = createAsyncThunk(
  "postBillItem",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postBillItem(data);
      dispatch(
        setAlert({ type: "success", message: "Bill Item Saved Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchAllBillItems = createAsyncThunk(
  "getAllBillItems",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAllBillItems(data);
      return response;
    } catch (error) {
      dispatch(
        setAlert({
          type: "error",
          message: error?.response?.data?.message || "Something went wrong",
        })
      );
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchBillItems = createAsyncThunk(
  "getBillItems",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getBillItems(data);
      return response;
    } catch (error) {
      dispatch(
        setAlert({
          type: "error",
          message: error?.response?.data?.message || "Something went wrong",
        })
      );
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateBillItem = createAsyncThunk(
  "editBillItem",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editBillItem(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Invoice Procedure Updated Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeBillItem = createAsyncThunk(
  "deleteBillItem",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteBillItem(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Invoice Procedure Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

//USER SESSION PRICING
export const addUserSessionPricing = createAsyncThunk(
  "addUserSessionPricing",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postUserSessionPricing(data);
      dispatch(
        setAlert({
          type: "success",
          message: "User Session Pricing Saved Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateUserSessionPricing = createAsyncThunk(
  "updateUserSessionPricing",
  async ({ userId, sessionPricing }, { rejectWithValue, dispatch }) => {
    try {
      const response = await putUserSessionPricing(userId, { sessionPricing });

      dispatch(
        setAlert({
          type: "success",
          message: "User Session Pricing Updated Successfully",
        })
      );

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);
//ADVANCE PAYMENT
export const addPaymentAccount = createAsyncThunk(
  "postPaymentAccount",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postPaymentAccount(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Payment Account Saved Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

// export const fetchPaymentAccounts = createAsyncThunk(
//   "getPaymentAccounts",
//   async (data, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await getPaymentAccounts(data);
//       return response;
//     } catch (error) {
//       dispatch(setAlert({ type: "error", message: error.response }));
//       return rejectWithValue("something went wrong");
//     }
//   }
// );

export const fetchPaymentAccounts = createAsyncThunk(
  "getPaymentAccounts",
  async (
    { centerIds, page, limit, search = "" },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await getPaymentAccounts(centerIds, page, limit, search);
      return res;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.response }));
      return rejectWithValue("Something went wrong");
    }
  }
);

export const removePaymentAccount = createAsyncThunk(
  "deletePaymentAccount",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deletePaymentAccount(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Payment Account Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);
/* -------------------------------------------------------------------- */
/* ---------------------------- BILLING ------------------------------- */
/* -------------------------------------------------------------------- */

/* -------------------------------------------------------------------- */
/* ---------------------------- DOCTOR SCHEDULE ----------------------- */
/* -------------------------------------------------------------------- */

export const fetchAllDoctorSchedule = createAsyncThunk(
  "getAllDoctorSchedule",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAllDoctorSchedule(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.response }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchDoctorSchedule = createAsyncThunk(
  "getDoctorSchedule",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getDoctorSchedule(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.response }));
      return rejectWithValue("something went wrong");
    }
  }
);

// export const addDoctorSchedule = createAsyncThunk(
//   "postDoctorSchedule",
//   async (data, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await postDoctorSchedule(data);
//       return response;
//     } catch (error) {
//       dispatch(setAlert({ type: "error", message: error.response }));
//       return rejectWithValue("something went wrong");
//     }
//   }
// );

export const updateDoctorSchedule = createAsyncThunk(
  "updateDoctorSchedule",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editDoctorSchedule(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.response }));
      return rejectWithValue("something went wrong");
    }
  }
);

/* -------------------------------------------------------------------- */
/* ---------------------------- DOCTOR SCHEDULE ----------------------- */
/* -------------------------------------------------------------------- */

/* -------------------------------------------------------------------- */
/* ---------------------------- CALENDER ------------------------------ */
/* -------------------------------------------------------------------- */

export const fetchCalenderDuration = createAsyncThunk(
  "getCalenderDuration",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getCalenderDuration(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.response }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addCalenderDuration = createAsyncThunk(
  "postCalenderDuration",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postCalenderDuration(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.response }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateCalenderDuration = createAsyncThunk(
  "updateCalenderDuration",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editCalenderDuration(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.response }));
      return rejectWithValue("something went wrong");
    }
  }
);

/* -------------------------------------------------------------------- */
/* ---------------------------- CALENDER ------------------------------ */
/* -------------------------------------------------------------------- */

const settingSlice = createSlice({
  name: "setting",
  initialState,
  reducers: {
    // postMedicine: (state, { payload }) => {
    //   state.data = [...state.data, payload.payload]
    // },
    setBillItems: (state, { payload }) => {
      state.invoiceProcedures = payload;
    },
    setPaymentAccounts: (state, { payload }) => {
      state.paymentAccounts = payload;
    },
  },
  extraReducers: (builder) => {
    /* -------------------------------------------------------------------- */
    /* ---------------------------- BILLING ------------------------------- */
    /* -------------------------------------------------------------------- */
    builder
      .addCase(addBillItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBillItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.invoiceProcedures = payload.payload;
      })
      .addCase(addBillItem.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchAllBillItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllBillItems.fulfilled, (state, { payload }) => {
        state.loading = false;
        localStorage.setItem("billItems", JSON.stringify(payload.payload));
        state.allInvoiceProcedures = payload.payload;
      })
      .addCase(fetchAllBillItems.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchBillItems.pending, (state) => {
        state.loading = true;
      })
      // .addCase(fetchBillItems.fulfilled, (state, { payload }) => {
      //   state.loading = false;
      //   localStorage.setItem("billItems", JSON.stringify(payload.payload));
      //   state.invoiceProcedures = payload.payload;
      // })
      .addCase(fetchBillItems.fulfilled, (state, { payload }) => {
        const { payload: items, total, page, limit, totalPages } = payload;
        state.invoiceProcedures = items;
        state.totalCount = total;
        state.currentPage = page;
        state.itemsPerPage = limit;
        state.totalPages = totalPages;
      })
      .addCase(fetchBillItems.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeBillItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeBillItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.invoiceProcedures = state.invoiceProcedures.filter(
          (item) => item._id !== payload.payload?._id
        );
      })
      .addCase(removeBillItem.rejected, (state, action) => {
        state.loading = false;
      });

    builder
      .addCase(updateBillItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBillItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findMedicineIndex = state.invoiceProcedures.findIndex(
          (el) => el._id === payload.payload?._id
        );
        state.invoiceProcedures[findMedicineIndex] = payload.payload;
      })
      .addCase(updateBillItem.rejected, (state, action) => {
        state.loading = false;
      });

    //USER SESSION PRICING
    builder
      .addCase(addUserSessionPricing.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUserSessionPricing.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findUserIndex = state.doctorSchedule.findIndex(
          (el) => el._id === payload.payload._id
        );
        state.doctorSchedule[findUserIndex] = payload.payload;
      })
      .addCase(addUserSessionPricing.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateUserSessionPricing.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserSessionPricing.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findUserIndex = state.doctorSchedule.findIndex(
          (el) => el._id === payload.payload._id
        );
        state.doctorSchedule[findUserIndex] = payload.payload;
      })
      .addCase(updateUserSessionPricing.rejected, (state) => {
        state.loading = false;
      });

    //ADVANCE PAYMENT
    builder
      .addCase(addPaymentAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPaymentAccount.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.paymentAccounts = payload.payload;
      })
      .addCase(addPaymentAccount.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchPaymentAccounts.pending, (state) => {
        state.loading = true;
      })
      // .addCase(fetchPaymentAccounts.fulfilled, (state, { payload }) => {
      //   state.loading = false;
      //   localStorage.setItem(
      //     "paymentAccounts",
      //     JSON.stringify(payload.payload)
      //   );
      //   state.paymentAccounts = payload.payload;
      // })
      .addCase(fetchPaymentAccounts.fulfilled, (state, { payload }) => {
        const {
          payload: accounts,
          totalCount,
          currentPage,
          limit,
          totalPages,
        } = payload;
        state.loading = false;
        state.paymentAccounts = accounts;
        state.paymentTotalCount = totalCount;
        state.paymentCurrentPage = currentPage;
        state.paymentItemsPerPage = limit;
        state.paymentTotalPages = totalPages;
      })
      .addCase(fetchPaymentAccounts.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removePaymentAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(removePaymentAccount.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.paymentAccounts = state.paymentAccounts.filter(
          (item) => item._id !== payload.payload._id
        );
      })
      .addCase(removePaymentAccount.rejected, (state, action) => {
        state.loading = false;
      });
    /* -------------------------------------------------------------------- */
    /* ---------------------------- BILLING ------------------------------- */
    /* -------------------------------------------------------------------- */

    /* -------------------------------------------------------------------- */
    /* ---------------------------- DOCTOR SCHEDULE ----------------------- */
    /* -------------------------------------------------------------------- */

    builder
      .addCase(fetchAllDoctorSchedule.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllDoctorSchedule.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.doctorSchedule = payload.payload;
      })
      .addCase(fetchAllDoctorSchedule.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchDoctorSchedule.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDoctorSchedule.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.doctorAvailableSlots = payload.result;
        // state.appointmentsInRange = payload.appointmentsInRange;
      })
      .addCase(fetchDoctorSchedule.rejected, (state) => {
        state.doctorAvailableSlots = [];
        state.loading = false;
      });

    // builder
    //   .addCase(addDoctorSchedule.pending, (state) => {
    //     state.loading = true;
    //   })
    //   .addCase(addDoctorSchedule.fulfilled, (state, { payload }) => {
    //     state.loading = false;

    //     const findIndex = state.doctorSchedule.findIndex(
    //       (el) => el._id === payload.payload._id
    //     );
    //     state.doctorSchedule[findIndex] = payload.payload;
    //   })
    //   .addCase(addDoctorSchedule.rejected, (state) => {
    //     state.loading = false;
    //   });

    builder
      .addCase(updateDoctorSchedule.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDoctorSchedule.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.doctorSchedule.findIndex(
          (el) => el._id === payload.payload._id
        );
        state.doctorSchedule[findIndex] = payload.payload;
      })
      .addCase(updateDoctorSchedule.rejected, (state, action) => {
        state.loading = false;
      });

    /* -------------------------------------------------------------------- */
    /* ---------------------------- DOCTOR SCHEDULE ----------------------- */
    /* -------------------------------------------------------------------- */

    /* -------------------------------------------------------------------- */
    /* ---------------------------- CALENDER ------------------------------ */
    /* -------------------------------------------------------------------- */

    builder
      .addCase(fetchCalenderDuration.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCalenderDuration.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.calender = payload.payload;
      })
      .addCase(fetchCalenderDuration.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addCalenderDuration.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCalenderDuration.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.calender = payload.payload;
      })
      .addCase(addCalenderDuration.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateCalenderDuration.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCalenderDuration.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.calender = payload.payload;
      })
      .addCase(updateCalenderDuration.rejected, (state, action) => {
        state.loading = false;
      });

    /* -------------------------------------------------------------------- */
    /* ---------------------------- CALENDER ------------------------------ */
    /* -------------------------------------------------------------------- */
  },
});

export const { setBillItems, setPaymentAccounts } = settingSlice.actions;

export default settingSlice.reducer;
