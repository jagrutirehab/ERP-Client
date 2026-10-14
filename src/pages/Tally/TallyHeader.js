import React from "react";
import { Row, Col, Button, Spinner, Input, Label, FormGroup } from "reactstrap";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import PropTypes from "prop-types";
import CenterDropdown from "../Report/Components/Doctor/components/CenterDropDown";

const VOUCHER_TYPES = [
  { id: "INVOICE", label: "IPD/OPD Invoice", enabled: true },
  { id: "ADVANCE_PAYMENT", label: "Advance Payment/Deposit", enabled: true },
  { id: "CENTRAL_PAYMENT", label: "Central Payment", enabled: true },
  { id: "CASH", label: "Cash", enabled: true },
];

const TallyHeader = ({
  selectedDate,
  setSelectedDate,
  centerOptions,
  selectedCentersIds,
  setSelectedCentersIds,
  selectedTypes,
  onTypeToggle,
  sending,
  onSync,
  onCancel,
}) => {
  const isDisabled =
    sending || selectedCentersIds.length === 0 || selectedTypes.length === 0;

  return (
    <Row className="mb-4 align-items-end">
      {/* Date Picker */}
      <Col md={3}>
        <Label className="form-label fw-semibold">Select Date</Label>
        <div
          className="border border-dark d-flex align-items-center bg-light"
          style={{ borderRadius: "4px" }}
        >
          <Flatpickr
            value={selectedDate}
            onChange={(dates) => {
              if (dates[0]) {
                setSelectedDate(dates[0]);
              }
            }}
            options={{
              dateFormat: "d M, Y",
              disableMobile: true,
            }}
            className="form-control shadow-none bg-light border-0"
            disabled={sending}
          />
        </div>
      </Col>

      {/* Center Dropdown */}
      <Col md={3}>
        <Label className="form-label fw-semibold">Select Centers</Label>
        <CenterDropdown
          options={centerOptions}
          value={selectedCentersIds}
          onChange={setSelectedCentersIds}
        />
      </Col>

      {/* Voucher Types */}
      <Col md={3}>
        <Label className="form-label fw-semibold">Voucher Types</Label>
        <div className="d-flex flex-wrap gap-3">
          {VOUCHER_TYPES.map((type) => (
            <FormGroup check key={type.id} className="mb-0">
              <Input
                type="checkbox"
                id={`type-${type.id}`}
                className="border-secondary"
                checked={selectedTypes.includes(type.id)}
                onChange={() => onTypeToggle(type.id)}
                disabled={sending || !type.enabled}
              />
              <Label
                check
                htmlFor={`type-${type.id}`}
                className={!type.enabled ? "text-muted" : ""}
              >
                {type.label}
                {!type.enabled && (
                  <small className="text-muted ms-1">(soon)</small>
                )}
              </Label>
            </FormGroup>
          ))}
        </div>
      </Col>

      {/* Action Buttons */}
      <Col md={3} className="d-flex flex-column gap-2">
        {/* Cancel — only visible while a sync is running */}
        {sending && (
          <Button
            color="danger"
            size="md"
            onClick={onCancel}
            className="w-100"
            title="Abort the current sync. Already-processed entries are unaffected."
          >
            <i className="bx bx-stop-circle me-2"></i>
            Cancel
          </Button>
        )}

        {/* Sync to Tally — upsert (insert or delete → re-insert) */}
        <Button
          color="primary"
          size="md"
          onClick={onSync}
          disabled={isDisabled}
          className="w-100"
          title="Sync entries to Tally (creates new or updates existing)"
        >
          {sending ? (
            <>
              <Spinner size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            <>
              <i className="bx bx-sync me-2"></i>
              Sync to Tally
            </>
          )}
        </Button>
      </Col>
    </Row>
  );
};

TallyHeader.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  setSelectedDate: PropTypes.func,
  centerOptions: PropTypes.array,
  selectedCentersIds: PropTypes.array,
  setSelectedCentersIds: PropTypes.func,
  selectedTypes: PropTypes.array,
  onTypeToggle: PropTypes.func,
  sending: PropTypes.bool,
  onSync: PropTypes.func,
  onCancel: PropTypes.func,
};

export default TallyHeader;
