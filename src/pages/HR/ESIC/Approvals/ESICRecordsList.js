import React, { useCallback, useEffect, useState } from "react";
import { Button } from "reactstrap";
import { CheckCheck, Pencil, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import DataTableComponent from "../../../../Components/Common/DataTable";
import PreviewFile from "../../../../Components/Common/PreviewFile";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { useDebounce } from "../../../../Components/Hooks/useDebounce";
import { getESICRecords } from "../../../../helpers/backend_helper";
import EditESICModal from "./EditESICModal";
import DeleteESICModal from "./DeleteESICModal";
import ESICActionModal from "./ESICActionModal";

const ESICRecordsList = ({ status, centers, search }) => {
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission } = usePermissions(token);
  const canWrite = hasPermission("HR", "ESIC_APPROVAL", "WRITE");
  const canDelete = hasPermission("HR", "ESIC_APPROVAL", "DELETE");

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [actionRecord, setActionRecord] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const debouncedSearch = useDebounce(search, 400);
  const centersKey = JSON.stringify(centers);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getESICRecords({
        status,
        centers,
        search: debouncedSearch,
        page,
        limit,
      });
      setData(response.data || []);
      setPagination(response.pagination || {});
    } catch (error) {
      toast.error(error?.message || "Failed to fetch ESIC records");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, centersKey, debouncedSearch, page, limit]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, centersKey, debouncedSearch]);

  const columns = [
    {
      name: "eCode",
      selector: (row) => row.employee?.eCode,
      sortable: true,
      wrap: true,
      minWidth: "130px",
    },
    {
      name: "Employee Name",
      selector: (row) => row.employee?.name,
      sortable: true,
      wrap: true,
      minWidth: "180px",
    },
    {
      name: "Center",
      selector: (row) => row.center?.title,
      wrap: true,
      minWidth: "140px",
    },
    {
      name: "Description",
      selector: (row) => row.description || "—",
      wrap: true,
      minWidth: "180px",
    },
    {
      name: "Files",
      cell: (row) => (
        <div className="d-flex flex-column align-items-start py-1">
          {row.files?.length ? (
            row.files.map((file, idx) => (
              <span
                key={file.path || idx}
                className="text-primary text-decoration-underline cursor-pointer"
                title={file.originalName || file.name}
                onClick={() => setPreviewFile(file)}
              >
                {`File ${idx + 1}`}
              </span>
            ))
          ) : (
            "—"
          )}
        </div>
      ),
      wrap: true,
    },
    ...(status !== "PENDING"
      ? [
          {
            name: "Note",
            selector: (row) => row.note || "—",
            wrap: true,
            minWidth: "180px",
          },
          {
            name: "Acted By",
            selector: (row) => row.actedBy?.name || "—",
            wrap: true,
            minWidth: "150px",
          },
        ]
      : []),
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {status === "PENDING" && canWrite && (
            <Button
              size="sm"
              color="primary"
              outline
              title="Edit"
              onClick={() => setEditRecord(row)}
            >
              <Pencil size={16} />
            </Button>
          )}
          {status === "PENDING" && canWrite && (
            <Button
              size="sm"
              color="success"
              className="text-white"
              title="Approve"
              onClick={() => {
                setActionRecord(row);
                setActionType("APPROVE");
              }}
            >
              <CheckCheck size={18} />
            </Button>
          )}
          {status === "PENDING" && canWrite && (
            <Button
              size="sm"
              color="danger"
              className="text-white"
              title="Reject"
              onClick={() => {
                setActionRecord(row);
                setActionType("REJECT");
              }}
            >
              <X size={16} />
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              color="danger"
              className="text-white"
              title="Delete"
              onClick={() => setDeleteRecord(row)}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "180px",
    },
  ];

  return (
    <>
      <DataTableComponent
        columns={columns}
        data={data}
        pagination={pagination}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        loading={loading}
        noDataComponent={
          centers.length === 0
            ? "Select a center above to view ESIC records"
            : "No records found"
        }
      />

      {editRecord && (
        <EditESICModal
          record={editRecord}
          isOpen={!!editRecord}
          toggle={() => setEditRecord(null)}
          onSuccess={() => {
            setEditRecord(null);
            fetchRecords();
          }}
        />
      )}

      {deleteRecord && (
        <DeleteESICModal
          record={deleteRecord}
          isOpen={!!deleteRecord}
          toggle={() => setDeleteRecord(null)}
          onSuccess={() => {
            setDeleteRecord(null);
            fetchRecords();
          }}
        />
      )}

      {actionRecord && (
        <ESICActionModal
          record={actionRecord}
          actionType={actionType}
          isOpen={!!actionRecord}
          toggle={() => {
            setActionRecord(null);
            setActionType(null);
          }}
          onSuccess={() => {
            setActionRecord(null);
            setActionType(null);
            fetchRecords();
          }}
        />
      )}

      <PreviewFile
        title={previewFile?.originalName || previewFile?.name || "Attachment"}
        file={previewFile}
        isOpen={!!previewFile}
        toggle={() => setPreviewFile(null)}
        allowDownload
      />
    </>
  );
};

export default ESICRecordsList;
