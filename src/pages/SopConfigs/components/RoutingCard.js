// components/RoutingCard.js
import React, { useState, useCallback, useEffect, useRef } from "react";
import AsyncSelect from "react-select/async";
import {
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Label,
  Button,
  Badge,
  Alert,
  Spinner,
  Input,
} from "reactstrap";
import {
  sopGetRoles,
  getEmployeesBySearch,
} from "../../../helpers/backend_helper";

const isECodeLike = (str) => /^[a-zA-Z]{1,3}\d+$/i.test(str);

const RoutingCard = ({
  selectedRoles,
  onRoleToggle,
  selectedUsers,
  onUsersChange,
  notifyAdmissionDoctor = false,
  notifyAdmissionPsychologist = false,
  onSpecialRoutingToggle,
  idPrefix = "",
  routingError,
  isSubmitting,
}) => {
  const doctorId = `notifyAdmissionDoctor-${idPrefix}`;
  const psychId = `notifyAdmissionPsychologist-${idPrefix}`;
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
        if (alive)
          setRolesError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load roles",
          );
      } finally {
        if (alive) setRolesLoading(false);
      }
    };

    fetchRoles();
    return () => {
      alive = false;
    };
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

  const debouncedLoadEmployees = useCallback(
    (inputValue, callback) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        callback(await fetchEmployees(inputValue));
      }, 400);
    },
    [fetchEmployees],
  );

  return (
    <Card className="mb-4">
      <CardHeader className="fw-semibold">
        Routing — Who Gets Notified
        {routingError && (
          <Badge color="danger" pill className="ms-2">
            Required
          </Badge>
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
                  >
                    {active && "✓ "}
                    {role.name?.toUpperCase()} ({role.count})
                  </Button>
                );
              })}
            </div>
          )}
        </FormGroup>

        <FormGroup>
          <Label className="fw-semibold">
            Notify Specific Users{" "}
            {selectedUsers.length > 0 && (
              <Badge color="info" pill className="ms-1">
                {selectedUsers.length}
              </Badge>
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
              inputValue?.length >= 2
                ? "No employees found"
                : "Type at least 2 characters to search"
            }
          />
        </FormGroup>

        <FormGroup>
          <Label className="fw-semibold mb-2">Patient's Care Team</Label>
          <div className="form-check">
            <Input
              type="checkbox"
              id={doctorId}
              checked={!!notifyAdmissionDoctor}
              disabled={isSubmitting}
              onChange={(e) =>
                onSpecialRoutingToggle?.(
                  "notifyAdmissionDoctor",
                  e.target.checked,
                )
              }
            />
            <Label htmlFor={doctorId} className="form-check-label ms-1">
              Notify patient&apos;s current admission doctor
            </Label>
          </div>
          <div className="form-check">
            <Input
              type="checkbox"
              id={psychId}
              checked={!!notifyAdmissionPsychologist}
              disabled={isSubmitting}
              onChange={(e) =>
                onSpecialRoutingToggle?.(
                  "notifyAdmissionPsychologist",
                  e.target.checked,
                )
              }
            />
            <Label htmlFor={psychId} className="form-check-label ms-1">
              Notify patient&apos;s current admission psychologist
            </Label>
          </div>
          <small className="text-muted d-block mt-1">
            Resolved to the assigned doctor/psychologist on the patient&apos;s
            current admission when the alert fires.
          </small>
        </FormGroup>

        {routingError && (
          <Alert color="danger" className="mb-0 mt-2 py-2">
            {routingError}
          </Alert>
        )}
      </CardBody>
    </Card>
  );
};

export default RoutingCard;
