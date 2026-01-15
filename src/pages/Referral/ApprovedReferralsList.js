import React from "react";
import {
  Table,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Pagination,
  PaginationItem,
  PaginationLink,
  Input,
} from "reactstrap";
import RenderWhen from "../../Components/Common/RenderWhen";

const ApprovedReferralsList = ({
  referrals,
  loading,
  onEdit,
  onDelete,
  hasUpdatePermission,
  hasDeletePermission,
  pagination = { total: 0, page: 1, limit: 10, totalPages: 0 },
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, pagination?.totalPages || 1);
  const currentPage = pagination?.page || 1;

  const renderPagination = () => {
    if (!referrals || referrals.length === 0) return null;

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
      pagination?.total || referrals.length
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
              <th scope="col">Speciality</th>
              <th scope="col">Hospital/Clinic</th>
              <th scope="col">Mobile Number</th>
              <th scope="col">Email</th>
              <th scope="col" style={{ width: "100px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {referrals && referrals.length > 0 ? (
              referrals.map((referral) => (
                <tr key={referral._id}>
                  <td className="text-capitalize">{referral.doctorName}</td>
                  <td className="text-capitalize">{referral.speciality}</td>
                  <td className="text-capitalize">{referral.hospitalClinic}</td>
                  <td>{referral.mobileNumber}</td>
                  <td>{referral.email || "—"}</td>
                  <td>
                    <UncontrolledDropdown>
                      <DropdownToggle
                        tag="button"
                        className="btn btn-sm btn-soft-secondary"
                      >
                        <i className="ri-more-fill"></i>
                      </DropdownToggle>
                      <DropdownMenu end strategy="fixed">
                        <RenderWhen isTrue={hasUpdatePermission}>
                          <DropdownItem onClick={() => onEdit(referral)}>
                            <i className="ri-pencil-line align-middle me-2"></i>
                            Edit
                          </DropdownItem>
                        </RenderWhen>
                        <RenderWhen isTrue={hasDeletePermission}>
                          <DropdownItem
                            className="text-danger"
                            onClick={() => onDelete(referral)}
                          >
                            <i className="ri-delete-bin-line align-middle me-2"></i>
                            Delete
                          </DropdownItem>
                        </RenderWhen>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No approved referrals found
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

export default ApprovedReferralsList;
