import React, { useEffect, useState, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner, Table, Input, Alert } from "reactstrap";
import { getCallRecordings } from "../../../helpers/backend_helper";
import Select from "react-select";

const BulkOverviewModal = ({ isOpen, toggle, onGenerate, currentFilters, progress }) => {
    // --- State Management ---
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [talkTimeFilter, setTalkTimeFilter] = useState("");
    const [recordings, setRecordings] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [page, setPage] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);
    const LIMIT = 200;

    const talkTimeOptions = [
        { value: "", label: "All Durations" },
        { value: "0_2", label: "0 - 2 min" },
        { value: "2_5", label: "2 - 5 min" },
        { value: "5_10", label: "5 - 10 min" },
        { value: "10_15", label: "10 - 15 min" },
        { value: "over_15", label: "Over 15 min" }
    ];

    const resetForm = useCallback(() => {
        setFromDate(currentFilters.fromDate || "");
        setToDate(currentFilters.toDate || "");
        setTalkTimeFilter("");
        setRecordings([]);
        setSelectedIds([]);
        setPage(1);
        setTotalDocs(0);
        setLoading(false);
        setIsSubmitting(false);
    }, [currentFilters]);

    // Helper logic to identify pending/failed recordings
    const isNotGenerated = (row) => {
        const resp = row?.Files?.geminiResponse;
        return !resp || resp === "" || resp.toLowerCase().startsWith("api error");
    };

    const fetchRecordings = async (pageNum = 1, isAppend = false) => {
        if (!fromDate && !toDate && !talkTimeFilter) return;

        if (isAppend) setLoadingMore(true);
        else setLoading(true);

        try {
            const response = await getCallRecordings({
                fromDate,
                toDate,
                talkTime: talkTimeFilter,
                page: pageNum,
                limit: LIMIT
            });

            const rawData = response?.data || [];
            const filteredData = rawData.filter(isNotGenerated);
            const total = response?.pagination?.totalRecords || 0;

            if (isAppend) {
                setRecordings(prev => [...prev, ...filteredData]);
                setSelectedIds(prev => [...prev, ...filteredData.map(r => r._id)]);
            } else {
                setRecordings(filteredData);
                setSelectedIds(filteredData.map(r => r._id));
                setPage(1);
            }
            setTotalDocs(total);
        } catch (error) {
            console.error("Error fetching modal recordings", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            const start = currentFilters.fromDate || "";
            const end = currentFilters.toDate || "";
            setFromDate(start);
            setToDate(end);
            if (start || end) fetchRecordings(1, false);
        } else {
            resetForm();
        }
    }, [isOpen]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchRecordings(nextPage, true);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === recordings.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(recordings.map(r => r._id));
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const success = await onGenerate(selectedIds);
            if (success) toggle();
        } catch (error) {
            console.error("Submission error", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const canFilter = fromDate || toDate || talkTimeFilter;

    return (
        <Modal
            isOpen={isOpen}
            toggle={isSubmitting ? undefined : toggle}
            centered
            size="lg"
            backdrop={isSubmitting ? "static" : true}
            keyboard={!isSubmitting}
        >
            <ModalHeader toggle={isSubmitting ? undefined : toggle}>
                Refine Bulk Overview Selection
            </ModalHeader>
            <ModalBody>
                {/* Inputs Row */}
                <div className="row g-2 mb-3 align-items-end">
                    <div className="col-md-3">
                        <label className="small fw-bold">From</label>
                        <div className="position-relative">
                            <Input
                                type="date"
                                size="sm"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="pe-4"
                            />
                            {fromDate && (
                                <button
                                    type="button"
                                    onClick={() => setFromDate("")}
                                    className="position-absolute border-0 bg-transparent"
                                    style={{ right: "25px", top: "50%", transform: "translateY(-50%)", color: "#999" }}
                                >✕</button>
                            )}
                        </div>
                    </div>

                    <div className="col-md-3">
                        <label className="small fw-bold">To</label>
                        <div className="position-relative">
                            <Input
                                type="date"
                                size="sm"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="pe-4"
                            />
                            {toDate && (
                                <button
                                    type="button"
                                    onClick={() => setToDate("")}
                                    className="position-absolute border-0 bg-transparent"
                                    style={{ right: "25px", top: "50%", transform: "translateY(-50%)", color: "#999" }}
                                >✕</button>
                            )}
                        </div>
                    </div>

                    <div className="col-md-4">
                        <label className="small fw-bold">Talk Time</label>
                        <Select
                            options={talkTimeOptions}
                            value={talkTimeOptions.find(opt => opt.value === talkTimeFilter) || null}
                            onChange={(opt) => setTalkTimeFilter(opt ? opt.value : "")}
                            placeholder="Select Talk Time"
                            isDisabled={isSubmitting}
                            isClearable
                            // Adding styles to match your UI height
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    minHeight: '31px',
                                    height: '31px',
                                }),
                                indicatorsContainer: (base) => ({
                                    ...base,
                                    height: '31px',
                                }),
                                valueContainer: (base) => ({
                                    ...base,
                                    height: '31px',
                                    padding: '0 8px'
                                })
                            }}
                        />
                    </div>

                    <div className="col-md-2">
                        <Button
                            color="primary"
                            size="sm"
                            className="w-100"
                            onClick={() => fetchRecordings(1, false)}
                            disabled={loading || !canFilter || isSubmitting}
                        >
                            {loading ? <Spinner size="sm" /> : "Filter"}
                        </Button>
                    </div>
                </div>

                {/* --- NEW WARNING MESSAGE --- */}
                <Alert color="warning" className="p-2 py-1 mb-2 border-0" style={{ fontSize: '13px' }}>
                    <i className="ri-error-warning-line me-1"></i>
                    <strong>Note:</strong> To prevent overlapping, only recordings with <strong>no generated overview</strong> or <strong>API/server errors</strong> are listed here.
                </Alert>

                <hr className="mt-1" />

                <div style={{ maxHeight: '350px', overflowY: 'auto' }} className="border rounded">
                    <Table hover responsive size="sm" className="align-middle mb-0 text-nowrap">
                        <thead className="table-light text-uppercase" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <Input
                                        type="checkbox"
                                        checked={recordings.length > 0 && selectedIds.length === recordings.length}
                                        onChange={toggleSelectAll}
                                        disabled={loading || recordings.length === 0 || isSubmitting}
                                    />
                                </th>
                                <th>Date</th>
                                <th>Agent</th>
                                <th>UCID</th>
                                <th>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && recordings.length > 0 ? (
                                recordings.map((row) => (
                                    <tr key={row._id}>
                                        <td>
                                            <Input
                                                type="checkbox"
                                                checked={selectedIds.includes(row._id)}
                                                onChange={() => handleSelectRow(row._id)}
                                                disabled={isSubmitting}
                                            />
                                        </td>
                                        <td>{new Date(row.Call_Date).toLocaleDateString()}</td>
                                        <td>{row.Agent || "N/A"}</td>
                                        <td className="small text-muted">{row.UCID}</td>
                                        <td>{row.Talk_Time || "0"} min</td>
                                    </tr>
                                ))
                            ) : !loading && (
                                <tr>
                                    <td colSpan="5" className="text-center p-4 text-muted">
                                        {!canFilter ? "Apply a filter to view pending recordings." : "No pending recordings found for this selection."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {loading && <div className="text-center p-5"><Spinner color="primary" /></div>}

                    {!loading && recordings.length > 0 && recordings.length < totalDocs && (
                        <div className="text-center p-3 border-top">
                            <Button color="link" size="sm" onClick={handleLoadMore} disabled={loadingMore || isSubmitting}>
                                {loadingMore ? <Spinner size="sm" className="me-2" /> : null}
                                Load More
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-3 p-2 bg-light border rounded d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-primary">Pending Selection: {selectedIds.length}</span>
                    <span className="text-muted small italic">Processing restricted to eligible records.</span>
                </div>
            </ModalBody>

            <ModalFooter className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1 me-3" style={{ minHeight: "45px" }}>
                    {isSubmitting && (
                        <div className="w-100">
                            <div className="d-flex justify-content-between mb-1">
                                <span className="small fw-bold text-primary">
                                    {progress < 100 ? "AI Processing..." : "Completing..."}
                                </span>
                                <span className="small fw-bold text-primary">{progress}%</span>
                            </div>
                            <div className="progress" style={{ height: "10px" }}>
                                <div
                                    className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                                    role="progressbar"
                                    style={{ width: `${progress}%`, transition: "width 0.4s ease" }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="d-flex gap-2">
                    <Button color="secondary" onClick={toggle} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        color="success"
                        onClick={handleSubmit}
                        disabled={loading || isSubmitting || selectedIds.length === 0}
                        style={{ minWidth: "140px" }}
                    >
                        {isSubmitting ? (
                            <><Spinner size="sm" className="me-2" />Processing</>
                        ) : (
                            `Generate (${selectedIds.length})`
                        )}
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default BulkOverviewModal;