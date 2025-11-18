import { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    CardTitle,
    Badge,
    Row,
    Col,
    Input
} from "reactstrap";
import { UserRound, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { getPendingApprovalsByPatient } from "../../../../store/features/pharmacy/pharmacySlice";
import DetailedPrescriptionModal from "../../Components/DetailedPrescriptionModal";

const PatientList = ({ activeTab, activeSubTab, hasUserPermission }) => {
    const [modal, setModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const dispatch = useDispatch();
    const { pendingPatients, loading } = useSelector((state) => state.Pharmacy);
    const user = useSelector((state) => state.User);
    const handleAuthError = useAuthError();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

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
            user?.centerAccess?.map(id => {
                const center = user?.userCenters?.find(c => c._id === id);
                return {
                    value: id,
                    label: center?.title || "Unknown Center"
                };
            }) || []
        )
    ];


    useEffect(() => {
        if (
            selectedCenter !== "ALL" &&
            !user?.centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
            setPage(1);
        }
    }, [selectedCenter, user?.centerAccess]);


    const selectedCenterOption = centerOptions.find(
        opt => opt.value === selectedCenter
    ) || centerOptions[0];



    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        if (activeSubTab !== "DETAILED" || !hasUserPermission) return;
        const fetchMedicineApprovals = async () => {
            try {
                const centers =
                    selectedCenter === "ALL"
                        ? user?.centerAccess
                        : [selectedCenter];

                await dispatch(
                    getPendingApprovalsByPatient({
                        page,
                        limit,
                        type: activeTab,
                        centers,
                        ...search.trim() !== "" && { search: debouncedSearch }
                    })
                ).unwrap();
            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error.message || "Failed to fetch medicine approvals.");
                }
            }
        };

        fetchMedicineApprovals();

    }, [page, limit, activeTab, activeSubTab, selectedCenter, debouncedSearch, user.centerAccess]);


    const handleCardClick = (patient) => {
        setSelectedPatient(patient);
        setModal(true);
    };

    const getPageRange = (total, current, maxButtons = 7) => {
        if (total <= maxButtons)
            return Array.from({ length: total }, (_, i) => i + 1);

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

    const patientData = pendingPatients?.data || [];
    const pagination = pendingPatients?.pagination || {};

    return (
        <div className="px-3">
            <div className="mb-3">

                {/*  DESKTOP VIEW */}
                <div className="d-none d-md-flex flex-row align-items-center gap-3">
                    <div style={{ width: "110px" }}>
                        <Select
                            value={{ value: limit, label: limit }}
                            onChange={(option) => {
                                setLimit(option.value);
                                setPage(1);
                            }}
                            options={[
                                { value: 10, label: "10" },
                                { value: 20, label: "20" },
                                { value: 30, label: "30" },
                                { value: 50, label: "50" },
                            ]}
                            classNamePrefix="react-select"
                        />
                    </div>
                    <div style={{ width: "200px" }}>
                        <Select
                            value={selectedCenterOption}
                            onChange={(option) => {
                                setSelectedCenter(option?.value);
                                setPage(1);
                            }}
                            options={centerOptions}
                            placeholder="All Centers"
                            classNamePrefix="react-select"
                        />
                    </div>
                    <div style={{ width: "220px" }}>
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="Search by patient name or UID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ flexGrow: 1 }}></div>
                </div>

                {/*  MOBILE VIEW */}
                <div className="d-flex d-md-none flex-column gap-3">
                    <div style={{ width: "100%" }}>
                        <Select
                            value={{ value: limit, label: limit }}
                            onChange={(option) => {
                                setLimit(option.value);
                                setPage(1);
                            }}
                            options={[
                                { value: 10, label: "10" },
                                { value: 20, label: "20" },
                                { value: 30, label: "30" },
                                { value: 50, label: "50" },
                            ]}
                            classNamePrefix="react-select"
                        />
                    </div>
                    <div style={{ width: "100%" }}>
                        <Select
                            value={selectedCenterOption}
                            onChange={(option) => {
                                setSelectedCenter(option?.value);
                                setPage(1);
                            }}
                            options={centerOptions}
                            placeholder="All Centers"
                            classNamePrefix="react-select"
                        />
                    </div>
                    <div style={{ width: "100%" }}>
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="Search by patient name or UID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                </div>

            </div>


            {loading && <LoaderSkeleton />}
            <Row className="g-3 mb-4">
                {!loading && patientData.length === 0 ? (
                    <div className="d-flex justify-content-center align-items-center py-5 w-100">
                        There is no records to display
                    </div>
                ) : !loading && patientData.map((patient) => (
                    <Col xs={12} sm={6} lg={4} key={patient._id} className="d-flex">
                        <Card
                            className="cursor-pointer w-100 transition-all"
                            style={{
                                backgroundColor: "#f8fafc",
                                border: "1px solid #000",
                                borderRadius: "0.25rem",
                                overflow: "hidden",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                                transition: "all 0.25s ease",
                            }}
                            onClick={() => handleCardClick(patient)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-3px)";
                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
                            }}
                        >
                            <CardBody className="d-flex flex-column h-100 p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <CardTitle
                                            tag="h5"
                                            className="fw-semibold text-dark mb-1"
                                            style={{
                                                fontSize: "1.15rem",
                                                whiteSpace: "normal",
                                                wordWrap: "break-word",
                                                maxWidth: "220px",
                                            }}
                                        >
                                            {patient?.patient.name}
                                        </CardTitle>

                                        <small className="text-muted">Patient ID: {patient?.patientId?.prefix} {patient?.patientId?.value}</small>
                                    </div>

                                    {patient?.centerName && (
                                        <Badge
                                            color="secondary"
                                            pill
                                            className="flex-shrink-0 text-uppercase fw-semibold"
                                            style={{
                                                fontSize: "0.7rem",
                                                letterSpacing: "0.5px",
                                                backgroundColor: "#334155",
                                                color: "white",
                                            }}
                                        >
                                            {patient.centerName}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex-grow-1">
                                    {patient?.doctorName && (
                                        <div className="d-flex align-items-center mb-2">
                                            <UserRound className="me-2 text-primary" size={16} />
                                            <div>
                                                <small className="text-muted d-block">Doctor</small>
                                                <span className="fw-medium text-dark">{patient.doctorName}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-3 border-top border-dark-subtle">
                                    <div className="d-flex align-items-center text-muted">
                                        <Calendar className="me-2" size={14} />
                                        <small>Created on&nbsp;</small>
                                        <small className="fw-semibold text-dark">
                                            {format(new Date(patient?.prescriptionDate), "dd MMM yyyy, hh:mm a")}
                                        </small>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>

            {!loading && pagination.totalPages > 1 && <div className="d-flex justify-content-between align-items-center mt-3 mb-4">
                <div className="small text-muted">
                    <>
                        Showing {(page - 1) * limit + 1} to{" "}
                        {Math.min(page * limit, pagination.totalDocs)} of{" "}
                        {pagination.totalDocs} entries
                    </>

                </div>

                <nav>
                    <ul className="pagination mb-0">
                        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                            <button
                                className="page-link"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                        </li>

                        {getPageRange(pagination.totalPages || 1, page, 7).map((p, idx) => (
                            <li
                                key={idx}
                                className={`page-item ${p === page ? "active" : ""} ${p === "..." ? "disabled" : ""
                                    }`}
                            >
                                {p === "..." ? (
                                    <span className="page-link">...</span>
                                ) : (
                                    <button className="page-link" onClick={() => setPage(p)}>
                                        {p}
                                    </button>
                                )}
                            </li>
                        ))}

                        <li
                            className={`page-item ${page === pagination.totalPages || pagination.totalDocs === 0
                                ? "disabled"
                                : ""
                                }`}
                        >
                            <button
                                className="page-link"
                                onClick={() =>
                                    setPage(Math.min(pagination.totalPages, page + 1))
                                }
                                disabled={
                                    page === pagination.totalPages || pagination.totalDocs === 0
                                }
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>}

            <DetailedPrescriptionModal patient={selectedPatient} modal={modal} setModal={setModal} />
        </div>
    );
};


const LoaderSkeleton = () => (
    <Row className="g-3">
        {[...Array(9)].map((_, index) => (
            <Col xs={12} sm={6} lg={4} key={index}>
                <div
                    style={{
                        background: "#f1f5f9",
                        height: "180px",
                        borderRadius: "8px",
                        animation: "pulse 1.5s infinite",
                    }}
                />
            </Col>
        ))}
    </Row>
);


export default PatientList;