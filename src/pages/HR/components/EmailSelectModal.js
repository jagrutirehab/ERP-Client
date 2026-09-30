import { Button, Modal } from "reactstrap";

const EmailSelectModal = ({ isOpen, toggle, emails, onSelect }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <div className="p-3">
        <h5 className="mb-3">Select Email</h5>

        {emails.map((e, idx) => (
          <Button
            key={idx}
            className="w-100 mb-2"
            color="primary"
            onClick={() => onSelect(e)}
          >
            {e}
          </Button>
        ))}
      </div>
    </Modal>
  );
};

export default EmailSelectModal;
