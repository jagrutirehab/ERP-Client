import { useState } from "react";
import DataTable from "react-data-table-component";
import { BiometricReqsColumn } from "../../../components/columns/BiometricReqsColumn";
import ApproveBiometricModal from "../../../components/ApproveBiometricModal";
const PendingApprovals = ({
  data,
  refetch,
  pagination,
  page,
  limit,
  onPageChange,
  onLimitChange,
  isMobile,
  hasWritePermission,
}) => {
  const [modal, setModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [status, setStatus] = useState("");

  const handleAction = (row, actionStatus) => {
    setSelectedRow(row);
    setStatus(actionStatus);
    setModal(true);
  };

  return (
    <div>
      <DataTable
        columns={BiometricReqsColumn({
          onApprove: (row) => handleAction(row, "approved"),
          onReject: (row) => handleAction(row, "rejected"),
          hasWritePermission,
        })}
        data={Array.isArray(data) ? data : []}
        pagination
        paginationServer
        paginationTotalRows={pagination?.totalDocs}
        paginationPerPage={limit}
        paginationDefaultPage={page}
        onChangePage={onPageChange}
        onChangeRowsPerPage={onLimitChange}
        highlightOnHover
        striped
        fixedHeader
        fixedHeaderScrollHeight="500px"
        dense={isMobile}
        responsive
      />
      <ApproveBiometricModal
        isOpen={modal}
        toggle={() => setModal(false)}
        row={selectedRow}
        status={status}
        onSuccess={refetch}
      />
    </div>
  );
};

export default PendingApprovals;
