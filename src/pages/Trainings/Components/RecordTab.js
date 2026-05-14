const RecordTab = ({ record, index, isActive, onClick, onRemove, total }) => {
    const totalSelected = Object.values(record.selectedUsers).reduce(
        (sum, arr) => sum + arr.length,
        0
    );

    return (
        <div
            className="d-flex align-items-center gap-2 px-3 py-2 rounded-top border-bottom-0 border me-1"
            style={{
                cursor: "pointer",
                background: isActive ? "#fff" : "#f3f6f9",
                borderColor: isActive ? "#e2e8f0" : "transparent",
                marginBottom: isActive ? -1 : 0,
                zIndex: isActive ? 2 : 1,
                position: "relative",
                transition: "background 0.15s",
            }}
            onClick={onClick}
        >
            <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>
                Record {index + 1}
            </span>
            {totalSelected > 0 && (
                <span className="badge bg-primary" style={{ fontSize: 10 }}>
                    {totalSelected}
                </span>
            )}
            {total > 1 && (
                <button
                    type="button"
                    className="btn-close"
                    style={{ fontSize: 9 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                />
            )}
        </div>
    );
};

export default RecordTab;