import React, { useState, useEffect } from "react";
import Breadcrumb from "../../../Components/Common/BreadCrumb";
import { Card, CardBody, Row, Col, Button, Spinner } from "reactstrap";
import { connect, useDispatch, useSelector } from "react-redux";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { useNavigate } from "react-router-dom";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import SearchBar from "./components/SearchBar";
import TherapiesTable from "./components/TherapiesTable";
import PaginationControls from "./components/PaginationControls";
import TherapyFormModal from "./components/TherapyFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchTherapy,
  addTherapy,
  updateTherapy,
  removeTherapy,
} from "../../../store/actions";

const Therapies = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingTherapy, setEditingTherapy] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, data: null });

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const {
    loading: permissionLoader,
    hasPermission,
    roles: userRoles,
  } = usePermissions(token);
  const hasUserPermission = hasPermission(
    "SETTING",
    "THERAPIESSETTING",
    "READ"
  );
  const handleAuthError = useAuthError();

  const isLoading = useSelector((state) => state.Setting.loading);
  const therapies = props.therapies || [];

  useEffect(() => {
    dispatch(fetchTherapy());
  }, [dispatch]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchItem(tempSearch);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [tempSearch]);

  const validationSchema = Yup.object({
    title: Yup.string().trim().required("Title is required"),
    description: Yup.string().trim().required("Description is required"),
    // price: Yup.number()
    //   .typeError("Price must be a number")
    //   .required("Price is required")
    //   .min(0, "Price must be >= 0"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: editingTherapy?.title || "",
      description: editingTherapy?.description || "",
      // price: editingTherapy?.price ?? "",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        // price: Number(values.price),
      };

      if (editingTherapy?._id) {
        dispatch(updateTherapy({ _id: editingTherapy._id, ...payload }));
      } else {
        dispatch(addTherapy(payload));
      }

      resetForm();
      setEditingTherapy(null);
      setModal(false);
    },
  });

  const toggleForm = () => {
    const nextOpen = !modal;
    setModal(nextOpen);
    if (!nextOpen) return;

    if (!editingTherapy) {
      formik.resetForm();
    } else {
      formik.setValues({
        title: editingTherapy.title || "",
        description: editingTherapy.description || "",
        price: editingTherapy.price ?? "",
      });
    }
  };

  const handleEdit = (therapy) => {
    setEditingTherapy(therapy);
    formik.setValues({
      title: therapy.title,
      description: therapy.description,
      price: therapy.price ?? "",
    });
    setModal(true);
  };

  const handleDelete = () => {
    if (!deleteModal?.data) return;
    const id = deleteModal.data._id || deleteModal.data.id;
    dispatch(removeTherapy(id));
    setDeleteModal({ isOpen: false, data: null });
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const filteredTherapies = therapies.filter(
    (t) =>
      (t.title || "").toLowerCase().includes(searchItem.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchItem.toLowerCase())
  );
  const totalPages = Math.ceil(filteredTherapies.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTherapies = filteredTherapies.slice(startIndex, endIndex);

  if (permissionLoader) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner
          color="primary"
          className="d-block"
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    );
  }

  if (!hasUserPermission) {
    navigate("/unauthorized");
    return null;
  }

  return (
    <div className="container-fluid d-flex flex-column h-100 px-3">
      <div className="mt-4 mx-4">
        <Breadcrumb title="Therapies" pageTitle="Therapies" />
      </div>

      <Card className="mb-3">
        <CardBody className="p-3">
          <Row className="g-2 align-items-center">
            <SearchBar
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
            />
            <CheckPermission
              accessRolePermission={userRoles?.permissions}
              permission="create"
            >
              <Col className="col-sm-auto ms-auto">
                <Button
                  color="success"
                  className="text-white"
                  onClick={() => {
                    setEditingTherapy(null);
                    toggleForm();
                  }}
                  disabled={isLoading}
                >
                  <i className="ri-add-fill me-1 align-bottom"></i> Add Therapy
                </Button>
              </Col>
            </CheckPermission>
          </Row>
        </CardBody>
      </Card>

      <Card className="flex-grow-1">
        <CardBody className="p-0">
          <TherapiesTable
            therapies={currentTherapies}
            onEdit={handleEdit}
            onDelete={(therapy) =>
              setDeleteModal({ isOpen: true, data: therapy })
            }
          />

          {totalPages > 1 && (
            <PaginationControls
              totalItems={filteredTherapies.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              onPageChange={handlePageChange}
            />
          )}
        </CardBody>
      </Card>

      <TherapyFormModal
        isOpen={modal}
        toggle={() => {
          setModal(false);
          formik.resetForm();
          setEditingTherapy(null);
        }}
        formData={formik.values}
        onChange={(e) => {
          formik.handleChange(e);
          formik.setFieldTouched(e.target.name, true, false);
        }}
        onSubmit={formik.handleSubmit}
        isEditing={!!editingTherapy}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        item={deleteModal.data}
        onCancel={() => setDeleteModal({ isOpen: false, data: null })}
        onConfirm={handleDelete}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  therapies: state.Setting.therapies,
});

export default connect(mapStateToProps)(Therapies);
