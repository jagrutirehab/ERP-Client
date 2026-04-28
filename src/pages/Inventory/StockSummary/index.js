import React, { useEffect, useState, useRef } from "react";
import { Search, Package } from "lucide-react";
import { CardBody } from "reactstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../Components/Table";
import { Button } from "../Components/Button";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { getStockSummaryColumns } from "../Columns/Pharmacy/StockSummaryColumns";
import { fetchPharmacyConsolidated } from "../../../store/features/pharmacy/pharmacySlice";

const StockSummary = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.User);
    const { data, loading, pagination } = useSelector((state) => state.Pharmacy);
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { hasPermission } = usePermissions(token);
    const handleAuthError = useAuthError();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCenter, setSelectedCenter] = useState("ALL");

    const totalItems = pagination?.total || 0;
    const totalPages = pagination?.pages || 1;

    const columns = getStockSummaryColumns();

    const centerOptions = [
        ...(user?.userCenters?.length > 1 ? [{ value: "ALL", label: "All Centers" }] : []),
        ...(user?.userCenters?.map((center) => ({
            value: center._id || center.id,
            label: center.title || "Unknown Center",
        })) || []),
    ];

    const selectedCenterOption =
        centerOptions.find((opt) => opt.value === selectedCenter) || centerOptions[0];

    const centers =
        selectedCenter === "ALL"
            ? user?.userCenters?.map((c) => c._id) || []
            : [selectedCenter];

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    useEffect(() => {
        if (!centers || centers.length === 0) return;

        const params = {
            page: currentPage,
            limit: pageSize,
            search: debouncedSearch || undefined,
            centers: centers?.join(",") || undefined,
        };

        dispatch(fetchPharmacyConsolidated(params)).unwrap().catch((err) => {
            handleAuthError(err);
        });
    }, [currentPage, pageSize, debouncedSearch, selectedCenter]);

    const goToPage = (page) => {
        if (page === "..." || page === currentPage) return;
        const target = Math.max(1, Math.min(totalPages, page));
        setCurrentPage(target);
    };

    const getPageRange = (total, current, maxButtons = 7) => {
        if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
        const sideButtons = Math.floor((maxButtons - 3) / 2);
        let start = Math.max(2, current - sideButtons);
        let end = Math.min(total - 1, current + sideButtons);
        if (current - 1 <= sideButtons) {
            start = 2;
            end = Math.min(total - 1, maxButtons - 2);
        }
        if (total - current <= sideButtons) {
            end = total - 1;
            start = Math.max(2, total - (maxButtons - 3));
        }
        const range = [1];
        if (start > 2) range.push("...");
        for (let i = start; i <= end; i++) range.push(i);
        if (end < total - 1) range.push("...");
        range.push(total);
        return range;
    };

    return (
        <CardBody className="p-3 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
            <div className="content-wrapper">
                <div className="text-center text-md-left mb-4">
                    <h1 className="display-4 font-weight-bold text-primary">STOCK SUMMARY</h1>
                </div>

                <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-4">
                    <div className="d-flex flex-wrap gap-3 align-items-center flex-grow-1">
                        <div className="w-90 w-md-auto" style={{ maxWidth: "290px" }}>
                            <div className="position-relative w-100">
                                <Search
                                    className="position-absolute"
                                    style={{
                                        left: "8px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        height: "18px",
                                        width: "18px",
                                        color: "#6c757d",
                                        pointerEvents: "none",
                                    }}
                                    aria-hidden="true"
                                />
                                <input
                                    type="text"
                                    placeholder="Search by Name or ID..."
                                    className="form-control"
                                    style={{
                                        paddingLeft: "36px",
                                        paddingRight: "12px",
                                        height: "40px",
                                    }}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ width: "220px" }}>
                            <Select
                                value={selectedCenterOption}
                                onChange={(option) => {
                                    setSelectedCenter(option?.value);
                                    setCurrentPage(1);
                                }}
                                options={centerOptions}
                                placeholder="All Centers"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        height: "40px",
                                        minHeight: "40px",
                                    }),
                                }}
                            />
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <label className="mb-0 small text-muted">Show</label>
                            <select
                                className="form-select form-select-sm"
                                style={{ width: "88px", height: "40px" }}
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div
                    className="overflow-auto mb-2 border rounded shadow-sm"
                    style={{ WebkitOverflowScrolling: "touch", maxHeight: "65vh" }}
                >
                    <Table>
                        <TableHeader className="bg-light">
                            <TableRow>
                                {columns.map((col, idx) => (
                                    <TableHead key={idx} className="font-weight-bold text-dark py-3" noWrap>
                                        {col.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                        <p className="mt-2 text-muted">Gathering inventory data...</p>
                                    </TableCell>
                                </TableRow>
                            ) : data.length > 0 ? (
                                data.map((row, rIdx) => (
                                    <TableRow key={rIdx}>
                                        {columns.map((col, cIdx) => (
                                            <TableCell key={cIdx} noWrap={col.accessor !== "centers"}>
                                                {col.cell ? col.cell(row) : row[col.accessor]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center py-5">
                                        <Package className="text-muted mb-2" size={48} />
                                        <p className="text-muted font-italic">No inventory records found matching your search.</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3">
                    <div className="text-muted small">
                        Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{" "}
                        <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{" "}
                        <strong>{totalItems}</strong> entries
                    </div>
                    <nav>
                        <ul className="pagination mb-0">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                >
                                    Previous
                                </button>
                            </li>
                            {getPageRange(totalPages, currentPage).map((page, idx) => (
                                <li
                                    key={idx}
                                    className={`page-item ${page === currentPage ? "active" : ""} ${page === "..." ? "disabled" : ""}`}
                                >
                                    {page === "..." ? (
                                        <span className="page-link">...</span>
                                    ) : (
                                        <button className="page-link" onClick={() => goToPage(page)} disabled={loading}>
                                            {page}
                                        </button>
                                    )}
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            <style jsx>{`
        .hover-shadow-sm:hover {
          background-color: #f8f9fa;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .pagination .page-link {
            cursor: pointer;
            border-radius: 4px;
            margin: 0 2px;
        }
        .pagination .page-item.active .page-link {
            background-color: #007bff;
            border-color: #007bff;
        }
        .transition-all {
          transition: all 0.2s ease-in-out;
        }
        .bg-soft-success {
          background-color: #e6fcf5;
        }
        .bg-soft-danger {
          background-color: #fff5f5;
        }
      `}</style>
        </CardBody>
    );
};

export default StockSummary;