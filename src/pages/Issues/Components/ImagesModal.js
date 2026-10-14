import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { FiDownload } from "react-icons/fi";

const ImagesModal = ({ isOpen, toggle, files }) => {

    const handleDownload = (url) => {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.download = "issue-image";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered scrollable>
            <ModalHeader toggle={toggle}>
                Attached Images
            </ModalHeader>

            <ModalBody>
                {files?.length === 0 ? (
                    <p>No images available</p>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                            gap: "12px",
                        }}
                    >
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="image-container"
                                style={{
                                    position: "relative",
                                    borderRadius: "6px",
                                    overflow: "hidden",
                                    border: "1px solid #ddd",
                                }}
                            >
                                <img
                                    src={file?.url}
                                    alt="issue"
                                    className="issue-image"
                                />
                                <div
                                    className="image-overlay"
                                    onClick={() => handleDownload(file?.url)}
                                >
                                    <FiDownload size={28} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};

export default ImagesModal;