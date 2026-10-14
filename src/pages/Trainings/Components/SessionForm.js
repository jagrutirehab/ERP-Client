import Select from "react-select";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const SessionForm = ({ record, recordIdx, onUpdate }) => {
    const user = useSelector((state) => state.User);

    const centerOptions = (user?.centerAccess || []).map((cid) => {
        const center = user?.userCenters?.find((c) => c._id === cid);
        return { value: cid, label: center?.title || "Unknown Center" };
    });

    const toMax = record.from ? record.from.slice(0, 10) + "T23:59" : undefined;

    const handleFromChange = (val) => {
        onUpdate(recordIdx, "from", val);
        if (record.to && record.to.slice(0, 10) !== val.slice(0, 10)) {
            onUpdate(recordIdx, "to", "");
        }
    };

    const calculatedHours = (() => {
        if (!record.from || !record.to) return null
        const diffMs = new Date(record.to) - new Date(record.from)
        if (diffMs <= 0) return null
        const totalMins = Math.floor(diffMs / (1000 * 60))
        const hours = Math.floor(totalMins / 60)
        const mins = totalMins % 60
        return `${hours}h ${mins}m`
    })()

    return (
        <div className="mb-4">
            <h6 className="text-uppercase text-muted fw-semibold mb-3" style={{ fontSize: 11, letterSpacing: 1 }}>
                Session Details
            </h6>
            <div className="row g-3">
                <div className="col-sm-6">
                    <label className="form-label fw-medium" style={{ fontSize: 13 }}>
                        Training Name <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Enter training name"
                        value={record.trainingName}
                        onChange={(e) => onUpdate(recordIdx, "trainingName", e.target.value)}
                    />
                </div>

                <div className="col-sm-6">
                    <label className="form-label fw-medium" style={{ fontSize: 13 }}>
                        Trainer Name <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Enter trainer name"
                        value={record.trainerName}
                        onChange={(e) => onUpdate(recordIdx, "trainerName", e.target.value)}
                    />
                </div>

                <div className="col-12">

                    <label className="form-label fw-medium" style={{ fontSize: 13 }}>
                        Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                        className="form-control form-control-sm"
                        placeholder="Enter training description..."
                        rows={3}
                        value={record.trainingDescription}
                        onChange={(e) => onUpdate(recordIdx, "trainingDescription", e.target.value)}
                    />
                </div>

                <div className="col-12">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                        <label className="form-label fw-medium mb-0" style={{ fontSize: 13 }}>
                            Centers <span className="text-danger">*</span>
                        </label>
                        <button
                            type="button"
                            className="btn btn-link btn-sm p-0 text-primary"
                            style={{ fontSize: 12 }}
                            onClick={() => onUpdate(recordIdx, "center", centerOptions.map(c => c.value))}
                        >
                            Select All
                        </button>
                    </div>
                    <Select
                        isMulti
                        options={centerOptions}
                        value={centerOptions.filter((c) => (record.center || []).includes(c.value))}
                        onChange={(selected) =>
                            onUpdate(recordIdx, "center", selected ? selected.map((s) => s.value) : [])
                        }
                        placeholder="Select centers"
                    />
                </div>

                <div className="col-sm-6">
                    <label className="form-label fw-medium" style={{ fontSize: 13 }}>
                        From <span className="text-danger">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        className="form-control form-control-sm"
                        value={record.from}
                        onChange={(e) => handleFromChange(e.target.value)}
                    />
                </div>

                <div className="col-sm-6">
                    <label className="form-label fw-medium" style={{ fontSize: 13 }}>
                        To <span className="text-danger">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        className="form-control form-control-sm"
                        value={record.to}
                        min={record.from || undefined}
                        max={toMax}
                        disabled={!record.from}
                        onChange={(e) => {
                            const selected = e.target.value
                            if (selected < record.from) return toast.error("Cannot set previous time")
                            onUpdate(recordIdx, "to", selected)
                        }}
                    />
                    {!record.from && (
                        <p className="text-muted mt-1 mb-0" style={{ fontSize: 11 }}>Select "From" first</p>
                    )}
                </div>

                {calculatedHours && (
                    <div className="col-12">
                        <div className="alert alert-info py-2 px-3 mb-0 d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
                            <i className="ri-time-line" />
                            <strong>Total Hours:</strong>&nbsp;{calculatedHours}
                            <span className="text-muted">(calculated automatically)</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionForm;