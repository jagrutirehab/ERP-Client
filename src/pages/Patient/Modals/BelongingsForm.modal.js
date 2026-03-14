import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Select from "react-select";
import CustomModal from "../../../Components/Common/Modal";
import { searchBelongings, uploadFile, createPatientBelonging, updatePatientBelonging, getPatientBelongingById } from "../../../helpers/backend_helper";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { capitalizeWords } from "../../../utils/toCapitalize";
import PreviewFile from "../../../Components/Common/PreviewFile";
import BelongingsPDF from "../../../Components/Print/Belongings";
import { useAuthError } from "../../../Components/Hooks/useAuthError";

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

const BelongingsFormModal = ({ isOpen, toggle, date, patient, center, addmissionId, editBelongingId, printMode, onSaved }) => {
    const handleAuthError = useAuthError();
    const [search, setSearch] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [showPDF, setShowPDF] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [savedBelongingId, setSavedBelongingId] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    const [customName, setCustomName] = useState("");
    const [customCategory, setCustomCategory] = useState("Other");
    const [customRisk, setCustomRisk] = useState("TBD");
    const [customAllowed, setCustomAllowed] = useState("To be assessed");
    const [showOtherForm, setShowOtherForm] = useState(false);

    const [handedOverTo, setHandedOverTo] = useState("");

    const [fetchingDetail, setFetchingDetail] = useState(false);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);

    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(false);
    const pdfBlobUrlRef = useRef(null);

    const isMobile = useMediaQuery("(max-width: 640px)");

    const [belongingsSuggestions, setBelongingsSuggestions] = useState([]);
    const [belongingsLoading, setBelongingsLoading] = useState(false);

    const debouncedSearch = useMemo(
        () =>
            debounce(async (query) => {
                if (!query.trim()) {
                    setBelongingsSuggestions([]);
                    setBelongingsLoading(false);
                    return;
                }
                try {
                    const res = await searchBelongings(query.trim());
                    const items = (res?.data || []).map((item) => ({
                        ...item,
                        allowedWithPatient: item.allowedWithPatient ? "Yes" : "No",
                        associatedRisk: capitalizeWords(item.associatedRisk || ""),
                        category: capitalizeWords(item.category || ""),
                    }));
                    setBelongingsSuggestions(items);
                } catch (err) {
                    if (!handleAuthError(err)) {
                        setBelongingsSuggestions([]);
                        toast.error("Failed to fetch belongings");
                    }
                } finally {
                    setBelongingsLoading(false);
                }
            }, 400),
        []
    );

    useEffect(() => {
        if (!search.trim()) {
            setBelongingsSuggestions([]);
            setBelongingsLoading(false);
            return;
        }
        setBelongingsLoading(true);
        debouncedSearch(search);
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch]);

    useEffect(() => {
        if (isOpen) {
            if (editBelongingId) {
                const fetchDetails = async () => {
                    setFetchingDetail(true);
                    try {
                        const res = await getPatientBelongingById(editBelongingId);
                        if (res?.data) {
                            const { items, _id } = res.data;
                            const mappedItems = items.map((itm) => ({
                                _id: itm.belongingItem?._id || null,
                                name: itm.belongingItem?.name || itm.otherItemName || "Custom Item",
                                category: itm.belongingItem?.category || "Other",
                                associatedRisk: itm.belongingItem?.associatedRisk || "TBD",
                                allowedWithPatient: itm.belongingItem?.allowedWithPatient !== undefined
                                    ? (itm.belongingItem?.allowedWithPatient ? "Yes" : "No")
                                    : "To be assessed",
                                quantity: itm.quantity || 1,
                                remarks: itm.remarks || "",
                                image: typeof itm.attachments?.[0] === "string"
                                    ? itm.attachments[0]
                                    : itm.attachments?.[0]?.url || null,
                                imageName: typeof itm.attachments?.[0] === "string"
                                    ? "attachment"
                                    : itm.attachments?.[0]?.name || null,
                                originalAttachments: itm.attachments || [],
                                isCustom: !itm.belongingItem?._id,
                                handedOverTo: itm.handedOverTo || "",
                            }));
                            setSelectedItems(mappedItems);
                            setSavedBelongingId(_id);
                            setHandedOverTo(res.data.handedOverTo || "");
                            setIsDirty(true);
                            if (printMode) {
                                setShowPDF(true);
                            } else {
                                setShowPDF(false);
                            }
                        }
                    } catch (error) {
                        if (!handleAuthError(error)) {
                            toast.error(error?.message || "Failed to fetch belonging details");
                        }
                    } finally {
                        setFetchingDetail(false);
                    }
                };
                fetchDetails();
            } else {
                setSelectedItems([]);
                setSavedBelongingId(null);
                setHandedOverTo("");
                setIsDirty(false);
                setShowPDF(false);
            }
        }
    }, [isOpen, editBelongingId, printMode]);

    const filteredItems = belongingsSuggestions.filter(
        (item) =>
            !selectedItems.find(
                (s) => s.name === item.name && s.category === item.category
            )
    );

    const addItem = useCallback(
        (item) => {
            if (
                selectedItems.find(
                    (s) =>
                        s.name === item.name && s.category === item.category
                )
            ) {
                toast.warning(`"${item.name}" is already added`);
                setSearch("");
                setShowSuggestions(false);
                return;
            }
            // Check if this is the "Other" item (empty name)
            if (item.category === "Other" && !item.name) {
                setShowOtherForm(true);
                setSearch("");
                setShowSuggestions(false);
                return;
            }
            setSelectedItems((prev) => [
                ...prev,
                { ...item, quantity: 1, remarks: "", image: null, handedOverTo: "" },
            ]);
            setIsDirty(true);
            setSearch("");
            setShowSuggestions(false);
        },
        [selectedItems]
    );

    const addCustomItem = () => {
        if (!customName.trim()) return;
        if (selectedItems.find((s) => s.name.toLowerCase() === customName.trim().toLowerCase())) {
            toast.warning(`"${customName.trim()}" is already added`);
            return;
        }
        setSelectedItems((prev) => [
            ...prev,
            {
                name: customName.trim(),
                category: customCategory,
                associatedRisk: customRisk,
                allowedWithPatient: customAllowed,
                quantity: 1,
                remarks: "",
                isCustom: true,
                image: null,
                handedOverTo: "",
            },
        ]);
        setIsDirty(true);
        setCustomName("");
        setCustomCategory("Other");
        setCustomRisk("TBD");
        setCustomAllowed("To be assessed");
        setShowOtherForm(false);
    };

    const removeItem = (idx) => {
        setSelectedItems((prev) => prev.filter((_, i) => i !== idx));
        setIsDirty(true);
    };

    const updateQuantity = (idx, val) => {
        setSelectedItems((prev) =>
            prev.map((item, i) =>
                i === idx ? { ...item, quantity: Math.max(1, Number(val) || 1) } : item
            )
        );
        setIsDirty(true);
    };

    const updateRemarks = (idx, val) => {
        setSelectedItems((prev) =>
            prev.map((item, i) => (i === idx ? { ...item, remarks: val } : item))
        );
        setIsDirty(true);
    };

    const updateHandedOverTo = (idx, val) => {
        setSelectedItems((prev) =>
            prev.map((item, i) => (i === idx ? { ...item, handedOverTo: val } : item))
        );
        setIsDirty(true);
    };

    const updateImage = async (idx, file) => {
        if (!file) return;
        try {
            setSelectedItems((prev) =>
                prev.map((item, i) =>
                    i === idx ? { ...item, uploading: true } : item
                )
            );
            const fd = new FormData();
            fd.append("file", file);
            fd.append("uploadPath", "BELONGING");
            const res = await uploadFile(fd);
            setSelectedItems((prev) =>
                prev.map((item, i) =>
                    i === idx ? { ...item, image: res.url, imageName: res.fileName || file.name, uploading: false } : item
                )
            );
            setIsDirty(true);
        } catch (err) {
            if (!handleAuthError(err)) {
                toast.error("Failed to upload attachment");
            }
            setSelectedItems((prev) =>
                prev.map((item, i) =>
                    i === idx ? { ...item, uploading: false } : item
                )
            );
        }
    };

    const removeImage = (idx) => {
        setSelectedItems((prev) =>
            prev.map((item, i) => (i === idx ? { ...item, image: null, imageName: null } : item))
        );
        setIsDirty(true);
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

    const handleSubmit = async () => {
        if (selectedItems.length === 0) return;
        setSubmitting(true);
        try {
            const items = selectedItems.map((item) => ({
                ...(item.isCustom || !item._id
                    ? { otherItemName: item.name }
                    : { belongingItem: item._id }),
                quantity: item.quantity || 1,
                attachments: item.image
                    ? (item.originalAttachments?.length > 0 &&
                        (item.originalAttachments[0]?.url === item.image || item.originalAttachments[0] === item.image)
                        ? item.originalAttachments
                        : [{ url: item.image, name: item.imageName || "attachment" }])
                    : [],
                remarks: item.remarks || "",
                handedOverTo: item.handedOverTo || "",
            }));

            const payload = {
                patient: patient?._id,
                addmission: addmissionId || patient?.addmission?._id,
                center: center?._id || center,
                date: date,
                items,
            };

            if (savedBelongingId) {
                await updatePatientBelonging(savedBelongingId, payload);
                toast.success("Belongings updated successfully");
            } else {
                const res = await createPatientBelonging(payload);
                setSavedBelongingId(res?.data?._id || res?._id);
                toast.success("Belongings saved successfully");
            }

            setIsDirty(false);
            onSaved?.();
            setShowPDF(true);
        } catch (err) {
            if (!handleAuthError(err)) {
                toast.error(err?.message || "Failed to save belongings");
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Generate PDF blob manually with retry for reliable preview
    useEffect(() => {
        if (!showPDF || isMobile) return;
        let cancelled = false;
        const generatePdf = async (attempt = 1) => {
            setPdfLoading(true);
            setPdfError(false);
            try {
                const blob = await pdf(
                    <BelongingsPDF items={selectedItems} patient={patient} date={date} center={center} handedOverTo={handedOverTo} />
                ).toBlob();
                if (cancelled) return;
                // Revoke previous URL
                if (pdfBlobUrlRef.current) URL.revokeObjectURL(pdfBlobUrlRef.current);
                const url = URL.createObjectURL(blob);
                pdfBlobUrlRef.current = url;
                setPdfBlobUrl(url);
                setPdfLoading(false);
            } catch (err) {
                if (cancelled) return;
                if (attempt < 3) {
                    setTimeout(() => generatePdf(attempt + 1), 500);
                } else {
                    setPdfLoading(false);
                    setPdfError(true);
                }
            }
        };
        generatePdf();
        return () => {
            cancelled = true;
        };
    }, [showPDF, isMobile, selectedItems, patient, date, center]);

    // Cleanup blob URL on unmount
    useEffect(() => {
        return () => {
            if (pdfBlobUrlRef.current) URL.revokeObjectURL(pdfBlobUrlRef.current);
        };
    }, []);

    if (showPDF) {
        const headerTitle = (
            <>
                <span className="me-3">Belongings PDF Preview</span>
                <PDFDownloadLink
                    document={
                        <BelongingsPDF
                            items={selectedItems}
                            patient={patient}
                            date={date}
                            center={center}
                            handedOverTo={handedOverTo}
                        />
                    }
                    fileName={`Belongings_${patient?.name || "patient"}.pdf`}
                    className="btn btn-primary btn-sm text-white"
                    style={{ position: "absolute", right: "50px", top: "20px", zIndex: 10 }}
                >
                    {({ loading }) =>
                        loading ? <Spinner size="sm" /> : "Download"
                    }
                </PDFDownloadLink>
            </>
        );

        return (
            <CustomModal
                isOpen={isOpen}
                toggle={() => {
                    setShowPDF(false);
                    toggle();
                }}
                title={headerTitle}
                size="xl"
            >
                <div className="mb-2">
                    {!printMode && (
                        <Button
                            color="secondary"
                            size="sm"
                            outline
                            onClick={() => setShowPDF(false)}
                        >
                            <i className="ri-arrow-left-line me-1"></i> Back to Form
                        </Button>
                    )}
                </div>
                {!isMobile ? (
                    <div style={{ position: "relative", minHeight: 550 }}>
                        {pdfLoading ? (
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
                        ) : pdfError || !pdfBlobUrl ? (
                            <div className="d-flex flex-column justify-content-center align-items-center py-5">
                                <i className="ri-file-damage-line fs-1 text-warning mb-2"></i>
                                <p className="text-muted mb-2">PDF preview could not be loaded.</p>
                                <p className="text-muted small mb-3">Please use the Download button above.</p>
                            </div>
                        ) : (
                            <iframe
                                src={pdfBlobUrl}
                                title="Belongings PDF"
                                width="100%"
                                height={550}
                                style={{ border: "none" }}
                            />
                        )}
                    </div>
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
                                loading ? <Spinner size="sm" /> : "Download"
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
                    {fetchingDetail ? (
                        <div className="text-center py-5">
                            <Spinner color="primary" />
                            <p className="mt-2 text-muted">Loading belongings form...</p>
                        </div>
                    ) : (
                        <>
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
                                    <span className="text-primary">{date
                                        ? format(new Date(date), "dd MMM yyyy, hh:mm a")
                                        : ""}</span>
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
                                {showSuggestions && search.trim() && (belongingsLoading || visibleItems.length > 0) && (
                                    <ListGroup
                                        className="position-absolute w-100 shadow"
                                        style={{ zIndex: 1050, maxHeight: 220, overflowY: "auto" }}
                                    >
                                        {belongingsLoading ? (
                                            <ListGroupItem className="text-center py-2">
                                                <Spinner size="sm" color="primary" /> <small className="text-muted ms-1">Searching...</small>
                                            </ListGroupItem>
                                        ) : visibleItems.length > 0 ? (
                                            visibleItems.map((item, idx) => (
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
                                                        <strong>{item.name || "(Other - Custom)"}</strong>{" "}
                                                        <small className="text-muted">({item.category})</small>
                                                    </span>
                                                    <Badge color={riskBadgeColor(item.associatedRisk)} pill>
                                                        {item.associatedRisk}
                                                    </Badge>
                                                </ListGroupItem>
                                            ))
                                        ) : null}
                                    </ListGroup>
                                )}
                            </div>

                            {/* Custom "Other" item form */}
                            {showOtherForm && (
                                <div className="border rounded p-3 mb-3 bg-light">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0">
                                            <i className="ri-add-circle-line me-1"></i> Add Custom Item
                                        </h6>
                                        <Button
                                            color="danger"
                                            className="text-white d-flex justify-content-center align-items-center p-0"
                                            style={{ width: "24px", height: "24px" }}
                                            onClick={() => setShowOtherForm(false)}
                                        >
                                            <i className="ri-close-line fs-5"></i>
                                        </Button>
                                    </div>
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
                                                    disabled
                                                    value={customCategory}
                                                    onChange={(e) => setCustomCategory(e.target.value)}
                                                    placeholder="Other"
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
                                                <th style={{ width: 250 }}>HandOver Status</th>
                                                <th style={{ width: 90 }}>Attachment</th>
                                                <th style={{ width: 40 }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedItems.map((item, idx) => (
                                                <tr key={idx} style={item.associatedRisk?.toLowerCase() === "high" ? { backgroundColor: "#fff0f0" } : {}}>
                                                    <td>{idx + 1}</td>
                                                    <td>
                                                        <small>{capitalizeWords(item.category)}</small>
                                                    </td>
                                                    <td>
                                                        {capitalizeWords(item.name)}
                                                    </td>
                                                    <td>
                                                        <Badge
                                                            color={riskBadgeColor(item.associatedRisk)}
                                                            pill
                                                        >
                                                            {capitalizeWords(item.associatedRisk)}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <small>{capitalizeWords(item.allowedWithPatient)}</small>
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
                                                            style={{ textTransform: "capitalize" }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Select
                                                            value={item.handedOverTo ? { value: item.handedOverTo, label: "Handed Over To Patient's Relative / Guardian / NOK" } : null}
                                                            onChange={(opt) => updateHandedOverTo(idx, opt ? opt.value : "")}
                                                            options={[
                                                                { value: "Patient's Relative/Guardian/NOK", label: "Handed Over To Patient's Relative / Guardian / NOK" },
                                                            ]}
                                                            isClearable
                                                            placeholder="-- Select --"
                                                            menuPortalTarget={document.body}
                                                            styles={{
                                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                                control: (base) => ({ ...base, minHeight: 31, fontSize: 13 }),
                                                                singleValue: (base) => ({ ...base, fontSize: 13, whiteSpace: "normal", overflow: "visible", textOverflow: "unset" }),
                                                                option: (base) => ({ ...base, fontSize: 13 }),
                                                                valueContainer: (base) => ({ ...base, flexWrap: "wrap" }),
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        {item.uploading ? (
                                                            <Spinner size="sm" color="primary" />
                                                        ) : item.image ? (
                                                            <div className="d-flex align-items-center gap-1">
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    style={{ width: 35, height: 35, objectFit: "cover", borderRadius: 4, cursor: "pointer" }}
                                                                    onClick={() => {
                                                                        setPreviewFile({
                                                                            url: item.image,
                                                                            type: "image/png",
                                                                            originalName: item.name || "Attachment",
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
                                                                    accept="image/jpeg, image/png, image/jpg"
                                                                    hidden
                                                                    onChange={(e) => {
                                                                        const file = e.target.files[0];
                                                                        if (file && file.type === "image/webp") {
                                                                            toast.error("WebP images are not supported");
                                                                            e.target.value = "";
                                                                            return;
                                                                        }
                                                                        updateImage(idx, file);
                                                                    }}
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

                            <div className="d-flex justify-content-end gap-2 border-top pt-3">
                                <Button color="secondary" outline onClick={toggle}>
                                    Cancel
                                </Button>
                                <Button
                                    color="success"
                                    className="text-white"
                                    disabled={selectedItems.length === 0 || submitting || (savedBelongingId && !isDirty)}
                                    onClick={handleSubmit}
                                >
                                    {submitting ? (
                                        <><Spinner size="sm" className="me-1" /> Saving...</>
                                    ) : savedBelongingId ? (
                                        <><i className="ri-edit-line me-1"></i> Update & Print</>
                                    ) : (
                                        <><i className="ri-save-line me-1"></i> Save & Print</>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
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
    editBelongingId: PropTypes.string,
    printMode: PropTypes.bool,
    onSaved: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => ({
    patient: state.Patient.patient,
    center: ownProps.center || state.Patient.patient?.center,
});

export default connect(mapStateToProps)(BelongingsFormModal);
