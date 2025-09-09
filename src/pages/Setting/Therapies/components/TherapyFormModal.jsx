import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";

const TherapyFormModal = ({
  isOpen,
  toggle,
  formData,
  onChange,
  onSubmit,
  isEditing,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {isEditing ? "Edit Therapy" : "Add New Therapy"}
      </ModalHeader>
      <Form onSubmit={onSubmit}>
        <ModalBody>
          <Row>
            <Col md={12}>
              <FormGroup>
                <Label for="title">Title *</Label>
                <Input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={onChange}
                  placeholder="Enter therapy title"
                  required
                />
              </FormGroup>
            </Col>
            <Col md={12}>
              <FormGroup>
                <Label for="description">Description *</Label>
                <Input
                  type="textarea"
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={onChange}
                  placeholder="Enter therapy description"
                  rows="4"
                  required
                />
              </FormGroup>
            </Col>
            <Col md={12}>
              <FormGroup>
                <Label for="price">Price *</Label>
                <Input
                  type="number"
                  name="price"
                  id="price"
                  value={formData.price}
                  onChange={onChange}
                  placeholder="Enter price"
                  required
                />
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
          <Button color="primary" type="submit">
            {isEditing ? "Update" : "Add"} Therapy
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default TherapyFormModal;
