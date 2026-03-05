import { useEffect, useState } from "react";
import { CardBody, Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink } from "reactstrap";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { Issues } from "../Columns/Issues";
import DataTableComponent from "../../../Components/Common/DataTable";
import { fetchIssues } from "../Helpers/FetchIssues";
import ImagesModal from "../Components/ImagesModal";
import DescriptionModal from "../Components/DescriptionModal";
import classnames from "classnames";
import { normalizeStatus } from "../Components/normalizeStatus";
import { useSelector } from "react-redux";
import StatusModal from "../Components/StatusModal";
import { changeStatus } from "../../../helpers/backend_helper";
import { toast } from "react-toastify";

const TechIssues = () => {
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const user = useSelector((state) => state.User);

    const [issues, setIssues] = useState([]);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [imageModal, setImageModal] = useState(false);
    const [files, setFiles] = useState([]);
    const [activeTab, setActiveTab] = useState("new");
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState(null);
    const [assignModal, setAssignModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);

    const [selectedCenter, setSelectedCenter] = useState("ALL");

    const type = "TECH";

    const loadIssues = async () => {
        try {
            setLoading(true);

            let centers = [];

            if (selectedCenter === "") {
                centers = [];
            }
            else if (selectedCenter === "ALL") {
                centers = user?.centerAccess || [];
            }
            else {
                centers = [selectedCenter];
            }

            const data = await fetchIssues(type, {
                centers,
                status: activeTab,
                page,
                limit
            });

            setIssues(data?.data || []);
            setPagination(data?.pagination || null);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!user?.centerAccess) return;
        loadIssues();
    }, [selectedCenter, user?.centerAccess, activeTab, page, limit]);

    const handleViewDescription = (desc) => {
        setDescription(desc);
        setModalOpen(true);
    };
    const handleViewImages = (filesData) => {
        setFiles(filesData || []);
        setImageModal(true);
    };


    const centerOptions = [
        ...(user?.centerAccess?.length > 1
            ? [
                {
                    value: "ALL",
                    label: "All Centers",
                },
            ]
            : []),
        ...(user?.centerAccess?.map((id) => {
            const center = user?.userCenters?.find((c) => c._id === id);
            return {
                value: id,
                label: center?.title || "Unknown Center",
            };
        }) || []),
    ];

    const handleAssign = (row) => {
        setSelectedIssue(row);
        setAssignModal(true);
    };

    const handleAssignSubmit = async (data) => {
        try {
            const { assignedTo, issueId, note, status } = data;
            const response = await changeStatus({ assignedTo, issueId, note, status });
            console.log("Response", response);
            toast.success(response?.message || "Assigned Successfully.")
            loadIssues();
        } catch (error) {
            console.log(error);
            toast.error("Error Assigning")

        }
    };



    return (
        <>
            <CardBody
                className="p-3 bg-white"
                style={isMobile ? { width: "100%" } : { width: "78%" }}
            >
                <div className="text-center text-md-left mb-4">
                    <h1 className="display-6 fw-bold text-primary">TECH ISSUES</h1>
                </div>

                <Nav tabs className="mb-3">
                    {["new", "assigned", "in_progress", "on_hold", "pending_user", "pending_release", "resolved", "closed"].map((tab) => (
                        <NavItem key={tab}>
                            <NavLink
                                className={classnames({ active: activeTab === tab })}
                                onClick={() => setActiveTab(tab)}
                                style={{ cursor: "pointer", fontWeight: 500 }}
                            >
                                {normalizeStatus(tab)}
                            </NavLink>
                        </NavItem>
                    ))}
                </Nav>

                <div className="mb-3">
                    <select
                        className="form-select"
                        style={{ width: "200px" }}
                        value={selectedCenter}
                        onChange={(e) => setSelectedCenter(e.target.value)}
                        disabled={!centerOptions?.length}
                    >
                        {!centerOptions?.length ? (
                            <option value="">No Center Selected</option>
                        ) : (
                            centerOptions.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))
                        )}
                    </select>
                </div>
                <DataTableComponent
                    columns={Issues(handleViewDescription, handleViewImages, activeTab, handleAssign)}
                    data={issues}
                    loading={loading}
                    pagination={pagination}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                />

            </CardBody>

            <ImagesModal
                isOpen={imageModal}
                toggle={() => setImageModal(false)}
                files={files}
            />

            <DescriptionModal
                isOpen={modalOpen}
                toggle={() => setModalOpen(false)}
                description={description}
            />

            <StatusModal
                isOpen={assignModal}
                toggle={() => setAssignModal(false)}
                issue={selectedIssue}
                onAssign={handleAssignSubmit}
                activeTab={activeTab}
                title={"Assign Issue to employee"}
            // status={"assigned"}
            />
        </>
    );
};

export default TechIssues;