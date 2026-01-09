import React from "react";
import {
  Table,
  Button,
  Pagination,
  PaginationItem,
  PaginationLink,
  Input,
} from "reactstrap";
import { usePermissions } from "../../Components/Hooks/useRoles";
import RenderWhen from "../../Components/Common/RenderWhen";

const PendingReferralsList = ({
  pendingReferrals,
  loading,
  onApprove,
  onReject,
  pagination = { total: 0, page: 1, limit: 10, totalPages: 0 },
  onPageChange,
}) => {
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);

  const hasApproveReferralPermission = hasPermission(
    "REFERRAL",
    "APPROVE_REFERRAL",
    "WRITE"
  );
  const hasRejectReferralPermission = hasPermission(
    "REFERRAL",
    "REJECT_REFERRAL",
    "WRITE"
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, pagination?.totalPages || 1);
  const currentPage = pagination?.page || 1;

  const renderPagination = () => {
    if (!pendingReferrals || pendingReferrals.length === 0) return null;

    const maxButtons = 5;
    const start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);

    const pages = [];
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }

    const from = (currentPage - 1) * (pagination.limit || 10) + 1;
    const to = Math.min(
      currentPage * (pagination.limit || 10),
      pagination?.total || pendingReferrals.length
    );

    return (
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-3 pt-3 border-top">
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">
            Showing {from}-{to} of {pagination?.total || 0}
          </small>
        </div>
        <div className="d-flex align-items-center gap-3 ms-md-auto">
          <div className="d-none d-md-flex align-items-center gap-2">
            <small className="text-muted">Items per page:</small>
            <Input
              type="select"
              bsSize="sm"
              value={pagination.limit}
              onChange={(e) =>
                onPageChange({
                  page: 1,
                  limit: Number(e.target.value),
                })
              }
              style={{ width: 100 }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Input>
          </div>
          <Pagination className="mb-0">
            <PaginationItem disabled={currentPage === 1}>
              <PaginationLink
                first
                onClick={() => onPageChange({ ...pagination, page: 1 })}
              />
            </PaginationItem>
            <PaginationItem disabled={currentPage === 1}>
              <PaginationLink
                previous
                onClick={() =>
                  onPageChange({ ...pagination, page: currentPage - 1 })
                }
              />
            </PaginationItem>
            {pages.map((p) => (
              <PaginationItem key={p} active={p === currentPage}>
                <PaginationLink
                  onClick={() => onPageChange({ ...pagination, page: p })}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem disabled={currentPage === totalPages}>
              <PaginationLink
                next
                onClick={() =>
                  onPageChange({ ...pagination, page: currentPage + 1 })
                }
              />
            </PaginationItem>
            <PaginationItem disabled={currentPage === totalPages}>
              <PaginationLink
                last
                onClick={() =>
                  onPageChange({ ...pagination, page: totalPages })
                }
              />
            </PaginationItem>
          </Pagination>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="table-responsive">
        <Table className="table-bordered table-nowrap align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th scope="col">Doctor Name</th>
              <th scope="col">Patient Name</th>
              <th scope="col">Phone Number</th>
              <th scope="col">Created Date</th>
              <th scope="col" style={{ width: "150px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pendingReferrals && pendingReferrals.length > 0 ? (
              pendingReferrals.map((referral) => (
                <tr key={referral._id}>
                  <td className="text-capitalize">{referral.doctorName}</td>
                  <td className="text-capitalize">
                    {referral.patient?.name || "—"}
                  </td>
                  <td>{referral.patient?.phoneNumber || "—"}</td>
                  <td>{new Date(referral.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <RenderWhen isTrue={hasApproveReferralPermission}>
                        <Button
                          color="success"
                          size="sm"
                          onClick={() => onApprove(referral)}
                        >
                          <i className="ri-check-line me-1"></i>Approve
                        </Button>
                      </RenderWhen>
                      <RenderWhen isTrue={hasRejectReferralPermission}>
                        <Button
                          color="danger"
                          size="sm"
                          onClick={() => onReject(referral)}
                        >
                          <i className="ri-close-line me-1"></i>Reject
                        </Button>
                      </RenderWhen>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No pending referrals
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      {renderPagination()}
    </>
  );
};

export default PendingReferralsList;
