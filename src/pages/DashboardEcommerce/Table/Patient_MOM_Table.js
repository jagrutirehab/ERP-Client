// import React, { useState, useMemo } from 'react';
// import { AgGridReact } from 'ag-grid-react';
// import { ModuleRegistry } from 'ag-grid-community';
// import { useQuery } from '@apollo/client';
// import { GET_FINANCE_LOGS } from '../../../GraphQL/graphQl-Query/financeQueries';
// import { ClientSideRowModelModule, PaginationModule, themeQuartz } from 'ag-grid-community';

// ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule]);

// const myTheme = themeQuartz.withParams({
//   backgroundColor: "rgb(250, 250, 250)",
//   foregroundColor: "rgb(33, 37, 41)",
//   accentColor: "rgb(100, 149, 237)",
//   headerTextColor: "rgb(255, 255, 255)",
//   headerBackgroundColor: "rgb(33, 150, 243)",
//   oddRowBackgroundColor: "rgba(0, 0, 0, 0.02)",
//   headerColumnResizeHandleColor: "rgba(255, 255, 255, 0.6)",
// });

// const months = [
//   { label: 'Apr 2025', prefix: 'apr' },
//   { label: 'Mar 2025', prefix: 'mar' },
//   { label: 'Feb 2025', prefix: 'mar' }, // using march data for all
//   { label: 'Jun 2025', prefix: 'mar' },
//   { label: 'Dec 2024', prefix: 'mar' },
//   { label: 'Nov 2024', prefix: 'mar' },
//   { label: 'Oct 2024', prefix: 'mar' },
//   { label: 'Sep 2024', prefix: 'mar' },
//   { label: 'Aug 2024', prefix: 'mar' },
//   { label: 'July 2024', prefix: 'mar' },
//   { label: 'June 2024', prefix: 'mar' },
//   { label: 'Mar 2024', prefix: 'mar' },
// ];

// const fields = [
//   { label: "Payable Amount(Lakh)", key: "payable" },
//   { label: "Advance Payment(IPD)", key: "advance_ipd" },
//   { label: "OPD", key: "opd" },
//   { label: "Advance Payment", key: "advance" },
//   { label: "# Admitted Patient", key: "admitted" },
//   { label: "# Discharged Patient", key: "discharged" },
//   { label: "# Remains Patient", key: "remains" },
// ];

// const TableComponent = () => {
//   const [rowData] = useState([
//     {
//       center: "Navi",
//       apr_payable: 79.2,
//       apr_advance_ipd: 56.4,
//       apr_opd: 1.6,
//       apr_advance: 58.0,
//       apr_admitted: 43,
//       apr_discharged: 29,
//       apr_remains: 216,
//       mar_payable: 83.1,
//       mar_advance_ipd: 84.5,
//       mar_opd: 3.3,
//       mar_advance: 87.8,
//       mar_admitted: 51,
//       mar_discharged: 48,
//       mar_remains: 202,
//     },
//     {
//       center: "Malad",
//       apr_payable: 79.2,
//       apr_advance_ipd: 56.4,
//       apr_opd: 1.6,
//       apr_advance: 58.0,
//       apr_admitted: 43,
//       apr_discharged: 29,
//       apr_remains: 216,
//       mar_payable: 83.1,
//       mar_advance_ipd: 84.5,
//       mar_opd: 3.3,
//       mar_advance: 87.8,
//       mar_admitted: 51,
//       mar_discharged: 48,
//       mar_remains: 202,
//     },
//     {
//       center: "Aroha",
//       apr_payable: 79.2,
//       apr_advance_ipd: 56.4,
//       apr_opd: 1.6,
//       apr_advance: 58.0,
//       apr_admitted: 43,
//       apr_discharged: 29,
//       apr_remains: 216,
//       mar_payable: 83.1,
//       mar_advance_ipd: 84.5,
//       mar_opd: 3.3,
//       mar_advance: 87.8,
//       mar_admitted: 51,
//       mar_discharged: 48,
//       mar_remains: 202,
//     },
//   ]);

//   const theme = useMemo(() => myTheme, []);

//   const columnDefs = useMemo(() => {
//     const monthlyColumns = months.map(({ label, prefix }) => ({
//       headerName: label,
//       children: fields.map(({ label: fieldLabel, key }) => ({
//         headerName: fieldLabel,
//         field: `${prefix}_${key}`,
//       })),
//     }));

//     return [
//       {
//         headerName: "Patients",
//         field: "center",
//         pinned: "center",
//       },
//       ...monthlyColumns,
//     ];
//   }, []);

//   return (
//     <div  style={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         padding: '10px',
//         fontFamily: 'Arial, sans-serif',
//         backgroundColor: '#f8f9fa',
//         minHeight: '100vh',
//       }}>
//             <h2 style={{ marginBottom: '10px', color: '#333' }}>Patient MOM Table</h2>

    

//     <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }} theme={theme}>
//       <AgGridReact
//         rowData={rowData}
//         columnDefs={columnDefs}
//         pagination={true}
//         paginationPageSize={10}
//         theme={theme}
//       />
//     </div>
//     </div>
//   );
// };

// export default TableComponent;

import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { useQuery } from '@apollo/client';
import { GET_FINANCE_LOGS } from '../../../GraphQL/graphQl-Query/financeQueries';
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
  { label: 'Feb 2025', prefix: 'mar' }, 
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
  { label: "Payable Amount(Lakh)", key: "payable" },
  { label: " Payment(IPD)", key: "advance_ipd" },
  { label: "OPD", key: "opd" },
  { label: " Payment", key: "advance" },
  { label: "# Admitted Patient", key: "admitted" },
  { label: "# Discharged Patient", key: "discharged" },
  { label: "# Remains Patient", key: "remains" },
];

const TableComponent = () => {
  const { data, loading, error } = useQuery(GET_FINANCE_LOGS);
   const theme = useMemo(() => myTheme, []);

  const columnDefs = useMemo(() => {
    const monthlyColumns = months.map(({ label, prefix }) => ({
      headerName: label,
      children: fields.map(({ label: fieldLabel, key }) => ({
        headerName: fieldLabel,
        field: `${prefix}_${key}`,
      })),
    }));

    return [
      {
        headerName: "Patients",
        field: "center",
        pinned: "center",
      },
      ...monthlyColumns,
    ];
  }, []);

  // Transform fetched data to match table format
  const rowData = useMemo(() => {
    if (!data || !data.getFinanceLogs) return [];

    return data.getFinanceLogs.map((item) => ({
      center: item.center,  // assuming your graphql data has center

      apr_payable: item.apr?.payable || 0,
      apr_advance_ipd: item.apr?.advance_ipd || 0,
      apr_opd: item.apr?.opd || 0,
      apr_advance: item.apr?.advance || 0,
      apr_admitted: item.apr?.admitted || 0,
      apr_discharged: item.apr?.discharged || 0,
      apr_remains: item.apr?.remains || 0,

      mar_payable: item.mar?.payable || 0,
      mar_advance_ipd: item.mar?.advance_ipd || 0,
      mar_opd: item.mar?.opd || 0,
      mar_advance: item.mar?.advance || 0,
      mar_admitted: item.mar?.admitted || 0,
      mar_discharged: item.mar?.discharged || 0,
      mar_remains: item.mar?.remains || 0,

      // if needed you can add more months here similarly
    }));
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading finance logs.</div>;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    }}>
      <h2 style={{ marginBottom: '10px', color: '#333' }}>Patient MOM Table</h2>

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
