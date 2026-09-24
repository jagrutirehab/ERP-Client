import { useEffect, useState } from "react";
import DataTableComponent from "../../../../Components/Common/DataTable";
import { Button, Input } from "reactstrap";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { getPharmacyReturns } from "../../../../store/features/pharmacy/pharmacySlice";
import { toast } from "react-toastify";
import Select from "react-select";
import { capitalizeWords } from "../../../../utils/toCapitalize";
import { ExpandableText } from "../../../../Components/Common/ExpandableText";
import DetailedPrescriptionModal from "../../Components/DetailedPrescriptionModal";
import RefreshButton from "../../../../Components/Common/RefreshButton";

const ReturnHistoryList = ({ activeTab, hasUserPermission }) => {
    const dispatch = useDispatch();
    const { pharmacyReturns } = useSelector((state) => state.Pharmacy);
    const user = useSelector((state) => state.User);
    const centerList = useSelector((state) => state.Center.data);
    const handleAuthError = useAuthError();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [viewPrescriptionModal, setViewPrescriptionModal] = useState(false);
    const [viewPrescriptionPatient, setViewPrescriptionPatient] = useState(null);

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

    const fetchReturns = async () => {
        if (!hasUserPermission) return;
        try {
            const centers =
                selectedCenter === "ALL"
                    ? user?.centerAccess
                    : [selectedCenter];

            await dispatch(
                getPharmacyReturns({
                    page,
                    limit,
                    type: activeTab,
                    centers,
                    ...search.trim() !== "" && { search: debouncedSearch }
                })
            ).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to fetch return history.");
            }
        }
    };

    useEffect(() => {
        fetchReturns();
    }, [page, limit, activeTab, selectedCenter, debouncedSearch, user.centerAccess]);

    const columns = [
        {
            name: <div>Patient</div>,
            selector: (row) =>
                `${capitalizeWords(row.patient?.name || "-")} (${row?.patientId?.prefix || ""}${row?.patientId?.value || ""})`,
            wrap: true,
            minWidth: "160px"
        },
        {
            name: <div>Center</div>,
            selector: (row) => capitalizeWords(row?.center?.title || "-"),
            wrap: true,
            minWidth: "100px"
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
            name: <div>Medicine</div>,
            selector: (row) =>
                `${row.stock?.medicineName || "-"}${row.stock?.id ? ` · ${row.stock.id}` : ""}`,
            wrap: true,
            minWidth: "160px"
        },
        {
            name: <div>Batch</div>,
            selector: (row) => capitalizeWords(row.stock?.Batch || "-"),
            wrap: true,
        },
        {
            name: <div>Qty Returned</div>,
            selector: (row) => row.returnQty,
            center: true,
        },
        {
            name: <div>Processed By</div>,
            selector: (row) => capitalizeWords(row.returnedByUser?.name || "-"),
            wrap: true,
        },
        {
            name: <div>Processed At</div>,
            selector: (row) =>
                row?.returnedAt
                    ? format(new Date(row.returnedAt), "dd MMM yyyy, hh:mm a")
                    : "-",
            wrap: true,
        },
        {
            name: <div>Remarks</div>,
            selector: (row) => <ExpandableText text={capitalizeWords(row.remarks) || "-"} />,
            wrap: true,
            minWidth: "170px"
        },
    ];

    const historyData = pharmacyReturns?.data || [];
    const pagination = pharmacyReturns?.pagination || {};

    return (
        <div className="px-3">
            <div className="mb-3">
                <div className="d-none d-md-flex flex-row align-items-center gap-3">
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
                    <RefreshButton loading={pharmacyReturns?.loading} onRefresh={fetchReturns} />
                </div>

                <div className="d-flex d-md-none flex-column gap-3">
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
                    <div>
                        <RefreshButton loading={pharmacyReturns?.loading} onRefresh={fetchReturns} />
                    </div>
                </div>
            </div>

            <DataTableComponent
                columns={columns}
                data={historyData}
                loading={pharmacyReturns?.loading}
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

            <DetailedPrescriptionModal
                patient={viewPrescriptionPatient}
                modal={viewPrescriptionModal}
                setModal={setViewPrescriptionModal}
                readOnly
            />
        </div>
    );
};

export default ReturnHistoryList;
