import { useEffect, useState } from "react";
import DataTableComponent from "../../../../Components/Common/DataTable";
import { Input } from "reactstrap";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { getMedicineApprovals } from "../../../../store/features/pharmacy/pharmacySlice";
import { toast } from "react-toastify";
import { ExpandableText } from "../../../../Components/Common/ExpandableText";
import Select from "react-select";
import { Button } from "reactstrap";
import { Pill } from "lucide-react";
import { capitalizeWords } from "../../../../utils/toCapitalize";
import ApproveMedicinesModal from "./ApproveMedicinesModal";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";
import DetailedPrescriptionModal from "../../Components/DetailedPrescriptionModal";

const History = ({ activeTab, activeSubTab, hasUserPermission }) => {
    const dispatch = useDispatch();
    const { medicineApprovals, loading } = useSelector((state) => state.Pharmacy);
    const user = useSelector((state) => state.User);
    const centerList = useSelector((state) => state.Center.data);
    const handleAuthError = useAuthError();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [approveModalApprovalId, setApproveModalApprovalId] = useState(null);
    const [approveModalCenterId, setApproveModalCenterId] = useState(null);
    const [viewPrescriptionModal, setViewPrescriptionModal] = useState(false);
    const [viewPrescriptionPatient, setViewPrescriptionPatient] = useState(null);

    const openApproveModal = (approvalId, centerId) => {
        setApproveModalApprovalId(approvalId);
        setApproveModalCenterId(centerId);
    };

    const openViewPrescription = (row) => {
        setViewPrescriptionPatient({
            prescriptionId: row.prescriptionId,
            patient: { name: row.patient?.name },
        });
        setViewPrescriptionModal(true);
    };


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
            centerList
                ?.filter(c => user?.centerAccess?.includes(c._id))
                ?.map(c => ({
                    value: c._id,
                    label: c.title,
                })) || []
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
        if (activeSubTab !== "HISTORY" || !hasUserPermission) return;
        const fetchMedicineApprovals = async () => {
            try {
                const centers =
                    selectedCenter === "ALL"
                        ? user?.centerAccess
                        : [selectedCenter];

                await dispatch(
                    getMedicineApprovals({
                        page,
                        limit,
                        type: activeTab,
                        centers,
                        status: "HISTORY",
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

    }, [page, limit, activeTab, activeSubTab, selectedCenter, debouncedSearch, user.centerAccess])

    const columns = [
        {
            name: <div>Patient Name</div>,
            selector: (row) => capitalizeWords(row.patient?.name || "-"),
            wrap: true,
            minWidth: "100px"
        },
        {
            name: <div>Patient UID</div>,
            selector: (row) => `${row?.patientId?.prefix || ""} ${row?.patientId?.value || ""}`,
            wrap: true
        },
        {
            name: <div>Center</div>,
            selector: (row) => capitalizeWords(row?.center?.title || "-"),
            wrap: true,
            minWidth: "100px"
        },
        {
            name: <div>Prescription Date</div>,
            selector: (row) =>
                row?.prescription?.date
                    ? format(new Date(row.prescription.date), "dd MMM yyyy, hh:mm a")
                    : "-",
            wrap: true,
        },
        {
            name: <div>Status</div>,
            cell: (row) => renderStatusBadge(row.approvalStatus),
            center: true,
            wrap: true
        },
        {
            name: <div>Prescription</div>,
            cell: (row) => (
                <Button
                    color="primary"
                    size="sm"
                    className="text-white"
                    disabled={!row.prescriptionId}
                    onClick={() => openViewPrescription(row)}
                >
                    View
                </Button>
            ),
            center: true,
        },
        {
            name: <div>Medicines</div>,
            cell: (row) => (
                <Button
                    color="primary"
                    size="sm"
                    className="d-flex align-items-center justify-content-center text-white"
                    style={{ minWidth: "95px", fontSize: "12px" }}
                    onClick={() => openApproveModal(row._id, row.center?._id)}
                >
                    <Pill size={14} className="me-1" />
                    Medicines
                </Button>
            ),
            center: true,
        },
        {
            name: <div>Approval Date</div>,
            selector: (row) =>
                row?.approvedAt
                    ? format(new Date(row.approvedAt), "dd MMM yyyy, hh:mm a")
                    : "-",
            wrap: true,
        },
        {
            name: <div>Remarks</div>,
            selector: (row) => <ExpandableText text={capitalizeWords(row.remarks) ?? "-"} />,
            wrap: true,
            minWidth: "200px"
        }
    ];

    const historyData = medicineApprovals?.data || [];
    const pagination = medicineApprovals?.pagination || {};


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
                                { value: 40, label: "40" },
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
                                { value: 40, label: "40" },
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


            <DataTableComponent
                columns={columns}
                data={historyData}
                loading={loading}
                pagination={pagination}
                limit={limit}
                page={page}
                setPage={setPage}
                setLimit={(rows) => {
                    setLimit(rows);
                    setPage(1);
                }}
                paginationRowsPerPageOptions={[10, 20, 30, 40, 50]}
            />

            <ApproveMedicinesModal
                isOpen={!!approveModalApprovalId}
                onClose={() => openApproveModal(null, null)}
                approvalId={approveModalApprovalId}
                centerId={approveModalCenterId}
                readOnly
            />

            <DetailedPrescriptionModal
                patient={viewPrescriptionPatient}
                modal={viewPrescriptionModal}
                setModal={setViewPrescriptionModal}
                readOnly
            />
        </div>
    );
};

export default History;
