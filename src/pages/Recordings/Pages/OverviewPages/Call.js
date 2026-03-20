import React, { useEffect, useState } from 'react'
import { getCallRecordingOverview } from '../../../../helpers/backend_helper';
import { CardBody, Label, Spinner } from 'reactstrap';
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import DataTableComponent from '../../../../Components/Common/DataTable';
import { CallRecordingsOverviewColumns } from '../../Columns/CallOverview';
import Select from "react-select";

const Call = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [overviews, setOverviews] = useState([]);
  const [callLoading, setCallLoading] = useState(false);
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


  return (
    <>
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="text-center text-md-left mb-4">
          <h1 className="display-6 fw-bold text-primary">CALL RECORDINGS AI - OVERVIEW</h1>
        </div>


        <div className="d-flex gap-3 mb-3">
          <div>
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

          <div>
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


          <div className="d-flex align-items-end">
            <button
              className="btn btn-primary px-4"
              style={{ height: "38px" }}
              onClick={loadCallRecordingOverviews}
              disabled={callLoading}
            >
              {callLoading ? <Spinner size="sm" /> : "Filter"}
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

        <div className="d-flex justify-content-end p-2">
          <Label className="mb-0 text-dark">
            Total Recordings: {pagination?.totalRecords}
          </Label>
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