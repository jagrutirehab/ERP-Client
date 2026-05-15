import React, { useEffect, useRef } from "react";
import { Spinner } from "reactstrap";

const UserCheckbox = React.memo(({ user, checked, onToggle }) => (
    <div
        className={`d-flex align-items-center gap-2 p-2 rounded-2 mb-1 border ${
            checked ? "border-primary bg-primary bg-opacity-10" : "border-light bg-light"
        }`}
        style={{ cursor: "pointer", transition: "all 0.15s" }}
        onClick={() => onToggle(user)}
    >
        <input
            type="checkbox"
            className="form-check-input m-0 flex-shrink-0"
            checked={checked}
            onChange={() => {}}
        />
        <div className="flex-grow-1 overflow-hidden">
            <p className="mb-0 fw-medium text-truncate" style={{ fontSize: 13 }}>{user.name}</p>
            <p className="mb-0 text-muted text-truncate" style={{ fontSize: 11 }}>{user.email}</p>
        </div>
    </div>
));

const UserSelector = ({
    allRoles,
    activeRole,
    onRoleChange,
    roleState,
    selectedInActiveRole,
    search,
    onSearchChange,
    onToggleUser,
    onSelectAll,
    onClearRole,
    activeRecord,
    onLoadMore,
}) => {
    const { users = [], total = 0, hasMore = false, loading = false } = roleState;
    const allSelectedIds = new Set(selectedInActiveRole.map((u) => u._id));
    const sentinelRef = useRef(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) onLoadMore();
            },
            { threshold: 0.1 }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loading, onLoadMore]);

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase text-muted fw-semibold mb-0" style={{ fontSize: 11, letterSpacing: 1 }}>
                    Select Attendees by Role
                </h6>
                {users.length > 0 && (
                    <div className="d-flex gap-2">
                        <button className="btn btn-link btn-sm text-primary p-0" style={{ fontSize: 12 }} onClick={onSelectAll}>
                            Select all
                        </button>
                        <span className="text-muted">|</span>
                        <button className="btn btn-link btn-sm text-danger p-0" style={{ fontSize: 12 }} onClick={onClearRole}>
                            Clear
                        </button>
                    </div>
                )}
            </div>

            <div className="d-flex flex-wrap gap-1 mb-3">
                {allRoles.map((r) => {
                    const count = (activeRecord.selectedUsers[r.name] || []).length;
                    return (
                        <button
                            key={r._id}
                            type="button"
                            className={`btn btn-sm rounded-pill ${
                                activeRole.name === r.name ? "btn-primary" : "btn-outline-secondary"
                            }`}
                            style={{ fontSize: 12 }}
                            onClick={() => onRoleChange(r)}
                        >
                            {r.name}
                            {count > 0 && (
                                <span
                                    className={`ms-1 badge rounded-pill ${
                                        activeRole.name === r.name ? "bg-white text-primary" : "bg-primary text-white"
                                    }`}
                                    style={{ fontSize: 10 }}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="input-group input-group-sm mb-2">
                <span className="input-group-text bg-light border-end-0">
                    <i className="ri-search-line text-muted" />
                </span>
                <input
                    type="text"
                    className="form-control border-start-0 bg-light"
                    placeholder={`Search ${activeRole.name} by name or email...`}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                {search && (
                    <button className="btn btn-light border" onClick={() => onSearchChange("")}>
                        <i className="ri-close-line" />
                    </button>
                )}
            </div>

            <div className="border rounded-2 p-2" style={{ maxHeight: 300, overflowY: "auto", background: "#fafbfc" }}>
                {loading && users.length === 0 ? (
                    <div className="d-flex justify-content-center align-items-center py-4 gap-2 text-muted">
                        <Spinner size="sm" />
                        <span style={{ fontSize: 13 }}>Loading users...</span>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-4 text-muted" style={{ fontSize: 13 }}>
                        <i className="ri-user-search-line fs-4 d-block mb-1" />
                        No users found
                    </div>
                ) : (
                    <>
                        {users.map((user) => (
                            <UserCheckbox
                                key={user._id}
                                user={user}
                                checked={allSelectedIds.has(user._id)}
                                onToggle={onToggleUser}
                            />
                        ))}

                        {loading && users.length > 0 && (
                            <div className="d-flex align-items-center justify-content-center gap-2 py-3 text-muted" style={{ fontSize: 12 }}>
                                <Spinner size="sm" color="primary" />
                                <span>Loading more...</span>
                            </div>
                        )}

                        {!hasMore && users.length > 0 && (
                            <p className="text-center text-muted mb-0 py-1" style={{ fontSize: 11 }}>
                                All {total} users loaded
                            </p>
                        )}

                        <div ref={sentinelRef} style={{ height: 1 }} />
                    </>
                )}
            </div>

            <p className="text-muted mt-1 mb-0" style={{ fontSize: 11 }}>
                {selectedInActiveRole.length} of <strong>{total}</strong> total selected in <strong>{activeRole.name}</strong>
            </p>
        </div>
    );
};

export default UserSelector;