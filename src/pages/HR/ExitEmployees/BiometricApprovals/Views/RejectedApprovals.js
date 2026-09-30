import DataTable from "react-data-table-component";
import { BiometricReqsColumn } from "../../../components/columns/BiometricReqsColumn";
import { ExitBiometricRequests } from "../../../components/columns/ExitBiometricRequests";

const RejectedApprovals = ({
  data,
  pagination,
  page,
  limit,
  onPageChange,
  onLimitChange,
  isMobile,
}) => {
  return (
    <div>
      <DataTable
        columns={ExitBiometricRequests({ status: "rejected", type: "exit" })}
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
    </div>
  );
};

export default RejectedApprovals;
