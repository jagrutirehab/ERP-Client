import { useParams } from "react-router-dom";
import InternalTransferForm from "../Form";

const EditRequest = () => {
    const { id } = useParams();
    return <InternalTransferForm mode="edit" requisitionId={id} />;
};

export default EditRequest;
