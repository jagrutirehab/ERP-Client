import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
    Button,
    Input,
    InputGroup,
    Table,
    Badge,
    ListGroup,
    ListGroupItem,
    Row,
    Col,
    FormGroup,
    Label,
    UncontrolledTooltip,
    Spinner,
} from "reactstrap";
import { connect } from "react-redux";
import { BlobProvider, PDFDownloadLink } from "@react-pdf/renderer";
import CustomModal from "../../../Components/Common/Modal";
import { belongingsData } from "../../../Components/constants/patient";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { capitalizeWords } from "../../../utils/toCapitalize";
import PreviewFile from "../../../Components/Common/PreviewFile";
import BelongingsPDF from "../../../Components/Print/Belongings";

const riskBadgeColor = (risk) => {
    switch (risk?.toLowerCase()) {
        case "high":
            return "danger";
        case "moderate":
            return "warning";
        case "low":
            return "success";
        default:
            return "secondary";
    }
};

const BelongingsFormModal = ({ isOpen, toggle, date, patient, center }) => {
    const [search, setSearch] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [showPDF, setShowPDF] = useState(false);

    // Custom "Other" item fields
    const [customName, setCustomName] = useState("");
    const [customCategory, setCustomCategory] = useState("Other");
    const [customRisk, setCustomRisk] = useState("TBD");
    const [customAllowed, setCustomAllowed] = useState("To be assessed");
    const [showOtherForm, setShowOtherForm] = useState(false);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);

    const isMobile = useMediaQuery("(max-width: 640px)");

    const filteredItems = search.trim()
        ? belongingsData.filter(
            (item) =>
                item.searchIndex.includes(search.toLowerCase()) &&
                !selectedItems.find(
                    (s) =>
                        s.belongings === item.belongings && s.category === item.category
                )
        )
        : [];

    const addItem = useCallback(
        (item) => {
            if (
                !selectedItems.find(
                    (s) =>
                        s.belongings === item.belongings && s.category === item.category
                )
            ) {
                // Check if this is the "Other" item (empty belongings name)
                if (item.category === "Other" && !item.belongings) {
                    setShowOtherForm(true);
                    setSearch("");
                    setShowSuggestions(false);
                    return;
                }
                setSelectedItems((prev) => [
                    ...prev,
                    { ...item, quantity: 1, remarks: "", image: null },
                ]);
            }
            setSearch("");
            setShowSuggestions(false);
        },
        [selectedItems]
    );

    const addCustomItem = () => {
        if (!customName.trim()) return;
        setSelectedItems((prev) => [
            ...prev,
            {
                belongings: customName.trim(),
                category: customCategory,
                associated_risk: customRisk,
                allowed_with_patient: customAllowed,
                quantity: 1,
                remarks: "",
                isCustom: true,
                image: null,
            },
        ]);
        setCustomName("");
        setCustomCategory("Other");
        setCustomRisk("TBD");
        setCustomAllowed("To be assessed");
        setShowOtherForm(false);
    };

    const removeItem = (idx) => {
        setSelectedItems((prev) => prev.filter((_, i) => i !== idx));
    };

    const updateQuantity = (idx, val) => {
        setSelectedItems((prev) =>
            prev.map((item, i) =>
                i === idx ? { ...item, quantity: Math.max(1, Number(val) || 1) } : item
            )
        );
    };

    const updateRemarks = (idx, val) => {
        setSelectedItems((prev) =>
            prev.map((item, i) => (i === idx ? { ...item, remarks: val } : item))
        );
    };

    const updateImage = (idx, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedItems((prev) =>
                prev.map((item, i) =>
                    i === idx ? { ...item, image: reader.result, imageName: file.name } : item
                )
            );
        };
        reader.readAsDataURL(file);
    };

    const removeImage = (idx) => {
        setSelectedItems((prev) =>
            prev.map((item, i) => (i === idx ? { ...item, image: null, imageName: null } : item))
        );
    };

    const visibleItems = filteredItems.slice(0, 15);

    const handleKeyDown = (e) => {
        if (!showSuggestions || visibleItems.length === 0) {
            if (e.key === "Escape") {
                setShowSuggestions(false);
            }
            return;
        }
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < visibleItems.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : visibleItems.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < visibleItems.length) {
                    addItem(visibleItems[highlightedIndex]);
                } else if (visibleItems.length > 0) {
                    addItem(visibleItems[0]);
                }
                setHighlightedIndex(-1);
                break;
            case "Escape":
                setShowSuggestions(false);
                setHighlightedIndex(-1);
                break;
            default:
                break;
        }
    };

    const formattedDate = date
        ? new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
        : "";

    if (showPDF) {
        return (
            <CustomModal
                isOpen={isOpen}
                toggle={() => {
                    setShowPDF(false);
                    toggle();
                }}
                title="Belongings PDF Preview"
                size="xl"
            >
                <div className="mb-2 d-flex justify-content-between">
                    <Button
                        color="secondary"
                        size="sm"
                        outline
                        onClick={() => setShowPDF(false)}
                    >
                        <i className="ri-arrow-left-line me-1"></i> Back to Form
                    </Button>

                    <PDFDownloadLink
                        document={
                            <BelongingsPDF
                                items={selectedItems}
                                patient={patient}
                                date={date}
                                center={center}
                            />
                        }
                        fileName={`Belongings_${patient?.name || "patient"}.pdf`}
                        className="btn btn-primary btn-sm text-white"
                    >
                        {({ loading }) =>
                            loading ? <Spinner size="sm" /> : "Download PDF"
                        }
                    </PDFDownloadLink>
                </div>
                {!isMobile ? (
                    <BlobProvider
                        document={
                            <BelongingsPDF
                                items={selectedItems}
                                patient={patient}
                                date={date}
                                center={center}
                            />
                        }
                    >
                        {({ url, loading }) => (
                            <div style={{ position: "relative", minHeight: 550 }}>
                                {(loading || !url) ? (
                                    <div
                                        className="d-flex flex-column justify-content-center align-items-center"
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: "rgba(255,255,255,0.85)",
                                            zIndex: 10,
                                        }}
                                    >
                                        <Spinner color="primary" />
                                        <p className="text-muted mt-2 mb-0">Generating PDF...</p>
                                    </div>
                                ) : (
                                    <iframe
                                        src={url}
                                        title="Belongings PDF"
                                        width="100%"
                                        height={550}
                                        style={{ border: "none" }}
                                    />
                                )}
                            </div>
                        )}
                    </BlobProvider>
                ) : (
                    <div className="text-center p-4 border rounded bg-light">
                        <p className="text-muted mb-3">
                            Preview not available on mobile, please download.
                        </p>
                        <PDFDownloadLink
                            document={
                                <BelongingsPDF
                                    items={selectedItems}
                                    patient={patient}
                                    date={date}
                                    center={center}
                                />
                            }
                            fileName={`Belongings_${patient?.name || "patient"}.pdf`}
                            className="btn btn-primary btn-sm"
                        >
                            {({ loading }) =>
                                loading ? <Spinner size="sm" /> : "Download PDF"
                            }
                        </PDFDownloadLink>
                    </div>
                )}
            </CustomModal>
        );
    }

    return (
        <>
        <CustomModal
            isOpen={isOpen}
            toggle={toggle}
            title="Belongings Form"
            size="xl"
        >
            <div>
                {/* Patient & Date info */}
                <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <p className="mb-0 text-muted">
                        <strong>Patient:</strong>{" "}
                        <span className="text-primary">
                            {(patient?.name || "").toUpperCase()}
                        </span>
                    </p>
                    <p className="mb-0 text-muted">
                        <strong>Date:</strong>{" "}
                        <span className="text-primary">{formattedDate}</span>
                    </p>
                </div>

                {/* Search */}
                <div className="position-relative mb-3">
                    <InputGroup>
                        <Input
                            type="text"
                            placeholder="Search belongings to add..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setShowSuggestions(true);
                                setHighlightedIndex(-1);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={handleKeyDown}
                        />
                        <Button
                            id="btn-add-suggestion"
                            color="primary"
                            className="text-white"
                            disabled={filteredItems.length === 0}
                            onClick={() => {
                                if (filteredItems.length > 0) addItem(filteredItems[0]);
                            }}
                        >
                            <i className="ri-send-plane-fill"></i>
                        </Button>
                        <UncontrolledTooltip target="btn-add-suggestion" placement="top">
                            Add Item
                        </UncontrolledTooltip>
                        <Button
                            id="btn-add-custom"
                            color="info"
                            className="text-white ms-2"
                            onClick={() => setShowOtherForm(!showOtherForm)}
                        >
                            <i className="ri-edit-line"></i>
                        </Button>
                        <UncontrolledTooltip target="btn-add-custom" placement="top">
                            Add other item
                        </UncontrolledTooltip>
                    </InputGroup>

                    {/* Suggestions dropdown */}
                    {showSuggestions && visibleItems.length > 0 && (
                        <ListGroup
                            className="position-absolute w-100 shadow"
                            style={{ zIndex: 1050, maxHeight: 220, overflowY: "auto" }}
                        >
                            {visibleItems.map((item, idx) => (
                                <ListGroupItem
                                    key={idx}
                                    tag="button"
                                    action
                                    style={idx === highlightedIndex ? { backgroundColor: "#e9ecef" } : {}}
                                    className="d-flex justify-content-between align-items-center py-2"
                                    onClick={() => addItem(item)}
                                    onMouseEnter={() => setHighlightedIndex(idx)}
                                >
                                    <span>
                                        <strong>{item.belongings || "(Other - Custom)"}</strong>{" "}
                                        <small className="text-muted">({item.category})</small>
                                    </span>
                                    <Badge color={riskBadgeColor(item.associated_risk)} pill>
                                        {item.associated_risk}
                                    </Badge>
                                </ListGroupItem>
                            ))}
                        </ListGroup>
                    )}
                </div>

                {/* Custom "Other" item form */}
                {showOtherForm && (
                    <div className="border rounded p-3 mb-3 bg-light">
                        <h6 className="mb-3">
                            <i className="ri-add-circle-line me-1"></i> Add Custom Item
                        </h6>
                        <Row>
                            <Col md={3}>
                                <FormGroup>
                                    <Label className="small">Item Name *</Label>
                                    <Input
                                        bsSize="sm"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder="e.g. Blanket"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Label className="small">Category</Label>
                                    <Input
                                        bsSize="sm"
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        placeholder="e.g. Clothing"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Label className="small">Associated Risk</Label>
                                    <Input
                                        type="select"
                                        bsSize="sm"
                                        value={customRisk}
                                        onChange={(e) => setCustomRisk(e.target.value)}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Moderate">Moderate</option>
                                        <option value="High">High</option>
                                        <option value="TBD">TBD</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Label className="small">Allowed With Patient</Label>
                                    <Input
                                        type="select"
                                        bsSize="sm"
                                        value={customAllowed}
                                        onChange={(e) => setCustomAllowed(e.target.value)}
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                        <option value="Conditional">Conditional</option>
                                        <option value="Supervised">Supervised</option>
                                        <option value="To be assessed">To be assessed</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={2} className="d-flex align-items-end mb-3">
                                <Button
                                    color="success"
                                    size="sm"
                                    className="w-100"
                                    disabled={!customName.trim()}
                                    onClick={addCustomItem}
                                >
                                    <i className="ri-add-line me-1"></i> Add
                                </Button>
                            </Col>
                        </Row>
                    </div>
                )}

                {/* Selected Items Table */}
                {selectedItems.length > 0 && (
                    <div
                        style={{ maxHeight: 350, overflowY: "auto" }}
                        className="border rounded mb-3"
                    >
                        <Table bordered hover responsive size="sm" className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: 30 }}>#</th>
                                    <th>Category</th>
                                    <th>Item</th>
                                    <th style={{ width: 60 }}>Associated Risk</th>
                                    <th style={{ width: 85 }}>Allowed With Patient</th>
                                    <th style={{ width: 65 }}>Qty</th>
                                    <th style={{ width: 140 }}>Remarks</th>
                                    <th style={{ width: 90 }}>Attachment</th>
                                    <th style={{ width: 40 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedItems.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <small>{item.category}</small>
                                        </td>
                                        <td>
                                            {capitalizeWords(item.belongings)}
                                            {/* {item.isCustom && (
                                                <Badge color="info" className="ms-1" pill>
                                                    Custom
                                                </Badge>
                                            )} */}
                                        </td>
                                        <td>
                                            <Badge
                                                color={riskBadgeColor(item.associated_risk)}
                                                pill
                                            >
                                                {item.associated_risk}
                                            </Badge>
                                        </td>
                                        <td>
                                            <small>{item.allowed_with_patient}</small>
                                        </td>
                                        <td>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(idx, e.target.value)}
                                                bsSize="sm"
                                                style={{ width: 55 }}
                                            />
                                        </td>
                                        <td>
                                            <Input
                                                type="text"
                                                value={item.remarks}
                                                onChange={(e) => updateRemarks(idx, e.target.value)}
                                                bsSize="sm"
                                                placeholder="..."
                                            />
                                        </td>
                                        <td className="text-center">
                                            {item.image ? (
                                                <div className="d-flex align-items-center gap-1">
                                                    <img
                                                        src={item.image}
                                                        alt={item.belongings}
                                                        style={{ width: 35, height: 35, objectFit: "cover", borderRadius: 4, cursor: "pointer" }}
                                                        onClick={() => {
                                                            setPreviewFile({
                                                                url: item.image,
                                                                type: "image/png",
                                                                originalName: item.belongings || "Attachment",
                                                            });
                                                            setPreviewOpen(true);
                                                        }}
                                                    />
                                                    <Button
                                                        color="link"
                                                        size="sm"
                                                        className="p-0 text-danger"
                                                        onClick={() => removeImage(idx)}
                                                    >
                                                        <i className="ri-close-circle-fill"></i>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <label className="btn btn-sm btn-outline-secondary mb-0" style={{ cursor: "pointer" }}>
                                                    <i className="ri-camera-line"></i>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        hidden
                                                        onChange={(e) => updateImage(idx, e.target.files[0])}
                                                    />
                                                </label>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                color="danger"
                                                size="sm"
                                                outline
                                                onClick={() => removeItem(idx)}
                                            >
                                                <i className="ri-delete-bin-line"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}

                {selectedItems.length === 0 && (
                    <div className="text-center text-muted py-4 border rounded mb-3">
                        <i className="ri-inbox-line fs-1 d-block mb-2"></i>
                        Search and add belongings above
                    </div>
                )}

                {/* Action buttons */}
                <div className="d-flex justify-content-end gap-2 border-top pt-3">
                    <Button color="secondary" outline onClick={toggle}>
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        className="text-white"
                        disabled={selectedItems.length === 0}
                        onClick={() => setShowPDF(true)}
                    >
                        <i className="ri-printer-line me-1"></i> Print
                    </Button>
                </div>
            </div>
        </CustomModal>
            <PreviewFile
                title={previewFile?.originalName || "Attachment Preview"}
                file={previewFile}
                isOpen={previewOpen}
                toggle={() => {
                    setPreviewOpen(false);
                    setPreviewFile(null);
                }}
            />
        </>
    );
};

BelongingsFormModal.propTypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    date: PropTypes.string,
    patient: PropTypes.object,
    center: PropTypes.object,
};

const mapStateToProps = (state) => ({
    patient: state.Patient.patient,
    center: state.Patient.patient?.center,
});

export default connect(mapStateToProps)(BelongingsFormModal);
