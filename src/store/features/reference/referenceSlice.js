import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllCenters,
  getPRDepartments,
  getUoms,
  getPaymentTerms,
  getVendors,
} from "../../../helpers/backend_helper";

const FRESH_FOR_MS = 15 * 1000;

const LISTS = {
  centers: {
    load: () => getAllCenters(),
    pick: (res) => res?.payload || res?.data || [],
    freshForMs: 10 * 60 * 1000,
  },
  departments: { load: () => getPRDepartments({}) },
  uoms: { load: () => getUoms({ status: "active", limit: 1000 }) },
  paymentTerms: { load: () => getPaymentTerms({ status: "active" }) },
  vendors: { load: () => getVendors({ status: "active", limit: 1000 }) },
};

// The center slice already announces these. Listening to them means a change made anywhere in the
// app makes the cached centers "old" at once, without touching the center slice at all.
const CENTER_CHANGE_ACTIONS = [
  "postCenter/fulfilled",
  "editCenter/fulfilled",
  "deleteCenter/fulfilled",
  "deleteCenterLogo/fulfilled",
];

const emptyList = () => ({ items: [], loading: false, loadedAt: null, error: null });

const initialState = {
  lists: Object.fromEntries(Object.keys(LISTS).map((name) => [name, emptyList()])),
};

export const fetchReferenceList = createAsyncThunk(
  "reference/fetchList",
  async ({ name }, { rejectWithValue }) => {
    try {
      const { load, pick } = LISTS[name];
      const res = await load();
      return { name, items: (pick ? pick(res) : res?.data) || [] };
    } catch (error) {
      // only plain text goes into the store, never the whole error object
      return rejectWithValue({
        name,
        message: error?.response?.data?.message || error?.message || "Couldn't load the list",
      });
    }
  },
  {
    // Skip the call when one is already running, or the list is still fresh (unless forced)
    condition: ({ name, force }, { getState }) => {
      const list = getState().Reference?.lists?.[name];
      if (!list) return false;
      if (list.loading) return false;
      const freshFor = LISTS[name].freshForMs ?? FRESH_FOR_MS;
      if (!force && list.loadedAt && Date.now() - list.loadedAt < freshFor) return false;
      return true;
    },
  },
);

const referenceSlice = createSlice({
  name: "reference",
  initialState,
  reducers: {
    // Call after a master is created, edited or deleted, so the next form fetches a new copy
    invalidateReferenceList: (state, { payload: name }) => {
      if (state.lists[name]) state.lists[name].loadedAt = null;
    },
    invalidateAllReferenceLists: (state) => {
      Object.values(state.lists).forEach((l) => {
        l.loadedAt = null;
      });
    },
    // For logout: nothing from one user's session should be left for the next
    clearReferenceData: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferenceList.pending, (state, { meta }) => {
        const list = state.lists[meta.arg.name];
        if (list) {
          list.loading = true;
          list.error = null;
        }
      })
      .addCase(fetchReferenceList.fulfilled, (state, { payload }) => {
        const list = state.lists[payload.name];
        list.items = payload.items;
        list.loading = false;
        list.loadedAt = Date.now();
      })
      .addCase(fetchReferenceList.rejected, (state, { meta, payload }) => {
        const list = state.lists[meta.arg.name];
        if (!list) return;
        list.loading = false;
        list.error = payload?.message || "Couldn't load the list";
      });

    // a center was created, edited or deleted: the cached centers are now old
    builder.addMatcher(
      (action) => CENTER_CHANGE_ACTIONS.includes(action.type),
      (state) => {
        state.lists.centers.loadedAt = null;
      },
    );
  },
});

export const { invalidateReferenceList, invalidateAllReferenceLists, clearReferenceData } =
  referenceSlice.actions;
export default referenceSlice.reducer;