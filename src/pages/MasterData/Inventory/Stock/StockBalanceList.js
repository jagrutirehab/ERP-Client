import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import { getStockBalances, getStockLedger } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleString("en-IN") : "—");

const tableCustomStyles = {
  headRow: {
    style: { backgroundColor: "#fff", borderBottom: "1px solid #edeff3", minHeight: "44px" },
  },
  headCells: { style: { fontSize: "13px", fontWeight: 600, color: "#475569" } },
  rows: {
    style: {
      minHeight: "56px",
      fontSize: "14px",
      color: "#101828",
      "&:not(:last-of-type)": { borderBottomColor: "#edeff3" },
    },
    highlightOnHoverStyle: {
      backgroundColor: "#fafbfc",
      borderBottomColor: "#edeff3",
      outline: "none",
    },
  },
  pagination: { style: { borderTopColor: "#edeff3", fontSize: "13px", color: "#667085" } },
};

const StockBalanceList = () => {
  const handleAuthError = useAuthError();

  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [ledgerModal, setLedgerModal] = useState(null);
  const [ledgerRows, setLedgerRows] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchBalances = async () => {
      setLoading(true);
      try {
        const res = await getStockBalances({ search });
        if (cancelled) return;
        setBalances(res?.data || []);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load stock.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBalances();
    return () => {
      cancelled = true;
    };
  }, [search, refreshFlag]);

  const openLedger = async (row) => {
    setLedgerModal(row);
    setLedgerLoading(true);
    try {
      const res = await getStockLedger({
        itemName: row.itemName,
        centerId: row.centerId?._id || row.centerId,
      });
      setLedgerRows(res?.data || []);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't load ledger.");
      }
    } finally {
      setLedgerLoading(false);
    }
  };

  const columns = [
    { name: "Item", selector: (row) => row.itemName, sortable: true },
    {
      name: "Center",
      cell: (row) => <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>,
    },
    {
      name: "Current Stock",
      cell: (row) => <span className="uom-cell-primary">{row.quantity}</span>,
    },
    {
      name: "Actions",
      width: "120px",
      right: true,
      cell: (row) => (
        <Button size="sm" color="light" onClick={() => openLedger(row)}>
          History
        </Button>
      ),
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Inventory / Stock Management</h4>
          <p>Current stock levels by item and center</p>
        </div>
      </div>

      <div className="uom-search-wrap mb-3">
        <i className="bx bx-search"></i>
        <Input
          placeholder="Search item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={balances}
          customStyles={tableCustomStyles}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No stock records yet</p>
              <p className="uom-empty-sub">Stock appears here automatically once a GRN is created.</p>
            </div>
          }
        />
      </div>

      {/* Ledger History Modal */}
      <Modal isOpen={!!ledgerModal} toggle={() => setLedgerModal(null)} centered size="lg">
        <ModalBody className="p-4">
          {ledgerModal && (
            <>
              <h5 className="mb-3">Movement History — {ledgerModal.itemName}</h5>
              {ledgerLoading ? (
                <div className="text-muted">Loading...</div>
              ) : ledgerRows.length === 0 ? (
                <div className="text-muted">No movements recorded yet.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="table mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Balance After</th>
                        <th>Reference</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerRows.map((row) => (
                        <tr key={row._id}>
                          <td>{dateFmt(row.transactionDate)}</td>
                          <td>
                            <span
                              className={`uom-status-pill ${row.transactionType === "in" ? "status-active" : "status-blacklisted"}`}
                            >
                              <span className="dot"></span> {row.transactionType.toUpperCase()}
                            </span>
                          </td>
                          <td>{row.quantity}</td>
                          <td className="fw-semibold">{row.balanceAfter}</td>
                          <td className="small text-muted">
                            {row.referenceType} · {row.referenceNumber}
                          </td>
                          <td className="small text-muted">{row.remarks || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="d-flex justify-content-end mt-3">
                <Button color="light" onClick={() => setLedgerModal(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default StockBalanceList;