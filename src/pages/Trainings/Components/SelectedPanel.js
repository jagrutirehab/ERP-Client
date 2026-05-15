const SelectedBadge = ({ user, role, onRemove }) => (
    <span
        className="badge d-inline-flex align-items-center gap-1 me-1 mb-1 px-2 py-1"
        style={{ background: "var(--vz-primary)", fontSize: 11, borderRadius: 20, fontWeight: 500 }}
    >
        {user.name}
        <button
            type="button"
            className="btn-close btn-close-white"
            style={{ fontSize: 8, lineHeight: 1 }}
            onClick={() => onRemove(role, user._id)}
        />
    </span>
);

const SelectedPanel = ({
    activeRecord,
    records,
    activeRecordIdx,
    onRemoveUser,
    onSwitchRecord,
}) => {
    const totalSelectedInRecord = Object.values(activeRecord.selectedUsers).reduce(
        (sum, arr) => sum + arr.length,
        0
    );

    return (
        <div className="sticky-top">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h6
                    className="text-uppercase text-muted fw-semibold mb-0"
                    style={{ fontSize: 11, letterSpacing: 1 }}
                >
                    Selected Attendees
                </h6>
                <span className="badge bg-primary rounded-pill">{totalSelectedInRecord} total</span>
            </div>

            {totalSelectedInRecord === 0 ? (
                <div
                    className="text-center py-5 border rounded-3 text-muted"
                    style={{ background: "#f8f9fa", fontSize: 13 }}
                >
                    <i className="ri-group-line fs-2 d-block mb-2 opacity-25" />
                    No attendees selected yet.
                    <br />
                    Pick users from the left panel.
                </div>
            ) : (
                <div
                    className="border rounded-3 overflow-hidden"
                    style={{ maxHeight: 460, overflowY: "auto" }}
                >
                    {Object.entries(activeRecord.selectedUsers)
                        .filter(([, users]) => users.length > 0)
                        .map(([role, users]) => (
                            <div key={role} className="border-bottom p-3">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span
                                        className="fw-semibold"
                                        style={{ fontSize: 12, color: "var(--vz-primary)" }}
                                    >
                                        {role}
                                    </span>
                                    <span
                                        className="badge bg-soft-primary text-primary"
                                        style={{ fontSize: 10 }}
                                    >
                                        {users.length}
                                    </span>
                                </div>
                                <div>
                                    {users.map((u) => (
                                        <SelectedBadge
                                            key={u._id}
                                            user={u}
                                            role={role}
                                            onRemove={onRemoveUser}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {records.length > 1 && (
                <div className="mt-4">
                    <h6
                        className="text-uppercase text-muted fw-semibold mb-2"
                        style={{ fontSize: 11, letterSpacing: 1 }}
                    >
                        All Records Summary
                    </h6>
                    <div className="d-flex flex-column gap-1">
                        {records.map((rec, idx) => {
                            const count = Object.values(rec.selectedUsers).reduce(
                                (s, a) => s + a.length,
                                0
                            );
                            return (
                                <div
                                    key={rec._uid}
                                    className={`d-flex align-items-center justify-content-between px-3 py-2 rounded-2 border ${
                                        idx === activeRecordIdx
                                            ? "border-primary bg-primary bg-opacity-10"
                                            : "border-light bg-light"
                                    }`}
                                    style={{ cursor: "pointer", fontSize: 13 }}
                                    onClick={() => onSwitchRecord(idx)}
                                >
                                    <span>
                                        <strong>Record {idx + 1}</strong>
                                        {rec.trainerName && (
                                            <span className="text-muted"> — {rec.trainerName}</span>
                                        )}
                                    </span>
                                    <span className="badge bg-secondary">{count} users</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectedPanel;