import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner } from "reactstrap";
import Select from "react-select";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { fetchCenterDashboardLive } from "../../store/features/centerDashboard/centerDashboardSlice";

const REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const MAX_HISTORY = 30;
const ACCENT = "#34d399";

const selectLightStyles = {
    control: (base, state) => ({
        ...base,
        background: "#ffffff",
        borderColor: state.isFocused ? ACCENT : "#e2e8f0",
        boxShadow: "none",
        minHeight: 34,
        minWidth: 180,
    }),
    singleValue: (base) => ({ ...base, color: "#0f172a", fontSize: "0.8rem" }),
    placeholder: (base) => ({ ...base, color: "#94a3b8", fontSize: "0.8rem" }),
    input: (base) => ({ ...base, color: "#0f172a" }),
    menu: (base) => ({ ...base, background: "#ffffff", border: "1px solid #e2e8f0", zIndex: 20 }),
    option: (base, state) => ({
        ...base,
        background: state.isFocused ? "#f1f5f9" : "transparent",
        color: "#0f172a",
        fontSize: "0.8rem",
        cursor: "pointer",
    }),
    indicatorSeparator: (base) => ({ ...base, background: "#e2e8f0" }),
    dropdownIndicator: (base) => ({ ...base, color: "#94a3b8" }),
};

const formatNum = (val) => Number(val ?? 0).toLocaleString("en-IN");

const Sparkline = ({ data, fillId }) => {
    const values = data.length > 1 ? data : [data[0] ?? 0, data[0] ?? 0];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 300;
    const height = 90;
    const stepX = width / (values.length - 1);
    const coords = values.map((v, i) => {
        const x = i * stepX;
        const y = height - ((v - min) / range) * (height - 14) - 7;
        return [x, y];
    });
    const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
    const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height: 90, display: "block" }}>
            <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#${fillId})`} stroke="none" />
            <path d={linePath} fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
};

const MetricPanel = ({ panelKey, badge, title, mainValue, deltaValue, deltaLabel, miniStats, sparklineData, captionLeft, captionRight }) => {
    const deltaPositive = deltaValue >= 0;
    return (
        <div
            style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: "1.25rem",
                height: "100%",
                boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            }}
        >
            <div className="d-flex align-items-center gap-2 mb-3">
                <span
                    style={{
                        background: "#ccfbf1",
                        color: "#0f766e",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        padding: "2px 6px",
                        borderRadius: 4,
                    }}
                >
                    {badge}
                </span>
                <span style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em" }}>
                    {title}
                </span>
            </div>

            <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                <span style={{ color: "#0f172a", fontWeight: 700, fontSize: "2.6rem", lineHeight: 1 }}>
                    {formatNum(mainValue)}
                </span>
                <span
                    style={{
                        background: deltaPositive ? "#dcfce7" : "#fee2e2",
                        color: deltaPositive ? "#15803d" : "#b91c1c",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 999,
                    }}
                >
                    {deltaPositive ? "▲" : "▼"} {deltaPositive ? "+" : ""}{formatNum(deltaValue)} {deltaLabel}
                </span>
            </div>

            <div
                className="d-flex mb-3"
                style={{ borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: "0.75rem 0" }}
            >
                {miniStats.map((stat, i) => (
                    <div
                        key={stat.label}
                        className="text-center flex-fill"
                        style={{ borderLeft: i === 0 ? "none" : "1px solid #e2e8f0" }}
                    >
                        <div style={{ color: "#0f172a", fontWeight: 700, fontSize: "1rem" }}>{stat.display}</div>
                        <div style={{ color: "#64748b", fontSize: "0.6rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            <Sparkline data={sparklineData} fillId={`spark-${panelKey}`} />

            <div className="d-flex justify-content-between mt-2">
                <span style={{ color: "#94a3b8", fontSize: "0.62rem", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                    {captionLeft}
                </span>
                <span style={{ color: "#94a3b8", fontSize: "0.62rem", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                    {captionRight}
                </span>
            </div>
        </div>
    );
};

const CenterDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data, loading, error } = useSelector((state) => state.CenterDashboard);
    const centerAccess = useSelector((state) => state.User?.centerAccess || [], shallowEqual);

    const [now, setNow] = useState(new Date());
    const [selectedKey, setSelectedKey] = useState("ALL");
    const [history, setHistory] = useState({});

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
        if (!centerAccess || centerAccess.length === 0) return;
        const load = () => {
            dispatch(fetchCenterDashboardLive({ centerAccess }));
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
        setHistory((prev) => {
            const next = { ...prev };
            const pushPoint = (key, admitted, discharged, counselling) => {
                const existing = next[key] || { admitted: [], discharged: [], counselling: [] };
                next[key] = {
                    admitted: [...existing.admitted, admitted].slice(-MAX_HISTORY),
                    discharged: [...existing.discharged, discharged].slice(-MAX_HISTORY),
                    counselling: [...existing.counselling, counselling].slice(-MAX_HISTORY),
                };
            };
            let totalAdmitted = 0, totalDischarged = 0, totalCounselling = 0;
            centers.forEach((center) => {
                const admitted = Number(center.admitted_patients) || 0;
                const discharged = Number(center.discharged_patients) || 0;
                const counselling = Number(center.counselling_sessions_count) || 0;
                pushPoint(center.center_name, admitted, discharged, counselling);
                totalAdmitted += admitted;
                totalDischarged += discharged;
                totalCounselling += counselling;
            });
            pushPoint("ALL", totalAdmitted, totalDischarged, totalCounselling);
            return next;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [centers]);

    const centerOptions = useMemo(() => [
        { value: "ALL", label: "All Centers" },
        ...centers.map((c) => ({ value: c.center_name, label: c.center_name })),
    ], [centers]);

    useEffect(() => {
        if (selectedKey === "ALL") return;
        if (!centers.some((c) => c.center_name === selectedKey)) {
            setSelectedKey("ALL");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [centers]);

    const viewData = useMemo(() => {
        if (centers.length === 0) return null;
        if (selectedKey === "ALL") {
            const sum = (field) => centers.reduce((s, c) => s + (Number(c[field]) || 0), 0);
            const avgYears = centers.reduce((s, c) => s + (Number(c.years_of_service) || 0), 0) / centers.length;
            return {
                center_name: "All Centers",
                admitted_patients: sum("admitted_patients"),
                admitted_today: sum("admitted_today"),
                admitted_this_week: sum("admitted_this_week"),
                discharged_patients: sum("discharged_patients"),
                discharged_this_month: sum("discharged_this_month"),
                discharged_this_year: sum("discharged_this_year"),
                counselling_sessions_count: sum("counselling_sessions_count"),
                counselling_today: sum("counselling_today"),
                sessions_this_week: sum("sessions_this_week"),
                sessions_this_quarter: sum("sessions_this_quarter"),
                years_of_service: avgYears,
            };
        }
        return centers.find((c) => c.center_name === selectedKey) || null;
    }, [centers, selectedKey]);

    const viewHistory = history[selectedKey] || { admitted: [], discharged: [], counselling: [] };

    const hiLo = (arr) => (arr.length === 0 ? { hi: 0, lo: 0 } : { hi: Math.max(...arr), lo: Math.min(...arr) });
    const admittedHiLo = hiLo(viewHistory.admitted);
    const counsellingHiLo = hiLo(viewHistory.counselling);

    const dateLabel = now.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase() +
        ", " + now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase() +
        ", " + now.getFullYear();
    const clockLabel = now.toLocaleTimeString("en-GB", { hour12: false });

    document.title = "Center Dashboard";

    return (
        <div className="page-content">
            <Container fluid>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
                    <div
                        className="d-flex align-items-center justify-content-between flex-wrap gap-3 px-4 py-3"
                        style={{ borderBottom: "1px solid #e2e8f0", background: "#ffffff" }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: ACCENT,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <i className="bx bx-pulse" style={{ color: "#022c22", fontSize: 20 }}></i>
                            </div>
                            <div>
                                <div style={{ color: "#0f172a", fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.2 }}>
                                    Jagruti Centre Pulse
                                </div>
                                <div style={{ color: "#64748b", fontSize: "0.68rem", letterSpacing: "0.06em" }}>
                                    {(viewData?.center_name || "ALL CENTERS").toUpperCase()}
                                    {selectedKey !== "ALL" ? " CENTRE" : ""} · LIVE BOARD
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-4">
                            <Select
                                value={centerOptions.find((o) => o.value === selectedKey) || centerOptions[0]}
                                onChange={(opt) => setSelectedKey(opt.value)}
                                options={centerOptions}
                                styles={selectLightStyles}
                                placeholder="Center..."
                            />
                            <div className="d-flex align-items-center gap-2">
                                <span className="live-dot" />
                                <span style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em" }}>
                                    LIVE
                                </span>
                            </div>
                            <div className="text-end">
                                <div style={{ color: "#d97706", fontWeight: 700, fontSize: "1.4rem", lineHeight: 1, fontFamily: "'SFMono-Regular', Menlo, Consolas, monospace" }}>
                                    {clockLabel}
                                </div>
                                <div style={{ color: "#64748b", fontSize: "0.62rem", letterSpacing: "0.05em" }}>
                                    {dateLabel}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        {loading && centers.length === 0 && (
                            <div className="text-center py-5">
                                <Spinner style={{ color: ACCENT }} />
                                <p className="mt-2" style={{ color: "#64748b" }}>Connecting to live feed...</p>
                            </div>
                        )}

                        {error && centers.length === 0 && !loading && (
                            <div className="text-center py-4" style={{ color: "#dc2626" }}>{error}</div>
                        )}

                        {!loading && !error && centers.length === 0 && (
                            <div className="text-center py-4" style={{ color: "#64748b" }}>No center data available.</div>
                        )}

                        {viewData && (
                            <Row className="g-3">
                                <Col xs="12" lg="4">
                                    <MetricPanel
                                        panelKey="admitted"
                                        badge="ADM"
                                        title="ADMITTED PATIENTS"
                                        mainValue={viewData.admitted_patients}
                                        deltaValue={viewData.admitted_today}
                                        deltaLabel="today"
                                        miniStats={[
                                            { label: "Today", display: `+${formatNum(viewData.admitted_today)}` },
                                            { label: "This Week", display: `+${formatNum(viewData.admitted_this_week)}` },
                                        ]}
                                        sparklineData={viewHistory.admitted}
                                        captionLeft="Census · Live Session"
                                        captionRight={`HI ${formatNum(admittedHiLo.hi)} · LO ${formatNum(admittedHiLo.lo)}`}
                                    />
                                </Col>
                                <Col xs="12" lg="4">
                                    <MetricPanel
                                        panelKey="discharged"
                                        badge="PTD"
                                        title="PATIENTS TREATED TILL DATE"
                                        mainValue={viewData.discharged_patients}
                                        deltaValue={viewData.discharged_this_month}
                                        deltaLabel="mo"
                                        miniStats={[
                                            { label: "This Month", display: `+${formatNum(viewData.discharged_this_month)}` },
                                            { label: "This Year", display: `+${formatNum(viewData.discharged_this_year)}` },
                                            { label: "Of Service", display: `${Number(viewData.years_of_service ?? 0).toFixed(1)} yrs` },
                                        ]}
                                        sparklineData={viewHistory.discharged}
                                        captionLeft="Lifetime Growth · Live"
                                        captionRight="All-Time High"
                                    />
                                </Col>
                                <Col xs="12" lg="4">
                                    <MetricPanel
                                        panelKey="counselling"
                                        badge="CSN"
                                        title="COUNSELLING SESSIONS COMPLETED"
                                        mainValue={viewData.counselling_sessions_count}
                                        deltaValue={viewData.counselling_today}
                                        deltaLabel="today"
                                        miniStats={[
                                            { label: "Today", display: `+${formatNum(viewData.counselling_today)}` },
                                            { label: "This Week", display: `+${formatNum(viewData.sessions_this_week)}` },
                                            { label: "This Quarter", display: `${formatNum(viewData.sessions_this_quarter)}` },
                                        ]}
                                        sparklineData={viewHistory.counselling}
                                        captionLeft="Sessions · Live Session"
                                        captionRight={`HI ${formatNum(counsellingHiLo.hi)} · LO ${formatNum(counsellingHiLo.lo)}`}
                                    />
                                </Col>
                            </Row>
                        )}
                    </div>
                </div>
            </Container>

            <style>{`
                @keyframes livePulseRed {
                    0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.7); }
                    70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
                    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
                }
                .live-dot {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #22c55e;
                    animation: livePulseRed 1.6s infinite;
                }
            `}</style>
        </div>
    );
};

export default CenterDashboard;
