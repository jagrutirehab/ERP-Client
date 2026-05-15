import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CardBody, Collapse, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { getTrainerRecordById } from "../../../helpers/backend_helper";

const formatDate = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const RoleBadge = ({ role }) => (
    <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" }}>
        {role}
    </span>
);

const TrainingRecordDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openRoles, setOpenRoles] = useState({});

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await getTrainerRecordById(id);
                setData(res?.data);
                if (res?.data?.attendanceData?.length) {
                    setOpenRoles({ [res.data.attendanceData[0]?.role]: true });
                }
            } catch {
                toast.error("Failed to load record");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    const toggleRole = (role) =>
        setOpenRoles((prev) => ({ ...prev, [role]: !prev[role] }));

    const totalAttendees = data?.attendanceData?.reduce(
        (sum, d) => sum + (d?.presents?.length || 0), 0
    ) || 0;

    const centerNames = data?.center?.map((c) => c?.title).filter(Boolean).join(", ") || "—";

    return (
        <CardBody className="p-4 bg-white" style={{ width: "78%" }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                    <i className="ri-arrow-left-line" />
                </button>
                <div className="flex-grow-1">
                    <h5 className="fw-bold mb-0">{data?.trainingName || "Training Detail"}</h5>
                    {data && (
                        <small className="text-muted">
                            by {data?.author?.name || "—"} · {centerNames}
                        </small>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><Spinner color="primary" /></div>
            ) : !data ? (
                <p className="text-muted text-center py-5">No data found.</p>
            ) : (
                <>
                    <div className="row g-3 mb-4">
                        {[
                            { label: "Trainer",         value: data?.trainerName,         icon: "ri-user-line" },
                            { label: "Centers",         value: centerNames,               icon: "ri-building-line" },
                            { label: "From",            value: formatDate(data?.from),    icon: "ri-calendar-line" },
                            { label: "To",              value: formatDate(data?.to),      icon: "ri-calendar-check-line" },
                            { label: "Total Hours",     value: `${data?.totalHours} hrs`, icon: "ri-time-line" },
                            { label: "Total Attendees", value: totalAttendees,            icon: "ri-group-line" },
                        ].map(({ label, value, icon }) => (
                            <div className="col-sm-4 col-6" key={label}>
                                <div className="p-3 rounded-3 border" style={{ background: "#f8fafc" }}>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <i className={`${icon} text-primary`} style={{ fontSize: 14 }} />
                                        <span className="text-muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                            {label}
                                        </span>
                                    </div>
                                    <p className="mb-0 fw-semibold" style={{ fontSize: 13 }}>{value || "—"}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {data?.trainingDescription && (
                        <div className="mb-4 p-3 rounded-3 border" style={{ background: "#f8fafc" }}>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <i className="ri-file-text-line text-primary" style={{ fontSize: 14 }} />
                                <span className="text-muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</span>
                            </div>
                            <p className="mb-0" style={{ fontSize: 13 }}>{data.trainingDescription}</p>
                        </div>
                    )}

                    <p className="fw-semibold small text-muted mb-3" style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Attendees by Role
                    </p>

                    {!data?.attendanceData?.length ? (
                        <p className="text-muted text-center py-4" style={{ fontSize: 13 }}>No attendance data</p>
                    ) : (
                        data.attendanceData.map((entry) => (
                            <div key={entry?.role} style={{ border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
                                <div
                                    onClick={() => toggleRole(entry?.role)}
                                    style={{
                                        padding: "14px 18px",
                                        background: openRoles[entry?.role] ? "#eff6ff" : "#f9fafb",
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        cursor: "pointer",
                                        borderBottom: openRoles[entry?.role] ? "1px solid #bfdbfe" : "none",
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", display: "inline-block", flexShrink: 0 }} />
                                        <span className="fw-semibold" style={{ fontSize: 14, color: "#1d4ed8" }}>{entry?.role}</span>
                                        <span className="badge bg-primary" style={{ fontSize: 10 }}>
                                            {entry?.presents?.length || 0}
                                        </span>
                                    </div>
                                    <i className={`ri-arrow-${openRoles[entry?.role] ? "up" : "down"}-s-line text-muted`} />
                                </div>

                                <Collapse isOpen={!!openRoles[entry?.role]}>
                                    <div style={{ padding: 16 }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                            <thead>
                                                <tr>
                                                    {["#", "Name", "Email", "Access Role" ,"Role"].map((h) => (
                                                        <th key={h} style={{ padding: "9px 12px", background: "#f8fafc", color: "#6b7280", fontWeight: 600, textAlign: "left", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {entry?.presents?.map((p, i) => (
                                                    <tr key={p?.user?._id || i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                        <td style={{ padding: "9px 12px", color: "#9ca3af" }}>{i + 1}</td>
                                                        <td style={{ padding: "9px 12px", fontWeight: 600, color: "#111827" }}>{p?.user?.name || "—"}</td>
                                                        <td style={{ padding: "9px 12px", color: "#6b7280" }}>{p?.user?.email || "—"}</td>
                                                        <td style={{ padding: "9px 12px" }}><RoleBadge role={p?.user?.accessRole || "—"} /></td>
                                                        <td style={{ padding: "9px 12px" }}><RoleBadge role={p?.user?.role || "—"} /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Collapse>
                            </div>
                        ))
                    )}
                </>
            )}
        </CardBody>
    );
};

export default TrainingRecordDetail;