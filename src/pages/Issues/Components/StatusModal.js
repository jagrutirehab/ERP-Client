import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import { useState, useMemo } from "react";
import Select from "react-select";
import { getEmployeesBySearch } from "../../../helpers/backend_helper";

const debounce = (fn, delay = 400) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

const StatusModal = ({ isOpen, toggle, issue, onAssign, activeTab, title }) => {
    const [employee, setEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [note, setNote] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(null);

    const isECodeLike = (value) => {
        return /^[A-Za-z]+[A-Za-z0-9]*\d+[A-Za-z0-9]*$/.test(value);
    };
    const fetchEmployees = async (searchText) => {
        if (!searchText || searchText.length < 2) {
            setEmployees([]);
            return;
        }

        try {
            setLoadingEmployees(true);

            const params = {
                type: "employee",
            };

            if (/^\d+$/.test(searchText) || isECodeLike(searchText)) {
                params.eCode = searchText;
            } else {
                params.name = searchText;
            }

            const response = await getEmployeesBySearch(params);

            const options =
                response?.data?.map((emp) => ({
                    value: emp._id,
                    label: `${emp.name} (${emp.eCode})`,
                })) || [];

            setEmployees(options);
        } catch (error) {
            console.log("Error loading employees", error);
        } finally {
            setLoadingEmployees(false);
        }
    };

    const debouncedFetchEmployees = useMemo(() => {
        return debounce(fetchEmployees, 400);
    }, []);

    // const handleSubmit = () => {
    //     onAssign({
    //         issueId: issue?._id,
    //         assignedTo: employee?.value,
    //         note,
    //         status: "assigned",
    //     });

    //     setEmployee(null);
    //     setNote("");
    //     toggle();
    // };
    console.log(selectedStatus?.value, "lala");
    
    const handleSubmit = () => {

        if (activeTab === "new") {
            onAssign({
                issueId: issue?._id,
                assignedTo: employee?.value,
                note,
                status: "assigned",
            });
        }

        if (activeTab !== "new") {
            onAssign({
                issueId: issue?._id,
                note,
                status: selectedStatus?.value,
            });
        }

        setEmployee(null);
        setSelectedStatus(null);
        setNote("");

        toggle();
    };

    const statusOptions = [
        // { value: "assigned", label: "Assigned" },
        { value: "in_progress", label: "In Progress" },
        { value: "on_hold", label: "On Hold" },
        { value: "pending_user", label: "Pending User" },
        { value: "pending_release", label: "Pending Release" },
        { value: "resolved", label: "Resolved" },
    ];

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle}>{title}</ModalHeader>

            <ModalBody>
                {/* Employee Dropdown */}
                {activeTab === "new" && (
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Assign To</label>

                        <Select
                            placeholder="Search employee by name or code"
                            options={employees}
                            value={employee}
                            isLoading={loadingEmployees}
                            isClearable
                            onInputChange={(value, { action }) => {
                                if (action === "input-change" && activeTab === "new") {
                                    debouncedFetchEmployees(value);
                                }
                            }}
                            onChange={(option) => setEmployee(option)}
                            noOptionsMessage={() =>
                                loadingEmployees
                                    ? "Searching employees..."
                                    : "Search employee..."
                            }
                        />
                    </div>
                )}


                {activeTab !== "new" && (
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Change Status</label>

                        <Select
                            placeholder="Select status"
                            options={statusOptions}
                            value={selectedStatus}
                            onChange={(option) => setSelectedStatus(option)}
                            isClearable
                        />
                    </div>
                )}

                {/* Note Field */}
                <div className="mb-3">
                    <label className="form-label fw-semibold">Note</label>

                    <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Add note..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-end gap-2">
                    <Button color="secondary" onClick={toggle}>
                        Cancel
                    </Button>

                    <Button color="primary" onClick={handleSubmit}>
                        {title}
                    </Button>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default StatusModal;