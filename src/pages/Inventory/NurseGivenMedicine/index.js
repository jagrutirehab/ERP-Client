import { endOfDay, format, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import { Badge, Button, CardBody, Input, Modal, ModalBody, ModalHeader, Spinner } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { getNurseGivenMedicineDetails } from "../../../helpers/backend_helper";
import Header from "../../Report/Components/Header";
import { getNurseGivenMedicines } from "../../../store/features/pharmacy/pharmacySlice";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const NurseGivenMedicine = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.User);
    const { data: givenMedicines, loading: medicineLoading } = useSelector((state) => state.Pharmacy);
    const handleAuthError = useAuthError();
    const isMobile = useMediaQuery("(max-width: 1000px)");

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading } = usePermissions(token);
    const hasUserPermission = hasPermission("PHARMACY", "NURSEGIVENMEDICINES", "READ");


    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [reportDate, setReportDate] = useState({
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
    });
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [loadingRowKey, setLoadingRowKey] = useState(null);

    const pagination = givenMedicines?.pagination || {};

    const centerOptions = [
        ...(user?.centerAccess?.length > 1
            ? [{
                value: "ALL",
                label: "All Centers",
                isDisabled: false,
            }]
            : []
        ),
        ...(
            user?.centerAccess?.map((id) => {
                const center = user?.userCenters?.find((item) => item._id === id);
                return {
                    value: id,
                    label: center?.title || "Unknown Center",
                };
            }) || []
        ),
    ];

    useEffect(() => {
        if (
            selectedCenter !== "ALL" &&
            !user?.centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
            setCurrentPage(1);
        }
    }, [user?.centerAccess, selectedCenter]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        if (user?.centerAccess?.length <= 1) {
            setSelectedCenter(user?.centerAccess?.[0] || "");
        }
    }, [user]);

    const selectedCenterOption =
        centerOptions.find((opt) => opt.value === selectedCenter) || centerOptions[0];

    const handleDateChange = (newDate) => {
        setReportDate(newDate);
        setCurrentPage(1);
    };

    const centers =
        selectedCenter === "ALL" ? user?.centerAccess : [selectedCenter];

    const fetchGivenMedicines = async () => {
        if (!centers?.length) return;

        try {
            await dispatch(
                getNurseGivenMedicines({
                    page: currentPage,
                    limit,
                    centers,
                    startDate: reportDate?.start?.toISOString(),
                    endDate: reportDate?.end?.toISOString(),
                    ...(debouncedSearch.trim() ? { search: debouncedSearch } : {}),
                })
            ).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "Failed to fetch nurse given medicines.");
            }
        }
    };


    useEffect(() => {
        if (hasUserPermission) {
            fetchGivenMedicines();
        }
    }, [dispatch, currentPage, limit, debouncedSearch, selectedCenter, user?.centerAccess, reportDate]);

    const handleOpenDetails = async (row) => {
        const rowKey = `${row?.patientId}-${row?.prescriptionId}-${row?.date}`;

        try {
            setLoadingRowKey(rowKey);
            setDetailsLoading(true);
            setDetailsOpen(true);

            const response = await getNurseGivenMedicineDetails({
                patientId: row?.patientId,
                prescriptionId: row?.prescriptionId,
                date: row?.date,
            });

            setSelectedRecord(response?.data || null);
        } catch (error) {
            setDetailsOpen(false);
            if (!handleAuthError(error)) {
                toast.error(error?.message || "Failed to fetch medicine record details.");
            }
        } finally {
            setLoadingRowKey(null);
            setDetailsLoading(false);
        }
    };

    const closeDetailsModal = () => {
        setDetailsOpen(false);
        setSelectedRecord(null);
        setDetailsLoading(false);
    };

    const columns = [
        {
            name: <div>Patient Name (UID)</div>,
            cell: (row) => (
                <div className="d-flex flex-column py-1">
                    <span className="fw-semibold">
                        {capitalizeWords(row?.patientName || "-")}
                    </span>
                    <span className="text-muted small">{row?.patientUid || "-"}</span>
                </div>
            ),
            wrap: true,
            minWidth: "220px",
        },
        {
            name: <div>Center</div>,
            selector: (row) => capitalizeWords(row?.centerName || "-"),
            wrap: true,
            minWidth: "180px",
        },
        {
            name: <div>Stats</div>,
            cell: (row) => (
                <div className="py-2" style={{ width: "100%" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", paddingBottom: "2px", marginBottom: "2px" }}>
                        <b style={{ width: "80px" }}>Total:</b> <span>{row?.stats?.total ?? 0}</span>
                    </div>
                    <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", paddingBottom: "2px", marginBottom: "2px" }}>
                        <b style={{ width: "80px" }}>Marked:</b> <span>{row?.stats?.success ?? 0}</span>
                    </div>
                    <div style={{ display: "flex" }}>
                        <b style={{ width: "80px" }}>Missed:</b> <span>{row?.stats?.missed ?? 0}</span>
                    </div>
                </div>
            ),
            minWidth: "150px",
        },
        {
            name: <div>Date</div>,
            selector: (row) =>
                row?.date ? format(new Date(row.date), "dd MMM yyyy") : "-",
            wrap: true,
            minWidth: "130px",
        },
        {
            name: <div>Taken At</div>,
            selector: (row) =>
                row?.takenAt
                    ? format(new Date(row.takenAt), "dd MMM yyyy, hh:mm a")
                    : "-",
            wrap: true,
            minWidth: "190px",
        },
        {
            name: <div>Details</div>,
            cell: (row) => (
                <Button
                    color="primary"
                    size="sm"
                    className="text-white"
                    onClick={() => handleOpenDetails(row)}
                    disabled={loadingRowKey === `${row?.patientId}-${row?.prescriptionId}-${row?.date}`}
                >
                    {loadingRowKey === `${row?.patientId}-${row?.prescriptionId}-${row?.date}` ? (
                        <Spinner size="sm" />
                    ) : (
                        "View"
                    )}
                </Button>
            ),
            center: true,
            minWidth: "110px",
        },
    ];


    if (!loading && !hasUserPermission) {
        navigate("/unauthorized");
    }

    return (
        <CardBody
            className="p-3 bg-white"
            style={isMobile ? { width: "100%" } : { width: "78%" }}
        >
            <div className="content-wrapper">
                <div className="text-center text-md-left mb-4">
                    <h1 className="display-5 font-weight-bold text-primary">
                        NURSE GIVEN MEDICINE
                    </h1>
                </div>
            </div>

            <div className="mb-3">
                <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center">
                    <div style={{ minWidth: "110px" }}>
                        <Select
                            value={{ value: limit, label: limit }}
                            onChange={(option) => {
                                setLimit(option.value);
                                setCurrentPage(1);
                            }}
                            options={[
                                { value: 10, label: "10" },
                                { value: 20, label: "20" },
                                { value: 30, label: "30" },
                                { value: 40, label: "40" },
                                { value: 50, label: "50" },
                            ]}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Limit"
                        />
                    </div>

                    <div style={{ minWidth: "220px" }}>
                        <Select
                            value={selectedCenterOption}
                            onChange={(option) => {
                                setSelectedCenter(option?.value);
                                setCurrentPage(1);
                            }}
                            options={centerOptions}
                            placeholder="All Centers"
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div style={{ minWidth: "220px", flex: 1 }}>
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="Search by patient name or UID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div style={{ minWidth: "320px" }}>
                        <Header
                            reportDate={reportDate}
                            setReportDate={handleDateChange}
                        />
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={givenMedicines?.data || []}
                progressPending={medicineLoading}
                progressComponent={<Spinner className="text-primary" />}
                highlightOnHover
                striped
                responsive
                fixedHeader
                fixedHeaderScrollHeight="400px"
                customStyles={{
                    table: {
                        style: {
                            minHeight: "350px",
                        },
                    },
                    headCells: {
                        style: {
                            backgroundColor: "#f8f9fa",
                            fontWeight: "600",
                            borderBottom: "2px solid #e9ecef",
                        },
                    },
                    rows: {
                        style: {
                            minHeight: "60px",
                            borderBottom: "1px solid #f1f1f1",
                        },
                    },
                }}
            />

            {!medicineLoading && pagination?.totalDocs > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="small text-muted">
                        Showing {(currentPage - 1) * limit + 1} to{" "}
                        {Math.min(currentPage * limit, pagination.totalDocs)} of{" "}
                        {pagination.totalDocs} entries
                    </div>

                    <nav>
                        <ul className="pagination mb-0">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                            </li>
                            <li className="page-item disabled">
                                <span className="page-link">
                                    Page {currentPage} of {pagination.totalPages || 1}
                                </span>
                            </li>
                            <li
                                className={`page-item ${currentPage === pagination.totalPages || pagination.totalDocs === 0
                                    ? "disabled"
                                    : ""
                                    }`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() =>
                                        setCurrentPage(Math.min(pagination.totalPages || 1, currentPage + 1))
                                    }
                                    disabled={
                                        currentPage === pagination.totalPages || pagination.totalDocs === 0
                                    }
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            <Modal isOpen={detailsOpen} toggle={closeDetailsModal} size="xl">
                <ModalHeader toggle={closeDetailsModal}>
                    Medicine Record Details
                </ModalHeader>
                <ModalBody>
                    {detailsLoading ? (
                        <div className="text-center py-4">
                            <Spinner className="text-primary" />
                        </div>
                    ) : selectedRecord ? (
                        <>
                            <div className="border rounded-3 mb-4 overflow-hidden">
                                <div className="px-3 px-md-4 py-3 border-bottom bg-light">
                                    <div className="fw-semibold fs-5 text-dark">
                                        {capitalizeWords(selectedRecord?.patientName || "-")}
                                    </div>
                                    <div className="text-muted small mt-1">
                                        {selectedRecord?.patientDisplayId || selectedRecord?.patientUid || "-"}
                                    </div>
                                </div>

                                <div className="row g-0">
                                    <div className="col-md-3 col-6 border-end border-bottom border-md-bottom-0">
                                        <div className="px-3 px-md-4 py-3 h-100">
                                            <div className="text-muted small mb-1">Center</div>
                                            <div className="fw-semibold text-dark">
                                                {capitalizeWords(selectedRecord?.centerName || "-")}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-6 border-end border-bottom border-md-bottom-0">
                                        <div className="px-3 px-md-4 py-3 h-100">
                                            <div className="text-muted small mb-1">Date</div>
                                            <div className="fw-semibold text-dark">
                                                {selectedRecord?.date ? format(new Date(selectedRecord.date), "dd MMM yyyy") : "-"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-4 border-end">
                                        <div className="px-3 px-md-4 py-3 h-100 text-md-center">
                                            <div className="text-muted small mb-1">Total</div>
                                            <div className="fw-bold fs-5 text-dark">
                                                {selectedRecord?.totalMedicines ?? 0}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-4 border-end">
                                        <div className="px-3 px-md-4 py-3 h-100 text-md-center">
                                            <div className="text-muted small mb-1">Success</div>
                                            <div className="fw-bold fs-5 text-success">
                                                {selectedRecord?.completedCount ?? 0}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-4">
                                        <div className="px-3 px-md-4 py-3 h-100 text-md-center">
                                            <div className="text-muted small mb-1">Missed</div>
                                            <div className="fw-bold fs-5 text-danger">
                                                {selectedRecord?.missedCount ?? 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DataTable
                                columns={[
                                    {
                                        name: <div>Medicine</div>,
                                        selector: (row) => row?.medicineName || "-",
                                        wrap: true,
                                        minWidth: "220px",
                                    },
                                    {
                                        name: <div>Slot</div>,
                                        selector: (row) => capitalizeWords(row?.slot || "-"),
                                        minWidth: "110px",
                                    },
                                    {
                                        name: <div>Dosage</div>,
                                        selector: (row) => row?.dosage ?? "-",
                                        minWidth: "100px",
                                    },
                                    {
                                        name: <div>Status</div>,
                                        cell: (row) => (
                                            <Badge
                                                color={row?.status === "completed" ? "success" : "danger"}
                                                className="text-uppercase px-3 py-2"
                                            >
                                                {row?.status || "-"}
                                            </Badge>
                                        ),
                                        minWidth: "120px",
                                    },
                                    {
                                        name: <div>Taken At</div>,
                                        selector: (row) =>
                                            row?.takenAt
                                                ? format(new Date(row.takenAt), "dd MMM yyyy, hh:mm a")
                                                : "-",
                                        wrap: true,
                                        minWidth: "190px",
                                    },
                                ]}
                                data={selectedRecord?.medicines || []}
                                highlightOnHover
                                striped
                                responsive
                                dense
                                customStyles={{
                                    headCells: {
                                        style: {
                                            backgroundColor: "#f8f9fa",
                                            fontWeight: "600",
                                            borderBottom: "2px solid #e9ecef",
                                        },
                                    },
                                    rows: {
                                        style: {
                                            minHeight: "56px",
                                            borderBottom: "1px solid #f1f1f1",
                                        },
                                    },
                                }}
                            />
                        </>
                    ) : (
                        <div className="text-center text-muted py-4">
                            No record details found.
                        </div>
                    )}
                </ModalBody>
            </Modal>
        </CardBody>
    );
};

export default NurseGivenMedicine;
