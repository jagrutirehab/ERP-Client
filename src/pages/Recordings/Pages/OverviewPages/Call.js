import React, { useEffect, useState } from 'react'
import { getCallRecordingOverview } from '../../../../helpers/backend_helper';
import { CardBody, Label, Spinner } from 'reactstrap';
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import DataTableComponent from '../../../../Components/Common/DataTable';
import { CallRecordingsOverviewColumns } from '../../Columns/CallOverview';
import Select from "react-select";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFilter } from 'react-icons/fa';

const Call = () => {
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

  const loadCallRecordingOverviews = async () => {
    setCallLoading(true)
    try {
      const response = await getCallRecordingOverview({
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
  useEffect(() => { loadCallRecordingOverviews() }, [page, limit, debouncedSearch, talkTimeFilter])
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

  console.log("pagination", pagination);

  const scoreLabels = {
    C1: "Pro greeting (Org/Name)",
    C2: "Calm/Empathetic tone",
    C3: "No interruptions/Active listening",
    C4: "Relevant probing questions",
    C5: "No repetitive questions",
    C6: "Accurate service info (IPD/OPD/Psych/Elder)",
    C7: "Tailored response to needs",
    C8: "Correct location/charges info",
    C9: "No price/discount talk before understanding issue",
    C10: "Explored room/budget before discount",
    C11: "Pitched OPD only if IPD unaffordable/unsuitable",
    C12: "No treatment guarantees",
    C13: "Asked visit timeline",
    C14: "Offered visit/CM escalation",
    C15: "Asked for more queries",
    C16: "Positive close + Next steps",
    C17: "Not rushed",
    C18: "Overall Experience",
  };

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

  const formatExportData = (data) => {
    return data.map((row, index) => {
      const parsed = getSafeParsedData(row?.Files?.geminiResponse);

      return {
        Index: index + 1,
        UCID: row?.UCID || "-",
        Agent: row?.Agent || "-",
        "Call Date": row?.Call_Date || "-",
        "Talk Time": row?.Talk_Time || "-",
        "Recording URL": row?.Files?.recording_url || row?.Files?.Recording_URL || "-",

        Strengths: Array.isArray(parsed?.strengths)
          ? parsed.strengths.join(" | ")
          : parsed?.strengths || "-",

        Weaknesses: Array.isArray(parsed?.weaknesses)
          ? parsed.weaknesses.join(" | ")
          : parsed?.weaknesses || "-",

        Coaching: parsed?.coaching || "-",

        // 🔥 Custom labeled columns
        ...Object.fromEntries(
          Object.keys(scoreLabels).map((key) => [
            `${key} - ${scoreLabels[key]}`, // 👈 THIS IS MAGIC
            parsed?.scores?.[key] ?? "-"
          ])
        ),
      };
    });
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {

      let allData = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getCallRecordingOverview({
          fromDate,
          toDate,
          page: currentPage,
          limit: 500, // backend safe limit
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

      const formattedData = formatExportData(allData);

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Call Overview");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, "call-overview.xlsx");

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
          <h1 className="display-6 fw-bold text-primary">CALL RECORDINGS AI - OVERVIEW</h1>
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
              onClick={loadCallRecordingOverviews}
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
            onClick={handleExportExcel}
            disabled={callLoading}
          >
            {exportLoading && <Spinner size="sm" />}
            {exportLoading ? "Exporting..." : "Export Excel"}
          </button>

        </div>

        <DataTableComponent
          columns={CallRecordingsOverviewColumns({ page, limit })}
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

export default Call