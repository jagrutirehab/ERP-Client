import React, { useEffect, useState } from "react";
import Breadcrumb from "../../../Components/Common/BreadCrumb";
import {
    CardBody,
    Row,
    Col,
    Input,
    Button,
    InputGroup,
    InputGroupText,
    Spinner,
} from "reactstrap";

import OfferListing from "./OfferListing";
import DeleteModal from "../../../Components/Common/DeleteModal";
import AddOfferModal from "./AddOfferModal";
import { fetchOfferList } from "../../../store/actions";
import { useDispatch, useSelector } from "react-redux";
import { updateOfferFunction } from "../../../store/features/offer/offerSlice";
import EditOfferModal from "./EditOffer";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { useNavigate } from "react-router-dom";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";

const OfferCode = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [modal, setModal] = useState(false);
    const [searchItem, setSearchItem] = useState('')
    const [apiFlag, setApiFlag] = useState(false)
    const [deleteOffer, setDeleteOffer] = useState({
        isOpen: false,
        data: null,
    });
    const [editOffer, setEditOffer] = useState({
        isOpen: false,
        data: null,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [tempSearch, setTempSearch] = useState("");
    const data = useSelector((state) => state.Offers.data);
    const token = useSelector((state) => state.User?.microLogin?.token);
    const totalCount = useSelector((state) => state.Offers.totalCount);
    const totalPages = useSelector((state) => state.Offers.totalPages);
    const { loading: permissionLoader, hasPermission, roles:userRoles } = usePermissions(token);
    const hasUserPermission = hasPermission("SETTING", "OFFERCODESETTING", "READ");
    const handleAuthError = useAuthError();

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setSearchItem(tempSearch);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [tempSearch]);

    const toggleForm = () => setModal(!modal);
    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = async () => {
        if (!deleteOffer?.data) return;
        const data = { ...deleteOffer?.data, deleted: true }
        try {
            const response = await dispatch(updateOfferFunction(data)).unwrap();
            if (response.success) {
                setApiFlag(!apiFlag)
                setDeleteOffer({ isOpen: false, data: null })
            }
        } catch (error) {
            if(!handleAuthError(error)) {
                console.error("Delete offer failed:", error);
                toast.error(error.message || "Failed to delete offer.");
            }
        }
    }

    useEffect(() => {
      const loadOfferList = async () => {
        try {
          if (!hasUserPermission) return;
          await dispatch(
            fetchOfferList({
              page: currentPage,
              limit: itemsPerPage,
              search: searchItem,
            })
          ).unwrap();
        } catch (error) {
          if (!handleAuthError(error)) {
            toast.error(error.message || "Failed to fetch offer list.");
          }
        }
      };

      loadOfferList();
    }, [
      dispatch,
      currentPage,
      itemsPerPage,
      searchItem,
      apiFlag,
      hasUserPermission,
    ]);


    if (permissionLoader) {
         return (
           <div className="d-flex justify-content-center align-items-center vh-100">
             <Spinner color="primary" className="d-block" style={{ width: '3rem', height: '3rem' }} />
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
          <Breadcrumb title="Offer Code" pageTitle="Offer Code" />
        </div>

        <CardBody className="p-3 bg-white">
          <Row className="g-2 align-items-center">
            <Col sm={4}>
              <InputGroup>
                <Input
                  type="text"
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  placeholder="Search for name"
                />
                <InputGroupText>
                  <i className="ri-search-line"></i>
                </InputGroupText>
              </InputGroup>
            </Col>

            <CheckPermission
              accessRolePermission={userRoles?.permissions}
              permission="create"
            >
              <Col className="col-sm-auto ms-auto">
                <Button
                  color="success"
                  className="text-white"
                  onClick={() => setModal(true)}
                >
                  <i className="ri-add-fill me-1 align-bottom"></i> Add Offer
                </Button>
              </Col>
            </CheckPermission>
          </Row>
        </CardBody>

        <div className="flex-grow-1 d-flex flex-column overflow-auto">
          <OfferListing
            offerCode={data}
            totalCount={totalCount}
            totalPages={totalPages}
            setEditOffer={setEditOffer}
            setDeleteOffer={setDeleteOffer}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            userPermissions={userRoles?.permissions}
          />
        </div>

        <DeleteModal
          show={deleteOffer.isOpen}
          onDeleteClick={handleDelete}
          onCloseClick={() => setDeleteOffer({ data: null, isOpen: false })}
        />

        <AddOfferModal
          modal={modal}
          toggle={toggleForm}
          apiFlag={apiFlag}
          setApiFlag={setApiFlag}
        />
        <EditOfferModal
          modal={editOffer?.isOpen}
          toggle={() => {
            setEditOffer({ data: null, isOpen: false });
          }}
          data={editOffer?.data}
          setApiFlag={setApiFlag}
          apiFlag={apiFlag}
        />
      </div>
    );
};

export default OfferCode;
