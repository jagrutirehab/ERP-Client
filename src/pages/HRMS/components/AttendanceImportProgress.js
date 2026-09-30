import { useEffect, useRef, useState } from "react";
import {
    ListGroup,
    ListGroupItem,
    Badge,
    Progress,
    Card,
    CardBody,
    Button,
} from "reactstrap";
import { getAttendanceImportById } from "../../../helpers/backend_helper";
import { downloadFile } from "../../../Components/Common/downloadFile";

const AttendanceImportProgress = ({ importId, onClose, center, onStatusChange }) => {
    const [data, setData] = useState(null);

    const [realProgress, setRealProgress] = useState(0);

    const [animatedProgress, setAnimatedProgress] = useState(0);
    const animationRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await getAttendanceImportById(importId);
            const d = res.data;
            setData(d);

            if (d.totalRows > 0) {
                const percent = Math.min(
                    Math.round((d.processedRows / d.totalRows) * 100),
                    100
                );
                setRealProgress(percent);
            }

            if (d.status === "COMPLETED" || d.status === "FAILED") {
                setRealProgress(100);
                clearInterval(interval);
            }
        }, 1500);

        return () => clearInterval(interval);
    }, [importId]);

    useEffect(() => {
        cancelAnimationFrame(animationRef.current);

        const animate = () => {
            setAnimatedProgress((prev) => {
                let next = prev + 0.6;
                const cap = Math.min(realProgress + 5, 98);

                if (realProgress === 100) {
                    next = Math.min(prev + 3, 100);
                } else {
                    next = Math.min(next, cap);
                }

                return next;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationRef.current);
    }, [realProgress]);

    useEffect(() => {
        if (data?.status === "COMPLETED" || data?.status === "FAILED") {
            onStatusChange?.(data?.status);
        }
    }, [data?.status]);

    if (!data) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border text-primary mb-3" />
                <p className="text-muted">Starting import…</p>
            </div>
        );
    }

    const statusColor = {
        PROCESSING: "primary",
        COMPLETED: "success",
        FAILED: "danger",
    }[data.status] || "secondary";

    return (
        <div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-2 text-muted">
                    Center: <strong>{center?.name || "-"}</strong>
                </h6>
                <Badge color={statusColor} pill>
                    {data.status}
                </Badge>
            </div>

            <Card className="mb-3 shadow-sm">
                <CardBody>
                    <div className="mb-2 d-flex justify-content-between">
                        <span className="text-muted small">Progress</span>
                        <strong>{Math.floor(animatedProgress)}%</strong>
                    </div>

                    <Progress
                        value={animatedProgress}
                        animated={data.status === "PROCESSING"}
                        style={{ height: "20px" }}
                    />

                    <div className="text-end text-muted mt-2 small ">
                        {data.processedRows} of {data.totalRows} rows processed
                    </div>
                </CardBody>
            </Card>

            <ListGroup>
                <ListGroupItem className="d-flex justify-content-between bg-white">
                    <span>Success</span>
                    <span>{data.successRows}</span>
                </ListGroupItem>

                <ListGroupItem className="d-flex justify-content-between bg-white">
                    <span>Skipped</span>
                    <span>{data.skippedRows}</span>
                </ListGroupItem>

                <ListGroupItem className="d-flex justify-content-between bg-white">
                    <span>Failed</span>
                    <span>{data.failed?.count || 0}</span>
                </ListGroupItem>
            </ListGroup>

            {data.status !== "PROCESSING" && (
                <div className="mt-4 d-flex justify-content-end gap-2">
                    <Button
                        onClick={onClose}
                        className="text-white">
                        Close
                    </Button>
                    {data.failed?.count > 0 && data.failed?.url && (
                        <Button
                            color="danger"
                            className="text-white"
                            onClick={() => downloadFile({ url: data.failed.url })}
                        >
                            Download Failed Rows
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default AttendanceImportProgress;
