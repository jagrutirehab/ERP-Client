import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  PaginationModule,
  themeQuartz,
} from "ag-grid-community";
import "bootstrap/dist/css/bootstrap.min.css";

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

const MonthTillDate = ({ centerId, data }) => {
  const { columnDefs, rowData } = useMemo(() => {
    if (!data) return { columnDefs: [], rowData: [] };
    const tagSource = (records, source) => {
      if (!records || !Array.isArray(records)) {
        return [];
      }

      return records.map((section) => {
        if (!section) return null;
        return {
          ...section,
          records: section?.records?.map((r) => ({ ...r, source })) || [],
        };
      });
    };
    const allSections = [
      ...tagSource(data?.opdData ? [data.opdData] : [], "opd"),
      ...tagSource(data?.admitData ? [data.admitData] : [], "admit"),
      ...tagSource(
        data?.dischargeData ? [data.dischargeData] : [],
        "discharge"
      ),
      ...tagSource(
        data?.advanceAndInvoiceAmount ? [data.advanceAndInvoiceAmount] : [],
        "invoice"
      ),
      ...tagSource(data?.occupancy ? [data.occupancy] : [], "occupancy"),
      ...tagSource(data?.remainPatient ? [data.remainPatient] : [], "remain"),
      ...tagSource(
        data?.invoicedAppointments ? [data.invoicedAppointments] : [],
        "totalAppointments"
      ),
      ...tagSource(
        data?.appointments ? [data.appointments] : [],
        "appointmentsData"
      ),
      ...tagSource(data?.deposit ? [data.deposit] : [], "deposit"),
    ];

    const allRecords = allSections.flatMap((section) => section.records);

    const recordMap = {};

    allRecords.forEach((record) => {
      const year = record?.year ? parseInt(record.year) : 0;
      const month = record?.month
        ? isNaN(record.month)
          ? new Date(`${record.month} 1, ${year}`).getMonth() + 1
          : parseInt(record.month)
        : 0;
      const key = `${year}-${month}`;

      if (!recordMap[key]) {
        recordMap[key] = { year, month };
      }
      if (record && typeof record === "object") {
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
            if (!recordMap[key][k]) {
              recordMap[key][k] = v;
            }
          }
        });
      }
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

    const monthColumns = months.map((m) => ({
      headerName: `${monthNames[m.month]} ${m.year}`,
      field: `${monthNames[m.month]} ${m.year}`,
      filter: "agNumberColumnFilter",
      sortable: true,
    }));

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
  return (
    <div className="ag-theme-quartz">
      <h1 style={{ textAlign: "center" }}>Month Till Date Table</h1>
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

export default MonthTillDate;
