import React from "react";
import PropTypes from "prop-types";
import { Col, Input, Row } from "reactstrap";
import {
  medicineTypes,
  medicineUnits,
} from "../../../Components/constants/medicine";
import { connect } from "react-redux";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Menu } from "lucide-react";


const SortableMedicine = ({ index, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="d-flex align-items-center gap-2">
      <span {...listeners} {...attributes} style={{ cursor: "grab", marginRight: 6, fontSize: window.innerWidth < 768 ? 14 : 20, touchAction: "none" }}>
        <Menu />
      </span>
      {children}
    </div>
  );
};


const Medicine = ({ medicines, setMedicines, isNew }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  const handleChange = (e) => {
    const prop = e.target.name;
    const value = e.target.value;
    const index = e.target.id;
    const drugsTable = [...medicines];

    if (prop === "morning" || prop === "evening" || prop === "night") {
      drugsTable[index].dosageAndFrequency = {
        ...drugsTable[index].dosageAndFrequency,
        [prop]: value,
      };
    } else {
      drugsTable[index][prop] = value;
    }
    setMedicines(drugsTable);
  };

  const removeDrug = (idx) => {
    const list = [...medicines];
    list.splice(idx, 1);
    setMedicines(list);
  };

  const bulkEditMedDuration = (duration) => {
    const meds = [...medicines]?.map((med) => ({ ...med, duration }));
    setMedicines(meds);
  };

  const handleMedicineSub = (name, idx, value) => {
    const drugsTable = [...medicines];
    drugsTable[idx].medicine[name] = value;
    setMedicines(drugsTable);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setMedicines((items) => arrayMove(items, active.id, over.id));
    }
  };


  return (
    <React.Fragment>
      <div className="medicine-table overflow-auto bg-light p-3 mb-3">
        <Row className="row-gap-2">
          <Col xs={1} className="border-bottom"></Col>
          <Col xs={2} className="border-bottom">
            <h6 className="display-6 fs-14">Drug</h6>
          </Col>
          <Col xs={3} className="border-bottom">
            <h6 className="display-6 fs-14">Dosage & Frequency</h6>
          </Col>
          <Col xs={3} className="border-bottom">
            <h6 className="display-6 fs-14">Intake</h6>
          </Col>
          <Col xs={3} className="border-bottom">
            <h6 className="display-6 fs-14">Duration</h6>
          </Col>
          <Col xs={1} className="border-bottom"></Col>


          {/* List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={medicines.map((_, idx) => idx)}
              strategy={verticalListSortingStrategy}
            >
              {(medicines || []).map((medicine, idx) => (
                <SortableMedicine key={idx} index={idx}>
                  <Col xs={2} className="">
                    <span className="font-semi-bold text-uppercase d-flex">
                      <span
                        className={`me-2 ${medicine.medicine.isNew || medicine.medicine.type
                          ? "w-50"
                          : ""
                          }`}
                      >
                        {medicine.medicine.isNew ? (
                          <div class="form-group">
                            <input
                              list="type-options"
                              className="form-control form-control-sm"
                              id={idx}
                              onChange={(e) =>
                                handleMedicineSub("type", idx, e.target.value)
                              }
                              required
                              name="type"
                              value={medicine.medicine?.type}
                              placeholder="Type or select an option"
                            />
                            <datalist id="type-options">
                              {(medicineTypes || []).map((item, idx) => (
                                <option
                                  key={idx + item}
                                  value={item}
                                  className="text-cap"
                                ></option>
                              ))}
                            </datalist>
                          </div>
                        ) : (
                          // <Input
                          //   bsSize="xs"
                          //   id={idx}
                          //   onChange={(e) =>
                          //     handleMedicineSub("type", idx, e.target.value)
                          //   }
                          //   name="type"
                          //   required
                          //   value={medicine.medicine.type}
                          //   type="select"
                          //   className="form-control p-0 ps-1 w-5"
                          // >
                          //   <option value="" selected disabled hidden>
                          //     Choose Type
                          //   </option>
                          //   {(medicineTypes || []).map((item, idx) => (
                          //     <option
                          //       key={idx + item}
                          //       value={item}
                          //       className="text-cap"
                          //     >
                          //       {item}
                          //     </option>
                          //   ))}
                          // </Input>
                          medicine.medicine.type
                        )}
                      </span>
                      {medicine.medicine?.name}
                      <span
                        className={`ms-2 ${medicine.medicine.isNew || medicine.medicine.unit
                          ? "w-50"
                          : ""
                          }`}
                      >
                        {medicine.medicine.isNew ? (
                          <div class="form-group">
                            <input
                              list="unit-options"
                              className="form-control form-control-sm"
                              id={idx}
                              onChange={(e) => {
                                handleMedicineSub("unit", idx, e.target.value);
                                if (e.target.value === "") {
                                  // Blur and refocus to re-trigger datalist suggestions
                                  e.target.blur();
                                  setTimeout(() => e.target.focus(), 0);
                                }
                              }}
                              required
                              name="unit"
                              value={medicine.medicine?.unit}
                              placeholder="Type or select an option"
                            />
                            <datalist id="unit-options">
                              {(medicineUnits || []).map((item, idx) => (
                                <option
                                  key={idx + item}
                                  value={item}
                                  className="text-cap"
                                ></option>
                              ))}
                            </datalist>
                          </div>
                        ) : (
                          // <Input
                          //   bsSize="xs"
                          //   id={idx}
                          //   onChange={(e) =>
                          //     handleMedicineSub("unit", idx, e.target.value)
                          //   }
                          //   name="unit"
                          //   value={medicine.medicine?.unit}
                          //   type="select"
                          //   required
                          //   className="form-control p-0 ps-1"
                          // >
                          //   <option value="" selected disabled hidden>
                          //     Choose Unit
                          //   </option>
                          //   {(medicineUnits || []).map((item, idx) => (
                          //     <option key={idx + item}>{item}</option>
                          //   ))}
                          // </Input>
                          medicine.medicine.unit
                        )}{" "}
                        {/* medicine.medicine?.strength &&  */}
                        {medicine.medicine.isNew ? (
                          <Input
                            bsSize="xs"
                            id={idx}
                            onChange={(e) =>
                              handleMedicineSub("strength", idx, e.target.value)
                            }
                            name="strength"
                            required
                            value={medicine.medicine?.strength}
                            type="text"
                            className="form-control p-0 ps-1"
                          />
                        ) : (
                          medicine.medicine.strength
                        )}
                      </span>
                    </span>
                  </Col>
                  <Col xs={3} className="">
                    <div className="d-flex flex-nowrap align-items-center">
                      <Input
                        bsSize={"sm"}
                        id={idx}
                        name="morning"
                        onChange={handleChange}
                        value={medicine.dosageAndFrequency.morning}
                      />
                      <span className="mx-2">-</span>
                      <Input
                        bsSize={"sm"}
                        id={idx}
                        name="evening"
                        onChange={handleChange}
                        value={medicine.dosageAndFrequency.evening}
                      />
                      <span className="mx-2">-</span>
                      <Input
                        bsSize={"sm"}
                        id={idx}
                        name="night"
                        onChange={handleChange}
                        value={medicine.dosageAndFrequency.night}
                      />
                      <span className="ms-3">Tablets</span>
                    </div>
                  </Col>
                  <Col xs={3} className="">
                    <div>
                      <Input
                        // id={idx}
                        name="intake"
                        className="bg-white"
                        bsSize={"sm"}
                        id={idx}
                        type="select"
                        onChange={handleChange}
                        value={medicine.intake}
                      >
                        <option value={"Before food"}>Before food</option>
                        <option value={"After food"}>After food</option>
                      </Input>
                      <Input
                        name="instructions"
                        bsSize={"sm"}
                        id={idx}
                        className="mt-2 bg-white"
                        type="text"
                        onChange={handleChange}
                        value={medicine.instructions}
                        placeholder="instruction"
                      />
                    </div>
                  </Col>
                  <Col xs={3} className="">
                    <div className="d-flex flex-nowrap">
                      <div className="position-relative">
                        <Input
                          name="duration"
                          type="number"
                          onChange={handleChange}
                          value={medicine.duration}
                          bsSize={"sm"}
                          id={idx}
                        />
                        <span
                          onClick={() => bulkEditMedDuration(medicine.duration)}
                          style={{ top: "-5px", right: "-7px" }}
                          className="btn btn-sm btn-success bg-white btn-outline p-0 position-absolute"
                        >
                          <svg
                            width="15"
                            height="15"
                            // className="bg-white"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 18 18"
                          >
                            <path
                              fill="#14c56b"
                              d="M2.855 10.908l-.67 1.407L.038 17.26a.535.535 0 0 0 0 .368.917.917 0 0 0 .154.184.917.917 0 0 0 .184.155.562.562 0 0 0 .188.033.48.48 0 0 0 .18-.033l4.945-2.143 1.41-.672 8.527-8.528-4.244-4.243zM4.862 14l-1.515.657L4 13.144l.512-1.064 1.414 1.414zM16.708 5.54L12.466 1.3l.707-.707A2 2 0 0 1 16 .59L17.415 2a2 2 0 0 1 0 2.83zM7.74.893l-.63-.63a.886.886 0 0 0-1.26 0l-4.578 4.59-.3.62-.96 2.2a.29.29 0 0 0 0 .16.705.705 0 0 0 .07.09.705.705 0 0 0 .09.07c.02 0 .05.01.08.01a.22.22 0 0 0 .08-.01l2.2-.96.62-.3 4.588-4.58a.887.887 0 0 0 0-1.26zM17.735 10.89l-.63-.63a.886.886 0 0 0-1.26 0l-4.578 4.59-.3.62-.96 2.2a.29.29 0 0 0 0 .16.46.46 0 0 0 .16.16c.02 0 .05.01.08.01a.22.22 0 0 0 .08-.01l2.2-.96.62-.3 4.59-4.58a.887.887 0 0 0-.002-1.26z"
                            />
                          </svg>
                        </span>
                      </div>
                      <Input
                        name="unit"
                        className="ms-3 bg-white"
                        bsSize={"sm"}
                        id={idx}
                        onChange={handleChange}
                        value={medicine.unit}
                        type="select"
                      >
                        <option>Day (s)</option>
                        <option>Month (s)</option>
                        <option>Year (s)</option>
                      </Input>
                    </div>
                  </Col>
                  <Col xs={1}>
                    <i
                      onClick={() => removeDrug(idx)}
                      className="btn text-black btn-sm btn-outline-danger ri-delete-bin-6-line"
                    ></i>
                  </Col>
                </SortableMedicine>
              ))}
            </SortableContext>
          </DndContext>
        </Row>
      </div>
    </React.Fragment>
  );
};

Medicine.propTypes = {
  medicines: PropTypes.array,
  setMedicines: PropTypes.func,
};

const mapStateToProps = (state) => ({
  isNew: state.Chart.chartForm?.data ? false : true,
});

export default connect(mapStateToProps)(Medicine);
