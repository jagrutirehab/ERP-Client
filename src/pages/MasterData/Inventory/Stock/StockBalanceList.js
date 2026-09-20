import React, { useState, useEffect, useMemo } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import {
  getStockBalances,
  getStockLedger,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleString("en-IN") : "—");

const tableCustomStyles = {
  headRow: {
    style: {
      backgroundColor: "#fff",
      borderBottom: "1px solid #edeff3",
      minHeight: "48px",
    },
  },
  headCells: {
    style: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.02em",
    },
  },
  rows: {
    style: {
      minHeight: "60px",
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
  pagination: {
    style: { borderTopColor: "#edeff3", fontSize: "13px", color: "#667085" },
  },
};

const SummaryCard = ({ label, value, sub, icon }) => (
  <div className="uom-table-card p-3 flex-fill">
    <div className="d-flex align-items-center gap-2 mb-1">
      <i className={`bx ${icon} text-primary fs-5`}></i>
      <span className="text-muted small">{label}</span>
    </div>
    <div className="fs-3 fw-bold">{value}</div>
    {sub && <div className="text-muted small">{sub}</div>}
  </div>
);

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
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Couldn't load stock.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBalances();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Couldn't load ledger.",
        );
      }
    } finally {
      setLedgerLoading(false);
    }
  };

  // Summary stats derived from the current balance list
  const stats = useMemo(() => {
    const uniqueItems = new Set(balances.map((b) => b.itemName));
    const uniqueSites = new Set(
      balances.map((b) => b.centerId?._id || b.centerId),
    );
    const totalQty = balances.reduce((sum, b) => sum + (b.quantity || 0), 0);
    const zeroCount = balances.filter((b) => b.quantity === 0).length;
    return {
      items: uniqueItems.size,
      sites: uniqueSites.size,
      totalQty,
      zeroCount,
    };
  }, [balances]);

  const columns = [
    {
      name: "Item",
      selector: (row) => row.itemName,
      sortable: true,
      grow: 2,
      cell: (row) => <span className="fw-semibold">{row.itemName}</span>,
    },
    {
      name: "Site",
      sortable: true,
      selector: (row) => row.centerId?.title || "—",
      cell: (row) => (
        <span className="d-flex align-items-center gap-1 text-muted">
          <i className="bx bx-map-pin"></i> {row.centerId?.title || "—"}
        </span>
      ),
    },
    {
      name: "Current Stock",
      sortable: true,
      selector: (row) => row.quantity,
      right: true,
      cell: (row) => (
        <span
          className={`fw-bold fs-6 ${row.quantity === 0 ? "text-danger" : "text-dark"}`}
        >
          {row.quantity}
        </span>
      ),
    },
    {
      name: "Last Updated",
      cell: (row) => (
        <span className="uom-cell-muted small">{dateFmt(row.updatedAt)}</span>
      ),
    },
    {
      name: "",
      width: "130px",
      right: true,
      cell: (row) => (
        <Button size="sm" color="light" onClick={() => openLedger(row)}>
          <i className="bx bx-history me-1"></i> History
        </Button>
      ),
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Inventory / Stock Management</h4>
          <p>
            A live view of how much of each item is currently held at every site
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <SummaryCard
          icon="bx-package"
          label="Items Tracked"
          value={stats.items}
        />
        <SummaryCard
          icon="bx-buildings"
          label="Sites With Stock"
          value={stats.sites}
        />
        <SummaryCard
          icon="bx-cube"
          label="Total Units On Hand"
          value={stats.totalQty}
        />
        <SummaryCard
          icon="bx-error-circle"
          label="Out of Stock Lines"
          value={stats.zeroCount}
          sub={stats.zeroCount > 0 ? "Needs attention" : "All good"}
        />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="uom-search-wrap mb-0" style={{ maxWidth: 360 }}>
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search by item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-muted small">
          Stock updates automatically from GRN, Issues, Returns, Transfers, and
          Adjustments
        </div>
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={balances}
          customStyles={tableCustomStyles}
          progressPending={loading}
          pagination
          highlightOnHover
          defaultSortFieldId={1}
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">No stock records yet</p>
              <p className="uom-empty-sub">
                Stock appears here automatically once a Goods Receipt Note (GRN)
                is created.
              </p>
            </div>
          }
        />
      </div>

      {/* Movement History Modal */}
      <Modal
        isOpen={!!ledgerModal}
        toggle={() => setLedgerModal(null)}
        centered
        size="lg"
      >
        <ModalBody className="p-4">
          {ledgerModal && (
            <>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div>
                  <h5 className="mb-0">{ledgerModal.itemName}</h5>
                  <p className="text-muted small mb-0">
                    {ledgerModal.centerId?.title}
                  </p>
                </div>
                <span className="fs-4 fw-bold">{ledgerModal.quantity}</span>
              </div>
              <hr />
              <h6 className="fw-semibold mb-3">Movement History</h6>

              {ledgerLoading ? (
                <div className="text-muted py-3">Loading...</div>
              ) : ledgerRows.length === 0 ? (
                <div className="uom-empty-state">
                  <p className="uom-empty-sub mb-0">
                    No movements recorded yet.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    overflowX: "auto",
                    maxHeight: 420,
                    overflowY: "auto",
                  }}
                >
                  <table className="table mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th className="text-end">Qty</th>
                        <th className="text-end">Balance After</th>
                        <th>Reference</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerRows.map((row) => (
                        <tr key={row._id}>
                          <td className="text-muted small">
                            {dateFmt(row.transactionDate)}
                          </td>
                          <td>
                            <span
                              className={`uom-status-pill ${row.transactionType === "in" ? "status-active" : "status-blacklisted"}`}
                            >
                              <span className="dot"></span>
                              {row.transactionType === "in" ? "IN" : "OUT"}
                            </span>
                          </td>
                          <td className="text-end fw-semibold">
                            {row.transactionType === "in" ? "+" : "-"}
                            {row.quantity}
                          </td>
                          <td className="text-end fw-semibold">
                            {row.balanceAfter}
                          </td>
                          <td className="small text-muted text-capitalize">
                            {row.referenceType?.replace("_", " ")} ·{" "}
                            {row.referenceNumber}
                          </td>
                          <td className="small text-muted">
                            {row.remarks || "—"}
                          </td>
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
