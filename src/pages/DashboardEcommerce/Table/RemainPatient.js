

import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, themeQuartz } from 'ag-grid-community';
import { useQuery } from '@apollo/client';
import { GET_REMAIN_PATIENT } from '../../../GraphQL/graphQl-Query/financeQueries';

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
  const { data, loading, error } = useQuery(GET_REMAIN_PATIENT);
  const [columnDefs, setColumnDefs] = useState([]);
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    console.log(data, " data")
    if (!data?.remainPatientData?.length) return;
  
    const monthYearSet = new Set();
    const allRows = [];
  
    data.remainPatientData.forEach(({ centerName, records }) => {
      const row = { centerName };
  
      records.forEach(({ month, year, totalRemains }) => {
        console.log(month,"month")
        if (month && year) {
          const key = `${month}-${year}`;
          monthYearSet.add(key);
          row[key] = totalRemains;
        }
      });
  
      allRows.push(row);
    });
    const monthIndex = {
      Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
      Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
    };
    
    const sortedMonthYears = Array.from(monthYearSet).sort((a, b) => {
      const [monthB, yearB] = b.split('-');
      const [monthA, yearA] = a.split('-');
      const yDiff = Number(yearB) - Number(yearA);
      if (yDiff !== 0) return yDiff;
      return monthIndex[monthB] - monthIndex[monthA];
    });
  
    const dynamicMonthColumns = sortedMonthYears.map(key => ({
      headerName: key,
      field: key,
      valueFormatter: ({ value }) => (value != null ? value.toLocaleString() : '0'),
      cellStyle: { textAlign: 'center' }
    }));

  
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
       <h3 className="ag-theme-quartz" style={{ margin: '10px 0', textAlign: 'center' }}>Remaining Patient Table</h3>
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
