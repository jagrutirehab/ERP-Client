import { useState } from "react";
import { useSelector } from "react-redux";
import { endOfDay, startOfDay, format } from "date-fns";
import Header from "../../../Report/Components/Header";
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
} from "reactstrap";
import Select from "react-select";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

const PendingAudits = () => {
    const user = useSelector((state) => state.User);

    const [selectedCenter, setSelectedCenter] = useState(null);
    const [auditDate, setAuditDate] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [pendingAudits, setPendingAudits] = useState([]);
    const [modalSelectedCenter, setModalSelectedCenter] = useState(null);
    const [reportDate, setReportDate] = useState({
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
    });

    const centerOptions =
        user?.userCenters?.map((center) => ({
            value: center?._id ?? center?.id ?? "",
            label: center?.title ?? center?.name ?? "Unknown",
        })) || [];

    const handleDateChange = (newDate) => setReportDate(newDate);

    const handleDownload = () => {
        if (!modalSelectedCenter || !auditDate) {
            toast.warn("Select center and audit date first");
            return;
        }

        const center = centerOptions.find((c) => c.value === modalSelectedCenter);
        const newAudit = {
            id: Date.now(),
            center: center?.label || "Unknown",
            date: auditDate,
            createdBy: "navis",
            status: "pending",
        };

        setPendingAudits((prev) => [...prev, newAudit]);
        toast.success("Sheet downloaded (simulated)");
        setModalOpen(false);
        setModalSelectedCenter(null);
        setAuditDate("");
    };

    const handleUploadSubmit = () => {
        if (!uploadFile) {
            toast.warning("Upload a file first");
            return;
        }

        setPendingAudits((prev) => prev.filter((a) => a.id !== selectedAudit.id));
        setUploadModalOpen(false);
        setUploadFile(null);
    };

    return (
        <>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div style={{ minWidth: "200px" }}>
                        <Select
                            options={centerOptions}
                            placeholder="All Centers"
                            value={centerOptions.find((opt) => opt.value === selectedCenter) || null}
                            onChange={(option) => setSelectedCenter(option?.value || null)}
                        />
                    </div>

                    <div style={{ minWidth: "220px" }}>
                        <Header reportDate={reportDate} setReportDate={handleDateChange} />
                    </div>
                </div>

                <Button
                    color="primary"
                    className="fw-semibold d-flex align-items-center gap-2 text-white"
                    onClick={() => setModalOpen(true)}
                >
                    <Plus size={18} />
                    Create an Audit
                </Button>
            </div>

            <div className="mt-4">
                {pendingAudits.length === 0 && (
                    <div className="text-center py-5">
                        <h6 className="text-secondary fw-semibold mb-2">No audits found</h6>
                        <p className="text-muted mb-0">Create a new audit to get started.</p>
                    </div>
                )}
                <div
                    className="d-grid"
                    style={{
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: "16px",
                    }}
                >
                    {pendingAudits.map((audit) => (
                        <div
                            key={audit.id}
                            onClick={() => {
                                setSelectedAudit(audit);
                                setUploadModalOpen(true);
                            }}
                            className="p-3 border border-secondary-subtle rounded shadow-sm d-flex flex-column justify-content-between bg-light cursor-pointer"
                        >
                            <div>
                                <h6 className="fw-bold mb-2">{audit.center}</h6>
                                <p className="mb-1 text-muted small">
                                    <strong>Date:</strong> {format(new Date(audit.date), "dd MMM yyyy")}
                                </p>
                                <p className="mb-1 text-muted small">
                                    <strong>Created by:</strong> {audit.createdBy}
                                </p>
                            </div>
                            <small className="text-primary mt-2 fw-semibold">Click to upload file</small>
                        </div>

                    ))}
                </div>
            </div>
            {/* Template download modal */}
            <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
                <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
                    Create an Audit
                </ModalHeader>
                <ModalBody>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleDownload();
                        }}
                    >
                        <div className="mb-3">
                            <label htmlFor="centerSelect" className="form-label fw-semibold">
                                Select Center
                            </label>
                            <Select
                                options={centerOptions}
                                placeholder="Select Center"
                                value={centerOptions.find((opt) => opt.value === modalSelectedCenter) || null}
                                onChange={(option) => setModalSelectedCenter(option?.value || null)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="auditDate" className="form-label fw-semibold">
                                Audit Date
                            </label>
                            <Input
                                id="auditDate"
                                type="date"
                                value={auditDate}
                                onChange={(e) => setAuditDate(e.target.value)}
                            />
                        </div>

                        <div className="text-end">
                            <Button type="submit" color="primary" className="fw-semibold text-white">
                                Download Template
                            </Button>
                        </div>
                    </form>
                </ModalBody>
            </Modal>


            {/* Audit file upload modal */}
            <Modal isOpen={uploadModalOpen} toggle={() => setUploadModalOpen(!uploadModalOpen)}>
                <ModalHeader toggle={() => setUploadModalOpen(!uploadModalOpen)}>
                    Upload Audit File
                </ModalHeader>
                <ModalBody>
                    <p>
                        <strong>Center:</strong> {selectedAudit?.center} <br />
                        <strong>Date:</strong> {selectedAudit?.date}
                    </p>

                    <label className="form-label fw-semibold">Upload File</label>
                    <Input type="file" onChange={(e) => setUploadFile(e.target.files[0])} />
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleUploadSubmit} className="text-white">
                        Submit
                    </Button>
                    <Button color="secondary" onClick={() => setUploadModalOpen(false)}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default PendingAudits;
