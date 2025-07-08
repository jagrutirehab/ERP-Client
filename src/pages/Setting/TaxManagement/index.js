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
} from "reactstrap";
import DeleteModal from "../../../Components/Common/DeleteModal";
import TaxListing from "./TaxListing";
import AddTaxModal from "./AddTaxModal";


const TaxManagement = () => {
    const offerCode = [];
    const [modal, setModal] = useState(true);
    const [deleteOffer, setDeleteOffer] = useState({
        isOpen: false,
        data: null,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [tempSearch, setTempSearch] = useState("");

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            console.log(tempSearch);
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

    const handleDelete = () => {
        setDeleteOffer({ isOpen: false, data: null })
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


                    <Col className="col-sm-auto ms-auto">
                        <Button color="success" className="text-white" onClick={() => setModal(true)}>
                            <i className="ri-add-fill me-1 align-bottom"></i> Add Tax
                        </Button>
                    </Col>
                </Row>
            </CardBody>
            <div className="flex-grow-1 d-flex flex-column overflow-auto">
                <TaxListing
                    offerCode={offerCode}
                    totalCount={10}
                    totalPages={50}
                    setDeleteOffer={setDeleteOffer}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            </div>
            <DeleteModal
                show={deleteOffer.isOpen}
                onDeleteClick={handleDelete}
                onCloseClick={handleDelete}
            />
          <AddTaxModal modal={modal} toggle={toggleForm} /> 
        </div>
    );
};

export default TaxManagement;
