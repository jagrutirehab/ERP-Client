


// import React, { useState, useEffect } from 'react';
// import { AgGridReact } from 'ag-grid-react';
// import { ModuleRegistry } from 'ag-grid-community';
// import { ClientSideRowModelModule, PaginationModule, themeQuartz } from 'ag-grid-community';
// import { useQuery } from '@apollo/client';
// import { GET_FINANCE_LOGS } from '../../../GraphQL/graphQl-Query/financeQueries';

// // Register modules
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

// const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
//                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// const MyAgGrid = () => {
//   const { data, loading, error } = useQuery(GET_FINANCE_LOGS);
//   const [columnDefs, setColumnDefs] = useState([]);
//   const [rowData, setRowData] = useState([]);

//   // useEffect(() => {
//   //   if (data && data.getFinanceLogs && data.getFinanceLogs.length > 0) {
//   //     const monthYearSet = new Set();

//   //     data.getFinanceLogs.forEach(item => {
//   //       if (item.month && item.year) {
//   //         monthYearSet.add(`${item.month}-${item.year}`);
//   //       }
//   //     });

//   //     const dynamicMonthColumns = Array.from(monthYearSet)
//   //       .sort((a, b) => {
//   //         const [monthA, yearA] = a.split('-').map(Number);
//   //         const [monthB, yearB] = b.split('-').map(Number);
//   //         return yearA !== yearB ? yearA - yearB : monthA - monthB;
//   //       })
//   //       .map(monthYear => {
//   //         const [month, year] = monthYear.split('-').map(Number);
//   //         const headerName = `${monthNames[month - 1]} ${year}`;
//   //         // console.log(dynamicMonthColumns, " mbbs")
//   //         return {
//   //           headerName,
//   //           field: monthYear,
//   //           valueFormatter: params => params.value ? params.value.toLocaleString() : '0',
//   //           cellStyle: { textAlign: 'center' },
//   //         };
//   //       });

//   //     const newColumnDefs = [
//   //       {
//   //         headerName: 'Center Name',
//   //         field: 'centerName',
//   //         pinned: 'left',
//   //         cellStyle: { fontWeight: 'bold' },
//   //       },
//   //       ...dynamicMonthColumns,
//   //     ];

//   //     const groupedData = {};

//   //     data.getFinanceLogs.forEach(item => {
//   //       const key = item.centerName;

//   //       if (!groupedData[key]) {
//   //         groupedData[key] = { centerName: item.centerName };
//   //       }

//   //       // **Now adding invoiceAmount instead of advanceAmount**
//   //       groupedData[key][`${item.month}-${item.year}`] = item.invoiceAmount;
//   //     });

//   //     const finalRowData = Object.values(groupedData);

//   //     setColumnDefs(newColumnDefs);
//   //     setRowData(finalRowData);
//   //   }
//   // }, [data]);
//   useEffect(() => {
//     console.log(data)
//     if (data && data.getFinanceLogs && data.getFinanceLogs.length > 0) {
//       const monthYearSet = new Set();
  
//       data.getFinanceLogs.forEach(item => {
//         if (item.month && item.year) {
//           monthYearSet.add(`${item.month}-${item.year}`);
//         }
//       });
  
//       const sortedMonthYears = Array.from(monthYearSet)
//         .sort((a, b) => {
//           const [monthA, yearA] = a.split('-').map(Number);
//           const [monthB, yearB] = b.split('-').map(Number);
//           return yearA !== yearB ? yearA - yearB : monthA - monthB;
//         });
  
//       const dynamicMonthColumns = sortedMonthYears.map(monthYear => {
//         const [month, year] = monthYear.split('-').map(Number);
//         const headerName = `${monthNames[month - 1]} ${year}`;
//         return {
//           headerName,
//           field: monthYear,
//           valueFormatter: params => 
//             params.value != null ? params.value.toLocaleString() : '0',
//           cellStyle: { textAlign: 'center' },
//         };
//       });
  
//       const newColumnDefs = [
//         {
//           headerName: 'Center Name',
//           field: 'centerName',
//           pinned: 'left',
//           cellStyle: { fontWeight: 'bold' },
//         },
//         ...dynamicMonthColumns,
//       ];
  
//       const groupedData = {};
  
//       data.getFinanceLogs.forEach(item => {
//         const key = item.centerName;
  
//         if (!groupedData[key]) {
//           groupedData[key] = { centerName: item.centerName };
//         }
  
//         groupedData[key][`${item.month}-${item.year}`] = item.invoiceAmount;
//       });
  
//       const finalRowData = Object.values(groupedData);
  
//       // --- Adding Total Row ---
//       const totalRow = { centerName: 'Total' };
  
//       sortedMonthYears.forEach(monthYear => {
//         totalRow[monthYear] = finalRowData.reduce((sum, row) => {
//           return sum + (row[monthYear] || 0);
//         }, 0);
//       });
  
//       finalRowData.push(totalRow);
  
//       setColumnDefs(newColumnDefs);
//       setRowData(finalRowData);
//     }
//   }, [data]);
  

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error loading data</div>;

//   return (
//     <div style={{ height: 600, width: '100%' }}>
//       <AgGridReact
//         theme={myTheme}
//         className="ag-theme-quartz" // <-- your theme
//         columnDefs={columnDefs}
//         rowData={rowData}
//         pagination={true}
//         domLayout="autoHeight"
//         defaultColDef={{ 
//           resizable: true, 
//           sortable: true, 
//           filter: true, 
//           flex: 1, 
//           minWidth: 120 
//         }}
//         suppressMovableColumns={true}
//       />
//     </div>
//   );
// };

// export default MyAgGrid;


import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, themeQuartz } from 'ag-grid-community';
import { useQuery } from '@apollo/client';
import { GET_FINANCE_LOGS } from '../../../GraphQL/graphQl-Query/financeQueries';

// Register required AG Grid modules
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

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MyAgGrid = () => {
  const { data, loading, error } = useQuery(GET_FINANCE_LOGS);
  const [columnDefs, setColumnDefs] = useState([]);
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    console.log(data)
    if (!data?.opd?.length) return;
  
    const monthYearSet = new Set();
    const allRows = [];
  
    data.opd.forEach(({ centerName, records }) => {
      const row = { centerName };
  
      records.forEach(({ month, year, payable }) => {
        if (month && year) {
          const key = `${month}-${year}`;
          monthYearSet.add(key);
          row[key] = payable;
        }
      });
  
      allRows.push(row);
    });
  
    const sortedMonthYears = Array.from(monthYearSet).sort((a, b) => {
      const [m1, y1] = a.split('-').map(Number);
      const [m2, y2] = b.split('-').map(Number);
      return y1 !== y2 ? y2 - y1 : m2 - m1;
    });
  
    const dynamicMonthColumns = sortedMonthYears.map(key => {
      const [month, year] = key.split('-').map(Number);
      return {
        headerName: `${monthNames[month - 1]} ${year}`,
        field: key,
        valueFormatter: ({ value }) => (value != null ? value.toLocaleString() : '0'),
        cellStyle: { textAlign: 'center' },
      };
    });
  
    const newColumnDefs = [
      {
        headerName: 'Center Name',
        field: 'centerName',
        pinned: 'left',
        cellStyle: { fontWeight: 'bold' },
      },
      ...dynamicMonthColumns,
    ];
  
    const totalRow = { centerName: 'Total' };
    sortedMonthYears.forEach(key => {
      totalRow[key] = allRows.reduce((sum, row) => sum + (row[key] || 0), 0);
    });
  
    allRows.push(totalRow);
  
    setColumnDefs(newColumnDefs);
    setRowData(allRows);
  }, [data]);
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div style={{ height: 600, width: '100%' }}>
       <h3 className="ag-theme-quartz" style={{ margin: '10px 0', textAlign: 'center' }}>OPD Table</h3>
      <AgGridReact
        theme={myTheme}
        className="ag-theme-quartz"
        columnDefs={columnDefs}
        rowData={rowData}
        pagination
        domLayout="autoHeight"
        defaultColDef={{ 
          resizable: true, 
          sortable: true, 
          filter: true, 
          flex: 1, 
          minWidth: 120 
        }}
        suppressMovableColumns
      />
    </div>
  );
};

export default MyAgGrid;
