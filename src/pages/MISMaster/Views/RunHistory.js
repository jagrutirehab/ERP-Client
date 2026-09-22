import React, { useEffect, useState } from "react";
import {
    Card, CardBody, Table, Spinner, Alert, Button, Badge,
    Row, Col, Input, Modal, ModalHeader, ModalBody,
} from "reactstrap";
import Select from "react-select";
import { getScripts, getScriptHistory, getAllHistory } from "../../../helpers/reportsMakerApiHelper";

const statusColor = (status) => (status === "success" ? "success" : status === "error" ? "danger" : "secondary");

const RunHistory = () => {
    const [scripts, setScripts] = useState([]);
    const [scriptsLoading, setScriptsLoading] = useState(true);
    const [scriptsError, setScriptsError] = useState(null);

    const [selectedScript, setSelectedScript] = useState(null);
    const [limit, setLimit] = useState(50);

    const [history, setHistory] = useState([]);
    const [total, setTotal] = useState(0);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(null);

    const [modalEntry, setModalEntry] = useState(null);

    useEffect(() => {
        setScriptsLoading(true);
        getScripts()
            .then((res) => {
                setScripts(res?.scripts || []);
                setScriptsError(null);
            })
            .catch((err) => {
                setScriptsError(err?.message || "Failed to load scripts list");
            })
            .finally(() => setScriptsLoading(false));
    }, []);

    const loadAllHistory = () => {
        setHistoryLoading(true);
        setHistoryError(null);
        getAllHistory(limit || 100)
            .then((res) => {
                const entries = res?.history || [];
                setHistory(entries);
                setTotal(entries.length);
            })
            .catch((err) => {
                setHistoryError(err?.message || "Failed to load history");
                setHistory([]);
                setTotal(0);
            })
            .finally(() => setHistoryLoading(false));
    };

    useEffect(() => {
        loadAllHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const scriptOptions = scripts.map((s) => ({ value: s, label: s }));

    const handleLoadHistory = () => {
        if (!selectedScript) {
            loadAllHistory();
            return;
        }
        setHistoryLoading(true);
        setHistoryError(null);
        getScriptHistory(selectedScript, limit || 50)
            .then((res) => {
                setHistory(res?.history || []);
                setTotal(res?.total || 0);
            })
            .catch((err) => {
                setHistoryError(err?.message || "Failed to load history");
                setHistory([]);
                setTotal(0);
            })
            .finally(() => setHistoryLoading(false));
    };

    const handleScriptChange = (opt) => {
        const value = opt?.value || null;
        setSelectedScript(value);
        if (!value) loadAllHistory();
    };

    return (
        <>
            <Row className="g-2 align-items-center mb-3">
                <Col md={4}>
                    <Select
                        value={selectedScript ? { value: selectedScript, label: selectedScript } : null}
                        onChange={handleScriptChange}
                        options={scriptOptions}
                        placeholder={scriptsLoading ? "Loading scripts..." : "All scripts"}
                        isLoading={scriptsLoading}
                        isDisabled={scriptsLoading || !!scriptsError}
                        isClearable
                    />
                </Col>
                <Col xs="auto" style={{ width: 120 }}>
                    <Input
                        type="number"
                        min={1}
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        placeholder="Limit"
                    />
                </Col>
                <Col xs="auto">
                    <Button
                        color="success"
                        onClick={handleLoadHistory}
                        disabled={historyLoading}
                    >
                        {historyLoading ? "Loading..." : "Load History"}
                    </Button>
                </Col>
                {total > 0 && (
                    <Col xs="auto" className="text-muted small">
                        Showing {history.length} of {total} runs
                    </Col>
                )}
            </Row>

            {scriptsError && <Alert color="danger">{scriptsError}</Alert>}

            <Card>
                <CardBody>
                    {historyLoading && (
                        <div className="text-center py-5">
                            <Spinner color="primary" />
                            <p className="mt-2 text-muted">Loading history...</p>
                        </div>
                    )}

                    {historyError && !historyLoading && <Alert color="danger">{historyError}</Alert>}

                    {!historyLoading && !historyError && history.length > 0 && (
                        <div style={{ overflowX: "auto" }}>
                            <Table className="mb-0 align-middle">
                                <thead>
                                    <tr>
                                        <th>Script</th>
                                        <th>Status</th>
                                        <th>Started At</th>
                                        <th>Finished At</th>
                                        <th>Duration (s)</th>
                                        <th>Return Code</th>
                                        <th>Output</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.slice().reverse().map((entry, idx) => (
                                        <tr key={idx}>
                                            <td>{entry.script || "—"}</td>
                                            <td><Badge color={statusColor(entry.status)}>{entry.status}</Badge></td>
                                            <td>{entry.started_at || "—"}</td>
                                            <td>{entry.finished_at || "—"}</td>
                                            <td>{entry.duration_seconds !== undefined ? entry.duration_seconds.toFixed(1) : "—"}</td>
                                            <td>{entry.return_code !== undefined ? entry.return_code : "—"}</td>
                                            <td>
                                                <Button size="sm" color="light" onClick={() => setModalEntry(entry)}>
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {!historyLoading && !historyError && history.length === 0 && (
                        <div className="text-center text-muted py-4">
                            {selectedScript ? "No history found for this script." : "No run history available."}
                        </div>
                    )}
                </CardBody>
            </Card>

            <Modal isOpen={!!modalEntry} toggle={() => setModalEntry(null)} size="lg">
                <ModalHeader toggle={() => setModalEntry(null)}>
                    {modalEntry?.script} — <Badge color={statusColor(modalEntry?.status)}>{modalEntry?.status}</Badge>
                </ModalHeader>
                <ModalBody>
                    <div className="text-muted small mb-2">
                        Started: {modalEntry?.started_at || "—"} &nbsp;|&nbsp;
                        Finished: {modalEntry?.finished_at || "—"} &nbsp;|&nbsp;
                        Duration: {modalEntry?.duration_seconds !== undefined ? `${modalEntry.duration_seconds.toFixed(1)}s` : "—"} &nbsp;|&nbsp;
                        Return Code: {modalEntry?.return_code !== undefined ? modalEntry.return_code : "—"}
                    </div>
                    {modalEntry?.error && <Alert color="danger">{modalEntry.error}</Alert>}
                    {modalEntry?.stdout && (
                        <>
                            <div className="fw-bold small">stdout</div>
                            <pre className="small p-2 bg-light border" style={{ maxHeight: 300, overflow: "auto" }}>
                                {modalEntry.stdout}
                            </pre>
                        </>
                    )}
                    {modalEntry?.stderr && (
                        <>
                            <div className="fw-bold small">stderr</div>
                            <pre className="small p-2 bg-light border text-danger" style={{ maxHeight: 300, overflow: "auto" }}>
                                {modalEntry.stderr}
                            </pre>
                        </>
                    )}
                </ModalBody>
            </Modal>
        </>
    );
};

export default RunHistory;
