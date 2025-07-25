import { APIClient } from "./api_helper";
import * as url from "./url_helper";
import qs from "qs";

const api = new APIClient();

// Gets the logged in user data from local session
export const getLoggedInUser = () => {
  const user = localStorage.getItem("user");
  if (user) return JSON.parse(user);
  return null;
};

// //is user is logged in
export const isUserAuthenticated = () => {
  return getLoggedInUser() !== null;
};

// Login Method
// export const postFakeLogin = data => api.create(url.POST_FAKE_LOGIN, data);

// Login Method
// export const postJwtLogin = (data) => api.create(url.POST_FAKE_JWT_LOGIN, data);

// Register Method
export const postUser = (data) =>
  api.create(url.POST_USER_REGISTER, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const postUserProfilePicture = (data) =>
  api.create(url.POST_USER_PROFILE_PICTURE, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const postUserDetailInformation = (data) =>
  api.create(url.POST_USER_DETAIL_INFORMATION, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const postUserSessionPricing = (data) =>
  api.create(url.POST_USER_SESSION_PRICING, data);
export const putUserSessionPricing = (id, data) =>
  api.put(`${url.PUT_USER_SESSION_PRICING}/${id}`, data);

export const getUsers = (data) => api.get(url.GET_USERS, data);

export const getDoctorUsers = (data) => api.get(url.GET_DOCTOR_USERS, data);

export const deleteUser = (data) =>
  api.delete(`${url.DELETE_USER}/${data.userId}/${data.pageId}`);
export const suspendUser = (data) => api.update(url.SUSPEND_USER, data);
export const markUserActiveInactive = (data) =>
  api.update(url.UPDATE_USER_ACTIVE_INACTIVE, data);

export const editUser = (data) =>
  api.put(url.EDIT_USER, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const editUserPassword = (data) =>
  api.update(url.EDIT_USER_PASSWORD, data);

// ClinicalTest
export const getCiwaTest = (data) =>
  api.get(`${url.GET_CIWA_TEST}?patientId=${data}`);
// export const getCiwaTest = (data) => api.get(`http://localhost:8080/api/v1/clinical-test/ciwa-test?patientId=${data}`);

export const postCiwatest = (data) =>
  api.create(url.POST_CIWA_TEST, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const postSsrstest = (data) =>
  api.create(url.POST_SSRS_TEST, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const postMPQtest = (data) =>
  api.create(url.POST_MPQ_TEST, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const postMMSEtest = (data) =>
  api.create(url.POST_MMSE_TEST, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const postYmrsTest = (data) => {
  api.create(url.POST_YMRS_TEST, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
// export const postYmrsTest = (data) => {
//   api.create("http://localhost:8080/api/v1/clinical-test/ymrs-test", data, {
//     headers: { "Content-Type": "multipart/form-data" },
//   })
// };

// export const postCiwatest = (data) => api.create(`http://localhost:8080/api/v1/clinical-test/ciwa-test`, data,{
//     headers: { "Content-Type": "multipart/form-data" },
//   });

export const getClinicalTest = (data) =>
  api.get(`${url.FETCH_CLINICAL_TEST}?patientId=${data.patientId}`);
// export const getClinicalTest = (data) => api.get(`http://localhost:8080/api/v1/clinical-test/?patientId=${data.patientId}`);

// Login Method
export const postLogin = (data) => api.create(url.POST_USER_LOGIN, data);

// Login Method
export const postJwtLogin = (data) => api.create(url.POST_USER_LOGIN, data);
// export const postSearchUser = (data) => api.get(url.SEARCH_USER, data);

// Logout Method
export const postLogout = () => api.get(url.POST_USER_LOGOUT);

// Log Method
export const getUserLogs = (data) => api.get(url.GET_USER_LOGS, data);

// Dashboard Method
export const getDashboardAnalytics = (data) =>
  api.get(`${url.GET_DASHBOARD_ANALYTICS}/${data}`);

// Center Method
export const postCenter = (data) =>
  api.create(url.POST_CENTER, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getCenters = (data) =>
  api.get(url.GET_CENTERS, {
    params: {
      centerIds: data,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });

export const getAllCenters = () => api.get(url.GET_ALL_CENTERS);
export const getDoctorsScheduleNew = (userId) =>
  api.get(`${url.GET_DOCTOR_SCHEDULE_NEW}?userId=${userId}`);
export const createDoctorsScheduleNew = (data) =>
  api.create(`${url.GET_DOCTOR_SCHEDULE_NEW}`, data);

export const editCenter = (data) =>
  api.put(url.EDIT_CENTER, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteCenterLogo = (data) =>
  api.update(url.DELETE_CENTER_LOGO, data);
export const deleteCenter = (data) =>
  api.delete(`${url.DELETE_CENTER}/${data}`);
export const deleteCenterPermanently = (data) =>
  api.delete(`${url.DELETE_CENTER_PERMANENTLY}/${data}`);

// Lead Methodes
export const getLeads = () => api.get(url.GET_LEADS);
export const postLead = (data) => api.create(url.POST_LEAD, data);
export const editLead = (data) => api.put(url.EDIT_LEAD, data);
export const postMergeLead = (data) => api.update(url.POST_MERGE_LEAD, data);
export const postUnMergeLead = (data) =>
  api.update(url.POST_UNMERGE_LEAD, data);
export const postSearchLead = (query) => api.get(url.GET_SEARCH_LEADS, query);
export const deleteLead = (param) => api.delete(`${url.DELETE_LEAD}/${param}`);
export const deleteLeadPermanently = (param) =>
  api.delete(`${url.DELETE_LEAD_PERMANENTLY}/${param}`);
export const postRestoreLead = (data) =>
  api.update(url.POST_RESTORE_LEAD, data);

// Medicine Method
// export const getMedicines = () => api.get(url.GET_MEDICINES);
export const getMedicines = ({ page = 1, limit = 10, search = "" } = {}) => {
  return api.get(url.GET_MEDICINES, {
    params: { page, limit, search },
  });
};
export const postMedicine = (data) => api.create(url.POST_MEDICINE, data);
export const postCSVMedicine = (data) =>
  api.create(url.POST_CSV_MEDICINE, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const postRestoreCenter = (data) => api.update(url.RESTORE_CENTER, data);
export const editMedicine = (data) => api.put(url.EDIT_MEDICINE, data);
export const deleteMedicine = (data) =>
  api.delete(`${url.DELETE_MEDICINE}/${data}`);
export const deleteMedicinePermanently = (param) =>
  api.delete(`${url.DELETE_MEDICINE_PERMANENTLY}/${param}`);
export const postRestoreMedicine = (data) =>
  api.update(url.POST_RESTORE_MEDICINE, data);

// Billing Setting Method
//invoice
export const getAllBillItems = ({
  centerIds,
  page = 1,
  limit = 10,
  search = "",
}) =>
  api.get(url.GET_ALL_BILL_ITEMS, {
    params: {
      centerIds,
      page,
      limit,
      search,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });

export const getBillItems = ({
  centerIds,
  page = 1,
  limit = 2000,
  search = "",
}) =>
  api.get(url.GET_BILL_ITEMS, {
    params: {
      centerIds,
      page,
      limit,
      search,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const postBillItem = (data) => api.create(url.POST_BILL_ITEM, data);
// export const postRestoreBillItem = (data) => api.update(url., data);
export const editBillItem = (data) => api.put(url.EDIT_BILL_ITEM, data);
export const deleteBillItem = (data) =>
  api.delete(`${url.DELETE_BILL_ITEM}/${data}`);
//advance payment
export const getPaymentAccounts = (data, page, limit, search = "") =>
  api.get(url.GET_PAYMENT_ACCOUNTS, {
    params: {
      centerIds: data,
      page,
      limit,
      search,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const postPaymentAccount = (data) =>
  api.create(url.POST_PAYMENT_ACCOUNT, data);
// export const postRestoreBillItem = (data) => api.update(url., data);
export const deletePaymentAccount = (data) =>
  api.delete(`${url.DELETE_PAYMENT_ACCOUNT}/${data}`);

// Patient Method
export const getPatients = (data) =>
  api.get(url.GET_PATIENTS, {
    params: {
      centerIds: data?.centerAccess,
      type: data?.type,
      skip: data?.skip,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getAllPatients = (data) => api.get(url.GET_ALL_PATIENTS);
export const getPatientById = (data) =>
  api.get(`${url.GET_PATIENT_BY_ID}/${data}`);
export const getMorePatients = (data) =>
  api.get(url.GET_MORE_PATIENTS, {
    params: {
      centerIds: data?.centerAccess,
      type: data?.type,
      skip: data?.skip,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getPatientReferral = (data) =>
  api.get(url.GET_PATIENTS_REFERRAL, data);
export const getPatientCountedDocuments = (data) =>
  api.get(url.GET_PATIENT_COUNTED_DOCUMENTS, { id: data });
export const getPatientId = () => api.get(url.CREATE_PATIENT_ID);
export const getSearchPatients = (query) =>
  api.get(url.SEARCH_PATIENTS, {
    params: {
      centerIds: query?.centerAccess,
      name: query.name,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getSearchPatientPhoneNumber = (query) =>
  api.get(url.SEARCH_PATIENTS_PHONE_NUMBER, {
    params: {
      centerIds: query?.centerAccess,
      phoneNumber: query.phoneNumber,
      uid: query.uid,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const postPatient = (data) =>
  api.create(url.POST_PATIENT, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const postRestorePatient = (data) =>
  api.update(url.POST_RESTORE_PATIENT, data);

export const postLeadPatient = (data) =>
  api.create(url.POST_LEAD_PATIENT, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateAdmissionAssignment = (data) =>
  api.put(url.UPDATE_ADMISSION_ASSIGNMENT, data);

export const updatePatientAdmission = (data) =>
  api.update(url.EDIT_ADMISSION, data);
export const postAdmitPatient = (data) => api.update(url.ADMIT_PATIENT, data);
export const postPatientCenterSwitch = (data) =>
  api.update(url.SWITCH_PATIENT_CENTER, data);

export const postDischargePatient = (data) =>
  api.update(url.DISCHARGE_PATIENT, data);
export const postUndischargePatient = (data) =>
  api.update(url.UNDISCHARGE_PATIENT, data);
export const editPatient = (data) =>
  api.put(url.EDIT_PATIENT, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deletePatientAadhaarCard = (data) =>
  api.update(url.DELETE_PATIENT_AADHAAR_CARD, data);
export const removePatient = (data) =>
  api.delete(`${url.DELETE_PATIENT}/${data}`);
export const deletePatientPermanently = (data) =>
  api.delete(`${url.DELETE_PATIENT_PERMANENTLY}/${data}`);

//Timeline
export const getPatientTimeline = (data) =>
  api.get(url.GET_PATIENT_TIMELINE, data);
export const getUserTimeline = (data) => api.get(url.GET_USER_TIMELINE, data);

// Chart Method
export const getChartsAddmissions = (data) =>
  api.get(url.GET_CHARTS_ADDMISSIONS, {
    params: {
      addmissions: [...data],
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getCharts = (data) =>
  api.get(url.GET_CHARTS, { addmission: data });
export const getGeneralCharts = (data) => api.get(url.GET_GENERAL_CHARTS, data);
export const postPrescription = (data) =>
  api.create(url.POST_PRESCRIPTION, data);
export const editPrescription = (data) => api.put(url.EDIT_PRESCRIPTION, data);
export const postGeneralPrescription = (data) =>
  api.create(url.POST_GENERAL_PRESCRIPTION, data);
export const editGeneralPrescription = (data) =>
  api.put(url.EDIT_GENERAL_PRESCRIPTION, data);
export const postVitalSign = (data) => api.create(url.POST_VITAL_SIGN, data);
export const editVitalSign = (data) => api.put(url.EDIT_VITAL_SIGN, data);
export const postGeneralVitalSign = (data) =>
  api.create(url.POST_GENERAL_VITAL_SIGN, data);
export const editGeneralVitalSign = (data) =>
  api.put(url.EDIT_GENERAL_VITAL_SIGN, data);
export const postClinicalNote = (data) =>
  api.create(url.POST_CLINICAL_NOTE, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const editClinicalNote = (data) =>
  api.put(url.EDIT_CLINICAL_NOTE, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const postGeneralClinicalNote = (data) =>
  api.create(url.POST_GENERAL_CLINICAL_NOTE, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const editGeneralClinicalNote = (data) =>
  api.put(url.EDIT_GENERAL_CLINICAL_NOTE, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteClinicalNoteFile = (data) =>
  api.update(url.DELETE_CLINICAL_NOTE_FILE, data);
export const postLabReport = (data) =>
  api.create(url.POST_LAB_REPORT, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const editLabReport = (data) =>
  api.put(url.EDIT_LAB_REPORT, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteLabReportFile = (data) =>
  api.update(url.DELETE_LAB_REPORT_FILE, data);
export const postGeneralLabReport = (data) =>
  api.create(url.POST_GENERAL_LAB_REPORT, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const editGeneralLabReport = (data) =>
  api.put(url.EDIT_GENERAL_LAB_REPORT, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const postRealtiveVisit = (data) =>
  api.create(url.POST_RELATIVE_VISIT, data);
export const editRealtiveVisit = (data) =>
  api.put(url.EDIT_RELATIVE_VISIT, data);
export const postGeneralRealtiveVisit = (data) =>
  api.create(url.POST_GENERAL_RELATIVE_VISIT, data);
export const editGeneralRealtiveVisit = (data) =>
  api.put(url.EDIT_GENERAL_RELATIVE_VISIT, data);
export const postDischargeSummary = (data) =>
  api.create(url.POST_DISCHARGE_SUMMARY, data);
export const editDischargeSummary = (data) =>
  api.put(url.EDIT_DISCHARGE_SUMMARY, data);
export const postDetailAdmission = (data) =>
  api.create(url.POST_DETAIL_ADMISSION, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const editDetailAdmission = (data) =>
  api.put(url.EDIT_DETAIL_ADMISSION, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const postGeneralDetailAdmission = (data) =>
  api.create(url.POST_GENERAL_DETAIL_ADMISSION, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const editGeneralDetailAdmission = (data) =>
  api.put(url.EDIT_GENERAL_DETAIL_ADMISSION, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteDetailAdmissionFile = (data) =>
  api.update(url.DELETE_DETAIL_ADMISSION_FILE, data);
export const deleteChart = (data) => api.delete(`${url.DELETE_CHART}/${data}`);
export const deleteChartPermanently = (param) =>
  api.delete(`${url.DELETE_CHART_PERMANENTLY}/${param}`);
export const postRestoreChart = (data) =>
  api.update(url.POST_RESTORE_CHART, data);
//OPD
export const getOPDPrescription = (data) =>
  api.get(url.GET_OPD_PRESCRIPTION, data);

// Bill Method
export const getBillsAddmissions = (data) =>
  api.get(url.GET_BILLS_ADDMISSIONS, {
    params: {
      addmissions: [...data],
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getBills = (data) => api.get(url.GET_BILLS, { addmission: data });
export const getDraftBills = (data) => api.get(url.GET_DRAFT_BILLS, data);
export const postInvoice = (data) => api.create(url.POST_INVOICE, data);
export const postDeposit = (data) => api.create(url.POST_DEPOSIT, data);
export const editDeposit = (data) => api.put(url.EDIT_DEPOSIT, data);
export const convertDepositToAdvance = (data) =>
  api.put(url.CONVERT_DEPOSIT_TO_ADVANCE, data);
export const postDraftInvoice = (data) =>
  api.create(url.POST_DRAFT_INVOICE, data);
export const postDraftToInvoice = (data) =>
  api.create(url.POST_DRAFT_TO_INVOICE, data);
export const editDraftInvoice = (data) => api.put(url.EDIT_DRAFT_INVOICE, data);
export const editInvoice = (data) => api.put(url.EDIT_INVOICE, data);
export const postAdvancePayment = (data) =>
  api.create(url.POST_ADVANCE_PAYMENT, data);
export const editAdvancePayment = (data) =>
  api.put(url.EDIT_ADVANCE_PAYMENT, data);
export const deleteDraftBill = (data) =>
  api.delete(`${url.DELETE_DRAFT_BILL}/${data}`);
export const deleteBill = (data) => api.delete(`${url.DELETE_BILL}/${data}`);
export const deleteBillPermanently = (param) =>
  api.delete(`${url.DELETE_BILL_PERMANENTLY}/${param}`);
export const postRestoreBill = (data) =>
  api.update(url.POST_RESTORE_BILL, data);

//recyclebin
export const getDeletedCenters = (data) =>
  api.get(url.GET_DELETED_CENTERS, {
    params: {
      centerIds: data,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getDeletedPatients = (data) =>
  api.get(url.GET_DELETED_PATIENTS, {
    params: {
      centerIds: data,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getDeletedCharts = (data) =>
  api.get(url.GET_DELETED_CHARTS, {
    params: {
      centerIds: data,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getDeletedBills = (data) =>
  api.get(url.GET_DELETED_BILLS, {
    params: {
      centerIds: data,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getDeletedLeads = (data) =>
  api.get(url.GET_DELETED_LEADS, {
    params: {
      centerIds: data,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });

export const getDeletedMedicines = (data) =>
  api.get(url.GET_DELETED_MEDICINES, {
    params: {
      centerIds: data,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });

//Booking
export const getAppointments = (data) =>
  api.get(url.GET_APPOINTMENTS, {
    params: {
      centerIds: data?.centerAccess,
      start: data?.start,
      end: data?.end,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });

export const getPatientAppointments = (data) =>
  api.get(url.GET_PATIENT_APPOINTMENTS, data);
export const getPatientAppointmentData = (data) =>
  api.get(url.GET_PATIENT_APPOINTMENT_DATA, data);
export const getPatientPreviousDoctor = (data) =>
  api.get(url.GET_PATIENT_PREVIOUS_DOCTOR, data);
export const postAppointment = (data) => api.create(url.POST_APPOINTMENT, data);
export const editAppointment = (data) => api.put(url.EDIT_APPOINTMENT, data);
export const postCancelAppointment = (data) =>
  api.update(url.CANCEL_APPOINTMENT, data);
export const deleteAppointment = (data) =>
  api.delete(`${url.DELETE_APPOINTMENT}/${data}`);
export const deleteAppointmentPermanently = (param) =>
  api.delete(`${url.DELETE_APPOINTMENT_PERMANENTLY}/${param}`);
export const postRestoreAppointment = (data) =>
  api.update(url.RESTORE_APPOINTMENT, data);

//Setting
//Doctor schedule
export const getAllDoctorSchedule = (data) =>
  api.get(url.GET_ALL_DOCTOR_SCHEDULE, data);
export const getDoctorSchedule = (data) =>
  api.get(url.GET_DOCTOR_AVAILABLE_SLOTS, data);
export const postDoctorSchedule = (data) =>
  api.create(url.POST_DOCTOR_SCHEDULE, data);
export const postDoctorScheduleNew = (data) =>
  api.create(url.GET_DOCTOR_SCHEDULE_NEW, data);
export const editDoctorSchedule = (data) =>
  api.put(url.EDIT_DOCTOR_SCHEDULE, data);

//Calender
export const postCalenderDuration = (data) =>
  api.create(url.POST_CALENDER_DURATION, data);
export const getCalenderDuration = (data) =>
  api.get(url.GET_CALENDER_DURATION, data);
export const editCalenderDuration = (data) =>
  api.put(url.EDIT_CALENDER_DURATION, data);

//Report
export const getReport = (data) =>
  api.get(url.GET_REPORT, {
    params: data,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getDBLogs = (data) =>
  api.get(url.GET_DB_LOGS, {
    params: data,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getFinanceAnalytics = (data) =>
  api.get(url.GET_FINANCE_ANALYTICS, {
    params: data,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getPatientAnalytics = (data) =>
  api.get(url.GET_PATIENT_ANALYTICS, {
    params: data,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getLeadAnalytics = (data) =>
  api.get(url.GET_LEAD_ANALYTICS, {
    params: data,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
export const getOPDAnalytics = (data) =>
  api.get(url.GET_OPD_ANALYTICS, {
    params: data,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });

//Notification
export const getBillNotification = (data) =>
  api.get(url.GET_BILL_NOTIFICATION, {
    params: {
      centerIds: data,
    },
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });

//Intern
export const addInternForm = (data) =>
  api.create(url.POST_INTERN_FORM, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchAllInterns = (params = {}) => {
  const query = qs.stringify(params, { skipNulls: true });
  return api.get(`${url.GET_INTERN_DATA}?${query}`);
};

export const getInternId = () => api.get(url.GET_INTERN_ID);

export const getInternById = (id) => api.get(url.GET_INTERN_BY_ID(id));

export const addInternReceipt = (data) =>
  api.create(url.ADD_INTERN_RECEIPT, data, {
    headers: { "Content-Type": "application/json" },
  });

export const getInternReceipt = (internId) => {
  return api.get(url.GET_INTERN_RECEIPT(internId));
};

export const updateInternForm = (id, data) => {
  return api.put(url.UPDATE_INTERN_FORM(id), data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const removeIntern = (id) => api.delete(`${url.DELETE_INTERN}/${id}`);
export const permenentremoveIntern = (id) =>
  api.delete(`${url.DELETE_INTERN}permenent-delete/${id}`);
export const removeInternBill = (id) =>
  api.delete(`${url.DELETE_INTERN_BILL}/${id}`);

export const updateInternReceipt = (data) => {
  return api.put(url.UPDATE_INTERN_RECEIPT, data);
};

export const add_offer_helper = (data) =>
  api.create(url.ADD_OFFER, data, {
    headers: { "Content-Type": "application/json" },
  });

export const getOfferList = ({ page = 1, limit = 10, search = "" } = {}) => {
  return api.get(url.GET_OFFER_LIST, { page, limit, search });
};

export const updateOffer = (data) => {
  return api.put(url.UPDATE_OFFER, data, {
    headers: { "Content-Type": "application/json" },
  });
};

export const add_tax_helper = (data) =>
  api.create(url.ADD_TAX, data, {
    headers: { "Content-Type": "application/json" },
  });

export const getTaxList = ({ page = 1, limit = 10, search = "" } = {}) => {
  return api.get(url.GET_TAX_LIST, { page, limit, search });
};

export const updateTax = (data) => {
  return api.put(url.UPDATE_TAX, data, {
    headers: { "Content-Type": "application/json" },
  });
};

export const getHubspotContacts = ({
  page = 1,
  limit = 10,
  search = "",
  visitDate,
  status,
} = {}) => {
  return api.get(url.GET_HUBSPOT_CONTACTS, {
    params: { page, limit, search, visitDate, status },
  });
};
