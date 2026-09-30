import React, { useState, useMemo, useEffect, useRef } from "react";
import { CardBody, Form, Input, Label, Row, Col } from "reactstrap";
import Select from "react-select";
import debounce from "lodash.debounce";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import {
  getEmployeesBySearch,
  postIssue,
  getCentreManagersByCenter,
} from "../../../helpers/backend_helper";
import { getAllCenters } from "../../../helpers/backend_helper";
import TicketForm from "../Components/TicketForm";
import { toast } from "react-toastify";
import { usePermissions } from "../../../Components/Hooks/useRoles";
// const FIXED_ASSIGNEES = [
//   { value: "6a2692bf484a7e7fd29da3ae", label: "PUSHPENDRA SINGH (JRC0894)" },
//   // { value: "697e145529c91d173986bdb8", label: "SHIVANI GUPTA (JRC0571)" },
//   ...(process.env.REACT_APP_ENV !== "production"
//     ? [
//         {
//           value: "696e176dea1a23b429717266",
//           label: "PRATIK MANE (JRC0280) - TEST",
//         },
//       ]
//     : []),
// ];
const initialFormState = {
  requestedFrom: null,
  center: "",
  description: "",
  contact: "",
  itemName: "",
  itemQty: "",
  comment: "",
  responsibleReviewer: null,
  reviewTakenFrom: null,
  requestType: null,
  hrDescription: "",
  manager: "",
  financeIssueType: "",
  maintenanceCategory: null,
  maintenanceOtherCategory: "",
  maintenanceTitle: "",
  maintenanceDescription: "",
  maintenanceLocation: "",
  maintenancePriority: null,
  anonymous: false,
  complaintCategory: null,
  complaintOtherCategory: "",
  complaintAgainst: null,
  complaintSubject: "",
  complaintDescription: "",
  operationalCentreManager: null,
  operationalAssignedTo: null,
  operationalCategory: null,
  operationalOtherCategory: "",
  operationalDescription: "",
  operationalPatientOrStaffId: "",
  files: [],
};
const RaiseTicket = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const [issueType, setIssueType] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);

  const [loader, setLoader] = useState(false);
  const [centreManagers, setCentreManagers] = useState([]);
  const [loadingCentreManagers, setLoadingCentreManagers] = useState(false);

  const [form, setForm] = useState(initialFormState);
  const fileInputRef = useRef(null);

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const { hasPermission, loading: isLoading } = usePermissions(token);

  const hasReadPermission = hasPermission("ISSUES", "RAISE_TICKET", "READ");
  const hasWritePermission = hasPermission("ISSUES", "RAISE_TICKET", "WRITE");
  const hasDeletePermission = hasPermission("ISSUES", "RAISE_TICKET", "DELETE");
  console.log("Has Read Perm", hasReadPermission);
  console.log("Has Write Perm", hasWritePermission);
  console.log("Has Delete Perm", hasDeletePermission);
  const canSubmit = hasWritePermission || hasDeletePermission;
  console.log("Can Submit", canSubmit);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    const combinedFiles = [...form.files, ...newFiles];

    setForm((prev) => ({
      ...prev,
      files: combinedFiles,
    }));
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      combinedFiles.forEach((file) => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const fetchEmployees = async (searchText) => {
    if (!searchText || searchText.length < 2) {
      setEmployees([]);
      return;
    }

    try {
      setLoadingEmployees(true);

      const params = { type: "employee" };

      if (/^\d+$/.test(searchText)) {
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

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await getAllCenters();

        console.log("response", response);

        const options =
          response?.payload?.map((center) => ({
            value: center._id,
            label: center.title,
          })) || [];

        setCenters(options);
      } catch (error) {
        console.log("Error fetching centers", error);
      }
    };

    fetchCenters();
  }, []);
  const HEAD_OFFICE_ID =
    process.env.REACT_APP_ENV === "production"
      ? "6941217427ea1c92eed41017" // Head-Office (Production)
      : "6940f64772e13a2b4c418c7e"; // Head-Office (Local/Staging)

  const HEAD_OFFICE_MANAGER = {
    value: "697e145529c91d173986bdb8",
    label: "SHIVANI GUPTA (JRC0571)",
  };
  useEffect(() => {
    const fetchCentreManagers = async () => {
      if (!form.center || issueType !== "OPERATIONAL") {
        setCentreManagers([]);
        return;
      }

      setForm((prev) => ({ ...prev, operationalCentreManager: null }));

      // Special case: Head Office → hardcoded manager, no API call
      if (form.center === HEAD_OFFICE_ID) {
        setCentreManagers([HEAD_OFFICE_MANAGER]);
        return;
      }

      try {
        setLoadingCentreManagers(true);

        const response = await getCentreManagersByCenter({
          center: form.center,
        });

        const options =
          response?.data?.map((emp) => ({
            value: emp._id,
            label: `${emp.name} (${emp.eCode})`,
          })) || [];

        setCentreManagers(options);
      } catch (error) {
        console.log("Error fetching centre managers", error);
      } finally {
        setLoadingCentreManagers(false);
      }
    };

    fetchCentreManagers();
  }, [form.center, issueType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    try {
      const formData = new FormData();

      if (form.requestedFrom?.value) {
        formData.append("requestedFrom", form.requestedFrom.value);
      }
      formData.append("center", form.center);
      formData.append("issueType", issueType);
      formData.append("contact", form.contact);

      if (issueType === "TECH") {
        formData.append("description", form.description);
      }

      if (issueType === "PURCHASE") {
        formData.append("itemName", form.itemName);
        formData.append("itemQty", form.itemQty);
        formData.append("comment", form.comment);
      }

      if (issueType === "REVIEW_SUBMISSION") {
        formData.append("responsibleReviewer", form.responsibleReviewer?.value);
        formData.append("reviewTakenFrom", form.reviewTakenFrom?.value);
      }

      if (issueType === "HR") {
        formData.append("requestType", form.requestType?.value);
        formData.append("description", form.hrDescription);
        // formData.append("manager", form.manager);
      }

      if (issueType === "FINANCE") {
        formData.append("financeIssueType", form.financeIssueType?.value);
        formData.append("description", form.financeDescription);
      }

      if (issueType === "MAINTENANCE") {
        formData.append("category", form.maintenanceCategory?.value);
        if (form.maintenanceCategory?.value === "OTHERS") {
          formData.append("otherCategory", form.maintenanceOtherCategory);
        }
        formData.append("title", form.maintenanceTitle);
        formData.append("description", form.maintenanceDescription);
        formData.append("location", form.maintenanceLocation);
        formData.append(
          "priority",
          form.maintenancePriority?.value || "MEDIUM",
        );
      }

      if (issueType === "COMPLAINT") {
        formData.append("anonymous", form.anonymous);
        formData.append("category", form.complaintCategory?.value);
        if (form.complaintCategory?.value === "OTHERS") {
          formData.append("otherCategory", form.complaintOtherCategory);
        }
        if (form.complaintAgainst?.value) {
          formData.append("complaintAgainst", form.complaintAgainst.value);
        }
        formData.append("subject", form.complaintSubject);
        formData.append("description", form.complaintDescription);
      }
      if (issueType === "OPERATIONAL") {
        formData.append("centreManager", form.operationalCentreManager?.value);
        formData.append("category", form.operationalCategory?.value);
        if (form.operationalCategory?.value === "OTHER") {
          formData.append("otherCategory", form.operationalOtherCategory);
        }
        formData.append("description", form.operationalDescription);
        formData.append("patientOrStaffId", form.operationalPatientOrStaffId);
      }

      if (form.files && form.files.length) {
        for (const file of form.files) {
          formData.append("files", file);
        }
      }

      const response = await postIssue(formData);

      toast.success(response?.message || "Issue Created.");

      setForm(initialFormState);
      setSelectedCenter(null);
      setIssueType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.message || "Error Posting Issue");
    } finally {
      setLoader(false);
    }
  };

  return (
    <CardBody
      className="p-4 bg-white shadow-sm rounded"
      style={isMobile ? { width: "100%" } : { width: "78%", margin: "0 auto" }}
    >
      <div className="text-center mb-4">
        <h1 className="fw-bold text-primary">RAISE A TICKET</h1>
      </div>

      <TicketForm
        issueType={issueType}
        setIssueType={setIssueType}
        centers={centers}
        selectedCenter={selectedCenter}
        setSelectedCenter={setSelectedCenter}
        employees={employees}
        loadingEmployees={loadingEmployees}
        debouncedFetchEmployees={debouncedFetchEmployees}
        form={form}
        setForm={setForm}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        loader={loader}
        fileInputRef={fileInputRef}
        canSubmit={canSubmit}
        centreManagers={centreManagers}
        loadingCentreManagers={loadingCentreManagers}
        // fixedAssignees={FIXED_ASSIGNEES}
      />
    </CardBody>
  );
};

export default RaiseTicket;
