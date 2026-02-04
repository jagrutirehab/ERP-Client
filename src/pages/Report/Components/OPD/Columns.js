import { differenceInMinutes, endOfDay, format, startOfDay } from "date-fns";
 
 export const columns = [
    {
      name: "#",
      selector: (row, idx) => idx + 1,
    },
    {
      name: <div>Patient Name</div>,
      selector: (row) => row.patient?.name,
      wrap: true,
      minWidth: "120px"
    },
    {
      name: <div>UID</div>,
      selector: (row) => `${row.patient?.id?.prefix}${row.patient?.id?.value}`,
      wrap: true
    },
    {
      name: <div>Doctor</div>,
      selector: (row) => row.doctor?.name,
      wrap: true,
      minWidth: "120px"
    },
    {
      name: <div>Date</div>,
      selector: (row) =>
        `On ${format(new Date(row.startDate), "dd MMM yyyy")} at \n ${format(
          new Date(row.startDate),
          "hh:mm a"
        )} for ${differenceInMinutes(
          new Date(row?.endDate),
          new Date(row?.startDate)
        )} mins`,
      wrap: true,
      minWidth: "120px"
    },
    {
      name: <div>Center</div>,
      selector: (row) => row.center?.title,
      wrap: true
    },
    {
      name: <div>Appointment Type</div>,
      selector: (row) => row.consultationType,
      wrap: true
    },
    // {
    //   name: <div>Patient Phone Number</div>,
    //   selector: (row) => row.patient?.phoneNumber,
    //   wrap: true,
    //   minWidth: "125px"
    // },
    {
      name: <div>No Show</div>,
      selector: (row) => row?.isCancelled ? "Yes" : "No",

    },
    {
      name: <div>Prescribed</div>,
      selector: (row) => (row?.chart?.chart === "PRESCRIPTION" ? "Yes" : "No"),
    },
    {
      name: <div>Clinical Note</div>,
      selector: (row) => (row?.chart?.chart === "CLINICAL_NOTE" ? "Yes" : "No"),
    },
    {
      name: <div>OPD Charges</div>,
      selector: (row) => row?.calculatedOpdCharges || 0,
      wrap: true
    },
    {
      name: <div>Paid Amount</div>,
      selector: (row) => row.bill?.receiptInvoice?.payable || 0,
      wrap: true
    },
    {
      name: <div>Payment Mode</div>,
      selector: (row) =>
        row.bill?.receiptInvoice?.paymentModes
          ?.map(
            (pm) =>
              `${pm.amount} - ${pm.type} ${pm.transactionId || ""} ${pm.bank || ""
              } ${pm.chequeNumber || ""} ${pm.cardNumber || ""}`
          )
          .join(", ") || "--",
      wrap: true,
    },
    // {
    //   name: "#",
    //   selector: (row) => row.,
    // },
    // {
    //   name: "#",
    //   selector: (row) => row.,
    // },
  ];