import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Spinner,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import Flatpickr from "react-flatpickr";
import moment from "moment";
import {
  createRoundNote,
  fetchPatientRoundNotes,
  fetchRoundNoteStaff,
  fetchRoundNotes,
  removeRoundNoteEntry,
  resetRoundNotesFilters,
  setRoundNoteDrawer,
  setRoundNotesFilters,
  updateRoundNoteEntry,
} from "../../store/actions";
import {
  getPatientById,
  getSearchPatients,
} from "../../helpers/backend_helper";
import { useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import RoundNoteForm, { CarryForwardStrip } from "./RoundNoteForm";
import RoundNoteCard from "./RoundCard";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { getRoundNoteStaff } from "../../helpers/backend_helper";

const RoundNotes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    list,
    loading,
    pagination,
    staff,
    staffLoading,
    filters,
    drawer,
    carryForwardOpen,
    floors,
  } = useSelector((state) => state.RoundNotes);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [patientOption, setPatientOption] = useState(null);
  const [selectedStaffOptions, setSelectedStaffOptions] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, note: null });
  const centerAccess = useSelector((state) => state.Center.data);
  const [centerIds, setCenterIds] = useState(
    centerAccess?.map((center) => center._id) || []
  );

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasIncidentPermission = hasPermission("ROUND_NOTES", null, "READ");
  const hasIncidentCreatePermission = hasPermission("ROUND_NOTES", "", "WRITE");

  useEffect(() => {
    if (permissionLoader) return;
    if (!hasIncidentPermission) {
      navigate("/unauthorized");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, hasIncidentPermission, permissionLoader]);

  useEffect(() => {
    if (centerAccess && !drawer.isOpen) {
      setCenterIds(centerAccess?.map((center) => center._id) || []);
    }
  }, [centerAccess, drawer.isOpen]);

  const loadPatientOptions = useCallback(async (inputValue) => {
    if (!inputValue) return [];
    const response = await getSearchPatients({ name: inputValue });
    return (
      response?.data?.map((patient) => ({
        label: `${patient.name} (${patient.patientId || ""})`,
        value: patient._id,
      })) || []
    );
  }, []);

  const formatPatientFilterOption = useCallback(
    (patient) => ({
      label: `${patient.name} (${patient.patientId || ""})`,
      value: patient._id,
    }),
    []
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const patientId = params.get("patientId");
    if (patientId && patientId !== filters.patientId) {
      dispatch(setRoundNotesFilters({ patientId }));
    }
  }, [location.search, dispatch, filters.patientId]);

  useEffect(() => {
    if (
      filters.patientId &&
      (!patientOption || patientOption.value !== filters.patientId)
    ) {
      getPatientById(filters.patientId)
        .then((response) => {
          if (response?.payload) {
            setPatientOption(formatPatientFilterOption(response.payload));
          }
        })
        .catch(() => {
          setPatientOption(null);
        });
    }
    if (!filters.patientId) {
      setPatientOption(null);
    }
  }, [filters.patientId, formatPatientFilterOption, patientOption]);

  console.log({ centerAccess });

  const queryPayload = useMemo(() => {
    const payload = {
      page,
      limit,
    };
    if (filters.search) payload.search = filters.search;
    if (filters.startDate) payload.startDate = filters.startDate;
    if (filters.endDate) payload.endDate = filters.endDate;

    if (filters.patientId) payload.patientId = filters.patientId;
    if (filters.staffIds?.length) payload.staffIds = filters.staffIds;
    if (filters.center?.length) payload.center = filters.center;

    return payload;
  }, [filters, page, limit]);

  useEffect(() => {
    dispatch(fetchRoundNotes(queryPayload));
  }, [dispatch, queryPayload]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setPage(1);
        dispatch(setRoundNotesFilters({ search: searchTerm || "" }));
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, filters.search, dispatch]);

  const handleDateRange = (selected) => {
    // If clearing or no selection
    if (!selected || !selected.length) {
      dispatch(setRoundNotesFilters({ startDate: null, endDate: null }));
      setPage(1);
      return;
    }

    // Only update if we have both dates (range is complete)
    const [start, end] = selected;
    if (start && end) {
      dispatch(
        setRoundNotesFilters({
          startDate: moment(start).format("YYYY-MM-DD"),
          endDate: moment(end).format("YYYY-MM-DD"),
        })
      );
      setPage(1);
    }
    // If only start date is selected, don't update state yet
    // This keeps the picker open for selecting the end date
  };

  const handleStaffChange = (options) => {
    setSelectedStaffOptions(options || []);
    dispatch(
      setRoundNotesFilters({
        staffIds: options?.map((option) => option.value) || [],
      })
    );
    setPage(1);
  };

  const handleCenterChange = (options) => {
    dispatch(
      setRoundNotesFilters({
        center: options?.map((option) => option.value) || [],
      })
    );
    setPage(1);
  };

  const handlePatientFilterChange = async (option) => {
    setPatientOption(option);
    dispatch(
      setRoundNotesFilters({
        patientId: option?.value || null,
      })
    );
    setPage(1);
    if (option?.value) {
      dispatch(fetchPatientRoundNotes({ patientId: option.value }));
    }
  };

  const handleDrawerSubmit = async (payload) => {
    if (drawer.mode === "edit" && drawer.data?._id) {
      await dispatch(
        updateRoundNoteEntry({ id: drawer.data._id, data: payload })
      ).unwrap();
    } else {
      await dispatch(createRoundNote(payload)).unwrap();
    }
    dispatch(fetchRoundNotes(queryPayload));
    if (filters.patientId) {
      dispatch(fetchPatientRoundNotes({ patientId: filters.patientId }));
    }
  };

  const handleDelete = (note) => {
    setDeleteModal({ isOpen: true, note });
  };

  const confirmDelete = async () => {
    if (!deleteModal.note) return;

    try {
      await dispatch(removeRoundNoteEntry(deleteModal.note._id)).unwrap();
      dispatch(fetchRoundNotes(queryPayload));
      if (filters.patientId) {
        dispatch(fetchPatientRoundNotes({ patientId: filters.patientId }));
      }
      setDeleteModal({ isOpen: false, note: null });
    } catch (error) {
      console.error("Error deleting round note:", error);
      setDeleteModal({ isOpen: false, note: null });
    }
  };

  const handleCarryForwardClose = async (note) => {
    await dispatch(
      updateRoundNoteEntry({
        id: note._id,
        data: { carryForward: false, carryForwardStatus: "closed" },
      })
    ).unwrap();
    dispatch(fetchRoundNotes(queryPayload));
  };

  const totalPages = pagination.totalPages || 1;

  return (
    <div className="page-content">
      <Row>
        <Col lg={3}>
          <Card className="mb-3">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Filters</h5>
                <Button
                  size="sm"
                  color="link"
                  onClick={() => {
                    setSearchTerm("");
                    setPatientOption(null);
                    setPage(1);
                    dispatch(resetRoundNotesFilters());
                    // setRoundNotesFilters({
                    //   startDate: null,
                    //   endDate: null,
                    // });
                  }}
                >
                  Reset
                </Button>
              </div>
              <Form className="d-flex flex-column gap-3">
                <FormGroup>
                  <Label>Center</Label>
                  <Select
                    isMulti
                    options={centerAccess.map((c) => ({
                      label: c.title,
                      value: c._id,
                    }))}
                    value={centerAccess
                      .map((c) => ({ label: c.title, value: c._id }))
                      .filter((option) =>
                        filters.center?.includes(option.value)
                      )}
                    onChange={handleCenterChange}
                    classNamePrefix="select2"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Search notes</Label>
                  <Input
                    type="text"
                    placeholder="Search text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Date range</Label>
                  <Flatpickr
                    key={`${filters.startDate}-${filters.endDate}`}
                    className="form-control"
                    value={[
                      filters.startDate ? new Date(filters.startDate) : null,
                      filters.endDate ? new Date(filters.endDate) : null,
                    ].filter(Boolean)}
                    options={{
                      mode: "range",
                      dateFormat: "d-m-Y",
                    }}
                    onChange={handleDateRange}
                  />
                </FormGroup>

                {/* <FormGroup>
                  <Label>Patient</Label>
                  <AsyncSelect
                    cacheOptions
                    loadOptions={loadPatientOptions}
                    defaultOptions
                    value={patientOption}
                    onChange={handlePatientFilterChange}
                    isClearable
                  />
                </FormGroup> */}
                <FormGroup>
                  <Label>Round taken by</Label>
                  <AsyncSelect
                    isMulti
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      const selectedCenterIds =
                        filters.center?.length > 0
                          ? filters.center
                          : centerAccess.map((c) => c._id);

                      const response = await getRoundNoteStaff({
                        search: inputValue,
                        centerAccess: JSON.stringify(selectedCenterIds),
                      });
                      return response.data.map((member) => ({
                        label: `${member.name} (${member.role})`,
                        value: member._id,
                      }));
                    }}
                    onChange={handleStaffChange}
                    classNamePrefix="select2"
                    value={selectedStaffOptions}
                    placeholder="Type to search staff..."
                    noOptionsMessage={({ inputValue }) =>
                      inputValue ? "No staff found" : "Type to search..."
                    }
                  />
                </FormGroup>
              </Form>
            </CardBody>
          </Card>
        </Col>
        <Col lg={9}>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h4 className="mb-1">Round Notes</h4>
              <p className="text-muted mb-0">
                Record, manage and review all floor / ward rounds
              </p>
            </div>
            {hasIncidentCreatePermission && (
              <Button
                color="primary"
                onClick={() =>
                  dispatch(
                    setRoundNoteDrawer({
                      isOpen: true,
                      mode: "create",
                      data: null,
                      carryForwardSource: null,
                    })
                  )
                }
              >
                Create New Round Note
              </Button>
            )}
          </div>
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <>
              <CarryForwardStrip
                notes={carryForwardOpen}
                onUse={(note) =>
                  dispatch(
                    setRoundNoteDrawer({
                      isOpen: true,
                      mode: "create",
                      data: null,
                      carryForwardSource: note,
                    })
                  )
                }
                onCloseCarryForward={handleCarryForwardClose}
              />
              {list.length === 0 ? (
                <Card>
                  <CardBody className="text-center text-muted">
                    No round notes found for the selected filters.
                  </CardBody>
                </Card>
              ) : (
                list.map((note) => (
                  <RoundNoteCard
                    key={note._id}
                    round={note}
                    onEdit={(current) =>
                      dispatch(
                        setRoundNoteDrawer({
                          isOpen: true,
                          mode: "edit",
                          data: current,
                          carryForwardSource: null,
                        })
                      )
                    }
                    onDelete={handleDelete}
                    onCarryForward={(current) =>
                      dispatch(
                        setRoundNoteDrawer({
                          isOpen: true,
                          mode: "create",
                          data: null,
                          carryForwardSource: current,
                        })
                      )
                    }
                    onCloseCarryForward={handleCarryForwardClose}
                  />
                ))
              )}
            </>
          )}
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted">Rows per page</span>
              <Input
                type="select"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                style={{ width: "80px" }}
              >
                {[10, 20, 50].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </Input>
            </div>
            <Pagination className="mb-0">
              <PaginationItem disabled={page === 1}>
                <PaginationLink
                  previous
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index} active={index + 1 === page}>
                  <PaginationLink onClick={() => setPage(index + 1)}>
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem disabled={page >= totalPages}>
                <PaginationLink
                  next
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                />
              </PaginationItem>
            </Pagination>
          </div>
        </Col>
      </Row>

      <RoundNoteForm
        isOpen={drawer.isOpen}
        mode={drawer.mode}
        data={drawer.data}
        staffLoading={staffLoading}
        setCenterIds={setCenterIds}
        carryForwardSource={drawer.carryForwardSource}
        floors={floors}
        onClose={() =>
          dispatch(
            setRoundNoteDrawer({
              isOpen: false,
              data: null,
              carryForwardSource: null,
            })
          )
        }
        onSubmit={handleDrawerSubmit}
        loadPatientOptions={loadPatientOptions}
        carryForwardNotes={carryForwardOpen}
        onCloseCarryForward={handleCarryForwardClose}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        toggle={() => setDeleteModal({ isOpen: false, note: null })}
        centered
      >
        <ModalHeader
          toggle={() => setDeleteModal({ isOpen: false, note: null })}
        >
          Confirm Delete
        </ModalHeader>
        <ModalBody>
          <p className="mb-0">
            Are you sure you want to delete this round note?
          </p>
          {deleteModal.note && (
            <div className="mt-3 p-2 bg-light rounded">
              <small className="text-muted">
                <strong>Date:</strong>{" "}
                {moment(deleteModal.note.roundDate).format("MMM D, YYYY")}
                <br />
                <strong>Session:</strong> {deleteModal.note.roundSession}
                <br />
                <strong>Notes:</strong> {deleteModal.note.notes?.length || 0}{" "}
                note(s)
              </small>
            </div>
          )}
          <p className="text-danger mt-3 mb-0">
            <small>This action cannot be undone.</small>
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="light"
            onClick={() => setDeleteModal({ isOpen: false, note: null })}
          >
            Cancel
          </Button>
          <Button color="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RoundNotes;
