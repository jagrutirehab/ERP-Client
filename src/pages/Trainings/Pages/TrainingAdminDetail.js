import React, { useEffect, useState } from "react";
import { CardBody, Nav, NavItem, NavLink, Spinner } from "reactstrap";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getTrainingAdminContent,
  getTrainingProgressReport,
} from "../../../helpers/backend_helper";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import PreviewFile from "../../../Components/Common/PreviewFile";
import { getErrorMessage } from "../Helpers/learnHelpers";
import { useAccordion } from "../Helpers/useAccordion";
import { formatDate } from "../Helpers/adminTrainingHelpers";
import { useCenterFilter } from "../Helpers/centerFilter";
import CenterSelect from "../Components/CenterSelect";
import ExportButton from "../Components/ExportButton";
import CycleSelector from "../Components/AllTrainings/CycleSelector";
import AttendeesTable from "../Components/AllTrainings/AttendeesTable";
import LessonBlock from "../Components/AllTrainings/LessonBlock";
import MediaPlayerModal from "../Components/AllTrainings/MediaPlayerModal";
import NotStartedTable from "../Components/AllTrainings/NotStartedTable";
import TrainingOverviewBlock from "../Components/AllTrainings/TrainingOverviewBlock";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "lessons", label: "Lessons" },
  { key: "not-started", label: "Not Started" },
  { key: "progress", label: "In Progress / Completed" },
];

const SummaryChip = ({ label, value, color }) => (
  <div className="border rounded px-3 py-2 text-center" style={{ minWidth: 110 }}>
    <div className="fw-bold" style={{ fontSize: 18, color }}>
      {value ?? "—"}
    </div>
    <div className="text-muted" style={{ fontSize: 11 }}>{label}</div>
  </div>
);

const TrainingAdminDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const backPath =
    routeLocation.state?.from === "history" ? "/trainings/history" : "/trainings/all";
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [playingMedia, setPlayingMedia] = useState(null);
  const centerFilter = useCenterFilter();
  const { cntrs } = centerFilter;

  const cycles = content?.cycles || [];
  const currentCycle = content?.cycle;
  const requestedCycle = Number(searchParams.get("cycle"));
  const cycle = cycles.some((item) => item.cycle === requestedCycle)
    ? requestedCycle
    : currentCycle;
  const cycleInfo = cycles.find((item) => item.cycle === cycle);
  const isPast = !!cycleInfo && !cycleInfo.current;
  const hasAudience = !isPast || cycleInfo.hasAudience;

  const visibleTabs = TABS.filter((item) => item.key !== "not-started" || hasAudience);
  const tab = visibleTabs.some((item) => item.key === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "overview";

  const lessonIds = (content?.lessons || []).map((lesson) => lesson._id);
  const [openLessonId, toggleLesson] = useAccordion(lessonIds, { openFirst: true });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await getTrainingAdminContent(id);
        setContent(response?.data);
        setLoadError(null);
      } catch (error) {
        setLoadError(
          getErrorMessage(error, "You may not have access, or this training no longer exists."),
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (cycle === undefined) return;
    const loadSummary = async () => {
      try {
        const response = await getTrainingProgressReport(id, {
          section: "started",
          ...(isPast && { cycle }),
          cntrs,
          limit: 1,
        });
        setSummary(response?.data?.summary || null);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load attendee summary"));
      }
    };
    loadSummary();
  }, [id, cycle, cntrs]);

  const changeTab = (key) =>
    setSearchParams(isPast ? { tab: key, cycle: String(cycle) } : { tab: key }, {
      replace: true,
      state: routeLocation.state,
    });

  const changeCycle = (value) =>
    setSearchParams(
      value === currentCycle ? { tab } : { tab, cycle: String(value) },
      { replace: true, state: routeLocation.state },
    );

  const tabCount = (key) => {
    if (key === "lessons") return content?.totals?.lessons;
    if (key === "not-started") return summary?.notStarted;
    if (key === "progress") return summary?.started;
    return null;
  };

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center text-center text-muted"
        style={{ width: isMobile ? "100%" : "78%", minHeight: "60vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  if (loadError || !content) {
    return (
      <CardBody className="p-4 bg-white">
        <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate(backPath)}>
          <i className="ri-arrow-left-line" /> Back
        </button>
        <p className="text-danger">{loadError || "Training not found."}</p>
      </CardBody>
    );
  }

  return (
    <CardBody className="p-4 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
      <div className="d-flex align-items-center gap-3 mb-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(backPath)}>
          <i className="ri-arrow-left-line" />
        </button>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <h4 className="fw-bold mb-0 text-truncate">{content.trainingName}</h4>
          <small className="text-muted">Training details and attendee progress</small>
        </div>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
        <SummaryChip
          label={hasAudience ? "Audience" : "Participants"}
          value={summary?.audience}
          color="#1d4ed8"
        />
        {hasAudience && (
          <SummaryChip label="Not started" value={summary?.notStarted} color="#4b5563" />
        )}
        <SummaryChip label="Started" value={summary?.started} color="#0369a1" />
        {isPast ? (
          <SummaryChip
            label="Did not complete"
            value={summary?.byStatus?.did_not_complete}
            color="#b91c1c"
          />
        ) : (
          <SummaryChip
            label="Pending acknowledgement"
            value={summary?.pendingAcknowledgement}
            color="#0f766e"
          />
        )}
        <SummaryChip label="Acknowledged" value={summary?.acknowledged} color="#15803d" />
        <div className="ms-auto d-flex align-items-center gap-2 flex-wrap">
          <CenterSelect
            options={centerFilter.options}
            value={centerFilter.value}
            onChange={centerFilter.onChange}
          />
          {cycles.length > 1 && (
            <CycleSelector cycles={cycles} value={cycle} onChange={changeCycle} />
          )}
          {hasAudience && (
            <ExportButton
              trainingId={id}
              label="Export everyone"
              params={{ section: "everyone", ...(isPast && { cycle }), cntrs }}
              disabled={!summary?.audience}
            />
          )}
        </div>
      </div>

      {isPast && (
        <div className="alert alert-warning py-2 mb-4" role="alert">
          <strong>Cycle {cycle}</strong> · {formatDate(cycleInfo.startedAt)} to{" "}
          {formatDate(cycleInfo.endedAt)} · read-only
          {!hasAudience && (
            <div className="small mt-1">
              The not started list is not available for this cycle because the audience was
              not recorded when it ended.
            </div>
          )}
        </div>
      )}

      <Nav tabs className="mb-4">
        {visibleTabs.map((item) => {
          const count = tabCount(item.key);
          return (
            <NavItem key={item.key}>
              <NavLink
                className={tab === item.key ? "active fw-semibold" : "text-muted"}
                style={{ cursor: "pointer" }}
                onClick={() => changeTab(item.key)}
              >
                {item.label}
                {count !== null && count !== undefined && (
                  <span className="badge bg-soft-primary text-primary ms-2">{count}</span>
                )}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>

      {tab === "overview" && (
        <TrainingOverviewBlock content={content} onViewFile={setPreviewFile} />
      )}

      {tab === "lessons" &&
        (content.lessons.length === 0 ? (
          <p className="text-muted text-center py-5">
            This training has no lessons. It is a single document with an optional quiz.
          </p>
        ) : (
          content.lessons.map((lesson, index) => (
            <LessonBlock
              key={lesson._id}
              lesson={lesson}
              index={index}
              open={openLessonId === lesson._id}
              onToggle={toggleLesson}
              onPlayMedia={setPlayingMedia}
              onViewFile={setPreviewFile}
            />
          ))
        ))}

      {tab === "not-started" && (
        <NotStartedTable
          key={cycle}
          trainingId={id}
          cycle={isPast ? cycle : undefined}
          cntrs={cntrs}
          onSummary={setSummary}
        />
      )}

      {tab === "progress" && (
        <AttendeesTable
          key={cycle}
          trainingId={id}
          cycle={isPast ? cycle : undefined}
          cntrs={cntrs}
          isPast={isPast}
          onSummary={setSummary}
        />
      )}

      <PreviewFile
        title={previewFile?.originalName || "File"}
        file={previewFile}
        isOpen={!!previewFile}
        toggle={() => setPreviewFile(null)}
        allowDownload
      />
      <MediaPlayerModal media={playingMedia} isOpen={!!playingMedia} onClose={() => setPlayingMedia(null)} />
    </CardBody>
  );
};

export default TrainingAdminDetail;
