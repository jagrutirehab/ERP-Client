import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const UserBar = ({ user }) => {
  return (
    <div style={{ padding: "1rem", maxWidth: "100%" }}>
      <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
        <li
          style={{
            backgroundColor: "#fff",
            borderRadius: "0.75rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
            padding: "1rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <Link
            to="#"
            onClick={(e) => e.preventDefault()}
            style={{
              textDecoration: "none",
              color: "#212529",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture.url}
                  alt="User"
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #e9ecef",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "#198754",
                    color: "#fff",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <span
                title="Online"
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#198754",
                  border: "2px solid #fff",
                  borderRadius: "50%",
                }}
              ></span>
            </div>

            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={user?.name || "Unknown User"}
              >
                {user?.name || "Unknown User"}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#6c757d",
                  fontStyle: "italic",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={user?.role || "Role not defined"}
              >
                {user?.role || "Role not defined"}
              </div>
            </div>
          </Link>
        </li>
      </ul>
    </div>
  );
};

UserBar.propTypes = {
  user: PropTypes.object.isRequired,
};

export default UserBar;
