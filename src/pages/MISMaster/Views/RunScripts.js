import React, { useEffect, useState } from "react";
import { Card, CardBody, Table, Spinner, Alert, Button, Badge, Collapse } from "reactstrap";
import { getScripts, runScript } from "../../../helpers/reportsMakerApiHelper";

const statusColor = (status) => (status === "success" ? "success" : status === "error" ? "danger" : "secondary");

const RunScripts = () => {
    const [scripts, setScripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [runningMap, setRunningMap] = useState({});
    const [resultsMap, setResultsMap] = useState({});
    const [expandedMap, setExpandedMap] = useState({});

    useEffect(() => {
        setLoading(true);
        getScripts()
            .then((res) => {
                setScripts(res?.scripts || []);
                setError(null);
            })
            .catch((err) => {
                setError(err?.message || "Failed to load scripts list");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleRun = (scriptName) => {
        setRunningMap((prev) => ({ ...prev, [scriptName]: true }));
        setResultsMap((prev) => ({ ...prev, [scriptName]: null }));
        runScript(scriptName)
            .then((res) => {
                setResultsMap((prev) => ({ ...prev, [scriptName]: res }));
                setExpandedMap((prev) => ({ ...prev, [scriptName]: true }));
            })
            .catch((err) => {
                const result = err?.script
                    ? err
                    : { status: "error", error: err?.message || "Failed to run script" };
                setResultsMap((prev) => ({ ...prev, [scriptName]: result }));
                setExpandedMap((prev) => ({ ...prev, [scriptName]: true }));
            })
            .finally(() => setRunningMap((prev) => ({ ...prev, [scriptName]: false })));
    };

    const toggleExpanded = (scriptName) => {
        setExpandedMap((prev) => ({ ...prev, [scriptName]: !prev[scriptName] }));
    };

    return (
        <Card>
            <CardBody>
                {loading && (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                        <p className="mt-2 text-muted">Loading scripts...</p>
                    </div>
                )}

                {error && !loading && <Alert color="danger">{error}</Alert>}

                {!loading && !error && scripts.length === 0 && (
                    <div className="text-center text-muted py-4">No scripts available.</div>
                )}

                {!loading && !error && scripts.length > 0 && (
                    <Table className="mb-0 align-middle">
                        <thead>
                            <tr>
                                <th>Script</th>
                                <th>Last Run Status</th>
                                <th>Last Run Started At</th>
                                <th>Duration (s)</th>
                                <th style={{ width: 220 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scripts.map((s) => {
                                const scriptName = s.script;
                                const result = resultsMap[scriptName];
                                const status = result ? result.status : s.last_run_status;
                                const startedAt = result?.started_at ?? s.last_run_started_at;
                                const duration = result?.duration_seconds ?? s.last_run_duration_seconds;
                                const isRunning = !!runningMap[scriptName];
                                const isExpanded = !!expandedMap[scriptName];
                                return (
                                    <React.Fragment key={scriptName}>
                                        <tr>
                                            <td>{scriptName}</td>
                                            <td>
                                                {status ? (
                                                    <Badge color={statusColor(status)}>{status}</Badge>
                                                ) : (
                                                    <span className="text-muted">Never run</span>
                                                )}
                                            </td>
                                            <td>{startedAt || "—"}</td>
                                            <td>{duration !== undefined && duration !== null ? duration.toFixed(1) : "—"}</td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    color="success"
                                                    className="me-2"
                                                    onClick={() => handleRun(scriptName)}
                                                    disabled={isRunning}
                                                >
                                                    {isRunning ? "Running..." : "Run"}
                                                </Button>
                                                {result && (
                                                    <Button
                                                        size="sm"
                                                        color="light"
                                                        onClick={() => toggleExpanded(scriptName)}
                                                    >
                                                        {isExpanded ? "Hide Output" : "View Output"}
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                        {result && (
                                            <tr>
                                                <td colSpan={5} className="p-0 border-0">
                                                    <Collapse isOpen={isExpanded}>
                                                        <div className="p-3 bg-light">
                                                            {result.error && (
                                                                <Alert color="danger" className="mb-2">{result.error}</Alert>
                                                            )}
                                                            <div className="text-muted small mb-2">
                                                                {result.started_at && <>Started: {result.started_at} &nbsp;|&nbsp; </>}
                                                                {result.finished_at && <>Finished: {result.finished_at} &nbsp;|&nbsp; </>}
                                                                {result.return_code !== undefined && <>Return Code: {result.return_code}</>}
                                                            </div>
                                                            {result.stdout && (
                                                                <>
                                                                    <div className="fw-bold small">stdout</div>
                                                                    <pre className="small p-2 bg-white border" style={{ maxHeight: 250, overflow: "auto" }}>
                                                                        {result.stdout}
                                                                    </pre>
                                                                </>
                                                            )}
                                                            {result.stderr && (
                                                                <>
                                                                    <div className="fw-bold small">stderr</div>
                                                                    <pre className="small p-2 bg-white border text-danger" style={{ maxHeight: 250, overflow: "auto" }}>
                                                                        {result.stderr}
                                                                    </pre>
                                                                </>
                                                            )}
                                                        </div>
                                                    </Collapse>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </Table>
                )}
            </CardBody>
        </Card>
    );
};

export default RunScripts;
