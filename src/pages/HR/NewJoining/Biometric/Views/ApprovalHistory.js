import DataTable from "react-data-table-component";
import { BiometricReqsColumn } from "../../../components/columns/BiometricReqsColumn";

const ApprovalHistory = ({
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
        columns={BiometricReqsColumn({ status: "approved" })}
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

export default ApprovalHistory;
