import React, { useEffect, useState } from "react";
import { getManagementHiringRequests } from "../../../../helpers/backend_helper";
import { CardBody } from "reactstrap";
// import DataTableComponent from "../../../components/Table/DataTable";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { HiringActionColumns } from "../../../HRMS/components/Table/Columns/HiringManagementColumn";
import DataTableComponent from "../../../HRMS/components/Table/DataTable";
import EditHiringRequestModal from "../../components/EditHiringRequestModal";
import { editManagementRequests } from "../../../../helpers/backend_helper";
import { toast } from "react-toastify";

const HiringManagement = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [formData, setFormData] = useState({});

  const loadHiringManagementRequests = async () => {
    setLoading(true);
    try {
      const response = await getManagementHiringRequests();
      console.log("response", response);
      setRequests(response?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHiringManagementRequests();
  }, []);

  const handleActionClick = (row) => {
    setSelectedRow(row);
    setFormData({
      updateStatus: row?.updateStatus || "",
      priority: row?.priority || "",
      remarks: row?.remarks || "",
      interviewer: row?.interviewer || "",
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedRow?._id) return;

    try {
      setLoading(true);

      const payload = {
        updateStatus: formData.updateStatus,
        priority: formData.priority,
        remarks: formData.remarks,
        interviewer: formData.interviewer,
      };

      const response = await editManagementRequests(selectedRow._id, payload);
      console.log("response", response);
      if (response.success === true) {
        toast.success(response?.message);
      }
      setIsModalOpen(false);
      loadHiringManagementRequests();
    } catch (error) {
      console.log(error);
      toast.error("Error Updating Data");
    } finally {
      setLoading(false);
    }
  };

  console.log("requests", requests);
  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">HIRING MANAGEMENT</h1>
      </div>
      <DataTableComponent
        columns={HiringActionColumns({ onActionClick: handleActionClick })}
        data={requests}
        loading={loading}
      />

      <EditHiringRequestModal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(false)}
        selectedRow={selectedRow}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdate}
        loading={loading}
      />
    </CardBody>
  );
};

export default HiringManagement;
