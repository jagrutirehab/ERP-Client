import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  Spinner,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import classnames from "classnames";
import { usePermissions } from "../../Components/Hooks/useRoles";
import FloorPhotos from "./FloorPhotos";
import Verification from "./Verification";

const Audit = () => {
  const navigate = useNavigate();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { loading: permissionLoader, hasPermission } = usePermissions(token);

  // Floor Photos tab — uploading and deleting photos.
  const hasPhotosRead = hasPermission("AUDIT", "FLOOR_PHOTOS", "READ");
  const hasPhotosWrite = hasPermission("AUDIT", "FLOOR_PHOTOS", "WRITE");
  const hasPhotosDelete = hasPermission("AUDIT", "FLOOR_PHOTOS", "DELETE");

  // Verification tab — approving and rejecting photos.
  const hasVerificationRead = hasPermission("AUDIT", "VERIFICATION", "READ");
  const hasVerificationWrite = hasPermission("AUDIT", "VERIFICATION", "WRITE");
  // const hasVerificationDelete = hasPermission("AUDIT", "VERIFICATION", "DELETE");

  // The page is reachable if either tab is readable.
  const hasUserPermission = hasPhotosRead || hasVerificationRead;

  const tabs = useMemo(
    () =>
      [
        hasPhotosRead && { key: "photos", label: "Floor Photos" },
        hasVerificationRead && { key: "verification", label: "Verification" },
      ].filter(Boolean),
    [hasPhotosRead, hasVerificationRead],
  );

  const [tab, setTab] = useState(null);

  // Land on the first tab the user may read, and never sit on a tab they lose
  // access to.
  useEffect(() => {
    if (!tabs.length) return;
    if (!tabs.some((item) => item.key === tab)) {
      setTab(tabs[0].key);
    }
  }, [tabs, tab]);

  useEffect(() => {
    if (!permissionLoader && !hasUserPermission) {
      navigate("/unauthorized");
    }
  }, [permissionLoader, hasUserPermission]);

  if (permissionLoader) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  document.title = "Audit";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="mb-4">
            <h4 className="fw-semibold mb-1">Audit</h4>
            <p className="text-muted small mb-0">
              Upload and verify floor photos for each center
            </p>
          </div>

          <Card>
            <CardBody>
              <Nav tabs className="mb-3">
                {tabs.map((item) => (
                  <NavItem key={item.key}>
                    <NavLink
                      className={classnames({ active: tab === item.key })}
                      onClick={() => setTab(item.key)}
                      style={{ cursor: "pointer", fontWeight: 500 }}
                    >
                      {item.label}
                    </NavLink>
                  </NavItem>
                ))}
              </Nav>

              {tab === "photos" && hasPhotosRead && (
                <FloorPhotos
                  hasWrite={hasPhotosWrite}
                  hasDelete={hasPhotosDelete}
                />
              )}

              {tab === "verification" && hasVerificationRead && (
                <Verification hasWrite={hasVerificationWrite} />
              )}
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Audit;
