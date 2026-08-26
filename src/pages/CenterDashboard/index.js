import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { fetchCenterDashboardLive } from "../../store/features/centerDashboard/centerDashboardSlice";

const REFRESH_INTERVAL_MS = 5000;
const MONO = "'SFMono-Regular', Menlo, Consolas, 'Courier New', monospace";

const STAT_ROWS = [
    { key: "admitted_patients", label: "Admitted", icon: "bx bx-bed", color: "#38bdf8" },
    { key: "discharged_patients", label: "Treated", icon: "bx bx-log-out-circle", color: "#facc15" },
    { key: "counselling_sessions_count", label: "Counselling", icon: "bx bx-conversation", color: "#a78bfa" },
];

const ACCENT_PALETTE = ["#22c55e", "#38bdf8", "#f59e0b", "#a78bfa", "#f472b6", "#facc15", "#34d399", "#fb7185"];

const CenterDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data, month, loading, error } = useSelector((state) => state.CenterDashboard);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const [lastUpdated, setLastUpdated] = useState(null);
    const [now, setNow] = useState(new Date());
    const [deltas, setDeltas] = useState({});
    const [flashCells, setFlashCells] = useState({});
    const prevValuesRef = useRef({});
    const hasBaselineRef = useRef(false);

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    
    const { loading: permissionLoader, hasPermission } = usePermissions(token);
    const hasCenterDashboardPermission = hasPermission("CENTER_DASHBOARD", null, "READ");

    // useEffect(() => {
    //     if (permissionLoader) return;
    //     if (!hasCenterDashboardPermission) {
    //         navigate("/unauthorized");
    //         return;
    //     }
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [hasCenterDashboardPermission, permissionLoader]);

    useEffect(() => {
        if (!centerAccess || centerAccess.length === 0) {
            setLastUpdated(null);
            return;
        }
        const load = () => {
            dispatch(fetchCenterDashboardLive({ centerAccess })).then(() => {
                setLastUpdated(new Date());
            });
        };
        load();
        const interval = setInterval(load, REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);

    }, [dispatch, centerAccess]);

    useEffect(() => {
        const tick = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    const centers = useMemo(
        () => (!centerAccess || centerAccess.length === 0 ? [] : data || []),
        [data, centerAccess]
    );

    useEffect(() => {
        if (centers.length === 0) return;
        const prev = prevValuesRef.current;
        const nextPrev = {};
        const newDeltas = {};
        const changedUp = [];
        const changedDown = [];

        centers.forEach((center) => {
            STAT_ROWS.forEach(({ key }) => {
                const cellKey = `${center.center_name}__${key}`;
                const current = Number(center[key]) || 0;
                nextPrev[cellKey] = current;
                if (hasBaselineRef.current && prev[cellKey] !== undefined) {
                    const delta = current - prev[cellKey];
                    newDeltas[cellKey] = delta;
                    if (delta > 0) changedUp.push(cellKey);
                    if (delta < 0) changedDown.push(cellKey);
                }
            });
        });

        prevValuesRef.current = nextPrev;
        hasBaselineRef.current = true;
        setDeltas(newDeltas);

        const changed = [...changedUp, ...changedDown];
        if (changed.length > 0) {
            setFlashCells((prevFlash) => {
                const next = { ...prevFlash };
                changedUp.forEach((k) => { next[k] = "up"; });
                changedDown.forEach((k) => { next[k] = "down"; });
                return next;
            });
            const timeout = setTimeout(() => {
                setFlashCells((prevFlash) => {
                    const next = { ...prevFlash };
                    changed.forEach((k) => { delete next[k]; });
                    return next;
                });
            }, 1500);
            return () => clearTimeout(timeout);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [centers]);

    const secondsAgo = lastUpdated ? Math.max(0, Math.floor((now - lastUpdated) / 1000)) : null;

    const renderDelta = (cellKey) => {
        const delta = deltas[cellKey];
        if (delta === undefined) {
            return <span style={{ color: "#cbd5e1", fontSize: "0.72rem", fontFamily: MONO }}>—</span>;
        }
        if (delta === 0) {
            return <span style={{ color: "#94a3b8", fontSize: "0.72rem", fontFamily: MONO }}>0</span>;
        }
        const positive = delta > 0;
        return (
            <span style={{ color: positive ? "#16a34a" : "#dc2626", fontSize: "0.72rem", fontFamily: MONO, fontWeight: 700 }}>
                {positive ? "▲" : "▼"} {positive ? "+" : ""}{delta}
            </span>
        );
    };

    document.title = "Center Dashboard";

    return (
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title="Center Dashboard" pageTitle="Center Dashboard" />

                <div
                    style={{
                        background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
                        borderRadius: 16,
                        padding: "1.25rem",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                    }}
                >
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 px-1">
                        <div className="d-flex align-items-center gap-2">
                            <span className="live-dot" />
                            <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em" }}>
                                LIVE
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            {month && (
                                <span style={{ color: "#475569", fontSize: "0.75rem", fontFamily: MONO }}>
                                    {new Date(month).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                                </span>
                            )}
                            {secondsAgo !== null && (
                                <span style={{ color: "#64748b", fontSize: "0.75rem", fontFamily: MONO }}>
                                    Updated {secondsAgo}s ago
                                </span>
                            )}
                        </div>
                    </div>

                    {loading && centers.length === 0 && (
                        <div className="text-center py-5">
                            <Spinner style={{ color: "#16a34a" }} />
                            <p className="mt-2" style={{ color: "#64748b" }}>Connecting to live feed...</p>
                        </div>
                    )}

                    {error && centers.length === 0 && !loading && (
                        <div className="text-center py-4" style={{ color: "#dc2626" }}>{error}</div>
                    )}

                    {centers.length > 0 && (
                        <Row className="g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-5">
                            {centers.map((center, ci) => (
                                <Col key={center.center_name}>
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            borderRadius: 12,
                                            border: "1px solid #e2e8f0",
                                            borderLeft: `3px solid ${ACCENT_PALETTE[ci % ACCENT_PALETTE.length]}`,
                                            padding: "1rem",
                                            height: "100%",
                                            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                                        }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <span style={{ color: "#0f172a", fontWeight: 700, fontSize: "1rem" }}>
                                                {center.center_name}
                                            </span>
                                            <span className="live-dot-small" />
                                        </div>

                                        {STAT_ROWS.map((stat) => {
                                            const cellKey = `${center.center_name}__${stat.key}`;
                                            const flashing = flashCells[cellKey];
                                            return (
                                                <div
                                                    key={stat.key}
                                                    className={flashing === "up" ? "flash-up" : flashing === "down" ? "flash-down" : ""}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        padding: "0.5rem 0.4rem",
                                                        borderRadius: 8,
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div
                                                            style={{
                                                                width: 28,
                                                                height: 28,
                                                                borderRadius: 8,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                background: `${stat.color}22`,
                                                            }}
                                                        >
                                                            <i className={stat.icon} style={{ color: stat.color, fontSize: 14 }}></i>
                                                        </div>
                                                        <span style={{ color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                                            {stat.label}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span style={{ color: "#020617", fontWeight: 700, fontSize: "1.15rem", fontFamily: MONO }}>
                                                            {center[stat.key] ?? 0}
                                                        </span>
                                                        {renderDelta(cellKey)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    )}

                    {!loading && !error && centers.length === 0 && (
                        <div className="text-center py-4" style={{ color: "#64748b" }}>No center data available.</div>
                    )}
                </div>
            </Container>

            <style>{`
                @keyframes livePulseRed {
                    0% { box-shadow: 0 0 0 0 rgba(248,113,113,0.7); }
                    70% { box-shadow: 0 0 0 8px rgba(248,113,113,0); }
                    100% { box-shadow: 0 0 0 0 rgba(248,113,113,0); }
                }
                @keyframes livePulseGreen {
                    0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
                    70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
                    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
                }
                @keyframes flashUpAnim {
                    0% { background: rgba(34,197,94,0.18); }
                    100% { background: transparent; }
                }
                @keyframes flashDownAnim {
                    0% { background: rgba(248,113,113,0.18); }
                    100% { background: transparent; }
                }
                .live-dot {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #f87171;
                    animation: livePulseRed 1.6s infinite;
                }
                .live-dot-small {
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #22c55e;
                    animation: livePulseGreen 1.6s infinite;
                }
                .flash-up {
                    animation: flashUpAnim 1.5s ease-out;
                }
                .flash-down {
                    animation: flashDownAnim 1.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default CenterDashboard;
