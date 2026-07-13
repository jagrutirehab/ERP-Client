import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import Select from "react-select";
import { Card, CardBody, Col, Row, Input, Button } from "reactstrap";
import { toast } from "react-toastify";
import {
  getEmployeeForms,
  deleteEmployeeForm,
  editEmployeeForm,
} from "../../../helpers/backend_helper";
import FormActionModal from "./components/FormActionModal";
import PreviewModal from "./components/PreviewModal";
import { useSelector } from "react-redux";
import DataTableComponent from "../../../Components/Common/DataTable";
import { FormColumns } from "../components/columns/FormColumn";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useCenterOptions } from "../../../Components/Hooks/useCenterOptions";

const FILE_TYPE_OPTIONS = [
  { value: "Form26AS", label: "Form 26AS" },
  { value: "TDS", label: "TDS" },
  { value: "Form16", label: "Form 16" },
  { value: "Payslip", label: "Payslip" },
];

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((m) => ({ value: m, label: m }));

const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});

const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const Forms = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    fileType: null,
    year: null,
    month: null,
  });
  const [modal, setModal] = useState({ open: false, type: null, row: null });
  const [previewRow, setPreviewRow] = useState(null);

  const user = useSelector((state) => state.User);
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const isFirstRender = useRef(true);

  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const hasWrite = hasPermission("HR", "EMPLOYEE_FORMS", "WRITE");
  const hasDelete = hasPermission("HR", "EMPLOYEE_FORMS", "DELETE");

  const centerOptions = useCenterOptions();

  const fetchForms = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await getEmployeeForms(params);
      setData(response?.data?.payload || response?.payload || []);
      setPagination(response?.data?.pagination || response?.pagination || {});
    } catch {
      toast.error("Failed to fetch forms.");
    } finally {
      setLoading(false);
    }
  }, []);

  const buildParams = useCallback(
    (overridePage) => {
      const params = { page: overridePage ?? page, limit };
      if (search) params.search = search;
      if (filters.fileType) params.fileType = filters.fileType.value;
      if (filters.year) params.year = filters.year.value;
      if (filters.month) params.month = filters.month.value;
      if (selectedCenter === "ALL") {
        params.centers = user?.centerAccess?.join(",") || "";
      } else if (selectedCenter) {
        params.centers = selectedCenter;
      } else {
        params.centers = "";
      }
      return params;
    },
    [search, filters, selectedCenter, page, limit, user?.centerAccess],
  );

  const debouncedFetch = useMemo(
    () => debounce((params) => fetchForms(params), 400),
    [fetchForms],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchForms(buildParams());
      return;
    }
    fetchForms(buildParams());
  }, [page, limit, filters, selectedCenter, user?.centerAccess]);

  useEffect(() => {
    if (isFirstRender.current) return;
    debouncedFetch(buildParams());
  }, [search]);

  const handleFilterChange = (key, opt) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: opt }));
  };

  const handleReset = () => {
    setSearch("");
    setFilters({ fileType: null, year: null, month: null });
    setSelectedCenter("ALL");
    setPage(1);
  };

  const openModal = (type, row) => setModal({ open: true, type, row });
  const closeModal = () => setModal({ open: false, type: null, row: null });

  const handleConfirm = async (payload) => {
    try {
      setActionLoading(true);

      if (modal.type === "delete") {
        await deleteEmployeeForm(payload.docId, payload.fileId);
        toast.success("File deleted successfully.");
      }

      if (modal.type === "edit") {
        const formData = new FormData();
        formData.append("docId", payload.docId);
        formData.append("fileId", payload.fileId);
        if (payload.fileType?.value)
          formData.append("fileType", payload.fileType.value);
        if (payload.year?.value) formData.append("year", payload.year.value);
        if (payload.month?.value) formData.append("month", payload.month.value);
        if (payload.file) formData.append("file", payload.file);

        await editEmployeeForm(formData);
        toast.success("Form updated successfully.");
      }

      closeModal();
      fetchForms(buildParams());
    } catch (error) {
      toast.error(error?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const rows = useMemo(() => {
    return data.map((row) => ({
      docId: row._id,
      fileId: row.fileId,
      employeeName: row.employee?.name || "—",
      eCode: row.employee?.eCode || "—",
      fileType: row.fileType,
      year: row.year,
      month: row.month || null,
      fileName: row.file?.originalName || row.file?.name,
      type: row.file?.type,
      url: row.file?.url,
      createdAt: row.createdAt,
      center: row.employee?.currentLocation?.title,
    }));
  }, [data]);

  const handleLimitChange = (newLimit) => {
    setPage(1);
    setLimit(newLimit);
  };

  return (
    <>
      <CardBody
        className="p-3 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="text-center text-md-left mb-4">
          <h1 className="display-6 fw-bold text-primary">EMPLOYEE FORMS</h1>
        </div>

        <Row>
          <Col xs={12}>
            <Card className="shadow-sm">
              <CardBody className="p-4">
                <Row className="g-3 mb-4 align-items-center">
                  <Col md={3}>
                    <Input
                      placeholder="Search by name or eCode..."
                      value={search}
                      onChange={(e) => {
                        setPage(1);
                        setSearch(e.target.value);
                      }}
                    />
                  </Col>
                  <Col md={2}>
                    <Select
                      placeholder="Form Type"
                      isClearable
                      options={FILE_TYPE_OPTIONS}
                      classNamePrefix="react-select"
                      value={filters.fileType}
                      onChange={(opt) => handleFilterChange("fileType", opt)}
                    />
                  </Col>
                  <Col md={2}>
                    <Select
                      placeholder="Year"
                      isClearable
                      options={YEAR_OPTIONS}
                      classNamePrefix="react-select"
                      value={filters.year}
                      onChange={(opt) => handleFilterChange("year", opt)}
                    />
                  </Col>
                  <Col md={2}>
                    <Select
                      placeholder="Month"
                      isClearable
                      options={MONTH_OPTIONS}
                      classNamePrefix="react-select"
                      value={filters.month}
                      onChange={(opt) => handleFilterChange("month", opt)}
                    />
                  </Col>
                  <Col md={2}>
                    <Select
                      options={centerOptions}
                      value={
                        centerOptions.find((c) => c.value === selectedCenter) ||
                        null
                      }
                      onChange={(selected) => {
                        setPage(1);
                        setSelectedCenter(selected ? selected.value : "ALL");
                      }}
                      placeholder="Select Center"
                      isDisabled={!centerOptions.length}
                      // isClearable
                    />
                  </Col>
                  <Col md={1}>
                    <Button
                      color="secondary"
                      outline
                      size="sm"
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                  </Col>
                </Row>

                <DataTableComponent
                  columns={FormColumns({
                    onView: (row) => setPreviewRow(row),
                    onEdit: (row) => openModal("edit", row),
                    onDelete: (row) => openModal("delete", row),
                    hasWrite,
                    hasDelete,
                  })}
                  data={rows}
                  loading={loading}
                  pagination={pagination}
                  page={page}
                  setPage={setPage}
                  limit={limit}
                  setLimit={handleLimitChange}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>

        <PreviewModal
          isOpen={!!previewRow}
          onClose={() => setPreviewRow(null)}
          row={previewRow}
        />

        <FormActionModal
          isOpen={modal.open}
          type={modal.type}
          row={modal.row}
          onClose={closeModal}
          onConfirm={handleConfirm}
          loading={actionLoading}
        />
      </CardBody>
    </>
  );
};

export default Forms;
