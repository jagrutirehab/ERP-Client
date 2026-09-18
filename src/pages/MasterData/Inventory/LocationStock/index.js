import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Input } from "reactstrap";
import { toast } from "react-toastify";
import { getLocationStock } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const LocationStock = () => {
  const handleAuthError = useAuthError();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    getLocationStock()
      .then((res) => setRows(res?.data || []))
      .catch((error) => {
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load.");
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = rows.filter(
    (r) =>
      r.itemName.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { name: "Item", selector: (row) => row.itemName, sortable: true },
    {
      name: "Location",
      cell: (row) => (
        <span className="uom-cell-primary">
          {row.location?.name} ({row.location?.code})
        </span>
      ),
    },
    {
      name: "Center",
      cell: (row) => <span className="uom-cell-muted">{row.location?.centerId?.title || "—"}</span>,
    },
    { name: "Quantity Here", cell: (row) => <span className="fw-semibold">{row.quantity}</span> },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Stock by Location</h4>
          <p>Where each item physically is, room-by-room / rack-by-rack</p>
        </div>
      </div>

      <div className="uom-search-wrap mb-3">
        <i className="bx bx-search"></i>
        <Input
          placeholder="Search item or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={filtered}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={<div className="uom-empty-state">No location stock yet — do a Putaway first.</div>}
        />
      </div>
    </div>
  );
};

export default LocationStock;