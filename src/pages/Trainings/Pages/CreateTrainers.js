import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { getUsersByRoles, sopGetRoles, createTrainerRecord } from "../../../helpers/backend_helper";
import { buildPayload, emptyRecord } from "../Helpers/Helper";
import RecordTab from "../Components/RecordTab";
import SessionForm from "../Components/SessionForm";
import UserSelector from "../Components/UserSelector";
import SelectedPanel from "../Components/SelectedPanel";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const LIMIT = 10;

const CreateTrainers = () => {
    const raw = localStorage.getItem("authUser");
    const user = JSON.parse(raw);


    const [allRoles, setAllRoles] = useState([]);
    const [usersByRole, setUsersByRole] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [activeRole, setActiveRole] = useState("");
    const [search, setSearch] = useState("");
    const [records, setRecords] = useState([emptyRecord(user?.data?.name)]);
    const [activeRecordIdx, setActiveRecordIdx] = useState(0);
    const searchTimeout = useRef(null);

    const token = JSON.parse(localStorage.getItem("user"))?.token;
    const { hasPermission } = usePermissions(token);
    const hasUserPermission = hasPermission("TRAININGS", "CREATE_TRAINING_RECORD", "READ");
    const hasWritePermission = hasPermission("TRAININGS", "CREATE_TRAINING_RECORD", "WRITE");
    const hasDeletePermission = hasPermission("TRAININGS", "CREATE_TRAINING_RECORD", "DELETE");
    const canAdd = hasWritePermission || hasDeletePermission;

    const fetchUsers = useCallback(async ({ role, page, search: searchTerm, append = false }) => {
        setUsersByRole((prev) => ({
            ...prev,
            [role]: { ...(prev[role] || {}), loading: true },
        }));
        try {
            const response = await getUsersByRoles({ role, search: searchTerm, page, limit: LIMIT });
            const newUsers = response?.users || [];
            const total = response?.total || 0;
            setUsersByRole((prev) => ({
                ...prev,
                [role]: {
                    users: append ? [...(prev[role]?.users || []), ...newUsers] : newUsers,
                    page,
                    total,
                    hasMore: newUsers.length === LIMIT,
                    loading: false,
                },
            }));
        } catch (err) {
            console.error("Users fetch failed", err);
            setUsersByRole((prev) => ({ ...prev, [role]: { ...(prev[role] || {}), loading: false } }));
        }
    }, []);

    const loadMore = useCallback(() => {
        const state = usersByRole[activeRole];
        if (!state || state.loading || !state.hasMore) return;
        fetchUsers({ role: activeRole, page: state.page + 1, search, append: true });
    }, [activeRole, usersByRole, search, fetchUsers]);

    const getRoles = async () => {
        try {
            const response = await sopGetRoles();
            if (response?.data?.length) {
                setAllRoles(response.data);
                setActiveRole(response.data[0].name);
            }
        } catch (err) {
            console.error("Roles fetch failed", err);
        }
    };

    useEffect(() => { getRoles(); }, []);

    useEffect(() => {
        if (!activeRole) return;
        if (!usersByRole[activeRole] && !search) {
            fetchUsers({ role: activeRole, page: 1, search: "" });
        }
    }, [activeRole]);

    useEffect(() => {
        if (!activeRole) return;
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchUsers({ role: activeRole, page: 1, search, append: false });
        }, 400);
        return () => clearTimeout(searchTimeout.current);
    }, [search, activeRole]);

    const handleRoleChange = (roleName) => {
        setActiveRole(roleName);
        setSearch("");
    };

    const updateRecord = (idx, field, value) =>
        setRecords((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));

    const addRecord = () => {
        setRecords((prev) => [...prev, emptyRecord(user?.data?.name)]);
        setActiveRecordIdx(records.length);
    };

    const removeRecord = (idx) => {
        setRecords((prev) => prev.filter((_, i) => i !== idx));
        setActiveRecordIdx((prev) => (prev >= idx && prev > 0 ? prev - 1 : 0));
    };

    const toggleUser = (employee) => {
        setRecords((prev) =>
            prev.map((record, i) => {
                if (i !== activeRecordIdx) return record;
                const roleUsers = record.selectedUsers[activeRole] || [];
                const exists = roleUsers.some((u) => u._id === employee._id);
                return {
                    ...record,
                    selectedUsers: {
                        ...record.selectedUsers,
                        [activeRole]: exists
                            ? roleUsers.filter((u) => u._id !== employee._id)
                            : [...roleUsers, employee],
                    },
                };
            })
        );
    };

    const removeSelectedUser = (role, userId) =>
        setRecords((prev) =>
            prev.map((record, i) => {
                if (i !== activeRecordIdx) return record;
                return {
                    ...record,
                    selectedUsers: {
                        ...record.selectedUsers,
                        [role]: (record.selectedUsers[role] || []).filter((u) => u._id !== userId),
                    },
                };
            })
        );

    const selectAllLoaded = () => {
        const loaded = usersByRole[activeRole]?.users || [];
        setRecords((prev) =>
            prev.map((record, i) => {
                if (i !== activeRecordIdx) return record;
                return { ...record, selectedUsers: { ...record.selectedUsers, [activeRole]: loaded } };
            })
        );
    };

    const clearRoleSelection = () =>
        setRecords((prev) =>
            prev.map((record, i) => {
                if (i !== activeRecordIdx) return record;
                const updated = { ...record.selectedUsers };
                delete updated[activeRole];
                return { ...record, selectedUsers: updated };
            })
        );

    const handleSubmit = async () => {
        for (let i = 0; i < records.length; i++) {
            if (!records[i].trainingName.trim()) {
                toast.error(`Record ${i + 1}: Training name is required`);
                setActiveRecordIdx(i);
                return;
            }
            if (!records[i].trainerName.trim()) {
                toast.error(`Record ${i + 1}: Trainer name is required`);
                setActiveRecordIdx(i);
                return;
            }
        }

        const payload = buildPayload(records);
        setSubmitting(true);
        try {
            await createTrainerRecord(payload.length === 1 ? payload[0] : payload);
            toast.success(`${payload.length} trainer record(s) saved successfully!`);
            setRecords([emptyRecord(user?.data?.name)]);
            setActiveRecordIdx(0);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Submission failed. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const activeRecord = records[activeRecordIdx] || emptyRecord(user?.data?.name);
    const activeRoleState = usersByRole[activeRole] || { users: [], total: 0, hasMore: false, loading: false };
    const selectedInActiveRole = activeRecord.selectedUsers[activeRole] || [];

    return (
        <div className="page-content">
            <div className="container-fluid">
                <div className="row mb-3">
                    <div className="col">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h4 className="mb-1 fw-semibold">Create Trainer Records</h4>
                                <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                                    Assign trainers, centers, and attendance for multiple sessions
                                </p>
                            </div>
                            <button
                                className="btn btn-soft-primary btn-sm d-flex align-items-center gap-2"
                                onClick={addRecord}
                            >
                                <i className="ri-add-line" />
                                Add Record
                            </button>
                        </div>
                    </div>
                </div>

                <div className="d-flex align-items-end flex-wrap" style={{ borderBottom: "1px solid #e2e8f0" }}>
                    {records?.map((record, idx) => (
                        <RecordTab
                            key={record._uid}
                            record={record}
                            index={idx}
                            isActive={idx === activeRecordIdx}
                            total={records.length}
                            onClick={() => setActiveRecordIdx(idx)}
                            onRemove={() => removeRecord(idx)}
                        />
                    ))}
                </div>

                <div className="card border-top-0 rounded-top-0 shadow-sm mb-3">
                    <div className="card-body">
                        <div className="row g-4">
                            <div className="col-lg-7">
                                <SessionForm
                                    record={activeRecord}
                                    recordIdx={activeRecordIdx}
                                    onUpdate={updateRecord}
                                />
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
                                    activeRecord={activeRecord}
                                    onLoadMore={loadMore}
                                />
                            </div>
                            <div className="col-lg-5">
                                <SelectedPanel
                                    activeRecord={activeRecord}
                                    records={records}
                                    activeRecordIdx={activeRecordIdx}
                                    onRemoveUser={removeSelectedUser}
                                    onSwitchRecord={setActiveRecordIdx}
                                />
                            </div>
                        </div>
                    </div>

                    {canAdd && <div className="card-footer bg-transparent d-flex align-items-center justify-content-between">
                        <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                            {records.length} record(s) ready to submit
                        </p>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-light btn-sm"
                                onClick={() => { setRecords([emptyRecord(user?.data?.name)]); setActiveRecordIdx(0); }}
                                disabled={submitting}
                            >
                                Reset All
                            </button>
                            <button
                                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <><Spinner size="sm" /> Saving...</>
                                ) : (
                                    <><i className="ri-save-line" /> Submit {records.length > 1 ? `(${records.length} Records)` : ""}</>
                                )}
                            </button>
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default CreateTrainers;