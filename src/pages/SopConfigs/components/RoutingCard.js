import React, { useState, useCallback, useEffect, useRef } from "react";
import AsyncSelect from "react-select/async";
import {
  Card, CardHeader, CardBody,
  FormGroup, Label, Input,
  Button, Badge, Alert, Spinner,
} from "reactstrap";
import { sopGetRoles, getEmployeesBySearch } from "../../../helpers/backend_helper";

const isECodeLike = (str) => /^[a-zA-Z]{1,3}\d+$/i.test(str);

const RoutingCard = ({
  selectedRoles,
  onRoleToggle,
  selectedUsers,
  onUsersChange,
  notifyEmails,
  onNotifyEmailsChange,
  notifyEmailsError,
  routingError,
  isSubmitting,
}) => {
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState(null);
  const rolesFetchedRef = useRef(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (rolesFetchedRef.current) return;
    rolesFetchedRef.current = true;
    let alive = true;

    const fetchRoles = async () => {
      try {
        const response = await sopGetRoles();
        const list =
          (Array.isArray(response) && response) ||
          response?.data?.data ||
          response?.data ||
          [];
        if (alive) setRoles(Array.isArray(list) ? list : []);
      } catch (err) {
        if (alive) {
          setRolesError(err?.response?.data?.message || err?.message || "Failed to load roles");
        }
      } finally {
        if (alive) setRolesLoading(false);
      }
    };

    fetchRoles();
    return () => { alive = false; };
  }, []);

  const fetchEmployees = useCallback(async (searchText) => {
    if (!searchText || searchText.length < 2) return [];
    try {
      const params = { type: "employee" };
      if (/^\d+$/.test(searchText) || isECodeLike(searchText)) {
        params.eCode = searchText;
      } else {
        params.name = searchText;
      }
      const response = await getEmployeesBySearch(params);
      return (
        response?.data?.map((emp) => ({
          value: emp._id,
          label: `${emp.name} (${emp.eCode})`,
        })) || []
      );
    } catch {
      return [];
    }
  }, []);

  const debouncedLoadEmployees = useCallback((inputValue, callback) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      callback(await fetchEmployees(inputValue));
    }, 400);
  }, [fetchEmployees]);

  const emailCount = notifyEmails.split(",").map((e) => e.trim()).filter(Boolean).length;

  return (
    <Card className="mb-4">
      <CardHeader className="fw-semibold">
        4. Routing — Who Gets Notified
        {routingError && (
          <Badge color="danger" pill className="ms-2">Required</Badge>
        )}
      </CardHeader>
      <CardBody>
        <FormGroup>
          <Label className="fw-semibold mb-2">Notify Roles</Label>

          {rolesLoading ? (
            <div className="d-flex align-items-center text-muted">
              <Spinner size="sm" className="me-2" />
              Loading roles...
            </div>
          ) : rolesError ? (
            <Alert color="warning" className="mb-0 py-2">
              Could not load roles: {rolesError}
            </Alert>
          ) : roles.length === 0 ? (
            <small className="text-muted">
              No roles configured. Create roles before assigning them to SOPs.
            </small>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {roles.map((role) => {
                const active = selectedRoles.includes(role.name);
                return (
                  <Button
                    key={role._id || role.name}
                    type="button"
                    color={active ? "primary" : "secondary"}
                    outline={!active}
                    size="sm"
                    onClick={() => onRoleToggle(role.name)}
                    disabled={isSubmitting}
                    title={role.description || ""}
                  >
                    {active && "✓ "}{role.name?.toUpperCase()}
                  </Button>
                );
              })}
            </div>
          )}

          <small className="text-muted d-block mt-2">
            Selected: {selectedRoles.length || "none"}
          </small>
        </FormGroup>

        <FormGroup>
          <Label for="notifyEmails" className="fw-semibold">
            External Emails{" "}
            {emailCount > 0 && <Badge color="info" pill className="ms-1">{emailCount}</Badge>}
          </Label>
          <Input
            type="textarea"
            id="notifyEmails"
            name="notifyEmails"
            rows="2"
            placeholder="oncall@hospital.com, qa@hospital.com"
            value={notifyEmails}
            onChange={onNotifyEmailsChange}
            invalid={!!notifyEmailsError}
            disabled={isSubmitting}
          />
          {notifyEmailsError && (
            <small className="text-danger">{notifyEmailsError}</small>
          )}
          <small className="text-muted d-block mt-1">
            Comma-separated. For external/on-call alerts not tied to a platform user.
          </small>
        </FormGroup>

        <FormGroup>
          <Label className="fw-semibold">
            Notify Specific Users{" "}
            {selectedUsers.length > 0 && (
              <Badge color="info" pill className="ms-1">{selectedUsers.length}</Badge>
            )}
          </Label>
          <AsyncSelect
            isMulti
            cacheOptions
            loadOptions={debouncedLoadEmployees}
            value={selectedUsers}
            onChange={onUsersChange}
            isDisabled={isSubmitting}
            placeholder="Search by name or employee code..."
            noOptionsMessage={({ inputValue }) =>
              inputValue?.length >= 2 ? "No employees found" : "Type at least 2 characters to search"
            }
          />
          <small className="text-muted d-block mt-1">
            Search and select platform users to notify directly.
          </small>
        </FormGroup>

        {routingError && (
          <Alert color="danger" className="mb-0 mt-2 py-2">{routingError}</Alert>
        )}
      </CardBody>
    </Card>
  );
};

export default RoutingCard;