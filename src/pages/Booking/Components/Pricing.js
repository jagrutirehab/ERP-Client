import React, { useState } from "react";
import { connect, useDispatch } from "react-redux";
import { Button, Col, Form, Input, Label, Row } from "reactstrap";
import { toast } from "react-toastify";
import {
  addUserSessionPricing,
  updateUserSessionPricing,
} from "../../../store/actions";

const sessions = [15, 30, 40, 50, 60, 75, 90, 120];

const Pricing = ({
  pricing,
  setPricing,
  sessionPricing,
  userCenters,
  doctor,
  toggle,
}) => {
  const dispatch = useDispatch();

  // Validation functions
  const validatePrice = (value) => {
    const numValue = Number(value);
    // if (!value || value === "") {
    //   toast.error("Price is required!");
    //   return false;
    // }
    // if (isNaN(numValue)) {
    //   toast.error("Price must be a valid number!");
    //   return false;
    // }
    if (numValue < 0) {
      toast.error("Price cannot be negative!");
      return false;
    }
    if (numValue % 1 !== 0) {
      toast.error("Price must be a whole number!");
      return false;
    }
    return true;
  };

  const validateSession = (value) => {
    const numValue = Number(value);
    if (!value || value === "") {
      toast.error("Session duration is required!");
      return false;
    }
    if (isNaN(numValue)) {
      toast.error("Session duration must be a valid number!");
      return false;
    }
    if (numValue < 0) {
      toast.error("Session duration cannot be negative!");
      return false;
    }
    if (numValue % 1 !== 0) {
      toast.error("Session duration must be a whole number!");
      return false;
    }
    return true;
  };

  const validateCenter = (centerId) => {
    if (!centerId || centerId === "") {
      toast.error("Please select a center!");
      return false;
    }
    return true;
  };

  const isSessionDuplicate = (
    sessionValue,
    currentIndex,
    type,
    centerIndex = null,
    subIndex = null
  ) => {
    if (!sessionValue) return false;
    sessionValue = Number(sessionValue);

    if (type === "online") {
      return pricing?.online?.some(
        (item, index) =>
          Number(item.session) === sessionValue &&
          index !== currentIndex &&
          item.session !== ""
      );
    } else if (type === "offline") {
      return pricing?.offline[centerIndex]?.pricings?.some(
        (item, index) =>
          Number(item.session) === sessionValue &&
          index !== subIndex &&
          item.session !== ""
      );
    }
    return false;
  };

  const isCenterDuplicate = (centerId, currentIndex) => {
    if (!centerId) return false;
    return pricing?.offline?.some(
      (item, index) =>
        item.center === centerId && index !== currentIndex && item.center !== ""
    );
  };

  const handleChange = (type, index, key, value, subIndex = null) => {
    // Common validations
    if (key === "price") {
      // Allow empty string for price
      if (value === "") {
        value = "";
      } else {
        const isValid = validatePrice(value);
        if (!isValid) return;
        value = Number(value); // Convert to number only if not empty
      }
    }
    if (key === "session") {
      const isValid = validateSession(value);
      if (!isValid) return;
      value = Number(value); // Convert to number after validation
    }

    if (type === "online") {
      // Online session validations
      if (key === "session") {
        if (isSessionDuplicate(value, index, "online")) {
          toast.error(
            `${value} minutes session already exists in online pricing!`
          );
          return;
        }
      }
    } else if (type === "offline") {
      // Offline session validations
      if (key === "center") {
        if (!validateCenter(value)) return;
        if (isCenterDuplicate(value, index)) {
          toast.error("This center already has pricing configured!");
          return;
        }
      }

      if (key === "session") {
        if (isSessionDuplicate(value, index, "offline", index, subIndex)) {
          toast.error(
            `${value} minutes session already exists for this center!`
          );
          return;
        }
      }
    }

    // Update pricing state after all validations pass
    setPricing((prevPricing) => {
      const updatedPricing = { ...prevPricing };

      if (type === "online") {
        updatedPricing.online = updatedPricing.online.map((item, i) =>
          i === index ? { ...item, [key]: value } : item
        );
      } else if (type === "offline") {
        updatedPricing.offline = updatedPricing.offline.map((center, i) => {
          if (i === index) {
            if (key === "center") {
              return { ...center, [key]: value };
            }

            const updatedPricings = center.pricings.map((pricing, j) =>
              j === subIndex ? { ...pricing, [key]: value } : pricing
            );
            return { ...center, pricings: updatedPricings };
          }
          return center;
        });
      }

      return updatedPricing;
    });
  };

  const addOfflineCenter = () => {
    setPricing((prevPricing) => ({
      ...prevPricing,
      offline: [
        ...prevPricing.offline,
        {
          center: "",
          pricings: [
            { session: "", price: "" },
            { session: "", price: "" },
          ],
        },
      ],
    }));
  };

  const removeOfflineCenter = (index) => {
    setPricing((prevPricing) => ({
      ...prevPricing,
      offline: prevPricing.offline.filter((_, i) => i !== index),
    }));
  };

  const removeOnlineSession = (index) => {
    setPricing((prevPricing) => ({
      ...prevPricing,
      online: prevPricing.online.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    if (sessionPricing) {
      const res = dispatch(
        updateUserSessionPricing({
          userId: doctor?._id,
          sessionPricing: pricing,
        })
      );
      console.log(res, "res");

      // if (res) {
      //   toggle();
      // }
    } else {
      const res = dispatch(
        addUserSessionPricing({ sessionPricing: pricing, userId: doctor?._id })
      );
      console.log(res, "res");

      // if (res) {
      //   toggle();
      // }
    }
  };

  console.log(pricing, "pricing");

  return (
    <React.Fragment>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
        className="w-100 my-4"
      >
        <Row className="gap-4">
          <Col xs={12} md={6} className="rounded-xl py-4 px-3 shadow-lg">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="display-h5">Online Pricing</h5>
              <Button
                color="primary"
                size="sm"
                onClick={() => {
                  const newPricing = { ...pricing };
                  newPricing.online = [
                    ...(newPricing.online || []),
                    { session: "", price: "" },
                  ];
                  setPricing(newPricing);
                }}
              >
                Add Session
              </Button>
            </div>

            {pricing?.online?.map((prc, idx) => (
              <Row key={idx} className="mb-3">
                <Col xs={2} md={5} className="d-flex align-items-end">
                  <div className="mt-auto">
                    <Label size="sm">Session</Label>
                    <Input
                      bsSize="sm"
                      type="select"
                      required
                      value={prc.session}
                      onChange={(e) =>
                        handleChange("online", idx, "session", e.target.value)
                      }
                    >
                      <option value="" selected disabled hidden>
                        Choose here
                      </option>
                      {sessions.map((option) => (
                        <option
                          key={option}
                          value={option}
                          disabled={isSessionDuplicate(option, idx, "online")}
                        >
                          {option} min
                        </option>
                      ))}
                    </Input>
                  </div>
                </Col>
                <Col xs={2} md={5}>
                  <div className="mt-auto">
                    <Label size="sm">Session Price</Label>
                    <Input
                      bsSize="sm"
                      type="text"
                      required
                      value={prc.price}
                      onChange={(e) =>
                        handleChange("online", idx, "price", e.target.value)
                      }
                      onKeyPress={(e) => {
                        // Allow only numbers and backspace
                        if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                </Col>
                <Col xs={2} md={2} className="d-flex align-items-end">
                  <Button
                    size="sm"
                    onClick={() => removeOnlineSession(idx)}
                    color="danger"
                    outline
                    type="button"
                    className="mb-1"
                  >
                    <i className="ri-close-circle-line font-size-20"></i>
                  </Button>
                </Col>
              </Row>
            ))}
          </Col>
          <Col xs={12} md={12} className="shadow-lg py-4 px-3">
            <h5 className="display-h5">Offline Pricing</h5>

            {pricing?.offline?.map((prc, idx) => (
              <Row
                key={idx}
                className={`${
                  idx !== pricing.offline.length - 1
                    ? "border-bottom border-dark pb-4"
                    : ""
                }`}
              >
                <Col xs={3} md={4}>
                  <div className="">
                    <Label size="sm">Centers</Label>
                    <Input
                      bsSize="sm"
                      type="select"
                      required
                      value={prc.center}
                      onChange={(e) =>
                        handleChange("offline", idx, "center", e.target.value)
                      }
                    >
                      <option value="" selected disabled hidden>
                        Choose here
                      </option>
                      {(userCenters || []).map((option) => (
                        <option
                          key={option._id}
                          value={option._id}
                          disabled={isCenterDuplicate(option._id, idx)}
                        >
                          {option.title}
                        </option>
                      ))}
                    </Input>
                  </div>
                </Col>

                <Col xs={2} md={6} className="">
                  {(prc?.pricings || []).map((pricing, i) => (
                    <div className="d-flex gap-4" key={i}>
                      <div className="mt-auto">
                        <Label size="sm">Session</Label>
                        <Input
                          bsSize="sm"
                          type="select"
                          required
                          value={pricing.session}
                          onChange={(e) =>
                            handleChange(
                              "offline",
                              idx,
                              "session",
                              e.target.value,
                              i
                            )
                          }
                        >
                          <option value="" selected disabled hidden>
                            Choose here
                          </option>
                          {sessions.map((option) => (
                            <option
                              key={option}
                              value={option}
                              disabled={isSessionDuplicate(
                                option,
                                idx,
                                "offline",
                                idx,
                                i
                              )}
                            >
                              {option} min
                            </option>
                          ))}
                        </Input>
                      </div>

                      <div className="mt-auto">
                        <Label size="sm">Session Price</Label>
                        <Input
                          bsSize="sm"
                          type="text"
                          required
                          value={pricing.price}
                          onChange={(e) =>
                            handleChange(
                              "offline",
                              idx,
                              "price",
                              e.target.value,
                              i
                            )
                          }
                          onKeyPress={(e) => {
                            // Allow only numbers and backspace
                            if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                              e.preventDefault();
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </Col>
                <Col xs={2} className="d-flex flex-col">
                  <Button
                    size="sm"
                    onClick={() => removeOfflineCenter(idx)}
                    color="danger"
                    outline
                    type="button"
                    className="mt-auto"
                  >
                    <i className="ri-close-circle-line font-size-20 mt-auto"></i>
                  </Button>
                </Col>
              </Row>
            ))}

            <button
              onClick={() => addOfflineCenter()}
              type="button"
              className="btn d-block btn-primary btn-sm"
            >
              Add
            </button>
          </Col>
        </Row>

        <div className="d-flex justify-content-end my-4">
          <button type="submit" className="btn btn-secondary btn-sm">
            Save
          </button>
        </div>
      </Form>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  userCenters: state.User.userCenters,
  centers: state.Center.data,
});

export default connect(mapStateToProps)(Pricing);
