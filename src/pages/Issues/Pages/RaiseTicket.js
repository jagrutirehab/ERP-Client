import React, { useState, useMemo, useEffect } from "react";
import { CardBody, Form, Input, Label, Row, Col } from "reactstrap";
import Select from "react-select";
import debounce from "lodash.debounce";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { getEmployeesBySearch, postIssue } from "../../../helpers/backend_helper";
import { getAllCenters } from "../../../helpers/backend_helper";
import TicketForm from "../Components/TicketForm";
import { toast } from "react-toastify";

const initialFormState = {
  requestedFrom: null,
  center: "",
  description: "",
  itemName: "",
  itemQty: "",
  comment: "",
  responsibleReviewer: null,
  reviewTakenFrom: null,
  files: [],
};
const RaiseTicket = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const [issueType, setIssueType] = useState("TECH");

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);

  const [loader, setLoader] = useState(false);

  const [form, setForm] = useState(initialFormState);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, files: [...e.target.files] });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true)
    try {
      const formData = new FormData();

      formData.append("requestedFrom", form.requestedFrom?.value);
      formData.append("center", form.center);
      formData.append("issueType", issueType);

      if (issueType === "TECH") {
        formData.append("description", form.description);
      }

      if (issueType === "PURCHASE") {
        formData.append("itemName", form.itemName);
        formData.append("itemQty", form.itemQty);
        formData.append("comment", form.comment);
      }

      if (issueType === "REVIEW_SUBMISSION") {
        formData.append(
          "responsibleReviewer",
          form.responsibleReviewer?.value
        );
        formData.append(
          "reviewTakenFrom",
          form.reviewTakenFrom?.value
        );
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
      setIssueType("TECH");

    } catch (error) {
      console.log(error);
      toast.error(error?.message || "Error Posting Issue");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div style={{ width: "100%", padding: "20px 0" }}>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto"
        }}
      >
        <CardBody className="p-4 bg-white shadow-sm rounded">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">Raise a Ticket</h2>
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
          />
        </CardBody>
      </div>
    </div>
  );
};

export default RaiseTicket;