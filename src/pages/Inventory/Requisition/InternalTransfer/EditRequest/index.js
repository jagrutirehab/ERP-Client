import { useParams } from "react-router-dom";
import InternalTransferForm from "../Form";

const EditRequest = ({ transferType = "internal" }) => {
    const { id } = useParams();
    return <InternalTransferForm mode="edit" requisitionId={id} transferType={transferType} />;
};

export default EditRequest;
