import { gql } from "@apollo/client";

export const GET_FINANCE_LOGS = gql`
  query GetFinanceLogs {
    opd {
      centerName
      records {
        year
        month
        payable
      }
    }
  }
`;
export const GET_TOTAL_PATIENT = gql`
  query GetPatientData {
    admitPatients {
      centerName
      records {
        year
        month
        totalPatients
      }
    }
  }
`;
export const GET_DISCHARGE_PATIENT = gql`
  query GetDischargePatientData {
    dischargePatients {
      centerName
      records {
        year
        month
        totalPatients
      }
    }
  }
`;
export const GET_ADVANCE_AMOUNT = gql`
  query GetAdvanceAmount {
    invoicedAmountAdvanceAmount {
      centerName
      records {
        year
        month
        advanceAmount
        invoiceAmount
      }
    }
  }
`;
export const GET_OCCUPIED_BED = gql`
  query GetAdvanceAmount {
    occupancy {
      centerName
      records {
        year
        month
        totalOccupancy
      }
    }
  }
`;
export const GET_REMAIN_PATIENT = gql`
  query PatientData {
    remainPatientData {
      centerName
      records {
        year
        month
        totalRemains
      }
    }
  }
`;

//  query for all category data in single object

export const GET_BILLING_DATA = gql`
  query GetBillingData($id: ID!) {
    getBillingData(id: $id) {
      centerName
      records {
        year
        month
        payable
        invoiceAmount
        advanceAmount
        totalPatients
        totalOccupancy
        totalRemains
      }
    }
  }
`;

// all in one query
export const GET_ON_MONTH_DATA = gql`
  query GetBillingData($id: ID!) {
    getBillingData(id: $id) {
      opd {
        centerName
        records {
          year
          month
          payable
        }
      }
      admitPatients {
        centerName
        records {
          year
          month
          totalPatients
        }
      }
      dischargePatients {
        centerName
        records {
          year
          month
          totalPatients
        }
      }
      invoicedAmountAdvanceAmount {
        centerName
        records {
          year
          month
          invoiceAmount
          advanceAmount
        }
      }
      occupancy {
        centerName
        records {
          year
          month
          totalOccupancy
        }
      }
      remainPatientData {
        centerName
        records {
          year
          month
          totalRemains
        }
      }
      invoicedAppointmentsData {
        centerName
        records {
          year
          month
          totalInvoicedAppointments
        }
      }
      appointmentsData {
        centerName
        records {
          year
          month
          totalAppointments
        }
      }
      deposit {
        centerName
        records {
          year
          month
          depositAmount
        }
      }
    }
  }
`;

export const GET_MONTH_TILL_DATE_DATA = gql`
  query GetMonthOnMonthData($id: ID!) {
    getMonthlyBillingData(id: $id) {
      opd {
        centerName
        records {
          year
          month
          payable
          invoiceAmount
          advanceAmount
          totalPatients
        }
      }
      admitPatients {
        centerName
        records {
          year
          month
          payable
          invoiceAmount
          advanceAmount
          totalPatients
        }
      }
      dischargePatients {
        centerName
        records {
          year
          month
          payable
          invoiceAmount
          advanceAmount
          totalPatients
        }
      }
      invoicedAmountAdvanceAmount {
        centerName
        records {
          year
          month
          payable
          invoiceAmount
          advanceAmount
          totalPatients
        }
      }
      occupancy {
        centerName
        records {
          year
          month
          totalOccupancy
          totalRemains
        }
      }
      remainPatientData {
        centerName
        records {
          year
          month
          totalOccupancy
          totalRemains
        }
      }
    }
  }
`;
