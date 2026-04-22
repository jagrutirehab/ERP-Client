import { useSearchParams } from "react-router-dom";
import InternalTransferForm from "../Form";

const AddRequest = () => {
    const [searchParams] = useSearchParams();
    const transferType = searchParams.get("type") || "internal";
    return <InternalTransferForm mode="add" transferType={transferType} />;
};

export default AddRequest;
