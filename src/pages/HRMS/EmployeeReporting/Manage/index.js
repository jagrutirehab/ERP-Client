import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import { usePermissions } from '../../../../Components/Hooks/useRoles';
import { CardBody, Input, Spinner } from 'reactstrap';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from "react-select";
import { fetchReportings } from '../../../../store/features/HRMS/hrmsSlice';
import { useAuthError } from '../../../../Components/Hooks/useAuthError';
import { toast } from 'react-toastify';
import DataTableComponent from '../../../../Components/Common/DataTable';
import { employeeReportingsColumns } from '../../components/Table/Columns/employeeReportings';
import EditEmployeeReportingModal from '../../components/EditEmployeeReportingModal';

const sortByOptions = [
    { value: "ALL", label: "All" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
];

const ManageEmployeeReportings = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const { centerAccess, userCenters } = useSelector((state) => state.User);
    const { data, pagination, loading } = useSelector((state) => state.HRMS);
    const handleAuthError = useAuthError();
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [limit, setLimit] = useState(10);
    const [modalOpen, setModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState("ACTIVE");

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading: permissionLoader } = usePermissions(token);
    const hasUserPermission = hasPermission(
        "HR",
        "MANAGE_EMPLOYEE_REPORTINGS",
        "READ"
    );

    const hasEditPermission = hasPermission(
        "HR",
        "MANAGE_EMPLOYEE_REPORTINGS",
        "WRITE"
    ) ||
        hasPermission(
            "HR",
            "MANAGE_EMPLOYEE_REPORTINGS",
            "DELETE"
        );

    const centerOptions = [
        ...(centerAccess?.length > 1
            ? [{
                value: "ALL",
                label: "All Centers",
                isDisabled: false,
            }]
            : []
        ),
        ...(
            centerAccess?.map(id => {
                const center = userCenters?.find(c => c._id === id);
                return {
                    value: id,
                    label: center?.title || "Unknown Center"
                };
            }) || []
        )
    ];

    const selectedCenterOption = centerOptions.find(
        opt => opt.value === selectedCenter
    ) || centerOptions[0];

    const selectedSortByOption =
        sortByOptions.find(opt => opt.value === sortBy) || sortByOptions[0];

    useEffect(() => {
        if (
            selectedCenter !== "ALL" &&
            !centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
            setPage(1);
        }
    }, [selectedCenter, centerAccess]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(handler);
    }, [search]);

    const fetchEmployeeReportings = async () => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? centerAccess
                    : [selectedCenter];

            await dispatch(fetchReportings({
                page,
                limit,
                search,
                centers,
                sortBy,
                ...debouncedSearch.trim() !== "" && { search: debouncedSearch }
            })).unwrap();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(
                    error.message || "Failed to fetch reportings"
                );
            }
        }
    }

    useEffect(() => {
        if (!hasUserPermission) return;
        fetchEmployeeReportings();
    }, [
        page,
        limit,
        selectedCenter,
        hasUserPermission,
        debouncedSearch,
        centerAccess,
        sortBy
    ]);

    useEffect(() => {
        setPage(1);
    }, [
        selectedCenter,
        limit,
        debouncedSearch,
        sortBy
    ]);

    const handleEditRecord = (row) => {
        setSelectedRecord(row);
        setModalOpen(true);
    }

    const columns = employeeReportingsColumns({
        onEdit: handleEditRecord,
        hasEditPermission,
        searchText: debouncedSearch,
    });

    if (!permissionLoader && !hasUserPermission) {
        navigate("/unauthorized");
    }

    if (permissionLoader) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <Spinner color="primary" />
            </div>
        )
    }
    return (
        <>
            <CardBody
                className="p-3 bg-white"
                style={isMobile ? { width: "100%" } : { width: "78%" }}>
                <div className="text-center text-md-left mb-4">
                    <h1 className="display-6 fw-bold text-primary">
                        MANAGE EMPLOYEE REPORTING
                    </h1>
                </div>

                <div className="mb-3 d-none d-md-block">
                    <div className="d-flex gap-3 align-items-center mb-2">
                        <div style={{ width: "200px" }}>
                            <Select
                                value={selectedCenterOption}
                                onChange={(opt) => setSelectedCenter(opt.value)}
                                options={centerOptions}
                                classNamePrefix="react-select"
                            />
                        </div>
                        <div style={{ width: "200px" }}>
                            <Select
                                value={selectedSortByOption}
                                onChange={(opt) => {
                                    setSortBy(opt.value);
                                    setPage(1);
                                }}
                                options={sortByOptions}
                                classNamePrefix="react-select"
                                isSearchable={false}
                            />
                        </div>

                        <div style={{ minWidth: "220px" }}>
                            <Input
                                type="text"
                                placeholder="Search by name, ECode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <DataTableComponent
                    columns={columns}
                    data={data}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    loading={loading}
                    pagination={pagination}
                />
            </CardBody>

            <EditEmployeeReportingModal
                isOpen={modalOpen}
                toggle={() => {
                    setModalOpen(!modalOpen);
                    setSelectedRecord(null);
                }}
                initialData={selectedRecord}
                onUpdate={() => {
                    setSelectedRecord(null);
                    setPage(1);
                    fetchEmployeeReportings();
                }}
            />
        </>
    )
}

export default ManageEmployeeReportings;