import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormGroup,
  Label,
  Alert,
  Row,
  Col,
  Card,
  CardBody,
} from "reactstrap";
import axios from "axios";
import { api } from "../../config"; // Assuming this is where your base URL is

const Apikeys = () => {
  // --- State ---
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdKeyData, setCreatedKeyData] = useState(null); // Stores the result after success
  const [error, setError] = useState("");

  // --- Actions ---

  // 1. Fetch Tokens
  const fetchTokens = async () => {
    try {
      setLoading(true);
      // Adjust URL based on your router.get('/auth-tokens')
      const response = await axios.get(`${api.CCTV_SERVICE_URL}/auth-tokens`);

      if (response && response.data) {
        setTokens(response.data);
      }
    } catch (err) {
      console.error("Error fetching tokens:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  // 2. Create Token
  const handleCreateToken = async () => {
    if (!createName.trim()) {
      setError("Please enter a name for the token.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      // Adjust URL based on your router.post('/auth/token')
      const response = await axios.post(`${api.CCTV_SERVICE_URL}/auth/token`, {
        name: createName,
      });

      if (response && response.data) {
        // Success! Show the key to the user
        setCreatedKeyData(response.data);
        // Refresh the list in the background
        fetchTokens();
      }
    } catch (err) {
      console.error("Error creating token:", err);
      setError("Failed to create token. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // 3. Helper: Toggle Modal
  const toggleModal = () => {
    setModalOpen(!modalOpen);
    // Reset states when closing/opening
    if (!modalOpen) {
      setCreateName("");
      setCreatedKeyData(null);
      setError("");
    }
  };

  // 4. Helper: Copy to Clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // --- Render ---

  return (
    <div className="page-content overflow-hidden">
      <Container fluid>
        <div className="chat-wrapper d-flex row gap-1 mx-n4 my-n4 mb-n5 p-1">
          {/* Header Section */}
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <div>
              <h4 className="mb-0">API Access Tokens</h4>
              <p className="text-muted mb-0">Manage external access keys</p>
            </div>
            <Button color="primary" onClick={toggleModal}>
              + Create New Token
            </Button>
          </div>

          {/* Table Section */}
          <div className="table-responsive">
            <Card>
              <CardBody>
                <Table className="align-middle table-nowrap mb-0" hover>
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">API Key</th>
                      <th scope="col">Created At</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : tokens.length > 0 ? (
                      tokens.map((token) => (
                        <tr key={token._id}>
                          <td className="fw-medium">{token.name}</td>
                          <td className="fw-medium">{token.key}</td>
                          {/* <td style={{ fontFamily: "monospace" }}>
                            {token.key
                              ? `${token.key.substring(0, 10)}...`
                              : "****"}
                          </td> */}
                          <td>
                            {token.createdAt
                              ? new Date(token.createdAt).toLocaleString()
                              : "-"}
                          </td>
                          <td>
                            <Button
                              color="light"
                              size="sm"
                              className="btn-soft-primary"
                              onClick={() => copyToClipboard(token.key)}
                              title="Copy Key"
                            >
                              📋 Copy
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">
                          No API tokens found. Create one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </div>

          {/* --- Create Token Modal --- */}
          <Modal isOpen={modalOpen} toggle={toggleModal} centered>
            <ModalHeader toggle={toggleModal}>
              {createdKeyData
                ? "Token Created Successfully"
                : "Create New API Token"}
            </ModalHeader>

            <ModalBody>
              {createdKeyData ? (
                // Success View
                <div className="text-center">
                  <div className="mb-3">
                    <i className="mdi mdi-check-circle-outline text-success display-2"></i>
                  </div>
                  <h5>Token Generated!</h5>
                  <p className="text-muted">
                    Please copy this key now. For security reasons, you may not
                    be able to see the full key again.
                  </p>
                  <Alert
                    color="success"
                    className="d-flex align-items-center justify-content-between"
                  >
                    <code
                      className="fs-5 text-dark"
                      style={{ wordBreak: "break-all" }}
                    >
                      {createdKeyData.apiKey}
                    </code>
                    <Button
                      color="link"
                      className="p-0 ms-2"
                      onClick={() => copyToClipboard(createdKeyData.apiKey)}
                    >
                      📋
                    </Button>
                  </Alert>
                </div>
              ) : (
                // Form View
                <>
                  {error && <Alert color="danger">{error}</Alert>}
                  <FormGroup>
                    <Label for="tokenName">Token Name</Label>
                    <Input
                      id="tokenName"
                      placeholder="e.g. Dashboard App, Mobile Client"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                    />
                    <small className="text-muted">
                      Give this token a recognizable name to identify who is
                      using it.
                    </small>
                  </FormGroup>
                </>
              )}
            </ModalBody>

            <ModalFooter>
              {createdKeyData ? (
                <Button color="primary" onClick={toggleModal}>
                  Done
                </Button>
              ) : (
                <>
                  <Button
                    color="secondary"
                    onClick={toggleModal}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onClick={handleCreateToken}
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Generate Key"}
                  </Button>
                </>
              )}
            </ModalFooter>
          </Modal>
        </div>
      </Container>
    </div>
  );
};

export default Apikeys;
