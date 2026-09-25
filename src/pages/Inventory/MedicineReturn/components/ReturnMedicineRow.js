import PropTypes from "prop-types";
import { Badge, Col, Input } from "reactstrap";
import ReturnSourceRow from "./ReturnSourceRow";

const ReturnMedicineRow = ({
    med,
    sources,
    sel,
    isChecked,
    canReturn,
    canAct,
    submitting,
    lineQty,
    onRowToggle,
    onSourceQtyChange,
    onRemarksChange,
}) => {
    const canToggle = canAct && canReturn;

    return (
        <Col xs={12} lg={6} className="mb-3">
            <div
                className="d-flex align-items-start gap-2 p-2 border rounded h-100"
                style={{ backgroundColor: "#f4f7fb" }}
            >
                {canAct && canReturn && (
                    <Input
                        type="checkbox"
                        className="mt-1"
                        style={isChecked ? undefined : { backgroundColor: "#fff", borderColor: "#6c757d" }}
                        checked={isChecked}
                        onChange={onRowToggle}
                    />
                )}
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div
                        className="fw-semibold"
                        style={canToggle ? { cursor: "pointer" } : undefined}
                        onClick={onRowToggle}
                    >
                        {med.medicine?.type} {med.medicine?.name} {med.medicine?.strength}
                    </div>
                    <div className="small text-muted">
                        Dispensed: {med.dispensedCount}
                        {isChecked && ` · Returning: ${lineQty}`}
                    </div>

                    {/* Keyed by index, not pharmacyStockRef — the same batch can appear
                        more than once (a line completed from the same batch across two
                        rounds), and keying by the batch id would collapse those rows. */}
                    {sources.map((src, i) => (
                        <ReturnSourceRow
                            key={i}
                            src={src}
                            value={sel?.perSource?.[i] ?? ""}
                            showInput={canAct && isChecked}
                            submitting={submitting}
                            isFirst={i === 0}
                            onChange={(value) => onSourceQtyChange(i, value)}
                        />
                    ))}

                    {canAct && isChecked && (
                        <Input
                            type="text"
                            bsSize="sm"
                            className="mt-2"
                            placeholder="Remarks (optional)"
                            value={sel?.remarks || ""}
                            disabled={submitting}
                            onChange={(e) => onRemarksChange(e.target.value)}
                        />
                    )}
                    {med.returned && (
                        <Badge color="secondary" className="mt-2">
                            Already returned
                        </Badge>
                    )}
                </div>
            </div>
        </Col>
    );
};

ReturnMedicineRow.propTypes = {
    med: PropTypes.object.isRequired,
    sources: PropTypes.array.isRequired,
    sel: PropTypes.object,
    isChecked: PropTypes.bool,
    canReturn: PropTypes.bool,
    canAct: PropTypes.bool,
    submitting: PropTypes.bool,
    lineQty: PropTypes.number,
    onRowToggle: PropTypes.func.isRequired,
    onSourceQtyChange: PropTypes.func.isRequired,
    onRemarksChange: PropTypes.func.isRequired,
};

export default ReturnMedicineRow;
