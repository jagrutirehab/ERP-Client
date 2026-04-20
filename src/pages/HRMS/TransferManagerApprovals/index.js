import React, { useMemo, useState } from "react";
import {
  Form,
  FormGroup,
  Label,
  Button,
  Container,
  Spinner,
  Card,
  CardBody
} from "reactstrap";
import { getEmployeesBySearch, getPendingApprovalsByManagerId, transferManagerPendingApprovals } from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import Select from "react-select";
import { toast } from "react-toastify";

const TransferManagerApprovals = () => {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
  });

  const handleAuthError = useAuthError();

  const [from, setFrom] = useState([]);
  const [to, setTo] = useState([]);

  const [loadingFrom, setLoadingFrom] = useState(false);
  const [loadingTo, setLoadingTo] = useState(false);

  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");

  const [pendingsLeaves, setPendingsleaves] = useState([]);
  const [pendingRegs, setPendingRegs] = useState([]);

  const [loadingPending, setLoadingPending] = useState(false);

  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);

  const [error, setError] = useState("")

  const [actionLoading, setActionLoading] = useState(false);
  const isECodeLike = (value) => {
    return /^[A-Za-z]+[A-Za-z0-9]*\d+[A-Za-z0-9]*$/.test(value);
  };

  const debounce = (fn, delay = 400) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  const fetchEmployees = async (searchText, type) => {
    try {
      type === "from" ? setLoadingFrom(true) : setLoadingTo(true);

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

      if (type === "from") {
        setFrom(options);
      } else {
        setTo(options);
      }
    } catch (error) {
      console.log("Error loading employees", error);
      if (!handleAuthError(error)) {
        console.log("Unhandled error");
      }
    } finally {
      type === "from" ? setLoadingFrom(false) : setLoadingTo(false);
    }
  };

  const debouncedFetchFrom = useMemo(() => {
    return debounce((value) => fetchEmployees(value, "from"), 400);
  }, []);

  const debouncedFetchTo = useMemo(() => {
    return debounce((value) => fetchEmployees(value, "to"), 400);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.from) {
      return setError("Please select From Manager");
    }

    if (!formData.to) {
      return setError("Please select To Manager");
    }

    setActionLoading(true)
    try {

      const response = await transferManagerPendingApprovals(formData);
      toast.success(response?.message || "Successfully transferred");

      setFormData({ from: "", to: "" });
      setSelectedFrom(null);
      setSelectedTo(null);
      setPendingsleaves([]);
      setPendingRegs([]);
      setError("");

    } catch (error) {
      toast.error("Error updating data");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFromSelect = async (selectedOption) => {
    try {
      setLoadingPending(true);

      const params = {
        from: selectedOption.value
      };

      const response = await getPendingApprovalsByManagerId(params);

      setPendingsleaves(response?.leaves);
      setPendingRegs(response?.regs);

    } catch (error) {
      console.log(error);
    } finally {
      setLoadingPending(false);
    }
  };

  const pendingL = pendingsLeaves?.flatMap((l) =>
    l?.leaves?.filter((leave) => leave?.status === "pending") || []
  );
  const pendingR = pendingRegs?.filter(r => r?.status === "PENDING")


  return (
    <Container
      style={{
        maxWidth: "500px",
        marginTop: "40px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "20px",
        height : "100%"
      }}
    >
      <h3 className="mb-3">Transfer Manager Approvals</h3>

      <Form onSubmit={handleSubmit}>
        {/* FROM */}
        <FormGroup>
          <Label>From Manager</Label>
          <Select
            value={selectedFrom}
            placeholder="Search Manager..."
            isClearable
            isLoading={loadingFrom}
            options={from}
            onInputChange={(value, { action }) => {
              if (action === "input-change") {
                setFromSearch(value);
                debouncedFetchFrom(value);
              }
            }}
            onChange={(option) => {
              setSelectedFrom(option);

              setFormData((prev) => ({
                ...prev,
                from: option?.value || "",
              }));

              if (option) {
                handleFromSelect(option);
              } else {
                setPendingsleaves([]);
                setPendingRegs([]);
                setLoadingPending(false);
              }
            }}
            noOptionsMessage={() => {
              if (loadingFrom) return <Spinner size="sm" />;
              if (!fromSearch) return "Type to search employees";
              if (from.length === 0) return "No employee found";
              return null;
            }}
          />
        </FormGroup>

        {/* TO */}
        <FormGroup>
          <Label>To Manager</Label>
          <Select
            value={selectedTo}
            placeholder="Search Manager..."
            isClearable
            isLoading={loadingTo}
            options={to}
            onInputChange={(value, { action }) => {
              if (action === "input-change") {
                setToSearch(value);
                debouncedFetchTo(value);
              }
            }}
            onChange={(option) => {
              setSelectedTo(option);

              const val = option?.value || "";

              setFormData((prev) => ({
                ...prev,
                to: val,
              }));

              if (val && val === formData.from) {
                setError("From Manager and To Manager can't be same.");
              } else {
                setError("");
              }
            }}
            noOptionsMessage={() => {
              if (loadingTo) return <Spinner size="sm" />;
              if (!toSearch) return "Type to search employees";
              if (to.length === 0) return "No employee found";
              return null;
            }}
          />
        </FormGroup>
        {error && (
          <div
            style={{
              background: "#ffe5e5",
              color: "#d32f2f",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "12px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {error}
          </div>
        )}

        <Button
          color="primary"
          type="submit"
          disabled={actionLoading}
          style={{
            cursor: actionLoading ? "not-allowed" : "pointer",
            opacity: actionLoading ? 0.5 : 1,
          }}
        >
          {actionLoading ? <Spinner size="sm" /> : "Transfer"}
        </Button>
      </Form>

      <div style={{ marginTop: "20px" }}>

        <div style={{ marginTop: "20px" }}>

          {loadingPending ? (
            <Spinner size="sm" />
          ) : (pendingL?.length > 0 || pendingR?.length > 0) ? (
            <>
              {pendingL?.length > 0 && (
                <div style={{ marginBottom: "6px" }}>
                  <span style={{ color: "#6c757d" }}>Pending Leaves:</span>{" "}
                  <span style={{ fontWeight: "bold" }}>{pendingL.length}</span>
                </div>
              )}

              {pendingR?.length > 0 && (
                <div>
                  <span style={{ color: "#6c757d" }}>Pending Regularizations:</span>{" "}
                  <span style={{ fontWeight: "bold" }}>{pendingR.length}</span>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: "#6c757d", fontStyle: "italic" }}>
              No pending requests found
            </div>
          )}

        </div>

      </div>
    </Container>
  );
};

export default TransferManagerApprovals;