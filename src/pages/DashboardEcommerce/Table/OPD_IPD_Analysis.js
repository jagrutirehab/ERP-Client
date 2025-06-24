import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, themeQuartz } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule]);

const myTheme = themeQuartz.withParams({
  backgroundColor: "rgb(250, 250, 250)",
  foregroundColor: "rgb(33, 37, 41)",
  accentColor: "rgb(100, 149, 237)",
  headerTextColor: "rgb(255, 255, 255)",
  headerBackgroundColor: "rgb(33, 150, 243)",
  oddRowBackgroundColor: "rgba(0, 0, 0, 0.02)",
  headerColumnResizeHandleColor: "rgba(255, 255, 255, 0.6)",
});

const months = [
  { label: 'Apr 2025', prefix: 'apr' },
  { label: 'Mar 2025', prefix: 'mar' },
  { label: 'Feb 2025', prefix: 'mar' }, // using march data for all
  { label: 'Jun 2025', prefix: 'mar' },
  { label: 'Dec 2024', prefix: 'mar' },
  { label: 'Nov 2024', prefix: 'mar' },
  { label: 'Oct 2024', prefix: 'mar' },
  { label: 'Sep 2024', prefix: 'mar' },
  { label: 'Aug 2024', prefix: 'mar' },
  { label: 'July 2024', prefix: 'mar' },
  { label: 'June 2024', prefix: 'mar' },
  { label: 'Mar 2024', prefix: 'mar' },
];

const fields = [
  { label: "OPD to IPD Patients", key: "opd_ipd_patient" },
  { label: "Existing Patients)", key: "existing_Patient" },
  { label: "Existing Patient's Invoices", key: "existing_Patient_invoice" },
  { label: "Existing Patient's opd_ipd_patient Amount", key: "existing_Patient_amount" },
  { label: "Existing Patient's Advanced Amount", key: "existing_patient_advance_amount" },

];

const TableComponent = () => {
  const [rowData] = useState([
    {
      center: "Navi",
      apr_opd_ipd_patient: 79.2,
      apr_existing_Patient: 56.4,
      apr_existing_Patient_invoice: 1.6,
      apr_existing_Patient_amount: 58.0,
      apr_existing_patient_advance_amount: 43,
      apr_discharged: 29,
      apr_remains: 216,
      mar_opd_ipd_patient: 83.1,
      mar_existing_Patient: 84.5,
      mar_existing_Patient_invoice: 3.3,
      mar_existing_Patient_amount: 87.8,
      mar_existing_patient_advance_amount: 51,
      mar_discharged: 48,
      mar_remains: 202,
    },
    {
      center: "Malad",
      apr_opd_ipd_patient: 79.2,
      apr_existing_Patient: 56.4,
      apr_existing_Patient_invoice: 1.6,
      apr_existing_Patient_amount: 58.0,
      apr_existing_patient_advance_amount: 43,
      apr_discharged: 29,
      apr_remains: 216,
      mar_opd_ipd_patient: 83.1,
      mar_existing_Patient: 84.5,
      mar_existing_Patient_invoice: 3.3,
      mar_existing_Patient_amount: 87.8,
      mar_existing_patient_advance_amount: 51,
      mar_discharged: 48,
      mar_remains: 202,
    },
    {
      center: "Aroha",
      apr_opd_ipd_patient: 79.2,
      apr_existing_Patient: 56.4,
      apr_existing_Patient_invoice: 1.6,
      apr_existing_Patient_amount: 58.0,
      apr_existing_patient_advance_amount: 43,
      apr_discharged: 29,
      apr_remains: 216,
      mar_opd_ipd_patient: 83.1,
      mar_existing_Patient: 84.5,
      mar_existing_Patient_invoice: 3.3,
      mar_existing_Patient_amount: 87.8,
      mar_existing_patient_advance_amount: 51,
      mar_discharged: 48,
      mar_remains: 202,
    },
  ]);

  const theme = useMemo(() => myTheme, []);

  const columnDefs = useMemo(() => {
    const displayedMonths = months.slice(0, 3);
    const monthlyColumns = months.map(({ label, prefix }) => ({
      headerName: label,
      children: fields.map(({ label: fieldLabel, key }) => ({
        headerName: fieldLabel,
        field: `${prefix}_${key}`,
              })),
    }));

    return [
      {
        headerName: "Center Name",
        field: "center",
        pinned: "left",
        // headerStyle: { display: 'flex', justifyContent: 'center', textAlign: 'center' },  // Centering Center Name header


      },
      ...monthlyColumns,
    ];
  }, []);

  return (
    <div  style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
      }}>
                    <h2 style={{ marginBottom: '10px', color: '#333' }}>OPD& IPD Analysis Table</h2>

    <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }} theme={theme}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
        theme={theme}
      />
    </div>
    </div>
  );
};

export default TableComponent;
