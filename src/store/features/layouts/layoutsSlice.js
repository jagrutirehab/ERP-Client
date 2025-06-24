import { createSlice } from "@reduxjs/toolkit";
//constants
import {
  layoutTypes,
  leftSidebarTypes,
  layoutModeTypes,
  layoutWidthTypes,
  layoutPositionTypes,
  topbarThemeTypes,
  leftsidbarSizeTypes,
  leftSidebarViewTypes,
  leftSidebarImageTypes,
} from "../../../Components/constants/layout";

const initialState = {
  layoutType: layoutTypes.VERTICAL,
  leftSidebarType: leftSidebarTypes.DARK,
  layoutModeType: layoutModeTypes.LIGHTMODE,
  layoutWidthType: layoutWidthTypes.FLUID,
  layoutPositionType: layoutPositionTypes.FIXED,
  topbarThemeType: topbarThemeTypes.DARK,
  leftsidbarSizeType: leftsidbarSizeTypes.SMALLHOVER,
  leftSidebarViewType: leftSidebarViewTypes.DEFAULT,
  leftSidebarImageType: leftSidebarImageTypes.NONE,
};

const layoutSlice = createSlice({
  name: "Layout",
  initialState,
  reducers: {
    changeLayout: (state, { payload }) => {
      state.layoutType = payload;
    },
    changeLayoutMode: (state, { payload }) => {
      state.layoutModeType = payload;
    },
    changeSidebarTheme: (state, { payload }) => {
      state.leftSidebarType = payload;
    },
    changeLayoutWidth: (state, { payload }) => {
      state.layoutWidthType = payload;
    },
    changeLayoutPosition: (state, { payload }) => {
      state.layoutPositionType = payload;
    },
    changeTopbarTheme: (state, { payload }) => {
      state.topbarThemeType = payload;
    },
    changeLeftsidebarSizeType: (state, { payload }) => {
      state.leftsidbarSizeType = payload;
    },
    changeLeftsidebarViewType: (state, { payload }) => {
      state.leftSidebarViewType = payload;
    },
    changeSidebarImageType: (state, { payload }) => {
      state.leftSidebarImageType = payload;
    },
    resetValue: (state) => {
      state.resetValue = initialState;
    },
  },
});

export const {
  changeLayout,
  changeLayoutMode,
  changeLayoutPosition,
  changeLayoutWidth,
  changeSidebarImageType,
  changeLeftsidebarSizeType,
  changeLeftsidebarViewType,
  changeSidebarTheme,
  changeTopbarTheme,
  resetValue,
} = layoutSlice.actions;

export default layoutSlice.reducer;
