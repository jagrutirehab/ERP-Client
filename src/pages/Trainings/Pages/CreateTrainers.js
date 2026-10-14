// import { useCallback, useEffect, useRef, useState } from "react";
// import { Spinner } from "reactstrap";
// import { toast } from "react-toastify";
// import { getUsersByRoles, sopGetRoles, createTrainerRecord } from "../../../helpers/backend_helper";
// import { buildPayload, emptyRecord } from "../Helpers/Helper";
// import RecordTab from "../Components/RecordTab";
// import SessionForm from "../Components/SessionForm";
// import UserSelector from "../Components/UserSelector";
// import SelectedPanel from "../Components/SelectedPanel";
// import { usePermissions } from "../../../Components/Hooks/useRoles";

// const LIMIT = 10;

// const CreateTrainers = () => {
//     const raw = localStorage.getItem("authUser");
//     const user = JSON.parse(raw);

//     const [allRoles, setAllRoles] = useState([]);
//     const [usersByRole, setUsersByRole] = useState({});
//     const [submitting, setSubmitting] = useState(false);
//     const [activeRole, setActiveRole] = useState({ id: "", name: "" });
//     const [search, setSearch] = useState("");
//     const [records, setRecords] = useState([emptyRecord(user?.data?.name)]);
//     const [activeRecordIdx, setActiveRecordIdx] = useState(0);
//     const searchTimeout = useRef(null);

//     const token = JSON.parse(localStorage.getItem("user"))?.token
//     const { hasPermission } = usePermissions(token)
//     const hasWritePermission = hasPermission("TRAININGS", "CREATE_TRAINING_RECORD", "WRITE")
//     const hasDeletePermission = hasPermission("TRAININGS", "CREATE_TRAINING_RECORD", "DELETE")
//     const canEdit = hasWritePermission

//     const activeRecord = records[activeRecordIdx] || emptyRecord(user?.data?.name);
//     const getCenterIds = () => (activeRecord.center || []).join(",");

//     const fetchUsers = useCallback(async ({ roleName, page, search: searchTerm, centers, append = false }) => {
//         if (!roleName) return;
//         setUsersByRole((prev) => ({
//             ...prev,
//             [roleName]: { ...(prev[roleName] || {}), loading: true },
//         }));
//         try {
//             const response = await getUsersByRoles({
//                 role: roleName,
//                 search: searchTerm,
//                 page,
//                 limit: LIMIT,
//                 ...(centers && { centers }),
//             });
//             const newUsers = response?.users || [];
//             const total = response?.total || 0;
//             setUsersByRole((prev) => ({
//                 ...prev,
//                 [roleName]: {
//                     users: append ? [...(prev[roleName]?.users || []), ...newUsers] : newUsers,
//                     page,
//                     total,
//                     hasMore: newUsers.length === LIMIT,
//                     loading: false,
//                 },
//             }));
//         } catch (err) {
//             console.error("Users fetch failed", err);
//             setUsersByRole((prev) => ({ ...prev, [roleName]: { ...(prev[roleName] || {}), loading: false } }));
//         }
//     }, []);

//     const loadMore = useCallback(() => {
//         const state = usersByRole[activeRole.name];
//         if (!state || state.loading || !state.hasMore) return;
//         fetchUsers({ roleName: activeRole.name, page: state.page + 1, search, centers: getCenterIds(), append: true });
//     }, [activeRole, usersByRole, search, activeRecord.center, fetchUsers]);

//     const getRoles = async () => {
//         try {
//             const response = await sopGetRoles();
//             if (response?.data?.length) {
//                 setAllRoles(response.data);
//                 setActiveRole({ id: response.data[0]._id, name: response.data[0].name });
//             }
//         } catch (err) {
//             console.error("Roles fetch failed", err);
//         }
//     };

//     useEffect(() => { getRoles(); }, []);

//     useEffect(() => {
//         if (!activeRole.id) return;
//         fetchUsers({ roleName: activeRole.name, page: 1, search: "", centers: getCenterIds(), append: false });
//     }, [activeRole.id]);

//     useEffect(() => {
//         if (!activeRole.id) return;
//         clearTimeout(searchTimeout.current);
//         searchTimeout.current = setTimeout(() => {
//             fetchUsers({ roleName: activeRole.name, page: 1, search, centers: getCenterIds(), append: false });
//         }, 400);
//         return () => clearTimeout(searchTimeout.current);
//     }, [search]);

//     useEffect(() => {
//         if (!activeRole.id) return;
//         fetchUsers({ roleName: activeRole.name, page: 1, search, centers: getCenterIds(), append: false });
//     }, [activeRecord.center]);

//     const handleRoleChange = (role) => {
//         setActiveRole({ id: role._id, name: role.name });
//         setSearch("");
//     };

//     const updateRecord = (idx, field, value) => {
//         setRecords(prev => prev.map((r, i) => {
//             if (i !== idx) return r
//             if (field !== 'center') return { ...r, [field]: value }

//             const newCenters = value
//             const filteredUsers = {}
//             Object.entries(r.selectedUsers).forEach(([role, users]) => {
//                 filteredUsers[role] = users.filter(u =>
//                     (u.centerAccess || []).some(c => newCenters.includes(c.toString()))
//                 )
//             })

//             return { ...r, center: newCenters, selectedUsers: filteredUsers }
//         }))
//     }

//     const addRecord = () => {
//         setRecords((prev) => [...prev, emptyRecord(user?.data?.name)]);
//         setActiveRecordIdx(records.length);
//     };

//     const removeRecord = (idx) => {
//         setRecords((prev) => prev.filter((_, i) => i !== idx));
//         setActiveRecordIdx((prev) => (prev >= idx && prev > 0 ? prev - 1 : 0));
//     };

//     const toggleUser = (employee) => {
//         setRecords((prev) =>
//             prev.map((record, i) => {
//                 if (i !== activeRecordIdx) return record;
//                 const roleUsers = record.selectedUsers[activeRole.name] || [];
//                 const exists = roleUsers.some((u) => u._id === employee._id);
//                 return {
//                     ...record,
//                     selectedUsers: {
//                         ...record.selectedUsers,
//                         [activeRole.name]: exists
//                             ? roleUsers.filter((u) => u._id !== employee._id)
//                             : [...roleUsers, employee],
//                     },
//                 };
//             })
//         );
//     };

//     const removeSelectedUser = (role, userId) =>
//         setRecords((prev) =>
//             prev.map((record, i) => {
//                 if (i !== activeRecordIdx) return record;
//                 return {
//                     ...record,
//                     selectedUsers: {
//                         ...record.selectedUsers,
//                         [role]: (record.selectedUsers[role] || []).filter((u) => u._id !== userId),
//                     },
//                 };
//             })
//         );

//     const selectAllLoaded = () => {
//         const loaded = usersByRole[activeRole.name]?.users || [];
//         setRecords((prev) =>
//             prev.map((record, i) => {
//                 if (i !== activeRecordIdx) return record;
//                 return { ...record, selectedUsers: { ...record.selectedUsers, [activeRole.name]: loaded } };
//             })
//         );
//     };

//     const clearRoleSelection = () =>
//         setRecords((prev) =>
//             prev.map((record, i) => {
//                 if (i !== activeRecordIdx) return record;
//                 const updated = { ...record.selectedUsers };
//                 delete updated[activeRole.name];
//                 return { ...record, selectedUsers: updated };
//             })
//         );

//     const handleSubmit = async () => {
//         for (let i = 0; i < records.length; i++) {
//             if (!records[i].trainingName.trim()) {
//                 toast.error(`Record ${i + 1}: Training name is required`);
//                 setActiveRecordIdx(i);
//                 return;
//             }
//             if (!records[i].trainerName.trim()) {
//                 toast.error(`Record ${i + 1}: Trainer name is required`);
//                 setActiveRecordIdx(i);
//                 return;
//             }
//             if (!records[i].trainingDescription.trim()) {
//                 toast.error(`Record ${i + 1}: Description is required`);
//                 setActiveRecordIdx(i);
//                 return;
//             }
//             if (!records[i].center?.length) {
//                 toast.error(`Record ${i + 1}: At least one center is required`);
//                 setActiveRecordIdx(i);
//                 return;
//             }
//             if (!records[i].from) {
//                 toast.error(`Record ${i + 1}: From date is required`);
//                 setActiveRecordIdx(i);
//                 return;
//             }
//             if (!records[i].to) {
//                 toast.error(`Record ${i + 1}: To date is required`);
//                 setActiveRecordIdx(i);
//                 return;
//             }
//         }
//         const payload = buildPayload(records);
//         setSubmitting(true);
//         try {
//             await createTrainerRecord(payload.length === 1 ? payload[0] : payload);
//             toast.success(`${payload.length} trainer record(s) saved successfully!`);
//             setRecords([emptyRecord(user?.data?.name)]);
//             setActiveRecordIdx(0);
//         } catch (err) {
//             console.log("err", err);

//             toast.error(err?.response?.data?.error || "Submission failed. Try again.");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const activeRoleState = usersByRole[activeRole.name] || { users: [], total: 0, hasMore: false, loading: false };
//     const selectedInActiveRole = activeRecord.selectedUsers[activeRole.name] || [];

//     const isFormValid = records.every((r) =>
//         r.trainingName.trim() &&
//         r.trainerName.trim() &&
//         r.trainingDescription.trim() &&
//         r.center?.length > 0 &&
//         r.from &&
//         r.to
//     );

//     return (
//         <div className="page-content" style={{ maxHeight: "100vh", overflowY: "auto" }}>
//             <div className="container-fluid">
//                 <div className="row mb-3">
//                     <div className="col">
//                         <div className="d-flex align-items-center justify-content-between">
//                             <div>
//                                 <h4 className="mb-1 fw-semibold">Create Trainer Records</h4>
//                                 <p className="text-muted mb-0" style={{ fontSize: 13 }}>
//                                     Assign trainers, centers, and attendance for multiple sessions
//                                 </p>
//                             </div>
//                             <button
//                                 className="btn btn-soft-primary btn-sm d-flex align-items-center gap-2"
//                                 onClick={addRecord}
//                             >
//                                 <i className="ri-add-line" />
//                                 Add Record
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="d-flex align-items-end flex-wrap" style={{ borderBottom: "1px solid #e2e8f0" }}>
//                     {records.map((record, idx) => (
//                         <RecordTab
//                             key={record._uid}
//                             record={record}
//                             index={idx}
//                             isActive={idx === activeRecordIdx}
//                             total={records.length}
//                             onClick={() => setActiveRecordIdx(idx)}
//                             onRemove={() => removeRecord(idx)}
//                         />
//                     ))}
//                 </div>

//                 <div className="card border-top-0 rounded-top-0 shadow-sm mb-3">
//                     <div className="card-body" style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
//                         <div className="row g-4">
//                             <div className="col-lg-7">
//                                 <SessionForm
//                                     record={activeRecord}
//                                     recordIdx={activeRecordIdx}
//                                     onUpdate={updateRecord}
//                                 />
//                                 <UserSelector
//                                     allRoles={allRoles}
//                                     activeRole={activeRole}
//                                     onRoleChange={handleRoleChange}
//                                     roleState={activeRoleState}
//                                     selectedInActiveRole={selectedInActiveRole}
//                                     search={search}
//                                     onSearchChange={setSearch}
//                                     onToggleUser={toggleUser}
//                                     onSelectAll={selectAllLoaded}
//                                     onClearRole={clearRoleSelection}
//                                     activeRecord={activeRecord}
//                                     onLoadMore={loadMore}
//                                 />
//                             </div>
//                             <div className="col-lg-5">
//                                 <SelectedPanel
//                                     activeRecord={activeRecord}
//                                     records={records}
//                                     activeRecordIdx={activeRecordIdx}
//                                     onRemoveUser={removeSelectedUser}
//                                     onSwitchRecord={setActiveRecordIdx}
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="card-footer bg-transparent d-flex align-items-center justify-content-between">
//                         <p className="text-muted mb-0" style={{ fontSize: 12 }}>
//                             {records.length} record(s) ready to submit
//                         </p>
//                         {canEdit && <div className="d-flex gap-2">
//                             <button
//                                 className="btn btn-light btn-sm"
//                                 onClick={() => { setRecords([emptyRecord(user?.data?.name)]); setActiveRecordIdx(0); }}
//                                 disabled={submitting}
//                             >
//                                 Reset All
//                             </button>
//                             <button
//                                 className="btn btn-primary btn-sm d-flex align-items-center gap-2"
//                                 onClick={handleSubmit}
//                                 disabled={submitting || !isFormValid}
//                             >
//                                 {submitting ? (
//                                     <><Spinner size="sm" /> Saving...</>
//                                 ) : (
//                                     <><i className="ri-save-line" /> Submit {records.length > 1 ? `(${records.length} Records)` : ""}</>
//                                 )}
//                             </button>
//                         </div>}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CreateTrainers;

import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { getEmployeesByPosition, createTrainerRecord, getPositions } from "../../../helpers/backend_helper";
import { buildCreateFormData, emptyRecord, flattenPositions } from "../Helpers/Helper";
import RecordTab from "../Components/RecordTab";
import SessionForm from "../Components/SessionForm";
import UserSelector from "../Components/UserSelector";
import SelectedPanel from "../Components/SelectedPanel";
import AttachmentPicker from "../Components/AttachmentPicker";
import TrainerVideoInput from "../Components/TrainerVideoInput";
import { enqueueTrainingUploads } from "../../../helpers/trainingUploader";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const LIMIT = 10;

const CreateTrainers = () => {
    const raw = localStorage.getItem("authUser");
    const user = JSON.parse(raw);

    const [allPositions, setAllPositions] = useState([]);
    const [employeesByPosition, setEmployeesByPosition] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [activePosition, setActivePosition] = useState({ id: "", name: "" });
    const [search, setSearch] = useState("");
    const [records, setRecords] = useState([emptyRecord(user?.data?.name)]);
    const [activeRecordIdx, setActiveRecordIdx] = useState(0);
    const searchTimeout = useRef(null);

    const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
    const { hasPermission } = usePermissions(token);
    const hasWritePermission = hasPermission("TRAININGS", "CREATE_TRAINING_RECORD", "WRITE");
    const canEdit = hasWritePermission;

    const activeRecord = records[activeRecordIdx] || emptyRecord(user?.data?.name);
    const getCenterIds = () => (activeRecord.center || []).join(",");

    const fetchUsers = useCallback(async ({ positionId, page, search: searchTerm, centers, append = false }) => {
        if (!positionId) return;
        setEmployeesByPosition((prev) => ({
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
            setEmployeesByPosition((prev) => ({
                ...prev,
                [positionId]: {
                    users: append ? [...(prev[positionId]?.users || []), ...newUsers] : newUsers,
                    page,
                    total,
                    hasMore: !!response?.hasMore,
                    loading: false,
                },
            }));
        } catch (err) {
            console.error("Users fetch failed", err);
            setEmployeesByPosition((prev) => ({ ...prev, [positionId]: { ...(prev[positionId] || {}), loading: false } }));
        }
    }, []);

    const loadMore = useCallback(() => {
        const state = employeesByPosition[activePosition.id];
        if (!state || state.loading || !state.hasMore) return;
        fetchUsers({ positionId: activePosition.id, page: state.page + 1, search, centers: getCenterIds(), append: true });
    }, [activePosition, employeesByPosition, search, activeRecord.center, fetchUsers]);

    const loadPositions = async () => {
        try {
            const response = await getPositions();
            const positions = flattenPositions(response?.data);
            if (positions.length) {
                setAllPositions(positions);
                setActivePosition({ id: positions[0]._id, name: positions[0].name });
            }
        } catch (err) {
            console.error("Positions fetch failed", err);
        }
    };

    useEffect(() => { loadPositions(); }, []);

    useEffect(() => {
        if (!activePosition.id) return;
        fetchUsers({ positionId: activePosition.id, page: 1, search: "", centers: getCenterIds(), append: false });
    }, [activePosition.id]);

    useEffect(() => {
        if (!activePosition.id) return;
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchUsers({ positionId: activePosition.id, page: 1, search, centers: getCenterIds(), append: false });
        }, 400);
        return () => clearTimeout(searchTimeout.current);
    }, [search]);

    useEffect(() => {
        if (!activePosition.id) return;
        fetchUsers({ positionId: activePosition.id, page: 1, search, centers: getCenterIds(), append: false });
    }, [activeRecord.center]);

    const handlePositionChange = (role) => {
        setActivePosition({ id: role._id, name: role.name });
        setSearch("");
    };

    const updateRecord = (idx, field, value) => {
        setRecords(prev => prev.map((r, i) => {
            if (i !== idx) return r;
            if (field !== "center") return { ...r, [field]: value };
            const newCenters = value;
            const filteredUsers = {};
            Object.entries(r.selectedUsers).forEach(([role, users]) => {
                filteredUsers[role] = users.filter(u =>
                    newCenters.includes(String(u.currentLocation))
                );
            });
            return { ...r, center: newCenters, selectedUsers: filteredUsers };
        }));
    };

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
                const positionEmployees = record.selectedUsers[activePosition.id] || [];
                const exists = positionEmployees.some((u) => u._id === employee._id);
                return {
                    ...record,
                    selectedUsers: {
                        ...record.selectedUsers,
                        [activePosition.id]: exists
                            ? positionEmployees.filter((u) => u._id !== employee._id)
                            : [...positionEmployees, employee],
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
        const loaded = employeesByPosition[activePosition.id]?.users || [];
        setRecords((prev) =>
            prev.map((record, i) => {
                if (i !== activeRecordIdx) return record;
                return { ...record, selectedUsers: { ...record.selectedUsers, [activePosition.id]: loaded } };
            })
        );
    };

    const clearPositionSelection = () =>
        setRecords((prev) =>
            prev.map((record, i) => {
                if (i !== activeRecordIdx) return record;
                const updated = { ...record.selectedUsers };
                delete updated[activePosition.id];
                return { ...record, selectedUsers: updated };
            })
        );

    const handleSubmit = async () => {
        for (let i = 0; i < records.length; i++) {
            if (!records[i].trainingName.trim()) { toast.error(`Record ${i + 1}: Training name is required`); setActiveRecordIdx(i); return; }
            if (!records[i].trainerName.trim()) { toast.error(`Record ${i + 1}: Trainer name is required`); setActiveRecordIdx(i); return; }
            if (!records[i].trainingDescription.trim()) { toast.error(`Record ${i + 1}: Description is required`); setActiveRecordIdx(i); return; }
            if (!records[i].center?.length) { toast.error(`Record ${i + 1}: At least one center is required`); setActiveRecordIdx(i); return; }
            if (!records[i].from) { toast.error(`Record ${i + 1}: From date is required`); setActiveRecordIdx(i); return; }
            if (!records[i].to) { toast.error(`Record ${i + 1}: To date is required`); setActiveRecordIdx(i); return; }
        }
        const positionNameById = Object.fromEntries(allPositions.map((p) => [p._id, p.name]));
        const formData = buildCreateFormData(records, positionNameById);
        setSubmitting(true);
        try {
            const response = await createTrainerRecord(formData);
            const saved = Array.isArray(response?.data) ? response.data : response?.data ? [response.data] : [];
            const withVideo = records
                .map((record, index) => ({ record, saved: saved[index] }))
                .filter(({ record }) => record.video);

            if (withVideo.length && saved.length !== records.length) {
                toast.warning(`${records.length} trainer record(s) saved, but the videos could not be matched to their records. Add them from Edit.`);
            } else {
                toast.success(
                    withVideo.length
                        ? `${records.length} trainer record(s) saved. ${withVideo.length} video(s) uploading in the background.`
                        : `${records.length} trainer record(s) saved successfully!`
                );
                enqueueTrainingUploads(
                    withVideo.map(({ record, saved: savedRecord }) => ({
                        file: record.video.file,
                        kind: "video",
                        targetType: "trainerRecord",
                        recordId: savedRecord._id,
                        trainingName: `Trainer record: ${record.trainingName}`,
                        durationSec: record.video.durationSec,
                    }))
                );
            }
            setRecords([emptyRecord(user?.data?.name)]);
            setActiveRecordIdx(0);
        } catch (err) {
            toast.error(err?.response?.data?.error || "Submission failed. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const activePositionState = employeesByPosition[activePosition.id] || { users: [], total: 0, hasMore: false, loading: false };
    const selectedInActivePosition = activeRecord.selectedUsers[activePosition.id] || [];

    const isFormValid = records.every((r) =>
        r.trainingName.trim() &&
        r.trainerName.trim() &&
        r.trainingDescription.trim() &&
        r.center?.length > 0 &&
        r.from &&
        r.to
    );

    return (
        <div className="page-content" style={{ maxHeight: "100vh", overflowY: "auto" }}>
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
                            <button className="btn btn-soft-primary btn-sm d-flex align-items-center gap-2" onClick={addRecord}>
                                <i className="ri-add-line" />
                                Add Record
                            </button>
                        </div>
                    </div>
                </div>

                <div className="d-flex align-items-end flex-wrap" style={{ borderBottom: "1px solid #e2e8f0" }}>
                    {records.map((record, idx) => (
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
                    <div className="card-body" style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
                        <div className="row g-4">
                            <div className="col-lg-7">
                                <SessionForm record={activeRecord} recordIdx={activeRecordIdx} onUpdate={updateRecord} />
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
                                    positionNames={Object.fromEntries(allPositions.map((p) => [p._id, p.name]))}
                                />
                                <AttachmentPicker
                                    newFiles={activeRecord.files || []}
                                    onAddFiles={(added) => updateRecord(activeRecordIdx, "files", [...(activeRecord.files || []), ...added])}
                                    onRemoveNew={(i) => updateRecord(activeRecordIdx, "files", (activeRecord.files || []).filter((_, idx) => idx !== i))}
                                />
                                <TrainerVideoInput
                                    pending={activeRecord.video}
                                    onPick={(video) => updateRecord(activeRecordIdx, "video", video)}
                                    onClearPending={() => updateRecord(activeRecordIdx, "video", null)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-footer bg-transparent d-flex align-items-center justify-content-between">
                        <p className="text-muted mb-0" style={{ fontSize: 12 }}>{records.length} record(s) ready to submit</p>
                        {canEdit && (
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
                                    disabled={submitting || !isFormValid}
                                >
                                    {submitting ? (
                                        <><Spinner size="sm" /> Saving...</>
                                    ) : (
                                        <><i className="ri-save-line" /> Submit {records.length > 1 ? `(${records.length} Records)` : ""}</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTrainers;