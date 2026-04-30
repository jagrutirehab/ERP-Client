import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { CardBody } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DataTable from "../../../Components/Common/DataTable";
import RefreshButton from "../../../Components/Common/RefreshButton";
import { useDispatch, useSelector } from "react-redux";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { getStockSummaryColumns } from "../Columns/Pharmacy/StockSummaryColumns";
import { fetchPharmacyConsolidated } from "../../../store/features/pharmacy/pharmacySlice";

const StockSummary = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.User);
    const { data, loading, pagination } = useSelector((state) => state.Pharmacy);
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { hasPermission, loading: permissionLoader } = usePermissions(token);
    const hasUserPermission = hasPermission("PHARMACY", "INVENTORY_STOCK_SUMMARY", "READ");
    const handleAuthError = useAuthError();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCenter, setSelectedCenter] = useState("ALL");

    const totalItems = pagination?.total || 0;

    const rawColumns = getStockSummaryColumns();
    const columns = useMemo(() => rawColumns.map(col => ({
        name: col.header,
        selector: row => row[col.accessor],
        cell: col.cell,
        sortable: col.accessor !== 'centers',
        wrap: col.accessor === 'centers',
        minWidth: col.accessor === 'centers' ? '350px' : '150px',
    })), [rawColumns]);

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

    const fetchStockSummary = async () => {
        if (!centers || centers.length === 0) return;

        const params = {
            page: currentPage,
            limit: pageSize,
            search: debouncedSearch || undefined,
            centers: centers?.join(",") || undefined,
        };

        try {
            await dispatch(fetchPharmacyConsolidated(params)).unwrap();
        } catch (err) {
            if (!handleAuthError(err)) {
                toast.error(err.message || "Failed to fetch inventory stock summary");
            }
        }
    };

    useEffect(() => {
        if (hasUserPermission) {
            fetchStockSummary();
        }
    }, [currentPage, pageSize, debouncedSearch, selectedCenter]);

    if (!hasUserPermission && !permissionLoader) {
        navigate("/unauthorized");
    }

    return (
        <CardBody className="p-3 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
            <div className="content-wrapper">
                <div className="text-center text-md-left mb-3">
                    <h4 className="font-weight-bold text-primary text-uppercase">Stock Summary</h4>
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
                    <RefreshButton loading={loading} onRefresh={fetchStockSummary} />
                </div>

                <div className="border rounded shadow-sm overflow-hidden bg-white">
                    <DataTable
                        columns={columns}
                        data={data}
                        loading={loading}
                        pagination={{ totalDocs: totalItems }}
                        limit={pageSize}
                        setLimit={setPageSize}
                        page={currentPage}
                        setPage={setCurrentPage}
                    />
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