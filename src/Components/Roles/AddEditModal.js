import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  getFilteredSubmoduleOptions,
  modulePermissionOptions,
  permissionList,
} from "../../Data/Roles.data";

const AddEditRoleModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    setName(initialData?.name || "");
    if (initialData?.permissions && Array.isArray(initialData.permissions)) {
      setPermissions(
        permissionList.map(({ key, subModules }) => {
          const existingModule = initialData.permissions.find(
            (mod) => mod.module.toUpperCase() === key
          );
          return {
            module: key,
            type: existingModule?.type || "NONE",
            subModules: subModules.map((sm) => ({
              name: sm.name,
              type:
                existingModule?.subModules?.find((s) => s.name === sm.name)
                  ?.type || "NONE",
            })),
          };
        })
      );
    } else {
      setPermissions(
        permissionList.map(({ key, subModules }) => ({
          module: key,
          type: "NONE",
          subModules: subModules.map((sm) => ({
            name: sm.name,
            type: "NONE",
          })),
        }))
      );
    }
  }, [initialData]);

  const getModulePermission = (modKey) => {
    return (
      permissions.find((mod) => mod.module === modKey) || {
        module: modKey,
        type: "NONE",
        subModules: [],
      }
    );
  };

  const updateModulePermission = (modKey, newType) => {
    setPermissions((prev) =>
      prev.map((mod) =>
        mod.module === modKey
          ? {
              ...mod,
              type: newType,
              subModules: mod.subModules.map((sm) => ({
                ...sm,
                type: newType,
              })),
            }
          : mod
      )
    );
    if (newType === "NONE") {
      setOpenDropdown((prev) => (prev === modKey ? null : prev));
    }
  };

  const updateSubmodulePermission = (modKey, subName, subType) => {
    setPermissions((prev) =>
      prev.map((mod) =>
        mod.module === modKey
          ? {
              ...mod,
              subModules: mod.subModules.map((sm) =>
                sm.name === subName ? { ...sm, type: subType } : sm
              ),
            }
          : mod
      )
    );
  };

  const toggleSubmodules = (modKey) => {
    setOpenDropdown((prev) => (prev === modKey ? null : modKey));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, permissions });
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "24px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#555",
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2
          style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#333",
            textAlign: "center",
            marginBottom: "4px",
          }}
        >
          {isEditMode ? "Edit Role" : "Add Role"}
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "#777",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          {isEditMode
            ? "Update role permissions"
            : "Create a new role and set permissions"}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{ display: "block", color: "#333", marginBottom: "6px" }}
            >
              Role Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px",
              }}
              placeholder="Enter role name"
            />
          </div>

          {permissionList.map(({ key, label, subModules }) => {
            const modulePerm = getModulePermission(key);

            return (
              <div
                key={key}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "20px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#333",
                    }}
                  >
                    {label}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    {modulePermissionOptions.map((perm) => (
                      <label
                        key={perm}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <input
                          type="radio"
                          name={`module-${key}`}
                          value={perm}
                          checked={modulePerm.type === perm}
                          onChange={() => updateModulePermission(key, perm)}
                        />
                        <span
                          style={{
                            textTransform: "capitalize",
                            fontSize: "14px",
                            color: "#333",
                          }}
                        >
                          {perm.toLowerCase()}
                        </span>
                      </label>
                    ))}
                    {(modulePerm.type === "READ" ||
                      modulePerm.type === "WRITE" ||
                      modulePerm.type === "DELETE") && (
                      <button
                        type="button"
                        onClick={() => toggleSubmodules(key)}
                        style={{
                          fontSize: "12px",
                          padding: "4px 8px",
                          border: "1px solid #bbb",
                          backgroundColor: "#fff",
                          color: "#333",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        {openDropdown === key
                          ? "Hide Submodules"
                          : "Show Submodules"}
                      </button>
                    )}
                  </div>
                </div>

                {openDropdown === key && (
                  <div
                    style={{
                      backgroundColor: "#eef2ff",
                      border: "1px solid #c7d2fe",
                      borderRadius: "6px",
                      padding: "12px 16px",
                      marginTop: "8px",
                    }}
                  >
                    {subModules.length === 0 ? (
                      <p style={{ fontSize: "14px", color: "#555" }}>
                        No submodules present.
                      </p>
                    ) : (
                      subModules.map((sm) => {
                        const subOptions = getFilteredSubmoduleOptions(
                          modulePerm.type
                        );
                        const current =
                          modulePerm.subModules?.find((s) => s.name === sm.name)
                            ?.type || "NONE";

                        return (
                          <div
                            key={sm.name}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "10px",
                              paddingLeft: "8px",
                              borderBottom: "1px dashed #ccc",
                              paddingBottom: "6px",
                            }}
                          >
                            <span style={{ fontSize: "14px", color: "#333" }}>
                              {sm.label}
                            </span>
                            <div style={{ display: "flex", gap: "12px" }}>
                              {subOptions.map((opt) => (
                                <label
                                  key={opt}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`sub-${key}-${sm.name}`}
                                    value={opt}
                                    checked={current === opt}
                                    onChange={() =>
                                      updateSubmodulePermission(
                                        key,
                                        sm.name,
                                        opt
                                      )
                                    }
                                  />
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      color: "#333",
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {opt.toLowerCase()}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}
          >
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "10px 16px",
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#333",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {isEditMode ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditRoleModal;
