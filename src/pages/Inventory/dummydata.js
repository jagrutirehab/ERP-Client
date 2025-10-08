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
