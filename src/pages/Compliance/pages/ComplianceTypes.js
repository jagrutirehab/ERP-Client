import React, { useEffect, useRef, useState } from "react";
import { Card, CardBody, Row, Col, Button, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import Select from "react-select";
import DataTableComponent from "../../../Components/Common/DataTable";
import RefreshButton from "../../../Components/Common/RefreshButton";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import ComplianceTypeViewModal from "../components/ComplianceTypeViewModal";
import { getComplianceTypeColumns } from "../Columns/ComplianceTypeColumns";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useCenterOptions } from "../../../Components/Hooks/useCenterOptions";
import {
  fetchComplianceTypes,
  setComplianceTypeStatus,
} from "../../../store/features/compliance/complianceSlice";

const ComplianceTypes = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { roles } = usePermissions(token);

  const user = useSelector((state) => state.User);
  const { types, typesLoading, typesTotal } = useSelector((state) => state.Compliance);

  const [viewingType, setViewingType] = useState(null);
  const [deactivating, setDeactivating] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const centerOptions = useCenterOptions();

  const selectedCenterOption =
    centerOptions.find((opt) => opt.value === selectedCenter) || centerOptions[0];

  // If the centre access list changes (e.g. access revoked for the one
  // currently selected), fall back to "ALL" instead of filtering on a centre
  // the user can no longer see.
  useEffect(() => {
    if (selectedCenter !== "ALL" && !user?.centerAccess?.includes(selectedCenter)) {
      setSelectedCenter("ALL");
      setPage(1);
    }
  }, [user?.centerAccess, selectedCenter]);

  const searchPromiseRef = useRef(null);

  const loadTypes = (search = searchQuery, pageArg = page) => {
    searchPromiseRef.current?.abort();
    const trimmed = search.trim();
    const centerParam =
      selectedCenter === "ALL"
        ? (user?.centerAccess || []).map((c) => c?._id || c).join(",")
        : selectedCenter;
    const promise = dispatch(
      fetchComplianceTypes({
        search: trimmed || undefined,
        center: centerParam,
        page: pageArg,
        limit,
      }),
    );
    searchPromiseRef.current = promise;
    promise
      .unwrap()
      .catch((error) => {
        if (error?.aborted) return;
        toast.error(error?.message || "Failed to load compliance types");
      });
  };

  // centre, page, limit, or the user's centre access: reload from the server
  useEffect(() => {
    loadTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCenter, page, limit, user?.centerAccess]);

  const isFirstSearchRun = useRef(true);
  useEffect(() => {
    if (isFirstSearchRun.current) {
      isFirstSearchRun.current = false;
      return;
    }
    const handler = setTimeout(() => {
      setPage(1);
      loadTypes(searchQuery, 1);
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const confirmDeactivate = async () => {
    if (!deactivating) return;
    try {
      setStatusUpdating(true);
      await dispatch(
        setComplianceTypeStatus({ id: deactivating._id, active: !deactivating.active }),
      ).unwrap();
      setDeactivating(null);
    } catch (error) {
      toast.error(error?.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const columns = getComplianceTypeColumns({
    roles,
    openView: setViewingType,
    openEdit: (row) => navigate(`/compliance/types/${row._id}/edit`),
    handleToggleActive: setDeactivating,
  });

  return (
    <React.Fragment>
      <CardBody className="p-3 bg-white">
        <div className="d-flex flex-column h-100">
          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
            <div>
              <h5 className="mb-1 fw-semibold">Compliance types</h5>
              <p className="text-muted mb-0 fs-13">
                Master list of licence categories tracked across centres. New types don&apos;t
                automatically create items for every centre — add them per centre from the centre
                register.
              </p>
            </div>
            <CheckPermission accessRolePermission={roles?.permissions} subAccess="COMPLIANCE_TYPES" permission="create">
              <Button
                color="success"
                size="sm"
                className="text-white text-nowrap"
                onClick={() => navigate("/compliance/types/new")}
              >
                <Plus size={14} className="me-1" /> Add type
              </Button>
            </CheckPermission>
          </div>

          <Card className="mb-3 shadow-sm border-0" style={{ borderRadius: "0 0 8px 8px" }}>
            <CardBody className="py-3">
              <Row className="g-2 align-items-center">
                <Col md={4} lg={3}>
                  <Select
                    classNamePrefix="react-select"
                    options={centerOptions}
                    value={selectedCenterOption}
                    onChange={(option) => {
                      setSelectedCenter(option?.value);
                      setPage(1);
                    }}
                    placeholder="All Centers"
                  />
                </Col>
                <Col md={5} lg={4}>
                  <div className="position-relative">
                    <i
                      className="bx bx-search position-absolute text-muted"
                      style={{ top: "50%", left: 10, transform: "translateY(-50%)" }}
                    />
                    <Input
                      type="text"
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: 32 }}
                    />
                  </div>
                </Col>
                <Col md={3} lg={5} className="d-flex justify-content-end">
                  <RefreshButton onRefresh={() => loadTypes()} loading={typesLoading} />
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Card className="flex-grow-1 shadow-sm border-0 mb-0">
            <CardBody className="p-0 d-flex flex-column h-100">
              <div className="flex-grow-1 position-relative" style={{ minHeight: "500px" }}>
                <DataTableComponent
                  columns={columns}
                  data={types}
                  loading={typesLoading}
                  fixedHeader={false}
                  page={page}
                  setPage={setPage}
                  limit={limit}
                  setLimit={setLimit}
                  pagination={{ totalDocs: typesTotal }}
                  noDataComponent="No compliance types match your search."
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </CardBody>

      <ComplianceTypeViewModal
        isOpen={!!viewingType}
        toggle={() => setViewingType(null)}
        type={viewingType}
      />

      <ConfirmationModal
        isOpen={!!deactivating}
        toggle={() => setDeactivating(null)}
        title={deactivating?.active ? "Deactivate compliance type" : "Activate compliance type"}
        message={
          deactivating?.active
            ? `Are you sure you want to deactivate "${deactivating?.name || ""}"? It won't be selectable when adding a new compliance item.`
            : `Are you sure you want to activate "${deactivating?.name || ""}"? It will be selectable again when adding a new compliance item.`
        }
        confirmText={deactivating?.active ? "Deactivate" : "Activate"}
        confirmColor={deactivating?.active ? "danger" : "success"}
        confirmDisabled={statusUpdating}
        onConfirm={confirmDeactivate}
      />
    </React.Fragment>
  );
};

export default ComplianceTypes;
