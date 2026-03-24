import React, { useState, useEffect, useRef } from 'react'
import { bulkGenerateFeedbackOverviewRecording, bulkGenerateOverviewRecording, generateFeedbackOverviewRecording, generateOverviewRecording, getFeedbackRecordings, uploadFeedbackXlsx, uploadXlsx } from '../../../helpers/backend_helper';
import { toast } from 'react-toastify';
import { CardBody, Label, Spinner } from 'reactstrap';
import { useMediaQuery } from '../../../Components/Hooks/useMediaQuery';
import DataTableComponent from '../../../Components/Common/DataTable';
import { callRecordingsColumns } from '../Columns/callRecordingsColumn';
import { useNavigate } from "react-router-dom";
import GenerateOverviewModal from '../Components/GenerateOverviewModal';
import Select from "react-select";
import BulkOverviewModal from '../Components/BulkOverviewModal';
import { all } from 'axios';
import UploadXlsxModal from '../Components/UploadXlsxModal';
import { useSelector } from 'react-redux';
import { usePermissions } from '../../../Components/Hooks/useRoles';
import { feedbackRecordingsColumns } from '../Columns/feedbackColumn';
import BulkFeedbackModal from '../Components/BulkFeedbackModal';
import { FaFilter } from "react-icons/fa";

const FeedbackRecording = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalDocs: 0
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [agentOrUcid, setAgentOrUcid] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const [overviewFilter, setOverviewFilter] = useState("");
  const [talkTimeFilter, setTalkTimeFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showBulkOverviewModal, setShowBulkOverviewModal] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const { hasPermission, loading: isLoading } = usePermissions(token);

  const hasReadPermission = hasPermission("RECORDINGS", "FEEDBACK_RECORDINGS", "READ");
  const hasWritePermission = hasPermission("RECORDINGS", "FEEDBACK_RECORDINGS", "WRITE");
  const hasDeletePermission = hasPermission("RECORDINGS", "FEEDBACK_RECORDINGS", "DELETE");
  const canAction = hasWritePermission || hasDeletePermission;

  // const fileInputRef = useRef(null);

  const loadRecordings = async (page = pagination?.page, limit = pagination?.limit) => {
    setLoading(true);

    try {
      const response = await getFeedbackRecordings({
        fromDate,
        toDate,
        page,
        limit,
        search: debouncedSearch,
        location: debouncedLocation,
        overview: overviewFilter,
        talkTime: talkTimeFilter
      });


      setRecordings(response?.data || []);

      setPagination({
        ...response?.pagination,
        totalDocs: response?.pagination?.totalRecords
      });

    } catch (error) {
      toast.error("Failed to load recordings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings(page, limit);
  }, [page, limit, debouncedSearch, debouncedLocation, overviewFilter, talkTimeFilter]);

  const HandleGenerateOverview = async () => {
    setGenerateLoading(true);
    try {
      const id = selectedRecording?._id
      const recordingUrl = selectedRecording?.Files?.recording_url
      const response = await generateFeedbackOverviewRecording(id, recordingUrl);
      console.log("Response", response);
      if (response?.geminiResponse?.startsWith("API Error")) {
        toast.error("Failed to generate overview with API error");
      } else {
        toast.success(response?.message);
      }
      loadRecordings(page, limit);
      setShowGenerateModal(false);
    } catch (error) {
      console.error("Error generating overview:", error);
      toast.error(error?.message || "Failed to generate overview");
    } finally {
      setGenerateLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(agentOrUcid);
    }, 400);

    return () => clearTimeout(timer);
  }, [agentOrUcid]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(locationSearch);
    }, 400);

    return () => clearTimeout(timer);
  }, [locationSearch]);


  const overviewOptions = [
    { value: "", label: "Sort By Overview" },
    { value: "generated", label: "Generated" },
    { value: "not_generated", label: "Not Generated" },
  ];

  const talkTimeOptions = [
    { value: "", label: "Talk Time" },
    { value: "0_2", label: "0 - 2 min" },
    { value: "2_5", label: "2 - 5 min" },
    { value: "5_10", label: "5 - 10 min" },
    { value: "10_15", label: "10 - 15 min" },
    { value: "over_15", label: "Over 15 min" }
  ];

  const handleGenerateBulkOverview = async (allIds) => {
    const total = allIds.length;
    let completed = 0;
    const chunkSize = 5;

    setBulkProgress(0);

    try {
      for (let i = 0; i < allIds.length; i += chunkSize) {
        const chunk = allIds.slice(i, i + chunkSize);

        const response = await bulkGenerateFeedbackOverviewRecording({ ids: chunk });
        console.log("Response", response);


        completed += chunk.length;
        setBulkProgress(Math.round((completed / total) * 100));
        toast.success(`Bulk overview generation completed successfully succeed : ${response?.summary?.success}, failed : ${response?.summary?.failed}`);
      }

      loadRecordings(page, limit);
      return true;
    } catch (error) {
      toast.error(error?.message || "Failed during bulk generation");
      return false;
    } finally {
      setBulkProgress(0);
    }
  };



  // 
  const handleUploadFile = async (file) => {

    const formData = new FormData();
    formData.append("file", file);

    try {

      setUploading(true);

      console.log("Uploading file:", file);

      const response = await uploadFeedbackXlsx(formData);

      console.log("Upload response:", response);

      toast.success("File uploaded successfully");

      loadRecordings(page, limit);

      setShowUploadModal(false);

    } catch (error) {
      toast.error(error?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };



  return (
    <>
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="text-center text-md-left mb-4">
          <h1 className="display-6 fw-bold text-primary">FEEDBACK RECORDINGS</h1>
        </div>

        {/* Filters */}
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


          <div className="d-flex align-items-end"style={{ width: isMobile ? "20%" : "auto" }}>
            <button
              className="btn btn-primary d-flex align-items-center justify-content-center"
              style={{
                height: "38px",
                width: isMobile ? "38px" : "auto",
                padding: isMobile ? "0" : "0 16px"
              }}
              onClick={loadRecordings}
              disabled={loading}
            >
              {loading ? (
                <Spinner size="sm" />
              ) : isMobile ? (
                <FaFilter />
              ) : (
                "Filter"
              )}
            </button>
          </div>


        </div>

        <div
          className={`d-flex mb-3 ${isMobile
            ? "flex-column gap-2"
            : "justify-content-between align-items-center"
            }`}
        >

          {/* LEFT SIDE FILTERS */}
          <div className={`d-flex gap-3 ${isMobile ? "flex-wrap" : ""}`}>

            <div>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Agent name or UCID"
                value={agentOrUcid}
                onChange={(e) => setAgentOrUcid(e.target.value)}
              />
            </div>

            <div>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Location"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
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

          {/* RIGHT SIDE BUTTONS */}
          {canAction && <div className={`d-flex gap-2 ${isMobile ? "flex-column w-100 mt-2" : ""
            }`}>

            <button
              className="btn btn-success"
              // disabled={selectedRows.length === 0}
              onClick={() => setShowBulkOverviewModal(true)}
            >
              Generate Overview
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setShowUploadModal(true)}
            >
              Upload XLSX
            </button>

          </div>}

        </div>

        <div className="d-flex justify-content-end align-items-center gap-3 mb-3">
          <Label className="mb-0 text-dark">
            Total Recordings: {pagination.totalDocs}
          </Label>
          <div style={{ width: "120px" }}>
            <Select
              options={overviewOptions}
              value={overviewOptions.find(opt => opt.value === overviewFilter)}
              onChange={(selected) => setOverviewFilter(selected?.value || "")}
              placeholder="Filter By Overview"
              isSearchable={false}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "38px",
                  height: "38px",
                  fontSize: "14px"
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  height: "38px"
                }),
                valueContainer: (base) => ({
                  ...base,
                  height: "38px",
                  padding: "0 8px"
                })
              }}
            />
          </div>

        </div>

        <DataTableComponent
          columns={feedbackRecordingsColumns(
            page,
            limit,
            navigate,
            recordings,
            setSelectedRecording,
            setShowGenerateModal,
            canAction
          )}
          loading={loading}
          data={recordings}
          pagination={pagination}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          selectableRows={true}
          onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
        />

        <GenerateOverviewModal
          isOpen={showGenerateModal}
          toggle={() => setShowGenerateModal(false)}
          selectedRecording={selectedRecording}
          onGenerate={HandleGenerateOverview}
          loading={generateLoading}
        />

      </CardBody>
      <BulkFeedbackModal
        isOpen={showBulkOverviewModal}
        toggle={() => setShowBulkOverviewModal(false)}
        onGenerate={handleGenerateBulkOverview}
        selectedRows={recordings}
        totalAvailable={pagination.totalDocs}
        currentFilters={{ fromDate, toDate }}
        progress={bulkProgress}
      />
      <UploadXlsxModal
        isOpen={showUploadModal}
        toggle={() => setShowUploadModal(false)}
        onUpload={handleUploadFile}
        loading={uploading}
      />
    </>
  )
}

export default FeedbackRecording