import { useEffect, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../Components/Common/DeleteModal";
import List from "./list";
import { useDispatch } from "react-redux";
import { fetchInterns } from "../../../store/actions";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
} from "reactstrap";
import moment from "moment";
import { removedInternpermenet } from "../../../store/features/intern/internSlice";

const InternRecycle = () => {
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [localInterns, setLocalInterns] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIntern, setSelectedIntern] = useState({
    data: null,
    isOpen: false,
  });
  const [deleteIntern, setDeleteIntern] = useState({
    data: null,
    isOpen: false,
  });

  const getFilterParams = () => ({
    page,
    limit,
    name: searchQuery,
    deleted: true,
  });

  const fetchData = async () => {
    try {
      const result = await dispatch(fetchInterns(getFilterParams()));
      const data = unwrapResult(result);
      setLocalInterns(data?.interns || []);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch interns:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch, page, limit, searchQuery]);

  const onCloseClick = () => {
    setDeleteIntern({ data: null, isOpen: false });
  };

  const onDeleteClick = async () => {
    try {
      await dispatch(removedInternpermenet(deleteIntern.data));
      await fetchData();
    } catch (error) {
      console.error("Failed to delete intern:", error);
    }
    onCloseClick();
  };

  const toggleViewModal = () => {
    setSelectedIntern((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const intern = selectedIntern?.data;

  return (
    <div className="w-100">
      <div className="p-4">
        <BreadCrumb title="Deleted Interns" />
      </div>

      <DeleteModal
        show={deleteIntern.isOpen}
        onCloseClick={onCloseClick}
        onDeleteClick={onDeleteClick}
      />

      {/* View Intern Details Modal */}
      <Modal isOpen={selectedIntern.isOpen} toggle={toggleViewModal} size="lg">
        <ModalHeader toggle={toggleViewModal}>
          {intern?.fullName || intern?.name || "Intern Details"}
        </ModalHeader>
        <ModalBody>
          <Row className="mb-3">
            <Col md="3">
              {intern?.profilePicture?.url ? (
                <img
                  src={intern.profilePicture.url}
                  alt="Profile"
                  className="img-thumbnail rounded-circle"
                  style={{ width: 120, height: 120 }}
                />
              ) : (
                <div
                  className="bg-secondary text-white d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 120, height: 120, fontSize: 32 }}
                >
                  {intern?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </Col>
            <Col md="9">
              <h4 className="mb-1">{intern?.name}</h4>
              <p className="mb-0 text-muted">{intern?.emailAddress}</p>
              <p className="mb-0">
                <strong>UID:</strong> {intern?.id?.prefix}
                {intern?.id?.value}
              </p>
              <p className="mb-0">
                <strong>Status:</strong> {intern?.internStatus}
              </p>
              <p className="mb-0">
                <strong>Deleted:</strong>{" "}
                <span
                  className={intern?.deleted ? "text-danger" : "text-success"}
                >
                  {intern?.deleted ? "Yes" : "No"}
                </span>
              </p>
            </Col>
          </Row>

          <hr />

          <Row>
            <Col md="6">
              <h6>Contact Info</h6>
              <p>
                <strong>Phone:</strong> {intern?.contactNumber}
              </p>
              <p>
                <strong>Gender:</strong> {intern?.gender}
              </p>
              <p>
                <strong>DOB:</strong>{" "}
                {moment(intern?.dateOfBirth).format("DD MMM YYYY")}
              </p>
              <p>
                <strong>Center:</strong> {intern?.center?.name}
              </p>
            </Col>

            <Col md="6">
              <h6>Address</h6>
              <p>
                <strong>Street:</strong> {intern?.street}
              </p>
              <p>
                <strong>City:</strong> {intern?.city}
              </p>
              <p>
                <strong>State:</strong> {intern?.state}
              </p>
              <p>
                <strong>Country:</strong> {intern?.country}
              </p>
              <p>
                <strong>Postal Code:</strong> {intern?.postalCode}
              </p>
            </Col>
          </Row>

          <hr />

          <Row>
            <Col md="6">
              <h6>Academic Info</h6>
              <p>
                <strong>Institution:</strong> {intern?.educationalInstitution}
              </p>
              <p>
                <strong>Course:</strong> {intern?.courseProgram}
              </p>
              <p>
                <strong>Year of Study:</strong> {intern?.yearOfStudy}
              </p>
              <p>
                <strong>Duration:</strong> {intern?.internshipDuration}
              </p>
            </Col>

            <Col md="6">
              <h6>Emergency Contact</h6>
              <p>
                <strong>Name:</strong> {intern?.emergencyContactName}
              </p>
              <p>
                <strong>Phone:</strong> {intern?.emergencyContactPhoneNumber}
              </p>
              <p>
                <strong>Email:</strong> {intern?.emergencyContactEmail}
              </p>
            </Col>
          </Row>

          <hr />

          <Row>
            <Col md="6">
              <p>
                <strong>Created At:</strong>{" "}
                {moment(intern?.createdAt).format("DD MMM YYYY, hh:mm A")}
              </p>
            </Col>
            <Col md="6">
              <p>
                <strong>Updated At:</strong>{" "}
                {moment(intern?.updatedAt).format("DD MMM YYYY, hh:mm A")}
              </p>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleViewModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <PerfectScrollbar className="chat-room-list">
        <List
          interns={localInterns}
          setSelectedIntern={setSelectedIntern}
          setDeleteIntern={setDeleteIntern}
          setPage={setPage}
          page={page}
          totalPages={totalPages}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          refresh={fetchData}
        />
      </PerfectScrollbar>
    </div>
  );
};

export default InternRecycle;
