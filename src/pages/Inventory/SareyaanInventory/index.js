import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { CardBody, Button } from "reactstrap";
import Select from "react-select";
import { startOfDay, endOfDay } from "date-fns";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import DataTable from "../../../Components/Common/DataTable";
import RefreshButton from "../../../Components/Common/RefreshButton";
import PreviewFile from "../../../Components/Common/PreviewFile";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { downloadSareyaanImportErrors } from "../../../helpers/backend_helper";
import { fetchSareyaanInventoryImports } from "../../../store/features/pharmacy/pharmacySlice";
import { sareyaanInventoryColumns } from "../Columns/Pharmacy/SareyaanInventoryColumns";
import SareyaanUploadModal from "./SareyaanUploadModal";
import DateRangeFilter from "../../../Components/Common/DateRangeFilter";

const SAREYAAN_CENTER_ID = "69df2e66732bc118687e38d9";
const SAREYAAN_CENTER_LABEL = "Sareyaan Pharma";

const SareyaanInventory = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.User);
    const { data: records, loading, pagination } = useSelector(
        (state) => state.Pharmacy
    );
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { hasPermission, loading: permissionLoader } = usePermissions(token);
    const hasUserPermission = hasPermission("PHARMACY", "SAREYAAN_INVENTORY", "READ");
    const hasWritePermission = hasPermission("PHARMACY", "SAREYAAN_INVENTORY", "WRITE") || hasPermission("PHARMACY", "SAREYAAN_INVENTORY", "DELETE");
    const handleAuthError = useAuthError();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedCenter, setSelectedCenter] = useState({
        value: SAREYAAN_CENTER_ID,
        label: SAREYAAN_CENTER_LABEL,
    });
    const [reportDate, setReportDate] = useState(() => {
        const now = new Date();
        return {
            start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
            end: endOfDay(now),
        };
    });

    const totalItems = pagination?.totalDocs || pagination?.total || 0;

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);

    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const toggleUploadModal = () => setUploadModalOpen(!uploadModalOpen);

    const togglePreview = () => {
        if (previewOpen && previewFile?.url?.startsWith("blob:")) {
            URL.revokeObjectURL(previewFile.url);
        }
        setPreviewOpen(!previewOpen);
    };

    const centerOptions = useMemo(() => {
        // Resolve a friendlier label for the Sareyaan center if it's available
        // in userCenters; otherwise fall back to the hardcoded label.
        const sareyaanCenter = user?.userCenters?.find(
            (c) => String(c._id || c.id) === SAREYAAN_CENTER_ID
        );
        return [
            {
                value: SAREYAAN_CENTER_ID,
                label: sareyaanCenter?.title || SAREYAAN_CENTER_LABEL,
            },
        ];
    }, [user?.userCenters]);

    // Keep the selected option's label in sync with whatever userCenters resolves to.
    useEffect(() => {
        if (centerOptions[0]) setSelectedCenter(centerOptions[0]);
    }, [centerOptions]);

    const fetchImports = () => {
        if (!hasUserPermission) return;

        let centers = [];
        if (selectedCenter && selectedCenter.value !== "") {
            centers = [selectedCenter.value];
        } else {
            centers = user?.centerAccess || [];
        }

        const params = {
            page: currentPage,
            limit: pageSize,
            centers,
            startDate: reportDate.start.toISOString(),
            endDate: reportDate.end.toISOString(),
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        dispatch(fetchSareyaanInventoryImports(params))
            .unwrap()
            .catch((err) => {
                if (!handleAuthError(err)) {
                    toast.error(err?.message || "Failed to fetch Sareyaan imports");
                }
            });
    };

    useEffect(() => {
        fetchImports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, selectedCenter, reportDate, user?.centerAccess]);

    useEffect(() => {
        setCurrentPage(1);
    }, [user?.centerAccess]);

    const handleDownloadErrors = useCallback(
        async (importId) => {
            try {
                const response = await downloadSareyaanImportErrors(importId);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute(
                    "download",
                    `sareyaan-import-errors-${importId}.csv`
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success("Error report downloaded successfully");
            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error("Failed to download error report");
                }
            }
        },
        [handleAuthError]
    );

    const columns = useMemo(
        () =>
            sareyaanInventoryColumns({
                handleDownloadErrors,
                setPreviewFile,
                setPreviewOpen,
            }),
        [handleDownloadErrors]
    );

    if (!hasUserPermission && !permissionLoader) {
        navigate("/unauthorized");
    }

    return (
        <CardBody
            className="p-3 bg-white"
            style={isMobile ? { width: "100%" } : { width: "78%" }}
        >
            <div className="content-wrapper">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h4 className="font-weight-bold text-primary text-uppercase mb-0">
                        Sareyaan Inventory Imports
                    </h4>
                    {hasWritePermission && (
                        <Button
                            color="primary"
                            onClick={toggleUploadModal}
                            className="d-flex align-items-center gap-1"
                        >
                            <Plus size={16} />
                            New Import
                        </Button>
                    )}
                </div>

                <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-4">
                    <div className="d-flex flex-wrap gap-3 align-items-center flex-grow-1">
                        <div style={{ minWidth: "220px" }}>
                            <Select
                                options={centerOptions}
                                value={selectedCenter}
                                onChange={(selected) => {
                                    setSelectedCenter(selected);
                                    setCurrentPage(1);
                                }}
                                placeholder="Filter Centers..."
                                classNamePrefix="react-select"
                                isDisabled
                            />
                        </div>
                        <DateRangeFilter
                            reportDate={reportDate}
                            setReportDate={(val) => {
                                setReportDate(val);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <RefreshButton
                        onRefresh={() => {
                            setCurrentPage(1);
                            fetchImports();
                        }}
                        loading={loading}
                    />
                </div>

                <DataTable
                    columns={columns}
                    data={records}
                    loading={loading}
                    pagination={{
                        totalDocs: totalItems,
                    }}
                    page={currentPage}
                    setPage={setCurrentPage}
                    limit={pageSize}
                    setLimit={setPageSize}
                />
            </div>

            <PreviewFile
                isOpen={previewOpen}
                toggle={togglePreview}
                file={previewFile}
                title="Sareyaan Import File"
                allowDownload={true}
            />

            <SareyaanUploadModal
                isOpen={uploadModalOpen}
                toggle={toggleUploadModal}
                onUploaded={() => {
                    setUploadModalOpen(false);
                    setCurrentPage(1);
                    fetchImports();
                }}
            />
        </CardBody>
    );
};

export default SareyaanInventory;
