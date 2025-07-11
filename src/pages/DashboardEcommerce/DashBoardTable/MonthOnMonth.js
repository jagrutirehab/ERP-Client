// import React, { useMemo } from 'react';
// import { useQuery } from '@apollo/client';
// import { AgGridReact } from 'ag-grid-react';
// import { ModuleRegistry,ClientSideRowModelModule, PaginationModule, themeQuartz } from 'ag-grid-community';
// import { GET_MERGED_DATA } from '../../../GraphQL/graphQl-Query/financeQueries';
// // import { GET_BILLING_DATA } from '../../../GraphQL/graphQl-Query/financeQueries';

// ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule]);

// const myTheme = themeQuartz.withParams({
//   backgroundColor: "#fafafa",
//   foregroundColor: "#212529",
//   accentColor: "#6495ed",
//   headerTextColor: "#ffffff",
//   headerBackgroundColor: "#2196f3",
//   oddRowBackgroundColor: "rgba(0, 0, 0, 0.02)",
//   headerColumnResizeHandleColor: "rgba(255, 255, 255, 0.6)",
// });

// const monthNames = {
//   1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr',
//   5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug',
//   9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
// };

// const DataTable = ({ centerId }) => {

//   const { data, loading, error } = useQuery(GET_MERGED_DATA, {
//     variables: {id: centerId }
// });

//   const { columnDefs, rowData } = useMemo(() => {
//     console.log(data, " check it")
//     if (!data) return { columnDefs: [], rowData: [] };

//     const billingData = data.getBillingData?.[0]?.records || [];

//     const months = [...billingData]
//     .sort((a, b) => {
//       const dateA = new Date(a.year, a.month - 1);
//       const dateB = new Date(b.year, b.month - 1);
//       return dateB - dateA; // ✅ latest month first
//     })
//     .map(r => {
//       const monthLabel = `${monthNames[+r.month]} ${r.year}`;
//       return { key: monthLabel, ...r };
//     });

//     // Define metrics you want to show
//     const metrics = [
//       { field: 'payable', label: 'Payable Amount' },
//       { field: 'invoiceAmount', label: 'Invoice Amount' },
//       { field: 'advanceAmount', label: 'Advance Amount' },
//       { field: 'totalPatients', label: 'Total Patients' },
//       { field: 'totalOccupancy', label: 'Occupied Beds' },
//       { field: 'totalRemains', label: 'Remaining Patients' },
//     ];

//     // Convert metrics to rowData format
//     const rowData = metrics.map(metric => {
//       const row = { metric: metric.label };
//       months.forEach(m => {
//         const monthLabel = `${monthNames[+m.month]} ${m.year}`;
//         row[monthLabel] = m[metric.field] ?? 0;
//       });
//       return row;
//     });

//     // Create dynamic columns from available months
//     const monthColumns = [...new Set(months.map(m => `${monthNames[+m.month]} ${m.year}`))].map(month => ({
//       headerName: month,
//       field: month,
//       filter: 'agNumberColumnFilter',
//       sortable: true,
//     }));

//     const columnDefs = [
//       { headerName: 'Metric', field: 'metric', pinned: 'left', cellStyle: { fontWeight: 'bold' } },
//       ...monthColumns
//     ];

//     return { columnDefs, rowData };
//   }, [data]);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error loading data</p>;

//   return (
//     <div className="ag-theme-quartz" style={{ height: '600px', width: '100%' }}>
//       <AgGridReact
//         columnDefs={columnDefs}
//         rowData={rowData}
//         pagination={true}
//         domLayout="autoHeight"
//         animateRows={true}
//         theme={myTheme}

//       />
//     </div>
//   );
// };

// export default DataTable;

import React, { useMemo, useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  PaginationModule,
  themeQuartz,
} from "ag-grid-community";
import { GET_ON_MONTH_DATA } from "../../../GraphQL/graphQl-Query/financeQueries";
ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule]);

const myTheme = themeQuartz.withParams({
  backgroundColor: "#fafafa",
  foregroundColor: "#212529",
  accentColor: "#6495ed",
  headerTextColor: "#ffffff",
  headerBackgroundColor: "#2196f3",
  oddRowBackgroundColor: "rgba(0, 0, 0, 0.02)",
  headerColumnResizeHandleColor: "rgba(255, 255, 255, 0.6)",
});

const monthNames = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const MonthOnMonth = ({ centerId, data }) => {
  // const { data, loading, error } = useQuery(GET_ON_MONTH_DATA, {
  //   variables: { id: centerId },
  // });
  // Progress bar state

  console.log(data, "data mom");

  const [progress, setProgress] = useState(0);

  // useEffect(() => {
  //   if (loading) {
  //     setProgress(0);
  //     const interval = setInterval(() => {
  //       setProgress((prev) => (prev < 95 ? prev + 1 : 95));
  //     }, 30);

  //     return () => clearInterval(interval);
  //   }
  // }, [loading]);

  const { columnDefs, rowData } = useMemo(() => {
    // console.log(GET_ON_MONTH_DATA)
    if (!data) return { columnDefs: [], rowData: [] };

    // Attach source info to help distinguish 'totalPatients' in admit/discharge
    const tagSource = (records, source) =>
      records.map((section) => {
        console.log(section, "section");

        return {
          ...section,
          records: section.records.map((r) => ({ ...r, source })),
        };
      });
    console.log(data.deposit, "deposit mom");
    const allSections = [
      ...tagSource([data.opdData] || [], "opd"),
      ...tagSource([data.admitData] || [], "admit"),
      ...tagSource([data.dischargeData] || [], "discharge"),
      ...tagSource([data.advanceAndInvoiceAmount] || [], "invoice"),
      ...tagSource([data.occupancy] || [], "occupancy"),
      ...tagSource([data.remainPatient] || [], "remain"),
      ...tagSource(
        [data.invoicedAppointments] || [],
        "invoicedAppointmentsData"
      ),
      ...tagSource([data.appointments] || [], "appointmentsData"),
      ...tagSource([data.deposit] || [], "deposit"),
    ];

    const allRecords = allSections.flatMap((section) => section.records);

    const recordMap = {};

    allRecords.forEach((record) => {
      const year = parseInt(record.year);
      const month = isNaN(record.month)
        ? new Date(`${record.month} 1, ${year}`).getMonth() + 1
        : parseInt(record.month);
      const key = `${year}-${month}`;

      if (!recordMap[key]) {
        recordMap[key] = { year, month };
      }

      Object.entries(record).forEach(([k, v]) => {
        if (v == null) return;

        if (k === "totalPatients") {
          const fieldName =
            record.source === "admit"
              ? "admittedPatients"
              : record.source === "discharge"
              ? "dischargedPatients"
              : k;

          recordMap[key][fieldName] = (recordMap[key][fieldName] ?? 0) + v;
        } else if (k !== "source") {
          if (recordMap[key][k] === undefined || recordMap[key][k] === null) {
            recordMap[key][k] = v;
          }
        }
      });
    });

    const months = Object.values(recordMap).sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1);
      const dateB = new Date(b.year, b.month - 1);
      return dateB - dateA;
    });

    const metrics = [
      { field: "invoiceAmount", label: "Invoice Amount" },
      { field: "advanceAmount", label: "Advance Amount" },
      { field: "payable", label: "OPD Amount" },
      { field: "depositAmount", label: "Total Deposit" },
      { field: "admittedPatients", label: "Admitted Patients" },
      { field: "dischargedPatients", label: "Discharged Patients" },
      { field: "totalOccupancy", label: "Occupied Beds" },
      { field: "totalRemains", label: "Remaining Patients" },
      { field: "totalAppointments", label: "Total Appointment" },
      { field: "totalInvoicedAppointments", label: "Invoiced Appointment" },
    ];

    const rowData = metrics.map((metric) => {
      const row = { metric: metric.label };
      months.forEach((m) => {
        const label = `${monthNames[m.month]} ${m.year}`;
        row[label] = m[metric.field] ?? 0;
      });
      return row;
    });

    const monthColumns = months.map((m) => {
      const label = `${monthNames[m.month]} ${m.year}`;
      return {
        headerName: label,
        field: label,
        filter: "agNumberColumnFilter",
        sortable: true,
      };
    });

    const columnDefs = [
      {
        headerName: "Metric",
        field: "metric",
        pinned: "left",
        cellStyle: { fontWeight: "bold" },
      },
      ...monthColumns,
    ];

    return { columnDefs, rowData };
  }, [data]);
  // if (loading) {
  //   return (
  //     <div
  //       className="d-flex justify-content-center align-items-center"
  //       style={{ height: "200px" }}
  //     >
  //       <div style={{ width: "50%" }}>
  //         <div className="progress">
  //           <div
  //             className="progress-bar progress-bar-striped progress-bar-animated"
  //             role="progressbar"
  //             style={{ width: `${progress}%` }}
  //             aria-valuenow={progress}
  //             aria-valuemin="0"
  //             aria-valuemax="100"
  //           >
  //             {progress}%
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  // if (error) return <p>Error loading data</p>;

  return (
    <div className="ag-theme-quartz">
      <h1 style={{ textAlign: "center" }}>Month On Month Data Table</h1>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        pagination={true}
        domLayout="autoHeight"
        animateRows={true}
        theme={myTheme}
      />
    </div>
  );
};

export default MonthOnMonth;
