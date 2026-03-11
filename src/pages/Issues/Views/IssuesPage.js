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
import { approveIssue, changeStatus } from "../../../helpers/backend_helper";
import { toast } from "react-toastify";
import ApprovalModal from "../Components/ApprovalModal";
import Select from "react-select";

const IssuesPage = ({ type }) => {
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

    const [approvalModal, setApprovalModal] = useState(false);
    const [approvalIssue, setApprovalIssue] = useState(null);
    const [approvalStatus, setApprovalStatus] = useState("");
    const [editRowId, setEditRowId] = useState(null);
    const [editedApproval, setEditedApproval] = useState("");
    const [editedApprovalBy, setEditedApprovalBy] = useState("");
    const approvers = ["HEMANT", "SURJEET", "SHIVANI", "VIKAS"];



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
                limit,
                ...(activeTab === "resolved" && approvalStatus
                    ? { approvalStatus }
                    : {})
            });

            setIssues(data?.data || []);
            setPagination({
                ...data?.pagination,
                totalDocs: data?.pagination?.totalRecords,
            });
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!user?.centerAccess) return;
        loadIssues();
    }, [selectedCenter, user?.centerAccess, activeTab, page, limit, approvalStatus, type]);

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
            toast.error(error?.message || "Error Assigning")

        }
    };


    const handleApproveClick = (issue) => {
        setApprovalIssue(issue);
        setApprovalModal(true);
    };

    const handleApprovalSubmit = async (data) => {
        try {

            const payload = {
                issueId: data.issueId,
                approvedBy: data.approvedBy
            }

            const response = await approveIssue(payload)
            console.log("payload", payload);

            toast.success(response?.message || "Issue Approved")

            setApprovalModal(false)
            setActiveTab("resolved")
            loadIssues()

        } catch (error) {
            toast.error(error?.message || "Approval Failed")
        }
    }


    const approvalOptions = [
        { value: "", label: "All" },
        { value: "approved", label: "Approved" },
        { value: "not_approved", label: "Not Approved" },
    ];

    // const handleEdit = (row) => {
    //     setEditRowId(row._id);

    //     // start with empty values
    //     setEditedApproval("");
    //     setEditedApprovalBy("");
    // };

    const handleEdit = (row) => {
        setEditRowId(row._id);

        // prefill approval dropdown
        if (row?.approval?.isApproved === true) {
            setEditedApproval("yes");
        } else if (row?.approval?.isApproved === false) {
            setEditedApproval("no");
        } else {
            setEditedApproval("");
        }

        // prefill approvedBy dropdown
        setEditedApprovalBy(row?.approval?.approvedBy || "");
    };
    const handleSave = async (row) => {
        try {

            const payload = {
                issueId: row._id
            };

            if (editedApprovalBy) {
                payload.approvedBy = editedApprovalBy;
            }

            if (editedApproval) {
                payload.isApproved = editedApproval === "yes";
            }

            const response = await approveIssue(payload);

            toast.success(response?.message || "Approval Updated");

            setEditRowId(null);
            loadIssues();

        } catch (error) {
            toast.error(error?.message || "Update Failed");
        }
    };
    return (
        <>
            <CardBody
                className="p-3 bg-white"
                style={isMobile ? { width: "100%" } : { width: "78%" }}
            >
                <div className="text-center text-md-left mb-4">
                    <h1 className="display-6 fw-bold text-primary">{type?.replaceAll("_", " ")} ISSUES</h1>
                </div>

                <Nav tabs className="mb-3">
                    {["new", "assigned", "in_progress", "on_hold", "pending_user", "pending_release", "resolved"].map((tab) => (
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

                <div className="mb-3 d-flex gap-2">
                    <Select
                        options={centerOptions || []}
                        value={centerOptions?.find((c) => c.value === selectedCenter) || null}
                        onChange={(selected) => setSelectedCenter(selected?.value || "")}
                        isDisabled={!centerOptions?.length}
                        placeholder={centerOptions?.length ? "Select Center" : "No Center Selected"}
                        styles={{ container: (base) => ({ ...base, width: 200 }) }}
                    />
                    {activeTab === "resolved" && (
                        <Select
                            options={approvalOptions}
                            value={approvalOptions.find((o) => o.value === approvalStatus) || null}
                            onChange={(selected) => setApprovalStatus(selected?.value || "")}
                            styles={{ container: (base) => ({ ...base, width: 200 }) }}
                        />
                    )}
                </div>



                <DataTableComponent
                    columns={
                        Issues(
                            handleViewDescription,
                            handleViewImages,
                            activeTab,
                            handleAssign,
                            handleApproveClick,
                            type,
                            editRowId,
                            handleEdit,
                            handleSave,
                            editedApproval,
                            setEditedApproval,
                            editedApprovalBy,
                            setEditedApprovalBy,
                            approvers,
                            setEditRowId
                        )}
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
            />

            <ApprovalModal
                isOpen={approvalModal}
                toggle={() => setApprovalModal(false)}
                issue={approvalIssue}
                onSubmit={handleApprovalSubmit}
            />
        </>
    );
};

export default IssuesPage;