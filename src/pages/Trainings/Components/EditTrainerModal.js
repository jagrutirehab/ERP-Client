import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Select from "react-select";
import { getEmployeesByPosition, editTrainerRecord, getPositions, removeTrainerVideo } from "../../../helpers/backend_helper";
import { enqueueTrainingUploads } from "../../../helpers/trainingUploader";
import { flattenPositions } from "../Helpers/Helper";
import UserSelector from "./UserSelector";
import AttachmentPicker from "./AttachmentPicker";
import TrainerVideoInput from "./TrainerVideoInput";

const LIMIT = 10;

const toLocalDatetime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d - offset).toISOString().slice(0, 16);
};

const EditTrainerModal = ({ isOpen, onClose, record, onRefresh }) => {
    const user = useSelector(state => state.User);
    const [allPositions, setAllPositions] = useState([]);
    const [employeesByPosition, setEmployeesByPosition] = useState({});
    const [activePosition, setActivePosition] = useState({ id: "", name: "" });
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const searchTimeout = useRef(null);

    const [form, setForm] = useState({
        trainingName: "",
        trainerName: "",
        trainingDescription: "",
        from: "",
        to: "",
        center: []
    });

    const [selectedUsers, setSelectedUsers] = useState({});
    const [savedPositionNames, setSavedPositionNames] = useState({});
    const [removedPaths, setRemovedPaths] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [videoRemoved, setVideoRemoved] = useState(false);
    const [newVideo, setNewVideo] = useState(null);

    const centerOptions = user?.centerAccess?.map(cid => {
        const center = user?.userCenters?.find(c => c._id === cid);
        return { value: cid, label: center?.title || "Unknown Center" };
    }) || [];

    const getCenterIds = () => form.center.join(",");

    useEffect(() => {
        if (!isOpen || !record) return;
        setForm({
            trainingName: record.trainingName || "",
            trainerName: record.trainerName || "",
            trainingDescription: record.trainingDescription || "",
            from: toLocalDatetime(record.from),
            to: toLocalDatetime(record.to),
            center: record.center?.map(c => c._id || c) || []
        });
        const preSelected = {};
        const names = {};
        record.attendanceData?.forEach(entry => {
            if (entry.position) {
                preSelected[entry.position] = entry.presents?.map(p => p.employee).filter(Boolean) || [];
                names[entry.position] = entry.positionName;
            }
        });
        setSelectedUsers(preSelected);
        setSavedPositionNames(names);
        setRemovedPaths([]);
        setNewFiles([]);
        setVideoRemoved(false);
        setNewVideo(null);
    }, [isOpen, record]);

    const fetchUsers = useCallback(async ({ positionId, page, search: searchTerm, centers, append = false }) => {
        if (!positionId) return;
        setEmployeesByPosition(prev => ({
            ...prev,
            [positionId]: { ...(prev[positionId] || {}), loading: true },
        }));
        try {
            const response = await getEmployeesByPosition({
                position: positionId,
                search: searchTerm,
                page,
                limit: LIMIT,
                ...(centers && { centers }),
            });
            const newUsers = response?.employees || [];
            const total = response?.total || 0;
            setEmployeesByPosition(prev => ({
                ...prev,
                [positionId]: {
                    users: append ? [...(prev[positionId]?.users || []), ...newUsers] : newUsers,
                    page,
                    total,
                    hasMore: !!response?.hasMore,
                    loading: false,
                },
            }));
        } catch {
            setEmployeesByPosition(prev => ({ ...prev, [positionId]: { ...(prev[positionId] || {}), loading: false } }));
        }
    }, []);

    const loadPositions = async () => {
        try {
            const response = await getPositions();
            const positions = flattenPositions(response?.data);
            if (positions.length) {
                setAllPositions(positions);
                setActivePosition({ id: positions[0]._id, name: positions[0].name });
            }
        } catch { }
    };

    useEffect(() => { if (isOpen) loadPositions(); }, [isOpen]);

    useEffect(() => {
        if (!activePosition.id) return;
        fetchUsers({ positionId: activePosition.id, page: 1, search: "", centers: getCenterIds() });
    }, [activePosition.id]);

    useEffect(() => {
        if (!activePosition.id) return;
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchUsers({ positionId: activePosition.id, page: 1, search, centers: getCenterIds() });
        }, 400);
        return () => clearTimeout(searchTimeout.current);
    }, [search]);

    useEffect(() => {
        if (!activePosition.id) return;
        fetchUsers({ positionId: activePosition.id, page: 1, search, centers: getCenterIds() });
    }, [form.center]);

    const loadMore = useCallback(() => {
        const state = employeesByPosition[activePosition.id];
        if (!state || state.loading || !state.hasMore) return;
        fetchUsers({ positionId: activePosition.id, page: state.page + 1, search, centers: getCenterIds(), append: true });
    }, [activePosition, employeesByPosition, search, form.center, fetchUsers]);

    const handlePositionChange = (role) => {
        setActivePosition({ id: role._id, name: role.name });
        setSearch("");
    };

    const toggleUser = (user) => {
        setSelectedUsers(prev => {
            const roleUsers = prev[activePosition.id] || [];
            const exists = roleUsers.some(u => u._id === user._id);
            return {
                ...prev,
                [activePosition.id]: exists
                    ? roleUsers.filter(u => u._id !== user._id)
                    : [...roleUsers, user],
            };
        });
    };

    const selectAllLoaded = () => {
        const loaded = employeesByPosition[activePosition.id]?.users || [];
        setSelectedUsers(prev => ({ ...prev, [activePosition.id]: loaded }));
    };

    const clearPositionSelection = () => {
        setSelectedUsers(prev => {
            const updated = { ...prev };
            delete updated[activePosition.id];
            return updated;
        });
    };

    const handleSubmit = async () => {
        if (!form.trainingName.trim()) return toast.error("Training name is required");
        if (!form.trainerName.trim()) return toast.error("Trainer name is required");
        if (!form.from || !form.to) return toast.error("From and To dates are required");
        if (!form.center.length) return toast.error("At least one center is required");

        const positionNameById = {
            ...savedPositionNames,
            ...Object.fromEntries(allPositions.map(p => [p._id, p.name])),
        };
        const attendanceData = Object.entries(selectedUsers)
            .filter(([, users]) => users.length > 0)
            .map(([positionId, users]) => ({
                position: positionId,
                positionName: positionNameById[positionId] || "",
                presents: users.map(u => ({ employee: u._id }))
            }));

        const payload = new FormData();
        payload.append("trainingName", form.trainingName);
        payload.append("trainerName", form.trainerName);
        payload.append("trainingDescription", form.trainingDescription);
        payload.append("from", new Date(form.from).toISOString());
        payload.append("to", new Date(form.to).toISOString());
        payload.append("center", JSON.stringify(form.center));
        payload.append("attendanceData", JSON.stringify(attendanceData));
        payload.append("removeFilePaths", JSON.stringify(removedPaths));
        newFiles.forEach(file => payload.append("files", file));

        try {
            setSubmitting(true);
            await editTrainerRecord(record._id, payload);

            let videoReady = true;
            if (savedVideo && (videoRemoved || newVideo)) {
                try {
                    await removeTrainerVideo(record._id, savedVideo._id);
                } catch (err) {
                    videoReady = false;
                    toast.error(err?.response?.data?.message || "The record was saved, but the old video could not be removed. Try again.");
                }
            }
            if (newVideo && videoReady) {
                enqueueTrainingUploads([{
                    file: newVideo.file,
                    kind: "video",
                    targetType: "trainerRecord",
                    recordId: record._id,
                    trainingName: `Trainer record: ${form.trainingName}`,
                    durationSec: newVideo.durationSec,
                }]);
            }

            toast.success(newVideo && videoReady ? "Trainer record updated. The video is uploading in the background." : "Trainer record updated successfully");
            onRefresh();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Update failed");
        } finally {
            setSubmitting(false);
        }
    };

    const activePositionState = employeesByPosition[activePosition.id] || { users: [], total: 0, hasMore: false, loading: false };
    const selectedInActivePosition = selectedUsers[activePosition.id] || [];
    const fakeRecord = { selectedUsers, center: form.center };
    const existingFiles = (record?.files || []).filter(f => !removedPaths.includes(f.path));
    const savedVideo = record?.videos?.[0] || null;

    return (
        <Modal isOpen={isOpen} toggle={onClose} size="xl" centered>
            <ModalHeader toggle={onClose}>Edit Trainer Record</ModalHeader>
            <ModalBody>
                <div className="row g-4">
                    <div className="col-lg-6">
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Training Name</label>
                            <input
                                className="form-control"
                                value={form.trainingName}
                                onChange={e => setForm(p => ({ ...p, trainingName: e.target.value }))}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Trainer Name</label>
                            <input
                                className="form-control"
                                value={form.trainerName}
                                onChange={e => setForm(p => ({ ...p, trainerName: e.target.value }))}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Description</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={form.trainingDescription}
                                onChange={e => setForm(p => ({ ...p, trainingDescription: e.target.value }))}
                            />
                        </div>
                        <div className="mb-3">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <label className="form-label fw-semibold small mb-0">Centers</label>
                                <button
                                    type="button"
                                    className="btn btn-link btn-sm p-0 text-primary"
                                    style={{ fontSize: 12 }}
                                    onClick={() => setForm(p => ({ ...p, center: centerOptions.map(c => c.value) }))}
                                >
                                    Select All
                                </button>
                            </div>
                            <Select
                                isMulti
                                options={centerOptions}
                                value={centerOptions.filter(c => form.center.includes(c.value))}
                                onChange={selected => {
                                    const newCenters = selected.map(s => s.value);
                                    const filteredUsers = {};
                                    Object.entries(selectedUsers).forEach(([role, users]) => {
                                        filteredUsers[role] = users.filter(u =>
                                            newCenters.includes(String(u.currentLocation))
                                        );
                                    });
                                    setSelectedUsers(filteredUsers);
                                    setForm(p => ({ ...p, center: newCenters }));
                                }}
                                placeholder="Select centers"
                            />
                        </div>
                        <div className="row">
                            <div className="col">
                                <label className="form-label fw-semibold small">From</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={form.from}
                                    onChange={e => {
                                        const newFrom = e.target.value;
                                        const fromDate = newFrom.slice(0, 10);
                                        const toDate = form.to ? form.to.slice(0, 10) : "";
                                        const toTime = form.to ? form.to.slice(11) : "";
                                        setForm(p => ({
                                            ...p,
                                            from: newFrom,
                                            to: fromDate !== toDate ? `${fromDate}T${toTime || "00:00"}` : p.to
                                        }));
                                    }}
                                />
                            </div>
                            <div className="col">
                                <label className="form-label fw-semibold small">To</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={form.to}
                                    min={form.from || undefined}
                                    max={form.from ? `${form.from.slice(0, 10)}T23:59` : undefined}
                                    onChange={e => {
                                        const selected = e.target.value;
                                        if (selected < form.from) return toast.error("Cannot set previous time");
                                        setForm(p => ({ ...p, to: selected }));
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <UserSelector
                            allPositions={allPositions}
                            activePosition={activePosition}
                            onPositionChange={handlePositionChange}
                            positionState={activePositionState}
                            selectedInActivePosition={selectedInActivePosition}
                            search={search}
                            onSearchChange={setSearch}
                            onToggleUser={toggleUser}
                            onSelectAll={selectAllLoaded}
                            onClearPosition={clearPositionSelection}
                            activeRecord={fakeRecord}
                            onLoadMore={loadMore}
                        />
                        <AttachmentPicker
                            existingFiles={existingFiles}
                            newFiles={newFiles}
                            onAddFiles={added => setNewFiles(prev => [...prev, ...added])}
                            onRemoveExisting={file => setRemovedPaths(prev => [...prev, file.path])}
                            onRemoveNew={i => setNewFiles(prev => prev.filter((_, idx) => idx !== i))}
                        />
                        <TrainerVideoInput
                            saved={savedVideo}
                            removed={videoRemoved}
                            pending={newVideo}
                            onPick={setNewVideo}
                            onClearPending={() => setNewVideo(null)}
                            onToggleRemove={() => setVideoRemoved(prev => !prev)}
                        />
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <Spinner size="sm" /> : "Save Changes"}
                </Button>
                <Button color="secondary" outline onClick={onClose}>Cancel</Button>
            </ModalFooter>
        </Modal>
    );
};

export default EditTrainerModal;