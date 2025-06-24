// login
export {
  loginSuccess,
  registerUser,
  addUserProfilePicture,
  addUserDetailInformation,
  addUserIncrementalSchedule,
  addUserWeeklySchedule,
  updateUserWeeklySchedule,
  updateUserPassword,
  suspendStaff,
  // fetchUsers,
  removeUser,
  updateUser,
  fetchDoctors,
  fetchUserSchedule,
  loginUser,
  logoutUser,
  searchUser,
  searchUserSuccess,
  searchUserFail,
  logoutUserSuccess,
  changeUserAccess,
  setUser,
  setUserForm,
  socialLogin,
  resetLoginFlag,
  apiError,
} from "./features/auth/user/userSlice";

// log
export { fetchUserLogs } from "./features/log/logSlice";

// alert
export { setAlert } from "./features/alert/alertSlice";

// center
export {
  createEditCenter,
  addCenter,
  fetchCenters,
  fetchAllCenters,
  updateCenter,
  removeCenter,
  removeCenterLogo,
  setCenters,
} from "./features/center/centerSlice";

// dashboard
export { fetchDashboardAnalytics } from "./features/dashboard/dashboardSlice";

// recyclebin
export {
  //patient
  getRemovedPatients,
  countPatientDocuments,
  restorePatient,
  removePatientPermanently,
  //chart
  getRemovedCharts,
  restoreChart,
  removeChartPermanently,
  //bill
  getRemovedBills,
  restoreBill,
  removeBillPermanently,
  //center
  getRemovedCenters,
  countCenterDocuments,
  restoreCenter,
  removeCenterPermanently,
  //leads
  getRemovedLeads,
  restoreLead,
  removeLeadPermanently,
  //medicines
  getRemovedMedicines,
  restoreMedicine,
  removeMedicinePermanently,
} from "./features/recyclebin/recyclebinSlice";

// booking
export {
  toggleAppointmentForm,
  setCurrentEvent,
  setEventDate,
  addAppointment,
  fetchAppointments,
  fetchPatientPreviousDoctor,
  fetchPatientAppointments,
  fetchPatientAppointmentData,
  updateAppointment,
  cancelAppointment,
  removeAppointment,
  removeEventChart,
  removeEventBill,
} from "./features/booking/bookingSlice";

// lead
export {
  createEditLead,
  addLeadPatient,
  fetchLeads,
  addLead,
  updateLead,
  mergeLead,
  unMergeLead,
  searchLead,
  searchLeadSuccess,
  searchLeadFail,
  removeLead,
  setUngroupLeads,
} from "./features/lead/leadSlice";

// layout
export {
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
} from "./features/layouts/layoutsSlice";

// patient
export {
  togglePatientForm,
  admitDischargePatient,
  admitIpdPatient,
  editAdmission,
  dischargeIpdPatient,
  undischargePatient,
  viewPatient,
  replacePatient,
  addPatient,
  updatePatient,
  updatePatientCenter,
  removeAadhaarCard,
  deletePatient,
  fetchPatients,
  fetchMorePatients,
  viewProfile,
  switchCenter,
  searchPatient,
  searchPatientPhoneNumber,
  searchUidPatient,
  searchPatientReferral,
  fetchPatientId,
  fetchAllPatients,
  fetchPatientById,
  editAdmissionAssignment,
} from "./features/patient/patientSlice";

// timeline
export {
  fetchPatientTimeline,
  resetOpdPatientTimeline,
} from "./features/timeline/timelineSlice";

// chart
export {
  createEditChart,
  setChartDate,
  fetchChartsAddmissions,
  fetchCharts,
  fetchGeneralCharts,
  addPrescription,
  addGeneralPrescription,
  updatePrescription,
  addVitalSign,
  addGeneralVitalSign,
  updateVitalSign,
  addClinicalNote,
  addGeneralClinicalNote,
  updateClinicalNote,
  removeClinicalNoteFile,
  addLabReport,
  addGeneralLabReport,
  updateLabReport,
  removeLabReportFile,
  addRelativeVisit,
  addGeneralRelativeVisit,
  updateRelativeVisit,
  addDischargeSummary,
  updateDischargeSummary,
  addDetailAdmission,
  addGeneralDetailAdmission,
  updateDetailAdmission,
  removeDetailAdissionFile,
  removeChart,
  resetOpdPatientCharts,
  fetchOPDPrescription,
  setPtLatestOPDPrescription,
} from "./features/chart/chartSlice";

// bill
export {
  createEditBill,
  setBillDate,
  setTotalAmount,
  fetchBillsAddmissions,
  fetchBills,
  fetchDraftBills,
  addInvoice,
  updateInvoice,
  addDeposit,
  updateDeposit,
  depositToAdvance,
  addDraftInvoice,
  updateDraftInvoice,
  draftToInvoice,
  addAdvancePayment,
  updateAdvancePayment,
  removeBill,
  removeDraft,
  resetOpdPatientBills,
} from "./features/bill/billSlice";

// print
export { togglePrint } from "./features/print/printSlice";

// medicine
export {
  addMedicine,
  addCSVMedicine,
  fetchMedicines,
  removeMedicine,
  updateMedicine,
  setMedicines,
} from "./features/medicine/medicineSlice";

// Setting
export {
  addBillItem,
  fetchBillItems,
  removeBillItem,
  updateBillItem,
  setBillItems,
  addPaymentAccount,
  fetchPaymentAccounts,
  removePaymentAccount,
  fetchAllDoctorSchedule,
  fetchDoctorSchedule,
  addUserSessionPricing,
  updateUserSessionPricing,
  // addDoctorSchedule,
  // updateDoctorSchedule,
  fetchCalenderDuration,
  addCalenderDuration,
  updateCalenderDuration,
} from "./features/setting/settingSlice";

//Report
export {
  fetchReport,
  fetchPatientAnalytics,
  fetchLeadAnalytics,
  fetchOPDAnalytics,
} from "./features/report/reportSlice";

//Notification
export { fetchBillNotification } from "./features/notification/notificationSlice";

//Intern
export {
  toggleInternForm,
  postInternData,
  fetchInterns,
  viewIntern,
  getInternIds,
  InternAdmission,
  fetchInternById,
  createUpdate,
  addInternBillReceipt,
  getInternReceiptById,
  editInternBill,
  editInternForm,
  createEditInternBill,
  setInternBillDate,
  removeInternReceipt,
  removedIntern,
  editInternReceipt,
} from "./features/intern/internSlice";

//Clinical Test
export {
  fetchCiwaTest,
  createCiwaTest,
  fetchClinicalTest,
} from "./features/clinicalTest/clinicalTestSlice";
