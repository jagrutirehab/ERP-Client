import PropTypes from "prop-types";
import { Badge, Button, Input } from "reactstrap";

// One alternative/extra stock source added on top of a line's primary batch —
// its own qty input, capped to whatever the line still has left once the
// primary and every other alt source's qty is accounted for.
const AltSourceRow = ({ alt, maxQty, onChangeQty, onRemove }) => {
    const exceedsStock = Number(alt.dispensedCount) > Number(alt.stock);

    return (
        <div
            className="d-flex align-items-start gap-2 p-2 mb-2 rounded"
            style={{ backgroundColor: "#fff9ec", border: "1px solid #f0dca0" }}
        >
            <Badge color="warning" className="text-dark mt-1 flex-shrink-0">
                Alt
            </Badge>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div className="small fw-semibold">{alt.medicineName}</div>
                <div className="small text-muted">
                    {alt.phrId && <>{alt.phrId} · </>}
                    Batch: {alt.batch || "-"}
                    {alt.company && <> · {alt.company}</>}
                    {" · Stock: "}{alt.stock}
                </div>
                <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                    <label className="small text-muted mb-0">Qty:</label>
                    <Input
                        type="number"
                        bsSize="sm"
                        min={1}
                        step={1}
                        style={{ width: "80px" }}
                        value={alt.dispensedCount ?? ""}
                        invalid={exceedsStock}
                        onKeyDown={(e) => {
                            if ([".", ",", "e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                        }}
                        onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {
                                onChangeQty("");
                            } else if (Number.isInteger(Number(raw))) {
                                const val = Number(raw);
                                onChangeQty(Number.isFinite(maxQty) ? Math.min(val, maxQty) : val);
                            }
                        }}
                    />
                    {exceedsStock && <span className="small text-danger">Exceeds stock ({alt.stock})</span>}
                    <Button color="link" size="sm" className="p-0 text-danger ms-auto" onClick={onRemove}>
                        remove
                    </Button>
                </div>
            </div>
        </div>
    );
};

AltSourceRow.propTypes = {
    alt: PropTypes.shape({
        key: PropTypes.string,
        medicineName: PropTypes.string,
        phrId: PropTypes.string,
        batch: PropTypes.string,
        company: PropTypes.string,
        stock: PropTypes.number,
        dispensedCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }).isRequired,
    maxQty: PropTypes.number,
    onChangeQty: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
};

export default AltSourceRow;
