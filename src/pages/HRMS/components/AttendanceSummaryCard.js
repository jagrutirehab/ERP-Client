import {
    Clock,
    Calendar,
    Fingerprint,
    CheckCircle,
    XCircle,
    Plane,
    CalendarOff,
    CalendarDays,
    RotateCw,
    Coffee,
    RefreshCcw,
} from "lucide-react";
import {
    Button,
    Card,
    CardBody,
    Col,
    Row,
    UncontrolledTooltip,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import "flatpickr/dist/themes/material_blue.css";
import "flatpickr/dist/plugins/monthSelect/style.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { minutesToTime } from "../../../utils/time";
import { capitalizeWords } from "../../../utils/toCapitalize";


const StatCard = ({ icon: Icon, value, label, color, loading }) => (
    <div className="h-100 rounded-3 border bg-white p-3 text-center shadow-sm">
        <div
            className="mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle"
            style={{
                width: 40,
                height: 40,
                backgroundColor: `${color}20`,
                color,
            }}
        >
            <Icon size={18} />
        </div>

        <h5 className="mb-1 fw-semibold">
            {loading ? <Skeleton width={30} height={20} /> : value}
        </h5>

        <small className="text-muted text-uppercase" style={{ fontSize: 11 }}>
            {loading ? <Skeleton width={50} /> : label}
        </small>
    </div>
);


const AttendanceSummaryCard = ({
    loading,
    onRefresh,
    selectedMonth,
    setSelectedMonth,
    data,
    fullWidth = false,
}) => {
    return (
        <Col xs="12" lg={fullWidth ? "12" : "8"}>
            <Card className="border-0 shadow-sm rounded-3 h-100">
                <CardBody className="p-4">

                    <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
                        <h5 className="mb-0 fw-semibold text-dark">Monthly Summary</h5>

                        <div className="d-flex align-items-center gap-2 ms-auto">
                            <div className="position-relative month-picker">
                                <Calendar
                                    size={14}
                                    className="position-absolute calendar-icon"
                                />

                                <Flatpickr
                                    value={selectedMonth}
                                    disabled={loading}
                                    options={{
                                        plugins: [
                                            monthSelectPlugin({
                                                shorthand: false,
                                                dateFormat: "Y-m",
                                                altFormat: "F Y",
                                            }),
                                        ],
                                        altInput: true,
                                        disableMobile: true
                                    }}
                                    onChange={([date]) => setSelectedMonth(date)}
                                    className="form-control form-control-sm"
                                />
                            </div>

                            <Button
                                id="refresh-data-btn"
                                color="light"
                                size="sm"
                                disabled={loading}
                                onClick={onRefresh}
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: 34, height: 34 }}
                            >
                                <RotateCw
                                    size={14}
                                    style={{
                                        animation: loading ? "spin 1s linear infinite" : "none",
                                    }}
                                />
                            </Button>

                            <UncontrolledTooltip target="refresh-data-btn">
                                Refresh
                            </UncontrolledTooltip>
                        </div>
                    </div>

                    <Row className="g-3 mb-4">
                        <Col md="6">
                            <div
                                className="rounded-3 p-3 d-flex align-items-center gap-3"
                                style={{
                                    backgroundColor: "#f9fafb",
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: 44,
                                        height: 44,
                                        backgroundColor: "#10b981",
                                    }}
                                >
                                    <Clock size={22} color="#fff" />
                                </div>

                                <div>
                                    <h5 className="mb-0 fw-semibold">
                                        {loading ? (
                                            <Skeleton width={60} />
                                        ) : (
                                            `${minutesToTime(data?.avgDuration)} hr`
                                        )}
                                    </h5>
                                    <small className="text-muted">Average Duration</small>
                                </div>
                            </div>
                        </Col>

                        <Col md="6">
                            <div
                                className="rounded-3 p-3 d-flex align-items-center gap-3"
                                style={{
                                    backgroundColor: "#f9fafb",
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: 44,
                                        height: 44,
                                        backgroundColor: "#3b82f6",
                                    }}
                                >
                                    <Fingerprint size={22} color="#fff" />
                                </div>

                                <div>
                                    <h6 className="mb-0 fw-semibold">
                                        {loading ? (
                                            <Skeleton width={60} />
                                        ) : data?.policy ? (
                                            capitalizeWords(data.policy)
                                        ) : (
                                            "-"
                                        )}
                                    </h6>
                                    <small className="text-muted">Working Policy</small>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row className="g-3">
                        <Col xs="6" md="4" xl="2">
                            <StatCard
                                icon={CheckCircle}
                                value={data?.present ?? 0}
                                label="Present"
                                color="#10b981"
                                loading={loading}
                            />
                        </Col>

                        <Col xs="6" md="4" xl="2">
                            <StatCard
                                icon={XCircle}
                                value={data?.absent ?? 0}
                                label="Absent"
                                color="#ef4444"
                                loading={loading}
                            />
                        </Col>

                        <Col xs="6" md="4" xl="2">
                            <StatCard
                                icon={Plane}
                                value={data?.leaves ?? 0}
                                label="Leaves"
                                color="#f59e0b"
                                loading={loading}
                            />
                        </Col>

                        <Col xs="6" md="4" xl="2">
                            <StatCard
                                icon={CalendarOff}
                                value={data?.weekOffs ?? 0}
                                label="Week Off"
                                color="#6b7280"
                                loading={loading}
                            />
                        </Col>

                        <Col xs="6" md="4" xl="2">
                            <StatCard
                                icon={Coffee}
                                value={data?.sundays ?? 0}
                                label="Sundays"
                                color="#92400e"
                                loading={loading}
                            />
                        </Col>

                        <Col xs="6" md="4" xl="2">
                            <StatCard
                                icon={CalendarDays}
                                value={data?.days ?? 0}
                                label="Total Days"
                                color="#0d6efd"
                                loading={loading}
                            />
                        </Col>

                        <Col xs="6" md="4" xl="2">
                            <StatCard
                                icon={RefreshCcw}
                                value={data?.regularizations ?? 0}
                                label="Regularize"
                                color="#0d6efd"
                                loading={loading}
                            />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
            <style>
                {`
        .month-picker .calendar-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
            pointer-events: none;
            z-index: 2;
        }

        .month-picker input,
        .month-picker .flatpickr-input {
            padding-left: 38px !important;
            height: 32px;
            line-height: 32px;
        }
        `}
            </style>
        </Col>
    );
};

export default AttendanceSummaryCard;
