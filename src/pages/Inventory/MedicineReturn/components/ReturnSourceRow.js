import PropTypes from "prop-types";
import { Badge, Input } from "reactstrap";

const ReturnSourceRow = ({ src, value, showInput, submitting, isFirst, onChange }) => {
    const invalid =
        showInput &&
        value !== "" &&
        (!Number.isInteger(Number(value)) || Number(value) > (Number(src.dispensedCount) || 0));

    return (
        <div
            className="d-flex align-items-start gap-2 py-1 mt-1"
            style={isFirst ? undefined : { borderTop: "1px solid #e3e8ee" }}
        >
            {src.isSubstitute && (
                <Badge color="warning" className="text-dark flex-shrink-0 mt-1">
                    Alt
                </Badge>
            )}
            <div style={{ minWidth: 0 }} className="flex-grow-1">
                <div className="fw-semibold" style={{ fontSize: "0.8rem" }}>
                    {src.dispensedCount} × {src.medicineName || src.batch?.medicineName || "Medicine"}
                </div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                    {src.batch?.medicineName && <>{src.batch.medicineName} · </>}
                    {src.batch?.id && <>{src.batch.id} · </>}
                    Batch: {src.batch?.Batch || "-"}
                    {src.batch?.company && <> · {src.batch.company}</>}
                </div>
                {showInput && (
                    <div className="d-flex align-items-center gap-2 mt-1">
                        <label className="small text-muted mb-0">Return qty:</label>
                        <Input
                            type="number"
                            bsSize="sm"
                            min={0}
                            step={1}
                            max={src.dispensedCount}
                            style={{ width: "80px" }}
                            value={value}
                            invalid={invalid}
                            disabled={submitting}
                            onKeyDown={(e) => {
                                if ([".", ",", "e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                            }}
                            onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === "") {
                                    onChange("");
                                } else if (Number.isInteger(Number(raw))) {
                                    const val = Number(raw);
                                    const cap = Number(src.dispensedCount) || 0;
                                    onChange(Math.min(val, cap));
                                }
                            }}
                        />
                        {invalid && <span className="small text-danger">Max {src.dispensedCount}</span>}
                    </div>
                )}
            </div>
        </div>
    );
};

ReturnSourceRow.propTypes = {
    src: PropTypes.shape({
        pharmacyStockRef: PropTypes.string,
        medicineName: PropTypes.string,
        isSubstitute: PropTypes.bool,
        dispensedCount: PropTypes.number,
        batch: PropTypes.object,
    }).isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    showInput: PropTypes.bool,
    submitting: PropTypes.bool,
    isFirst: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
};

export default ReturnSourceRow;
