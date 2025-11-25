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
import ConditionsTable from "./components/ConditionsTable";
import PaginationControls from "./components/PaginationControls";
import ConditionFormModal from "./components/ConditionFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchCondition,
  addCondition,
  updateCondition,
  removeCondition,
} from "../../../store/actions";

const Conditions = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingCondition, setEditingCondition] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, data: null });

  console.log({ props });

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const {
    loading: permissionLoader,
    hasPermission,
    roles: userRoles,
  } = usePermissions(token);
  const hasUserPermission = hasPermission(
    "SETTING",
    "CONDITIONSSETTING",
    "READ"
  );
  const handleAuthError = useAuthError();

  const isLoading = useSelector((state) => state.Setting.loading);
  const conditions = props.conditions || [];

  useEffect(() => {
    dispatch(fetchCondition());
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
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: editingCondition?.title || "",
      description: editingCondition?.description || "",
      icdCode: editingCondition?.icdCode || "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        icdCode: values.icdCode.trim(),
      };

      console.log("in form");

      if (editingCondition?._id) {
        console.log({ editingCondition, mssg: "edit form" });

        dispatch(updateCondition({ _id: editingCondition._id, ...payload }));
      } else {
        console.log({ mssg: "add form" });

        dispatch(addCondition(payload));
      }

      resetForm();
      setEditingCondition(null);
      setModal(false);
    },
  });

  const toggleForm = () => {
    const nextOpen = !modal;
    setModal(nextOpen);
    if (!nextOpen) return;

    if (!editingCondition) {
      formik.resetForm();
    } else {
      formik.setValues({
        title: editingCondition.title || "",
        description: editingCondition.description || "",
      });
    }
  };

  const handleEdit = (condition) => {
    setEditingCondition(condition);
    formik.setValues({
      title: condition.title,
      description: condition.description,
    });
    setModal(true);
  };

  const handleDelete = async () => {
    if (!deleteModal?.data) return;

    const id = deleteModal.data._id || deleteModal.data.id;
    dispatch(removeCondition(id));
    setDeleteModal({ isOpen: false, data: null });
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const filteredConditions = conditions.filter(
    (c) =>
      (c.title || "").toLowerCase().includes(searchItem.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchItem.toLowerCase())
  );
  const totalPages = Math.ceil(filteredConditions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConditions = filteredConditions.slice(startIndex, endIndex);

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
        <Breadcrumb title="Conditions" pageTitle="Conditions" />
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
                    setEditingCondition(null);
                    toggleForm();
                  }}
                  disabled={isLoading}
                >
                  <i className="ri-add-fill me-1 align-bottom"></i> Add
                  Condition
                </Button>
              </Col>
            </CheckPermission>
          </Row>
        </CardBody>
      </Card>

      <Card className="flex-grow-1">
        <CardBody className="p-0">
          <ConditionsTable
            conditions={currentConditions}
            userRoles={userRoles}
            onEdit={handleEdit}
            onDelete={(condition) =>
              setDeleteModal({ isOpen: true, data: condition })
            }
          />

          {/* {totalPages > 1 && ( */}
          <PaginationControls
            totalItems={filteredConditions.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            onPageChange={handlePageChange}
          />
          {/* )} */}
        </CardBody>
      </Card>

      <ConditionFormModal
        isOpen={modal}
        toggle={() => {
          setModal(false);
          formik.resetForm();
          setEditingCondition(null);
        }}
        formData={formik.values}
        onChange={(e) => {
          formik.handleChange(e);
          formik.setFieldTouched(e.target.name, true, false);
        }}
        onSubmit={formik.handleSubmit}
        isEditing={!!editingCondition}
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
  conditions: state.Setting.conditions,
});

export default connect(mapStateToProps)(Conditions);
