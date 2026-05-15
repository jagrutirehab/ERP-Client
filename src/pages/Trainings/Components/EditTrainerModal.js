import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Select from "react-select";
import { getUsersByRoles, sopGetRoles, editTrainerRecord } from "../../../helpers/backend_helper";
import UserSelector from "./UserSelector";

const LIMIT = 10;

const toLocalDatetime = (dateStr) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    const offset = d.getTimezoneOffset() * 60000
    return new Date(d - offset).toISOString().slice(0, 16)
}

const EditTrainerModal = ({ isOpen, onClose, record, onRefresh }) => {
    const user = useSelector(state => state.User)
    const [allRoles, setAllRoles] = useState([]);
    const [usersByRole, setUsersByRole] = useState({});
    const [activeRole, setActiveRole] = useState({ id: "", name: "" });
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
    })

    const [selectedUsers, setSelectedUsers] = useState({})


    const centerOptions = user?.centerAccess?.map(cid => {
        const center = user?.userCenters?.find(c => c._id === cid)
        return { value: cid, label: center?.title || "Unknown Center" }
    }) || []

    const getCenterIds = () => form.center.join(",")

    useEffect(() => {
        if (!isOpen || !record) return

        setForm({
            trainingName: record.trainingName || "",
            trainerName: record.trainerName || "",
            trainingDescription: record.trainingDescription || "",
            from: toLocalDatetime(record.from),
            to: toLocalDatetime(record.to),
            center: record.center?.map(c => c._id || c) || []
        })

        const preSelected = {}
        record.attendanceData?.forEach(entry => {
            if (entry.role) {
                preSelected[entry.role] = entry.presents?.map(p => p.user).filter(Boolean) || []
            }
        })
        setSelectedUsers(preSelected)
    }, [isOpen, record])

    const fetchUsers = useCallback(async ({ roleName, page, search: searchTerm, centers, append = false }) => {
        if (!roleName) return;
        setUsersByRole(prev => ({
            ...prev,
            [roleName]: { ...(prev[roleName] || {}), loading: true },
        }));
        try {
            const response = await getUsersByRoles({
                role: roleName,
                search: searchTerm,
                page,
                limit: LIMIT,
                ...(centers && { centers }),
            });
            const newUsers = response?.users || [];
            const total = response?.total || 0;
            setUsersByRole(prev => ({
                ...prev,
                [roleName]: {
                    users: append ? [...(prev[roleName]?.users || []), ...newUsers] : newUsers,
                    page,
                    total,
                    hasMore: newUsers.length === LIMIT,
                    loading: false,
                },
            }));
        } catch {
            setUsersByRole(prev => ({ ...prev, [roleName]: { ...(prev[roleName] || {}), loading: false } }));
        }
    }, []);

    const getRoles = async () => {
        try {
            const response = await sopGetRoles();
            if (response?.data?.length) {
                setAllRoles(response.data);
                const first = response.data[0]
                setActiveRole({ id: first._id, name: first.name });
            }
        } catch { }
    };

    useEffect(() => { if (isOpen) getRoles(); }, [isOpen]);

    useEffect(() => {
        if (!activeRole.id) return;
        fetchUsers({ roleName: activeRole.name, page: 1, search: "", centers: getCenterIds() });
    }, [activeRole.id]);

    useEffect(() => {
        if (!activeRole.id) return;
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchUsers({ roleName: activeRole.name, page: 1, search, centers: getCenterIds() });
        }, 400);
        return () => clearTimeout(searchTimeout.current);
    }, [search]);

    useEffect(() => {
        if (!activeRole.id) return;
        fetchUsers({ roleName: activeRole.name, page: 1, search, centers: getCenterIds() });
    }, [form.center]);

    const loadMore = useCallback(() => {
        const state = usersByRole[activeRole.name];
        if (!state || state.loading || !state.hasMore) return;
        fetchUsers({ roleName: activeRole.name, page: state.page + 1, search, centers: getCenterIds(), append: true });
    }, [activeRole, usersByRole, search, form.center, fetchUsers]);

    const handleRoleChange = (role) => {
        setActiveRole({ id: role._id, name: role.name });
        setSearch("");
    };

    const toggleUser = (user) => {
        setSelectedUsers(prev => {
            const roleUsers = prev[activeRole.name] || [];
            const exists = roleUsers.some(u => u._id === user._id);
            return {
                ...prev,
                [activeRole.name]: exists
                    ? roleUsers.filter(u => u._id !== user._id)
                    : [...roleUsers, user],
            };
        });
    };

    const selectAllLoaded = () => {
        const loaded = usersByRole[activeRole.name]?.users || [];
        setSelectedUsers(prev => ({ ...prev, [activeRole.name]: loaded }));
    };

    const clearRoleSelection = () => {
        setSelectedUsers(prev => {
            const updated = { ...prev };
            delete updated[activeRole.name];
            return updated;
        });
    };

    const handleSubmit = async () => {
        if (!form.trainingName.trim()) return toast.error("Training name is required");
        if (!form.trainerName.trim()) return toast.error("Trainer name is required");
        if (!form.from || !form.to) return toast.error("From and To dates are required");
        if (!form.center.length) return toast.error("At least one center is required");

        const attendanceData = Object.entries(selectedUsers)
            .filter(([, users]) => users.length > 0)
            .map(([role, users]) => ({
                role,
                presents: users.map(u => ({ user: u._id }))
            }));

        const payload = { ...form, attendanceData };

        try {
            setSubmitting(true);
            await editTrainerRecord(record._id, payload);
            toast.success("Trainer record updated successfully");
            onRefresh();
            onClose();
        } catch (err) {
            console.log("error", err);

            toast.error(err?.response?.data?.message || "Update failed");
        } finally {
            setSubmitting(false);
        }
    };

    const activeRoleState = usersByRole[activeRole.name] || { users: [], total: 0, hasMore: false, loading: false };
    const selectedInActiveRole = selectedUsers[activeRole.name] || [];
    const fakeRecord = { selectedUsers, center: form.center }




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
                                    const newCenters = selected.map(s => s.value)
                                    const filteredUsers = {}
                                    Object.entries(selectedUsers).forEach(([role, users]) => {
                                        filteredUsers[role] = users.filter(u =>
                                            (u.centerAccess || []).some(c => newCenters.includes(c.toString()))
                                        )
                                    })
                                    setSelectedUsers(filteredUsers)
                                    setForm(p => ({ ...p, center: newCenters }))
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
                                        const newFrom = e.target.value
                                        const fromDate = newFrom.slice(0, 10)
                                        const toDate = form.to ? form.to.slice(0, 10) : ""
                                        const toTime = form.to ? form.to.slice(11) : ""
                                        setForm(p => ({
                                            ...p,
                                            from: newFrom,
                                            to: fromDate !== toDate ? `${fromDate}T${toTime || "00:00"}` : p.to
                                        }))
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
                                        const selected = e.target.value
                                        if (selected < form.from) return toast.error("Cannot set previous time")
                                        setForm(p => ({ ...p, to: selected }))
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <UserSelector
                            allRoles={allRoles}
                            activeRole={activeRole}
                            onRoleChange={handleRoleChange}
                            roleState={activeRoleState}
                            selectedInActiveRole={selectedInActiveRole}
                            search={search}
                            onSearchChange={setSearch}
                            onToggleUser={toggleUser}
                            onSelectAll={selectAllLoaded}
                            onClearRole={clearRoleSelection}
                            activeRecord={fakeRecord}
                            onLoadMore={loadMore}
                        />
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <Spinner size="sm" /> : 'Save Changes'}
                </Button>
                <Button color="secondary" outline onClick={onClose}>Cancel</Button>
            </ModalFooter>
        </Modal>
    );
};

export default EditTrainerModal;