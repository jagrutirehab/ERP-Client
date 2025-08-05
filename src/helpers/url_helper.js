//4010/api/v1/
//REGISTER
export const POST_USER_REGISTER = "/auth/user";
export const POST_USER_PROFILE_PICTURE = "/auth/user/profile-picture";
export const POST_USER_DETAIL_INFORMATION = "/auth/user/detail-information";
export const GET_USERS = "/auth/user";
export const GET_DOCTOR_USERS = "/auth/user/center-doctor";
export const GET_DELETED_USERS = "/auth/user/deleted";
export const SUSPEND_USER = "/auth/user/suspend";
export const DELETE_USER = "/auth/user";
export const EDIT_USER = "/auth/user";
export const EDIT_USER_PASSWORD = "/auth/user";
export const POST_USER_SESSION_PRICING = "/auth/user/session-pricing";
export const PUT_USER_SESSION_PRICING = "/auth/user/session-pricing";
export const UPDATE_USER_ACTIVE_INACTIVE = "/auth/user/mark-active-inactive";
//LOGIN
export const POST_USER_LOGIN = "/auth/login";
export const SEARCH_USER = "/auth/search";

//LOGOUT
export const POST_USER_LOGOUT = "/auth/logout";

//DASHBOARD
export const GET_DASHBOARD_ANALYTICS = "/dashboard";

//LOG
export const GET_USER_LOGS = "/log/user";

//CENTER
export const POST_CENTER = "/center";
export const GET_CENTERS = "/center";
export const GET_DELETED_CENTERS = "/center/deleted";
export const GET_ALL_CENTERS = "/center/all";
export const EDIT_CENTER = "/center";
export const DELETE_CENTER_LOGO = "/center";
export const RESTORE_CENTER = "/center/restore";
export const DELETE_CENTER = "/center";
export const DELETE_CENTER_PERMANENTLY = "/center/delete-permanently";

//BOOKING
export const GET_APPOINTMENTS = "/booking";
export const GET_PATIENT_APPOINTMENTS = "/booking/patient/appointment";
export const GET_PATIENT_APPOINTMENT_DATA = "/booking/patient/appointment/data";
export const GET_PATIENT_PREVIOUS_DOCTOR =
  "/booking/patient/appointment/doctor";
export const POST_APPOINTMENT = "/booking";
export const EDIT_APPOINTMENT = "/booking";
export const DELETE_APPOINTMENT = "/booking";
export const RESTORE_APPOINTMENT = "/booking/restore";
export const DELETE_APPOINTMENT_PERMANENTLY = "/booking/delete-permanently";
export const CANCEL_APPOINTMENT = "/booking";

//LEAD
export const POST_LEAD = "/lead";
export const GET_DELETED_LEADS = "/lead/deleted";
export const POST_RESTORE_LEAD = "/lead/restore";
export const EDIT_LEAD = "/lead";
export const GET_LEADS = "/lead";
export const GET_SEARCH_LEADS = "/lead/search";
export const POST_MERGE_LEAD = "/lead/merge";
export const POST_UNMERGE_LEAD = "/lead/unmerge";
export const DELETE_LEAD = "/lead";
export const DELETE_LEAD_PERMANENTLY = "/lead/delete-permanently";

//PATIENT
export const GET_PATIENTS = "/patient";
export const GET_PATIENT_BY_ID = "/patient/patient-id";
export const GET_ALL_PATIENTS = "/patient/all";
export const GET_MORE_PATIENTS = "/patient/more";
export const GET_PATIENTS_REFERRAL = "/patient/patient-referral";
export const GET_PATIENT_COUNTED_DOCUMENTS = "/patient/count-documents";
export const GET_DELETED_PATIENTS = "/patient/deleted";
export const POST_PATIENT = "/patient";
export const CREATE_PATIENT_ID = "/patient/create-id";
export const POST_LEAD_PATIENT = "/patient/lead";
export const SEARCH_PATIENTS = "/patient/search";
export const SEARCH_PATIENTS_PHONE_NUMBER = "/patient/search/phone-number";
export const ADMIT_PATIENT = "/patient/admit";
export const EDIT_ADMISSION = "/patient/admit/update";
export const DISCHARGE_PATIENT = "/patient/discharge";
export const UNDISCHARGE_PATIENT = "/patient/un-discharge";
export const SWITCH_PATIENT_CENTER = "/patient/center";
export const EDIT_PATIENT = "/patient";
export const DELETE_PATIENT_AADHAAR_CARD = "/patient";
export const POST_RESTORE_PATIENT = "/patient/restore";
export const DELETE_PATIENT = "/patient";
export const DELETE_PATIENT_PERMANENTLY = "/patient/delete-permanently";
export const UPDATE_ADMISSION_ASSIGNMENT =
  "/patient/update-admission-assignment";

//TIMELINE
export const GET_PATIENT_TIMELINE = "/timeline/patient";
export const GET_USER_TIMELINE = "/timeline/user";
export const GET_INTERN_TIMELINE = "timeline/intern";

//CHART
export const GET_CHARTS_ADDMISSIONS = "/chart/addmission";
export const GET_CHARTS = "/chart";
export const GET_GENERAL_CHARTS = "/chart/general";
export const GET_DELETED_CHARTS = "/chart/deleted";
export const POST_PRESCRIPTION = "/chart/prescription";
export const EDIT_PRESCRIPTION = "/chart/prescription";
export const POST_GENERAL_PRESCRIPTION = "/chart/prescription/general";
export const EDIT_GENERAL_PRESCRIPTION = "/chart/prescription/general";
export const POST_VITAL_SIGN = "/chart/vital-sign";
export const EDIT_VITAL_SIGN = "/chart/vital-sign";
export const POST_GENERAL_VITAL_SIGN = "/chart/vital-sign/general";
export const EDIT_GENERAL_VITAL_SIGN = "/chart/vital-sign/general";
export const POST_LAB_REPORT = "/chart/lab-report";
export const EDIT_LAB_REPORT = "/chart/lab-report";
export const POST_GENERAL_LAB_REPORT = "/chart/lab-report/general";
export const EDIT_GENERAL_LAB_REPORT = "/chart/lab-report/general";
export const DELETE_LAB_REPORT_FILE = "/chart/lab-report";
export const POST_CLINICAL_NOTE = "/chart/clinical-note";
export const EDIT_CLINICAL_NOTE = "/chart/clinical-note";
export const POST_GENERAL_CLINICAL_NOTE = "/chart/clinical-note/general";
export const EDIT_GENERAL_CLINICAL_NOTE = "/chart/clinical-note/general";
export const DELETE_CLINICAL_NOTE_FILE = "/chart/clinical-note";
export const POST_RELATIVE_VISIT = "/chart/relative-visit";
export const EDIT_RELATIVE_VISIT = "/chart/relative-visit";
export const POST_GENERAL_RELATIVE_VISIT = "/chart/relative-visit/general";
export const EDIT_GENERAL_RELATIVE_VISIT = "/chart/relative-visit/general";
export const POST_DISCHARGE_SUMMARY = "/chart/discharge-summary";
export const EDIT_DISCHARGE_SUMMARY = "/chart/discharge-summary";
export const POST_DETAIL_ADMISSION = "/chart/detail-admission";
export const EDIT_DETAIL_ADMISSION = "/chart/detail-admission";
export const POST_GENERAL_DETAIL_ADMISSION = "/chart/detail-admission/general";
export const EDIT_GENERAL_DETAIL_ADMISSION = "/chart/detail-admission/general";
export const DELETE_DETAIL_ADMISSION_FILE = "/chart/detail-admission";
export const DELETE_CHART = "/chart";
export const POST_RESTORE_CHART = "/chart/restore";
export const DELETE_CHART_PERMANENTLY = "/chart/delete-permanently";
//OPD
export const GET_OPD_PRESCRIPTION = "/chart/opd/prescription";

//BILL
export const GET_BILLS_ADDMISSIONS = "/bill/addmission";
export const GET_BILLS = "/bill";
export const GET_DRAFT_BILLS = "/bill/draft";
export const DELETE_DRAFT_BILL = "/bill/draft";
export const GET_DELETED_BILLS = "/bill/deleted";
export const POST_INVOICE = "/bill/invoice";
export const POST_DEPOSIT = "/bill/deposit";
export const EDIT_DEPOSIT = "/bill/deposit";
export const CONVERT_DEPOSIT_TO_ADVANCE = "/bill/deposit/convert-to-advance";
export const POST_DRAFT_INVOICE = "/bill/draft/invoice";
export const EDIT_DRAFT_INVOICE = "/bill/draft/invoice";
export const POST_DRAFT_TO_INVOICE = "/bill/draft/draft-to-invoiceBill";
export const POST_ADVANCE_PAYMENT = "/bill/advance-payment";
export const EDIT_INVOICE = "/bill/invoice";
export const EDIT_ADVANCE_PAYMENT = "/bill/advance-payment";
export const DELETE_BILL = "/bill";
export const POST_RESTORE_BILL = "/bill/restore";
export const DELETE_BILL_PERMANENTLY = "/bill/delete-permanently";

//MEDICINE
export const GET_MEDICINES = "/medicine";
export const GET_DELETED_MEDICINES = "/medicine/deleted";
export const POST_MEDICINE = "/medicine";
export const POST_CSV_MEDICINE = "/medicine/csv";
export const EDIT_MEDICINE = "/medicine";
export const DELETE_MEDICINE = "/medicine";
export const POST_RESTORE_MEDICINE = "/medicine/restore";
export const DELETE_MEDICINE_PERMANENTLY = "/medicine/delete-permanently";

//BILL SETTING
//invoice
export const POST_BILL_ITEM = "/bill-setting";
export const GET_DELETED_BILL_ITEMS = "/bill-setting/deleted";
export const GET_BILL_ITEMS = "/bill-setting";
export const GET_ALL_BILL_ITEMS = "/bill-setting/all";
export const EDIT_BILL_ITEM = "/bill-setting";
export const DELETE_BILL_ITEM = "/bill-setting";
//advance payment
export const POST_PAYMENT_ACCOUNT = "/bill-setting/payment-account";
export const GET_PAYMENT_ACCOUNTS = "/bill-setting/payment-account";
export const DELETE_PAYMENT_ACCOUNT = "/bill-setting/payment-account";

//DOCTOR WORKING SCHEDULE
export const GET_ALL_DOCTOR_SCHEDULE = "/setting/doctor-schedule/all";
export const GET_DOCTOR_AVAILABLE_SLOTS = "/setting/available-slots";
export const GET_DOCTOR_SCHEDULE = "/setting/doctor-schedule";
export const POST_DOCTOR_SCHEDULE = "/setting/doctor-schedule";
export const EDIT_DOCTOR_SCHEDULE = "/setting/doctor-schedule";
export const GET_DOCTOR_SCHEDULE_NEW = "/setting/doctor-schedule/new";

//CALENDER
export const GET_CALENDER_DURATION = "/setting/calender";
export const POST_CALENDER_DURATION = "/setting/calender";
export const EDIT_CALENDER_DURATION = "/setting/calender";

//REPORT
export const GET_REPORT = "/report";
export const GET_DB_LOGS = "/report/db-logs";
export const GET_FINANCE_ANALYTICS = "/report/finance";
export const GET_PATIENT_ANALYTICS = "/report/patient";
export const GET_PATIENT_ANALYTICS_WP = "/report/patient-csv";
export const GET_LEAD_ANALYTICS = "/report/lead";
export const GET_OPD_ANALYTICS = "/report/opd";

//NOTIFICATION
export const GET_BILL_NOTIFICATION = "notification/bill";

//INTERN
export const POST_INTERN_FORM = "intern/";
export const GET_INTERN_DATA = "intern/";
export const GET_INTERN_ID = "intern/create-internid";
export const GET_INTERN_BY_ID = (id) => `intern/${id}`;
export const ADD_INTERN_RECEIPT = "intern/receipt";
export const GET_INTERN_RECEIPT = (internId) =>
  `intern/receipt?intern=${internId}`;
export const UPDATE_INTERN_FORM = (id) => `intern/${id}`;
export const DELETE_INTERN = "intern/";
export const DELETE_INTERN_BILL = "intern/receipt";
export const UPDATE_INTERN_RECEIPT = "intern/receipt";

//CLINICAL TEST
export const GET_CIWA_TEST = "/clinical-test/ciwa-test";
export const POST_CIWA_TEST = "/clinical-test/ciwa-test";
export const POST_SSRS_TEST = "/clinical-test/ssrs-test";
export const POST_MPQ_TEST = "/clinical-test/mpq-test";
export const POST_MMSE_TEST = "/clinical-test/mmse-test";
export const POST_YMRS_TEST = "/clinical-test/ymrs-test";
export const FETCH_CLINICAL_TEST = "/clinical-test";

// OFFER
export const ADD_OFFER = "/offer/addoffer";
export const GET_OFFER_LIST = "/offer/get-offer-list";
export const UPDATE_OFFER = "/offer/update";

//TAX
export const ADD_TAX = "/tax/addtax";
export const GET_TAX_LIST = "/tax/get-tax-list";
export const UPDATE_TAX = "/tax/update";

//HUBSPOT
export const GET_HUBSPOT_CONTACTS = "/hubspot/getContacts";

//New Microservice APIS
export const CSRF = "/csrf-token"
export const MICRO_SIGN_IN = "/userauths/signin"
export const MICRO_SIGN_UP = "/userauths/signup";
export const MICRO_LOGOUT="/userauths/logout";
export const CHANGE_PASSWORD="/userauths/forgott-password"
export const ROLES = "/role"
export const USER = "/user"
export const MOVE_TO_BIN="/user/move-recyclebin"
export const ACTIVATE_DEACTIVATE_USER="/user/deactive"
export const CHANGE_USER_PASSWORD="/user/change-password"
