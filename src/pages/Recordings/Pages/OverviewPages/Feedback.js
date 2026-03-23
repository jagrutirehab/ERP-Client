import React, { useEffect, useState } from 'react'
import { getCallRecordingOverview, getFeedbackRecordingOverview } from '../../../../helpers/backend_helper';
import { CardBody, Label, Spinner } from 'reactstrap';
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import DataTableComponent from '../../../../Components/Common/DataTable';
import Select from "react-select";
import { FeedbackRecordingsOverviewColumns } from '../../Columns/FeedbackOverview';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFilter } from 'react-icons/fa';

const Feedback = () => {
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const [overviews, setOverviews] = useState([]);
    const [callLoading, setCallLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalDocs: 0
    });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [agentOrUcid, setAgentOrUcid] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [talkTimeFilter, setTalkTimeFilter] = useState("");

    const loadFeedbackRecordingOverviews = async () => {
        setCallLoading(true)
        try {
            const response = await getFeedbackRecordingOverview({
                fromDate,
                toDate,
                page,
                limit,
                search: debouncedSearch,
                talkTime: talkTimeFilter
            });
            console.log("Response", response);
            setOverviews(response?.data);
            setPagination({
                ...response?.pagination,
                totalDocs: response?.pagination?.totalRecords
            });

        } catch (error) {
            console.log(error);

        } finally {
            setCallLoading(false)
        }
    }
    useEffect(() => { loadFeedbackRecordingOverviews() }, [page, limit, debouncedSearch, talkTimeFilter])
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(agentOrUcid);
        }, 400);

        return () => clearTimeout(timer);
    }, [agentOrUcid]);

    const talkTimeOptions = [
        { value: "", label: "Talk Time" },
        { value: "0_2", label: "0 - 2 min" },
        { value: "2_5", label: "2 - 5 min" },
        { value: "5_10", label: "5 - 10 min" },
        { value: "10_15", label: "10 - 15 min" },
        { value: "over_15", label: "Over 15 min" }
    ];

    const getSafeParsedData = (rawData) => {
        if (!rawData) return null;

        try {
            if (typeof rawData === "object") return rawData;

            const cleaned = rawData
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            return JSON.parse(cleaned);
        } catch (e) {
            return null;
        }
    };

    const getParsed = (row) => {
        const d = getSafeParsedData(row?.Files?.geminiResponse);

        return {
            reception: d?.onboarding_facilities?.reception_experience?.value,
            tour: d?.onboarding_facilities?.manager_provided_tour?.value,
            hygiene: d?.onboarding_facilities?.hygiene_satisfaction?.value,
            room: d?.onboarding_facilities?.room_satisfaction?.value,
            queries: d?.onboarding_facilities?.queries_resolved?.value,

            psych: d?.clinical_feedback?.psych_discussion_held?.value,
            psychRating: d?.clinical_feedback?.psych_experience_rating?.value,
            empathy: d?.clinical_feedback?.staff_empathy_professionalism?.value,
            treatment: d?.clinical_feedback?.treatment_plan_satisfaction?.value,
            family: d?.clinical_feedback?.family_involvement?.value,

            status: d?.patient_outcomes?.status_vs_admission?.value,
            improvement: d?.patient_outcomes?.visible_improvement?.value,
            behavior: d?.patient_outcomes?.progress_areas?.behavior,
            mood: d?.patient_outcomes?.progress_areas?.mood,
            daily: d?.patient_outcomes?.progress_areas?.daily_functioning,
            sleep: d?.patient_outcomes?.progress_areas?.sleep,
            communication: d?.patient_outcomes?.progress_areas?.communication,

            updates: d?.communication_support?.regular_updates_received?.value,
            clarity: d?.communication_support?.updates_clear_helpful?.value,
            frequency: d?.communication_support?.call_frequency?.value,
            support: d?.communication_support?.family_support_adequacy?.value,
            concerns: d?.communication_support?.concerns_addressed_promptly?.value,

            belongings: d?.discharge_loyalty?.belongings_returned?.value,
            nps: d?.discharge_loyalty?.nps_score?.value,
            suggestion: d?.discharge_loyalty?.improvement_suggestions,
            notes: d?.discharge_loyalty?.discharge_experience_notes,

            strengths: d?.audit_report?.strengths || [],
            weaknesses: d?.audit_report?.weaknesses || [],
            coaching: d?.audit_report?.coaching_points || "",
        };
    };

    const formatFeedbackExportData = (data) => {
        return data.map((row, index) => {
            const d = getParsed(row);

            return {
                Index: index + 1,
                UCID: row?.UCID || "-",
                Agent: row?.Agent || "-",
                "Call Date": row?.Call_Date || "-",
                "Talk Time": row?.Talk_Time || "-",
                "Recording URL": row?.Files?.recording_url || row?.Files?.Recording_URL || "-",

                Strengths: d?.strengths?.join(" | ") || "-",
                Weaknesses: d?.weaknesses?.join(" | ") || "-",
                Coaching: d?.coaching || "-",

                "Reception Experience": d?.reception || "-",
                "Manager Provided Tour": d?.tour || "-",
                "Hygiene Satisfaction": d?.hygiene || "-",
                "Room Satisfaction": d?.room || "-",
                "Queries Resolved": d?.queries || "-",

                "Psych Discussion": d?.psych || "-",
                "Psych Experience Rating": d?.psychRating || "-",
                "Staff Empathy Professionalism": d?.empathy || "-",
                "Treatment Plan Satisfaction": d?.treatment || "-",
                "Family Involvement": d?.family || "-",

                "Status vs Admission": d?.status || "-",
                "Visible Improvement": d?.improvement || "-",
                Behavior: d?.behavior || "-",
                Mood: d?.mood || "-",
                "Daily Functioning": d?.daily || "-",
                Sleep: d?.sleep || "-",
                Communication: d?.communication || "-",

                "Regular Updates Received": d?.updates || "-",
                "Updates Clarity Helpful": d?.clarity || "-",
                "Call Frequency": d?.frequency || "-",
                "Family Support Adequacy": d?.support || "-",
                "Concerns Addressed Promptly": d?.concerns || "-",

                "Belongings Returned": d?.belongings || "-",
                "NPS Score": d?.nps || "-",
                "Improvement Suggestions": d?.suggestion || "-",
                "Discharge Exp Notes": d?.notes || "-",
            };
        });
    };

    const handleExportFeedbackExcel = async () => {
        try {
            setExportLoading(true);

            let allData = [];
            let currentPage = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await getFeedbackRecordingOverview({
                    fromDate,
                    toDate,
                    page: currentPage,
                    limit: 500,
                    search: debouncedSearch,
                    talkTime: talkTimeFilter
                });

                const data = response?.data || [];
                allData = [...allData, ...data];

                if (data.length < 500) {
                    hasMore = false;
                } else {
                    currentPage++;
                }
            }

            const formatted = formatFeedbackExportData(allData);

            const worksheet = XLSX.utils.json_to_sheet(formatted);
            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback Overview");

            const buffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            const blob = new Blob([buffer], {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            saveAs(blob, "feedback-overview.xlsx");

        } catch (err) {
            console.error(err);
        } finally {
            setExportLoading(false);
        }
    };


    return (
        <>
            <CardBody
                className="p-3 bg-white"
                style={isMobile ? { width: "100%" } : { width: "78%" }}
            >
                <div className="text-center text-md-left mb-4">
                    <h1 className="display-6 fw-bold text-primary">FEEDBACK RECORDINGS AI - OVERVIEW</h1>
                </div>


                <div className={`d-flex gap-3 mb-3 ${isMobile ? "flex-wrap" : ""}`}>
                    <div style={{ width: isMobile ? "35%" : "auto" }}>
                        <label>From Date</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type="date"
                                className="form-control pe-5"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />

                            {fromDate && (
                                <button
                                    type="button"
                                    onClick={() => setFromDate("")}
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        border: "none",
                                        background: "transparent",
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        lineHeight: 1
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ width: isMobile ? "35%" : "auto" }}>
                        <label>To Date</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type="date"
                                className="form-control pe-5"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />

                            {toDate && (
                                <button
                                    type="button"
                                    onClick={() => setToDate("")}
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        border: "none",
                                        background: "transparent",
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        lineHeight: 1
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>


                    <div className="d-flex align-items-end" style={{ width: isMobile ? "20%" : "auto" }}>
                        <button
                            className="btn btn-primary px-4"
                            style={{ height: "38px" }}
                            onClick={loadFeedbackRecordingOverviews}
                            disabled={callLoading}
                        >
                            {callLoading ? (
                                <Spinner size="sm" />
                            ) : isMobile ? (
                                <FaFilter />
                            ) : (
                                "Filter"
                            )}
                        </button>
                    </div>


                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">

                    {/* LEFT SIDE FILTERS */}
                    <div className="d-flex gap-3">

                        <div>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter Agent name or UCID"
                                value={agentOrUcid}
                                onChange={(e) => setAgentOrUcid(e.target.value)}
                            />
                        </div>



                        <div style={{ width: "150px" }}>
                            <Select
                                options={talkTimeOptions}
                                value={talkTimeOptions.find(opt => opt.value === talkTimeFilter)}
                                onChange={(selected) => setTalkTimeFilter(selected?.value || "")}
                                placeholder="Talk Time"
                                isSearchable={false}
                            />
                        </div>

                    </div>


                </div>

                <div className="d-flex justify-content-between align-items-center p-2">

                    {/* LEFT SIDE */}
                    <Label className="mb-0 text-dark fw-semibold">
                        Total Recordings: {pagination?.totalRecords}
                    </Label>

                    {/* RIGHT SIDE */}
                    <button
                        className="btn btn-success d-flex align-items-center gap-2"
                        onClick={handleExportFeedbackExcel}
                        disabled={callLoading || exportLoading}
                    >
                        {exportLoading && <Spinner size="sm" />}
                        {exportLoading ? "Exporting..." : "Export Excel"}
                    </button>

                </div>

                <DataTableComponent
                    columns={FeedbackRecordingsOverviewColumns({ page, limit })}
                    data={overviews}
                    loading={callLoading}
                    pagination={pagination}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                />
            </CardBody>
        </>
    )
}

export default Feedback