/* eslint-disable no-lone-blocks */
export const medicines = [
  {
    name: "Paracetamol",
    generic: "Acetaminophen",
    category: "Analgesics",
    form: "Tablet",
    strength: "500mg",
    stock: 2500,
    reorder: 500,
    expiry: "Dec 31, 2025",
    batch: "PCM-2024-001",
    supplier: "MedSupply Co",
    status: "NORMAL",
  },
  {
    name: "Amoxicillin",
    generic: "Amoxicillin",
    category: "Antibiotics",
    form: "Capsule",
    strength: "250mg",
    stock: 150,
    reorder: 200,
    expiry: "Aug 15, 2025",
    batch: "AMX-2024-002",
    supplier: "PharmaDist Inc",
    status: "LOW",
  },
  {
    name: "Insulin",
    generic: "Human Insulin",
    category: "Diabetes Medications",
    form: "Injectable",
    strength: "100IU/ml",
    stock: 75,
    reorder: 100,
    expiry: "Jun 30, 2025",
    batch: "INS-2024-003",
    supplier: "SpecialtyCare Ltd",
    status: "LOW",
  },
  {
    name: "Lisinopril",
    generic: "Lisinopril",
    category: "ACE Inhibitors",
    form: "Tablet",
    strength: "10mg",
    stock: 800,
    reorder: 300,
    expiry: "Mar 20, 2026",
    batch: "LIS-2024-004",
    supplier: "MedSupply Co",
    status: "NORMAL",
  },
];

{
  /* Cards View */
}
{
  /* {view === "cards" && (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4" style={{maxHeight: "55vh", overflow:"auto"}}>
            {(medicines || []).map((med) => (
              <div className="col" key={med._id}>
                <Card>
                  <CardContent>
                    <h2 className="h5 font-weight-bold text-primary">
                      {display(med.medicineName)}
                    </h2>
                    <p className="text-muted small">
                      {display(med.generic)} • {display(med.category)}
                    </p>
                    <p className="small">
                      Strength: {display(med.Strength || med.strength)} • Unit:{" "}
                      {display(med.unitType || med.unit)}
                    </p>
                    <p className="small">
                      Stock: {display(med.stock)} (Reorder:{" "}
                      {display(med.reorder)})
                    </p>
                    <p className="small">Expiry: {display(med.Expiry)}</p>
                    <p className="small">Batch: {display(med.Batch)}</p>
                    <p className="small">Supplier: {display(med.supplier)}</p>
                    <StatusBadge status={med.Status} />
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(med)}
                      >
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Adjust
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )} */
}

{
  /* <Button
                        variant={view === "cards" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setView("cards")}
                      >
                        <LayoutGrid className="h-5 w-5" />
                      </Button> */
}


export const ipdPatients = [
  {
    id: "UID12452",
    name: "Aarav Sharma",
    createdAt: "10:15 AM",
    prescription: {
      drNotes: "",
      diagnosis: "",
      medicines: [
        {
          medicine: {
            name: "TEST MEDICINE 72727",
            type: "DROP",
            strength: "12.5",
            unit: "MG",
          },
          totalCount: 2,
          dosageAndFrequency: {
            morning: "1",
            evening: "0",
            night: "1",
          },
          instructions: "",
          intake: "After food",
          duration: "30",
          unit: "Day(s)",
        },
      ],
      notes: "",
      investigationPlan: "",
      observation: "",
    },
    center: {
      title: "Aroha"
    },
    doctorName: "Dr. Bharat Mali",
    psychologistName: "Pratik Kadlag",
    prescriptionStartDate: "2025-10-14T12:30:03.307Z",
    prescriptionEndDate: "2025-11-13T12:30:03.307Z",
    deleted: false,
  },
  {
    id: "UID13132",
    name: "Priya Singh",
    createdAt: "11:40 AM",
    prescription: {
      drNotes:
        "Stubborn, violent behaviour, suicidal threat, sudden impulses, demanding behaviour, suicidal attempts, wandering away,",
      diagnosis: "Acute and Transient Psychotic Disorder",
      medicines: [
        {
          _id: "68ff686867753f27e97fab68",
          medicine: {
            name: "DOLO",
            type: "TAB",
            strength: "650",
            unit: "MG",
          },
          totalCount: 2,
          dosageAndFrequency: {
            morning: "1",
            evening: "0",
            night: "1",
          },
          instructions: "",
          intake: "After food",
          duration: "30",
          unit: "Day(s)",
        },
        {
          _id: "68ff677967753f27e97fa912",
          medicine: {
            name: "URETHRAL CATHATER",
            type: "SURGICAL",
            strength: "",
            unit: "NOS",
          },
          totalCount: 2,
          dosageAndFrequency: {
            morning: "1",
            evening: "0",
            night: "1",
          },
          instructions: "",
          intake: "After food",
          duration: "30",
          unit: "Day(s)",
        },
        {
          _id: "68ee404136e137c703a6cd3a",
          medicine: {
            name: "PARI CR PLUS",
            type: "TAB",
            strength: "",
            unit: "MG",
          },
          totalCount: 2,
          dosageAndFrequency: {
            morning: "1",
            evening: "0",
            night: "1",
          },
          instructions: "",
          intake: "After food",
          duration: "30",
          unit: "Day(s)",
        },
      ],
      notes: "Suspicious that maternal uncle will harm him or father",
      investigationPlan: "",

      deleted: false,
      __v: 0,
    },
    doctorName: "Dr. Bharat Mali",
    psychologistName: "Pratik Kadlag",
    center: {
      title: "Taloja"
    },
    prescriptionStartDate: "2025-10-14T12:30:03.307Z",
    prescriptionEndDate: "2025-11-13T12:30:03.307Z",
    deleted: false,
  },
];


export const opdPatients = [
  {
    id: 1,
    name: "Aarav Sharma",
    createdAt: "10:15 AM",
    prescription: {
      _id: "68ee424b94bc1566d65a45de",
      drNotes: "",
      diagnosis: "",
      medicines: [
        {
          _id: "68ee424b94bc1566d65a45df",
          medicine: {
            name: "TEST MEDICINE 72727",
            type: "DROP",
            strength: "12.5",
            unit: "MG",
          },
          dosageAndFrequency: {
            morning: "1",
            evening: "0",
            night: "1",
          },
          instructions: "",
          intake: "After food",
          duration: "30",
          unit: "Day(s)",
        },
      ],
      notes: "",
      investigationPlan: "",
      observation: "",
    },
    center: {
      title: "Aroha"
    },
    doctorName: "Dr. Bharat Mali",
    psychologistName: "Pratik Kadlag",
    prescriptionStartDate: "2025-10-14T12:30:03.307Z",
    prescriptionEndDate: "2025-11-13T12:30:03.307Z",
    deleted: false,
  },
  {
    id: 2,
    name: "Priya Singh",
    createdAt: "11:40 AM",
    prescription: {
      _id: "68ff677967753f27e97fa911",
      center: "651f8abfed3d16334ae5a908",
      patient: "67ea4b165e3a655806ff52b8",
      drNotes:
        "Stubborn, violent behaviour, suicidal threat, sudden impulses, demanding behaviour, suicidal attempts, wandering away,",
      diagnosis: "Acute and Transient Psychotic Disorder",
      medicines: [
        {
          _id: "68ff686867753f27e97fab68",
          medicine: {
            name: "DOLO",
            type: "TAB",
            strength: "650",
            unit: "MG",
          },
          dosageAndFrequency: {
            morning: "1",
            evening: "0",
            night: "1",
          },
          instructions: "",
          intake: "After food",
          duration: "30",
          unit: "Day(s)",
        },
        {
          _id: "68ff677967753f27e97fa912",
          medicine: {
            name: "URETHRAL CATHATER",
            type: "SURGICAL",
            strength: "",
            unit: "NOS",
          },
          dosageAndFrequency: {
            morning: "1",
            evening: "0",
            night: "1",
          },
          instructions: "",
          intake: "After food",
          duration: "30",
          unit: "Day(s)",
        },
        {
          _id: "68ee404136e137c703a6cd3a",
          medicine: {
            name: "PARI CR PLUS",
            type: "TAB",
            strength: "",
            unit: "MG",
          },
          dosageAndFrequency: {
            morning: "1",
            evening: "0",
            night: "1",
          },
          instructions: "",
          intake: "After food",
          duration: "30",
          unit: "Day(s)",
        },
      ],
      notes: "Suspicious that maternal uncle will harm him or father",
      investigationPlan: "",

      deleted: false,
      __v: 0,
    },
    doctorName: "Dr. Bharat Mali",
    psychologistName: "Pratik Kadlag",
    center: {
      title: "Taloja"
    },
    prescriptionStartDate: "2025-10-14T12:30:03.307Z",
    prescriptionEndDate: "2025-11-13T12:30:03.307Z",
    deleted: false,
  },
];

export const historyData = [
  {

    patient: {
      name: "Test Name",
      uid: "UID12547"
    },
    prescriptionDate: "2025-10-14T12:30:03.307Z",
    approvalDate: "2025-10-15T10:12:45.100Z",
    medicines: [
      { name: "TAB DOLO 650 MG", totalCount: 10 },
      { name: "SURGICAL URETHRAL CATHATER NOS", totalCount: 5 },
      { name: "TAB PARI CR PLUS MG", totalCount: 1 },
    ],
    status: "Approved",
  },
  {
    patient: {
      name: "Riya Patel",
      uid: "UID78569"
    },
    prescriptionDate: "2025-10-12T09:15:00.000Z",
    approvalDate: "2025-10-13T14:45:00.000Z",
    medicines: [
      { name: "TAB Q2 TAB MG", totalCount: 8 },
      { name: "TAB VENTAB PLUS 10 MG", totalCount: 2 },
    ],
    status: "Rejected",
  },
];


export const audits = [
  {
    id: 1,
    center: "Taloja-OPD",
    date: "2025-10-20",
    createdBy: "Navis",
  },
  {
    id: 2,
    center: "Pune HWH",
    date: "2025-10-21",
    createdBy: "Pratyush",
  },
  {
    id: 3,
    center: "Nerul",
    date: "2025-10-22",
    createdBy: "Amit",
  },
];