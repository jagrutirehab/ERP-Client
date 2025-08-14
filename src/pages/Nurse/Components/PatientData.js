export const patients = [
  {
    id: "67cab6cca40ffe635ecf89b0",
    name: "Alice Smith",
    room: "301",
    bed: "A",
    status: "Urgent", // 'Urgent', 'Attention', 'Stable'
    vitals: { hr: 98, bp: "130/85", temp: "100.2°F" },
    nextAction: "STAT Meds (Insulin) @ 1:30 PM",
    alerts: ["test alert 1", "test alert 2"],
    notes: ["test note 1"],
    details: {
      summary:
        "55 y/o female, admitted for pneumonia. Allergic to Penicillin. Currently experiencing fever and shortness of breath. Requires close monitoring.",
      medications: [
        {
          name: "Insulin",
          dosage: "10 units",
          route: "SC",
          schedule: "QID",
          due: "1:30 PM",
          status: "Due Soon",
        },
        {
          name: "Amoxicillin",
          dosage: "500mg",
          route: "PO",
          schedule: "TID",
          due: "2:00 PM",
          status: "Scheduled",
        },
        {
          name: "Paracetamol",
          dosage: "650mg",
          route: "PO",
          schedule: "PRN",
          lastAdmin: "11:00 AM",
          status: "PRN",
        },
      ],
      orders: [
        { description: "STAT Insulin", status: "New", type: "Medication" },
        { description: "Chest X-Ray", status: "Outstanding", type: "Imaging" },
        { description: "Sputum Culture", status: "Outstanding", type: "Lab" },
      ],
      assessments:
        "Last Pain Assessment: 12:00 PM (Pain 6/10). Respiratory Assessment: Crackles in lower lobes. Skin: Intact.",
      io: "Last I/O: 11:30 AM (Intake: 500ml, Output: 200ml). Total 24hr Intake: 1500ml, Output: 800ml.",
      labs: "New CBC results available (Critical WBC: 18.5). Electrolytes within normal limits. Blood Culture pending.",
      carePlan:
        "Focus on respiratory support, pain management, and infection control. Administer antibiotics as ordered. Encourage deep breathing exercises.",
      history:
        "Past Medical History: Diabetes, Hypertension. Surgical History: Cholecystectomy (2010). Social History: Non-smoker, occasional alcohol.",
    },
  },
  {
    id: "P002",
    name: "Bob Johnson",
    room: "302",
    bed: "B",
    status: "Attention",
    vitals: { hr: 72, bp: "118/75", temp: "98.0°F" },
    nextAction: "Oral Meds (Lisinopril) @ 2:00 PM",
    alerts: ["test alert 1", "test alert 1"],
    notes: ["test note 1"],
    details: {
      summary:
        "70 y/o male, admitted for cardiac evaluation. No known allergies. Complains of occasional chest discomfort.",
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          route: "PO",
          schedule: "QD",
          due: "2:00 PM",
          status: "Due Soon",
        },
        {
          name: "Aspirin",
          dosage: "81mg",
          route: "PO",
          schedule: "QD",
          due: "8:00 AM",
          status: "Administered",
        },
      ],
      orders: [
        { description: "ECG", status: "Outstanding", type: "Diagnostic" },
        { description: "Troponin Levels", status: "New", type: "Lab" },
      ],
      assessments:
        "Last Cardiac Assessment: 10:00 AM (Stable rhythm, no edema). Pain: 0/10.",
      io: "Last I/O: 10:00 AM (Intake: 800ml, Output: 600ml). Total 24hr Intake: 2000ml, Output: 1500ml.",
      labs: "No new lab results. Previous Cholesterol: High.",
      carePlan:
        "Monitor cardiac rhythm and fluid balance. Educate on heart-healthy diet. Encourage light ambulation.",
      history:
        "Past Medical History: CAD, Hyperlipidemia. Family History: Father had MI at 60. Social History: Former smoker (quit 10 years ago).",
    },
  },
  {
    id: "P003",
    name: "Carol White",
    room: "303",
    bed: "C",
    status: "Stable",
    vitals: { hr: 68, bp: "125/80", temp: "98.4°F" },
    nextAction: "Wound Dressing Change @ 3:00 PM",
    alerts: [],
    notes: [],
    details: {
      summary:
        "40 y/o female, post-op appendectomy. Day 2 post-op. No known allergies. Ambulating well.",
      medications: [
        {
          name: "Oxycodone",
          dosage: "5mg",
          route: "PO",
          schedule: "PRN",
          lastAdmin: "10:30 AM",
          status: "PRN",
        },
        {
          name: "Docusate",
          dosage: "100mg",
          route: "PO",
          schedule: "BID",
          due: "6:00 PM",
          status: "Scheduled",
        },
      ],
      orders: [
        { description: "Wound Care", status: "Outstanding", type: "Nursing" },
        {
          description: "Advance Diet as Tolerated",
          status: "New",
          type: "Dietary",
        },
      ],
      assessments:
        "Last Surgical Site Assessment: 11:00 AM (Clean, Dry, Intact, no redness). Pain: 2/10 with meds.",
      io: "Last I/O: 12:00 PM (Intake: 600ml, Output: 400ml). Total 24hr Intake: 1800ml, Output: 1200ml.",
      labs: "No new lab results. WBC trending down.",
      carePlan:
        "Pain management and wound care. Encourage ambulation. Monitor for signs of infection.",
      history:
        "Past Medical History: None significant. Surgical History: Appendectomy (yesterday).",
    },
  },
  {
    id: "P004",
    name: "David Green",
    room: "304",
    bed: "D",
    status: "Urgent",
    vitals: { hr: 110, bp: "90/60", temp: "101.5°F" },
    nextAction: "Fluid Bolus (NS) @ 1:45 PM",
    alerts: ["test alert 1", "test alert 1", "test alert 1"],
    notes: [],
    details: {
      summary:
        "60 y/o male, admitted for severe dehydration and fever. Allergic to Sulfa drugs. Lethargic.",
      medications: [
        {
          name: "Normal Saline",
          dosage: "500ml",
          route: "IV",
          schedule: "STAT",
          due: "1:45 PM",
          status: "Due Soon",
        },
        {
          name: "Acetaminophen",
          dosage: "650mg",
          route: "PO",
          schedule: "PRN",
          lastAdmin: "12:00 PM",
          status: "PRN",
        },
      ],
      orders: [
        { description: "STAT Fluid Bolus", status: "New", type: "Medication" },
        {
          description: "Repeat Electrolytes",
          status: "Outstanding",
          type: "Lab",
        },
        { description: "Urine Culture", status: "New", type: "Lab" },
      ],
      assessments:
        "Last Hydration Assessment: 1:00 PM (Poor skin turgor, dry mucous membranes). Mental Status: Drowsy.",
      io: "Last I/O: 12:30 PM (Intake: 100ml, Output: 50ml). Total 24hr Intake: 500ml, Output: 300ml.",
      labs: "Electrolytes pending. Previous BUN/Creatinine elevated.",
      carePlan:
        "Aggressive rehydration and electrolyte monitoring. Monitor urine output closely. Fever management.",
      history:
        "Past Medical History: Kidney Stones, Recurrent UTIs. Social History: Lives alone.",
    },
  },
  {
    id: "P005",
    name: "Eve Brown",
    room: "305",
    bed: "E",
    status: "Attention",
    vitals: { hr: 80, bp: "140/90", temp: "98.8°F" },
    nextAction: "Blood Glucose Check @ 2:30 PM",
    alerts: ["test alert 1"],
    notes: ["test note 1"],
    details: {
      summary:
        "65 y/o female, admitted for uncontrolled hypertension. Diabetic. Complains of dizziness.",
      medications: [
        {
          name: "Metformin",
          dosage: "500mg",
          route: "PO",
          schedule: "BID",
          due: "2:30 PM",
          status: "Due Soon",
        },
        {
          name: "Amlodipine",
          dosage: "5mg",
          route: "PO",
          schedule: "QD",
          due: "9:00 AM",
          status: "Administered",
        },
      ],
      orders: [
        {
          description: "Blood Glucose Monitoring",
          status: "Outstanding",
          type: "Diagnostic",
        },
        {
          description: "Dietary Consult for Diabetic Diet",
          status: "New",
          type: "Consult",
        },
      ],
      assessments:
        "Last BP Check: 1:00 PM (145/95). Glucose: 220 mg/dL. Neurological: Alert and oriented, no focal deficits.",
      io: "Last I/O: 12:00 PM (Intake: 400ml, Output: 300ml). Total 24hr Intake: 1600ml, Output: 1000ml.",
      labs: "Recent A1C: 8.5%. Fasting Glucose: 250 mg/dL.",
      carePlan:
        "Blood pressure and glucose management. Patient education on medication adherence and diet. Fall precautions.",
      history:
        "Past Medical History: Hypertension, Type 2 Diabetes. Family History: Mother had diabetes. Social History: Lives with spouse.",
    },
  },
  {
    id: "P005",
    name: "Eve Brown",
    room: "305",
    bed: "E",
    status: "Attention",
    vitals: { hr: 80, bp: "140/90", temp: "98.8°F" },
    nextAction: "Blood Glucose Check @ 2:30 PM",
    alerts: ["test alert 1"],
    notes: ["test note 1"],
    details: {
      summary:
        "65 y/o female, admitted for uncontrolled hypertension. Diabetic. Complains of dizziness.",
      medications: [
        {
          name: "Metformin",
          dosage: "500mg",
          route: "PO",
          schedule: "BID",
          due: "2:30 PM",
          status: "Due Soon",
        },
        {
          name: "Amlodipine",
          dosage: "5mg",
          route: "PO",
          schedule: "QD",
          due: "9:00 AM",
          status: "Administered",
        },
      ],
      orders: [
        {
          description: "Blood Glucose Monitoring",
          status: "Outstanding",
          type: "Diagnostic",
        },
        {
          description: "Dietary Consult for Diabetic Diet",
          status: "New",
          type: "Consult",
        },
      ],
      assessments:
        "Last BP Check: 1:00 PM (145/95). Glucose: 220 mg/dL. Neurological: Alert and oriented, no focal deficits.",
      io: "Last I/O: 12:00 PM (Intake: 400ml, Output: 300ml). Total 24hr Intake: 1600ml, Output: 1000ml.",
      labs: "Recent A1C: 8.5%. Fasting Glucose: 250 mg/dL.",
      carePlan:
        "Blood pressure and glucose management. Patient education on medication adherence and diet. Fall precautions.",
      history:
        "Past Medical History: Hypertension, Type 2 Diabetes. Family History: Mother had diabetes. Social History: Lives with spouse.",
    },
  },
  {
    id: "P005",
    name: "Eve Brown",
    room: "305",
    bed: "E",
    status: "Attention",
    vitals: { hr: 80, bp: "140/90", temp: "98.8°F" },
    nextAction: "Blood Glucose Check @ 2:30 PM",
    alerts: ["test alert 1"],
    notes: ["test note 1"],
    details: {
      summary:
        "65 y/o female, admitted for uncontrolled hypertension. Diabetic. Complains of dizziness.",
      medications: [
        {
          name: "Metformin",
          dosage: "500mg",
          route: "PO",
          schedule: "BID",
          due: "2:30 PM",
          status: "Due Soon",
        },
        {
          name: "Amlodipine",
          dosage: "5mg",
          route: "PO",
          schedule: "QD",
          due: "9:00 AM",
          status: "Administered",
        },
      ],
      orders: [
        {
          description: "Blood Glucose Monitoring",
          status: "Outstanding",
          type: "Diagnostic",
        },
        {
          description: "Dietary Consult for Diabetic Diet",
          status: "New",
          type: "Consult",
        },
      ],
      assessments:
        "Last BP Check: 1:00 PM (145/95). Glucose: 220 mg/dL. Neurological: Alert and oriented, no focal deficits.",
      io: "Last I/O: 12:00 PM (Intake: 400ml, Output: 300ml). Total 24hr Intake: 1600ml, Output: 1000ml.",
      labs: "Recent A1C: 8.5%. Fasting Glucose: 250 mg/dL.",
      carePlan:
        "Blood pressure and glucose management. Patient education on medication adherence and diet. Fall precautions.",
      history:
        "Past Medical History: Hypertension, Type 2 Diabetes. Family History: Mother had diabetes. Social History: Lives with spouse.",
    },
  },
  {
    id: "P005",
    name: "Eve Brown",
    room: "305",
    bed: "E",
    status: "Attention",
    vitals: { hr: 80, bp: "140/90", temp: "98.8°F" },
    nextAction: "Blood Glucose Check @ 2:30 PM",
    alerts: ["test alert 1"],
    notes: ["test note 1"],
    details: {
      summary:
        "65 y/o female, admitted for uncontrolled hypertension. Diabetic. Complains of dizziness.",
      medications: [
        {
          name: "Metformin",
          dosage: "500mg",
          route: "PO",
          schedule: "BID",
          due: "2:30 PM",
          status: "Due Soon",
        },
        {
          name: "Amlodipine",
          dosage: "5mg",
          route: "PO",
          schedule: "QD",
          due: "9:00 AM",
          status: "Administered",
        },
      ],
      orders: [
        {
          description: "Blood Glucose Monitoring",
          status: "Outstanding",
          type: "Diagnostic",
        },
        {
          description: "Dietary Consult for Diabetic Diet",
          status: "New",
          type: "Consult",
        },
      ],
      assessments:
        "Last BP Check: 1:00 PM (145/95). Glucose: 220 mg/dL. Neurological: Alert and oriented, no focal deficits.",
      io: "Last I/O: 12:00 PM (Intake: 400ml, Output: 300ml). Total 24hr Intake: 1600ml, Output: 1000ml.",
      labs: "Recent A1C: 8.5%. Fasting Glucose: 250 mg/dL.",
      carePlan:
        "Blood pressure and glucose management. Patient education on medication adherence and diet. Fall precautions.",
      history:
        "Past Medical History: Hypertension, Type 2 Diabetes. Family History: Mother had diabetes. Social History: Lives with spouse.",
    },
  },
  {
    id: "P005",
    name: "Eve Brown",
    room: "305",
    bed: "E",
    status: "Attention",
    vitals: { hr: 80, bp: "140/90", temp: "98.8°F" },
    nextAction: "Blood Glucose Check @ 2:30 PM",
    alerts: ["test alert 1"],
    notes: ["test note 1"],
    details: {
      summary:
        "65 y/o female, admitted for uncontrolled hypertension. Diabetic. Complains of dizziness.",
      medications: [
        {
          name: "Metformin",
          dosage: "500mg",
          route: "PO",
          schedule: "BID",
          due: "2:30 PM",
          status: "Due Soon",
        },
        {
          name: "Amlodipine",
          dosage: "5mg",
          route: "PO",
          schedule: "QD",
          due: "9:00 AM",
          status: "Administered",
        },
      ],
      orders: [
        {
          description: "Blood Glucose Monitoring",
          status: "Outstanding",
          type: "Diagnostic",
        },
        {
          description: "Dietary Consult for Diabetic Diet",
          status: "New",
          type: "Consult",
        },
      ],
      assessments:
        "Last BP Check: 1:00 PM (145/95). Glucose: 220 mg/dL. Neurological: Alert and oriented, no focal deficits.",
      io: "Last I/O: 12:00 PM (Intake: 400ml, Output: 300ml). Total 24hr Intake: 1600ml, Output: 1000ml.",
      labs: "Recent A1C: 8.5%. Fasting Glucose: 250 mg/dL.",
      carePlan:
        "Blood pressure and glucose management. Patient education on medication adherence and diet. Fall precautions.",
      history:
        "Past Medical History: Hypertension, Type 2 Diabetes. Family History: Mother had diabetes. Social History: Lives with spouse.",
    },
  },
  {
    id: "P005",
    name: "Eve Brown",
    room: "305",
    bed: "E",
    status: "Attention",
    vitals: { hr: 80, bp: "140/90", temp: "98.8°F" },
    nextAction: "Blood Glucose Check @ 2:30 PM",
    alerts: ["test alert 1"],
    notes: ["test note 1"],
    details: {
      summary:
        "65 y/o female, admitted for uncontrolled hypertension. Diabetic. Complains of dizziness.",
      medications: [
        {
          name: "Metformin",
          dosage: "500mg",
          route: "PO",
          schedule: "BID",
          due: "2:30 PM",
          status: "Due Soon",
        },
        {
          name: "Amlodipine",
          dosage: "5mg",
          route: "PO",
          schedule: "QD",
          due: "9:00 AM",
          status: "Administered",
        },
      ],
      orders: [
        {
          description: "Blood Glucose Monitoring",
          status: "Outstanding",
          type: "Diagnostic",
        },
        {
          description: "Dietary Consult for Diabetic Diet",
          status: "New",
          type: "Consult",
        },
      ],
      assessments:
        "Last BP Check: 1:00 PM (145/95). Glucose: 220 mg/dL. Neurological: Alert and oriented, no focal deficits.",
      io: "Last I/O: 12:00 PM (Intake: 400ml, Output: 300ml). Total 24hr Intake: 1600ml, Output: 1000ml.",
      labs: "Recent A1C: 8.5%. Fasting Glucose: 250 mg/dL.",
      carePlan:
        "Blood pressure and glucose management. Patient education on medication adherence and diet. Fall precautions.",
      history:
        "Past Medical History: Hypertension, Type 2 Diabetes. Family History: Mother had diabetes. Social History: Lives with spouse.",
    },
  },
  {
    id: "P005",
    name: "Eve Brown",
    room: "305",
    bed: "E",
    status: "Attention",
    vitals: { hr: 80, bp: "140/90", temp: "98.8°F" },
    nextAction: "Blood Glucose Check @ 2:30 PM",
    alerts: ["test alert 1"],
    notes: ["test note 1"],
    details: {
      summary:
        "65 y/o female, admitted for uncontrolled hypertension. Diabetic. Complains of dizziness.",
      medications: [
        {
          name: "Metformin",
          dosage: "500mg",
          route: "PO",
          schedule: "BID",
          due: "2:30 PM",
          status: "Due Soon",
        },
        {
          name: "Amlodipine",
          dosage: "5mg",
          route: "PO",
          schedule: "QD",
          due: "9:00 AM",
          status: "Administered",
        },
      ],
      orders: [
        {
          description: "Blood Glucose Monitoring",
          status: "Outstanding",
          type: "Diagnostic",
        },
        {
          description: "Dietary Consult for Diabetic Diet",
          status: "New",
          type: "Consult",
        },
      ],
      assessments:
        "Last BP Check: 1:00 PM (145/95). Glucose: 220 mg/dL. Neurological: Alert and oriented, no focal deficits.",
      io: "Last I/O: 12:00 PM (Intake: 400ml, Output: 300ml). Total 24hr Intake: 1600ml, Output: 1000ml.",
      labs: "Recent A1C: 8.5%. Fasting Glucose: 250 mg/dL.",
      carePlan:
        "Blood pressure and glucose management. Patient education on medication adherence and diet. Fall precautions.",
      history:
        "Past Medical History: Hypertension, Type 2 Diabetes. Family History: Mother had diabetes. Social History: Lives with spouse.",
    },
  },
];
