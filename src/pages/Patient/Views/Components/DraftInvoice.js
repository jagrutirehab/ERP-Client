import React, { useState } from "react";
import PropTypes from "prop-types";
import Wrapper from "../../Components/Wrapper";
import RenderWhen from "../../../../Components/Common/RenderWhen";
import Invoice from "../../Bills/Invoice";
import { connect, useDispatch } from "react-redux";
import DeleteModal from "../../../../Components/Common/DeleteModal";
import {
  createEditBill,
  draftToInvoice,
  removeDraft,
} from "../../../../store/actions";
import { Alert, Button, DropdownItem } from "reactstrap";
import CustomModal from "../../../../Components/Common/Modal";

const DraftInvoice = ({ drafts, toggleDateModal }) => {
  const dispatch = useDispatch();
  const [draft, setDraft] = useState({
    draft: null,
    isOpen: false,
  });
  const [convertDraft, setConvertDraft] = useState({
    draft: null,
    isOpen: false,
  });

  const cancelDelete = () => {
    setDraft({
      draft: null,
      isOpen: false,
    });
  };

  const deleteBill = () => {
    dispatch(removeDraft(draft.draft._id));
    setDraft({
      draft: null,
      isOpen: false,
    });
  };

  const editDraft = (bill) => {
    dispatch(createEditBill({ data: bill, bill: bill.bill, isOpen: false }));
    toggleDateModal();
  };

  const getDraft = (draft) => {
    setDraft({
      draft,
      isOpen: true,
    });
  };

  return (
    <React.Fragment>
      <div className="draft-bill p-2">
        {(drafts || []).map((draft, id) => (
          <Wrapper
            key={draft._id}
            item={draft}
            showId={false}
            showPrint={false}
            name="Billing"
            editItem={editDraft}
            deleteItem={getDraft}
            extraOptions={(draft) => (
              <DropdownItem
                onClick={() => {
                  setConvertDraft({ draft, isOpen: true });
                }}
                href="#"
              >
                {" "}
                <i className="ri-exchange-dollar-line align-bottom text-muted me-2"></i>{" "}
                Submit as invoice
              </DropdownItem>
            )}
            //   printItem={printBill}
            toggleDateModal={toggleDateModal}
            disableEdit={false}
            disableDelete={false}
          >
            <Invoice
              title={"Draft Invoice"}
              data={draft?.invoice}
              bill={draft}
            />
          </Wrapper>
        ))}
      </div>
      <CustomModal
        isOpen={convertDraft.isOpen}
        toggle={() => setConvertDraft({ draft: null, isOpen: false })}
        centered
        size={"md"}
        title={"Draft to Bill"}
      >
        <Alert color="success">
          Are you sure you want to convert this draft into Invoice
        </Alert>
        <div className="d-flex justify-content-end gap-3 mt-3">
          <Button
            onClick={() => setConvertDraft({ draft: null, isOpen: false })}
            size="sm"
            color="danger"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              dispatch(draftToInvoice({ draft: convertDraft.draft?._id }));
              setConvertDraft({ draft: null, isOpen: false });
            }}
            size="sm"
            color="success"
          >
            Submit as Invoice
          </Button>
        </div>
      </CustomModal>
      <DeleteModal
        onCloseClick={cancelDelete}
        onDeleteClick={deleteBill}
        show={draft.isOpen}
      />
    </React.Fragment>
  );
};

DraftInvoice.propTypes = {};

const mapStateToProps = (state) => ({
  drafts: state.Bill.draftData,
});

export default connect(mapStateToProps)(DraftInvoice);
