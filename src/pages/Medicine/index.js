import React, { useEffect, useState } from "react";
import Breadcrumb from "../../Components/Common/BreadCrumb";
import AddMedicines from "./Components/AddMedicine";
import MedicineBar from "./Components/MedicineBar";
import DeleteModal from "../../Components/Common/DeleteModal";
import MedicineList from "./Components/MedicineList";
import { useDispatch, useSelector } from "react-redux";
import { fetchMedicines, removeMedicine } from "../../store/actions";
import MedicineCSV from "./Components/MedicineCSV";

const Medicine = () => {
  const dispatch = useDispatch();
  const medicines = useSelector((state) => state.Medicine.data);
  const totalCount = useSelector((state) => state.Medicine.totalCount);
  const totalPages = useSelector((state) => state.Medicine.totalPages);

  const [modal, setModal] = useState(false);
  const [CSVModal, setCSVModal] = useState(false);
  const [deleteMedicine, setDeleteMedicine] = useState({
    isOpen: false,
    data: null,
  });

  const [searchItem, setSearchItem] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const toggleForm = () => setModal(!modal);
  const toggleCSV = () => setCSVModal(!CSVModal);

  const dltMedicine = () => {
    dispatch(removeMedicine(deleteMedicine.data));
    setDeleteMedicine({ isOpen: false, data: null });
  };

  const cancelDeleteMedicine = () => {
    setDeleteMedicine({ isOpen: false, data: null });
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    dispatch(
      fetchMedicines({
        page: currentPage,
        limit: itemsPerPage,
        search: searchItem,
      })
    );
  }, [dispatch, currentPage, itemsPerPage, searchItem]);

  return (
    <div className="container-fluid d-flex flex-column h-100 px-3">
      <div className="mt-4 mx-4">
        <Breadcrumb title="Medicine" pageTitle="Medicine" />
      </div>

      <MedicineBar
        toggleForm={toggleForm}
        toggleCSV={toggleCSV}
        setSearchItem={setSearchItem}
      />

      <div className="flex-grow-1 d-flex flex-column overflow-auto">
        <MedicineList
          medicines={medicines}
          totalCount={totalCount}
          totalPages={totalPages}
          searchItem={searchItem}
          setDeleteMedicine={setDeleteMedicine}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      <AddMedicines modal={modal} toggle={toggleForm} />
      <MedicineCSV modal={CSVModal} toggle={toggleCSV} />
      <DeleteModal
        show={deleteMedicine.isOpen}
        onDeleteClick={dltMedicine}
        onCloseClick={cancelDeleteMedicine}
      />
    </div>
  );
};

export default Medicine;
