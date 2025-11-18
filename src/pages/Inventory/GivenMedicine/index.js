import React, { useEffect, useState, useRef } from "react";
// import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../Components/Table";
import Select from "react-select";
import { toast } from "react-toastify";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { fetchCenters } from "../../../store/actions";
import { Button } from "../Components/Button";
import { CardBody, Modal, ModalBody, ModalHeader } from "reactstrap";
import GiveMedicine from "../GiveMedicine";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { useAuthError } from "../../../Components/Hooks/useAuthError";

const GivenMedicine = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User);
  const handleAuthError = useAuthError();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission } = usePermissions(token);
  const [givenMedicines, setGivenMedicines] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [modalOpengive, setModalOpengive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const abortRef = useRef(null);


  const centerOptions = [
    ...(user?.centerAccess?.length > 1
      ? [{
        value: "ALL",
        label: "All Centers",
        isDisabled: false,
      }]
      : []
    ),
    ...(
      user?.centerAccess?.map(id => {
        const center = user?.userCenters?.find(c => c._id === id);
        return {
          value: id,
          label: center?.title || "Unknown Center"
        };
      }) || []
    )
  ];


  const selectedCenterOption = centerOptions.find(
    opt => opt.value === selectedCenter
  ) || centerOptions[0];


  const handleGiveMedicine = () => {
    setModalOpengive(true);
  };

  const display = (v) => (v === undefined || v === null || v === "" ? "-" : v);

  const getPageRange = (total, current, maxButtons = 7) => {
    if (total <= maxButtons)
      return Array.from({ length: total }, (_, i) => i + 1);
    const sideButtons = Math.floor((maxButtons - 3) / 2);
    let start = Math.max(2, current - sideButtons);
    let end = Math.min(total - 1, current + sideButtons);
    if (current - 1 <= sideButtons) {
      start = 2;
      end = Math.min(total - 1, maxButtons - 2);
    }
    if (total - current <= sideButtons) {
      end = total - 1;
      start = Math.max(2, total - (maxButtons - 3));
    }
    const range = [1];
    if (start > 2) range.push("...");
    for (let i = start; i <= end; i++) range.push(i);
    if (end < total - 1) range.push("...");
    range.push(total);
    return range;
  };

  const fetchGivenMedicines = async ({
    page = currentPage,
    limit = pageSize,
    centers,
    q,
  } = {}) => {
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch (e) {}
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: q || undefined,
        centers
      };
      // if (center) {
      //   params.center = center;
      // } else if (user?.centerAccess) {
      //   params.centers = user.centerAccess;
      // }

      const response = await axios.get("/pharmacy/getall-give-medicine", {
        params,
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const body = response || {};
      // console.log(body);
      setGivenMedicines(Array.isArray(body.data) ? body.data : []);
      setTotalItems(Number(body.total ?? 0));
      setTotalPages(Number(body.pages ?? 1));
      setCurrentPage(Number(body.page ?? page));
    } catch (err) {
      const cancelled =
        err?.name === "CanceledError" ||
        err?.name === "AbortError" ||
        err?.code === "ERR_CANCELED";
      if (!cancelled || !handleAuthError(err)) {
        toast.error("Failed to fetch records");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const centers =
      selectedCenter === "ALL"
        ? user?.centerAccess
        : [selectedCenter];
    fetchGivenMedicines({
      page: currentPage,
      limit: pageSize,
      centers,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, selectedCenter, user?.centerAccess]);

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  useEffect(() => {
    dispatch(fetchCenters({ centerIds: user?.centerAccess }));
  }, [dispatch, user?.centerAccess]);

  const goToPage = (page) => {
    if (page === "..." || page === currentPage) return;
    const target = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(target);
  };

  return (
    <CardBody className="p-3 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
      <div className="content-wrapper">
        <div className="text-center text-md-left mb-4">
          <h1 className="display-5 font-weight-bold text-primary">
            GIVEN MEDICINE
          </h1>
        </div>

        <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
          <div style={{ minWidth: "220px" }}>
            {/* <Select
              placeholder="All Centers"
              value={selectedCenter}
              onChange={(e) => {
                setSelectedCenter(e.target.value);
                setCurrentPage(1);
              }}
              options={
                user?.userCenters?.map((center) => ({
                  value: center?._id ?? center?.id ?? "",
                  label: center?.title ?? center?.name ?? "Unknown",
                })) || []
              }
            /> */}
            <Select
              value={selectedCenterOption}
              onChange={(option) => {
                setSelectedCenter(option?.value);
                setCurrentPage(1);
              }}
              options={centerOptions}
              placeholder="All Centers"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
          <div className="w-100 w-md-auto" style={{ maxWidth: "140px" }}>
            <div className="position-relative w-100">
              {hasPermission("PHARMACY", "GIVENMEDICINES", "WRITE") ? (
                <Button onClick={handleGiveMedicine}>Give Medicine</Button>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto mb-2" style={{ maxHeight: "65vh" }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Center</TableHead>
                <TableHead>Given By</TableHead>
                <TableHead>Medicines</TableHead>
                {/* <TableHead>Actions</TableHead> */}
              </TableRow>
            </TableHeader>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  fontSize: "1rem",
                  color: "#666",
                }}
              >
                Loading...
              </div>
            ) : givenMedicines.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  fontSize: "1rem",
                  color: "#666",
                }}
              >
                No records found
              </div>
            ) : (
              <TableBody>
                {givenMedicines.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      {new Date(item?.createdAt)
                        .toLocaleString("en-IN", { hour12: true })
                        .replace(/am|pm/g, (match) => match.toUpperCase())}
                    </TableCell>
                    <TableCell>
                      {display(
                        item?.patientId?.name
                          ? item.patientId.name.toUpperCase()
                          : "Unassigned"
                      )}
                    </TableCell>
                    <TableCell>
                      {display(item?.centerInfo?.title || "-")}
                    </TableCell>
                    <TableCell>
                      {display(item?.createdBy?.name || "Unknown")}
                    </TableCell>
                    <TableCell>
                      <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                        {item?.MedicineId?.map((m, idx) => (
                          <li key={idx}>
                            {display(m?.Medicine?.medicineName)} —{" "}
                            <strong>{m?.quantity}</strong>
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="small text-muted">
            Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
            entries
          </div>

          <div className="d-flex align-items-center gap-2">
            <label className="mb-0 small text-muted">Show</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "88px" }}
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <ul className="pagination mb-0 ms-3">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                >
                  Previous
                </button>
              </li>
              {getPageRange(totalPages, currentPage, 7).map((p, i) => (
                <li
                  key={i}
                  className={`page-item ${p === currentPage ? "active" : ""}`}
                >
                  {p === "..." ? (
                    <span className="page-link">...</span>
                  ) : (
                    <button className="page-link" onClick={() => goToPage(p)}>
                      {p}
                    </button>
                  )}
                </li>
              ))}
              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""
                  }`}
              >
                <button
                  className="page-link"
                  onClick={() =>
                    goToPage(Math.min(totalPages, currentPage + 1))
                  }
                >
                  Next
                </button>
              </li>
            </ul>
          </div>
        </div>
        <Modal
          isOpen={modalOpengive}
          toggle={() => setModalOpengive(!modalOpengive)}
          size="xl"
          scrollable
          backdrop="static"
        >
          <ModalHeader toggle={() => setModalOpengive(false)}>
            {"Give Medicine"}
          </ModalHeader>
          <ModalBody>
            <GiveMedicine
              user={user}
              setModalOpengive={setModalOpengive}
              fetchMedicines={({ page = 1, limit = pageSize, q = "" } = {}) =>
                fetchGivenMedicines({
                  page,
                  limit,
                  center: selectedCenter || undefined,
                  q,
                })
              }
              onResetPagination={() => {
                setCurrentPage(1);
                setPageSize(10);
              }}
            />
          </ModalBody>
        </Modal>
      </div>
    </CardBody>
  );
};

export default GivenMedicine;
