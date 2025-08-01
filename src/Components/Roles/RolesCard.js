import { Card } from "./Card";

export const RoleCard = ({
  totalUsers = 0,
  avatars = [],
  roleName = "Unnamed Role",
  onEdit,
  onDelete,
}) => (
  <Card
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minWidth: "250px",
      width: "100%",
      height: "100%",
      padding: "1rem",
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#4B5563" }}>
        Total {totalUsers} user{totalUsers !== 1 ? "s" : ""}
      </span>

      {totalUsers > 0 && avatars.length > 0 && (
        <div style={{ display: "flex", marginLeft: "0.5rem" }}>
          {avatars.slice(0, 3).map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "9999px",
                border: "2px solid white",
                objectFit: "cover",
                marginLeft: i === 0 ? "0" : "-0.5rem",
              }}
            />
          ))}
          {avatars.length > 3 && (
            <span
              style={{
                width: "2rem",
                height: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9999px",
                backgroundColor: "#E5E7EB",
                color: "#4B5563",
                fontSize: "0.75rem",
                fontWeight: 500,
                border: "2px solid white",
                marginLeft: "-0.5rem",
              }}
            >
              +{avatars.length - 3}
            </span>
          )}
        </div>
      )}
    </div>

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "#111827",
            margin: 0,
          }}
        >
          {roleName}
        </h3>
        <button
          onClick={onEdit}
          style={{
            marginTop: "0.25rem",
            fontSize: "0.875rem",
            color: "#4F46E5",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          <i
            className="bx bx-edit-alt"
            style={{ fontSize: "1rem", marginRight: "0.25rem" }}
          />
          Edit Role
        </button>
      </div>
      {totalUsers <= 0 ? (
        <button
          onClick={onDelete}
          style={{
            padding: "0.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9CA3AF",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
        >
          <i className="bx bx-trash" style={{ fontSize: "1.25rem" }} />
        </button>
      ) : (
        ""
      )}
    </div>
  </Card>
);

export const AddRoleCard = ({ onAdd }) => (
  <Card
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      minWidth: "250px",
      width: "100%",
      height: "100%",
      padding: "1rem",
      boxSizing: "border-box",
    }}
  >
    <h3
      style={{
        fontSize: "1.125rem",
        fontWeight: 500,
        color: "#111827",
        marginBottom: "0.5rem",
      }}
    >
      Add Role
    </h3>
    <p
      style={{
        fontSize: "0.875rem",
        color: "#6B7280",
        marginBottom: "1rem",
      }}
    >
      Add new role, if it doesn’t exist.
    </p>
    <button
      onClick={onAdd}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.5rem 1rem",
        backgroundColor: "#4F46E5",
        color: "white",
        fontSize: "0.875rem",
        fontWeight: 500,
        borderRadius: "0.375rem",
        border: "none",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        cursor: "pointer",
      }}
    >
      <i
        className="bx bx-plus"
        style={{ fontSize: "1rem", marginRight: "0.5rem" }}
      />
      Add Role
    </button>
  </Card>
);
