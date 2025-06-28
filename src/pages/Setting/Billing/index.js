import React, { useEffect, useState } from "react";
import Breadcrumb from "../../../Components/Common/BreadCrumb";
import AddItems from "./Components/invoice/AddItem";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import BillingBar from "./Components/invoice/BillingBar";
import DeleteModal from "../../../Components/Common/DeleteModal";
import ItemList from "./Components/invoice/ItemList";
import { connect, useDispatch } from "react-redux";
import {
  fetchBillItems,
  fetchPaymentAccounts,
  removeBillItem,
  removePaymentAccount,
} from "../../../store/actions";
import classNames from "classnames";
import PaymentBar from "./Components/advancePayment/PaymentBar";
import PaymentList from "./Components/advancePayment/PaymentList";
import AddPayment from "./Components/advancePayment/AddPayment";

const Billing = ({
  centers,
  billItems,
  totalCount,
  totalPages,
  currentPage,
  itemsPerPage,
  paymentAccounts,
  paymentTotalCount,
  paymentTotalPages,
  paymentCurrentPage,
  paymentItemsPerPage,
}) => {
  const dispatch = useDispatch();

  // Modal states
  const [modal, setModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState({ isOpen: false, data: null });

  // Tabs
  const [tab, setTab] = useState("1");

  // Pagination + Search for Invoice
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Pagination + Search for Advance payment
  const [searchadv, setSearchadv] = useState("");
  const [pageadv, setPageadv] = useState(1);
  const [limitadv, setLimitadv] = useState(10);

  // Toggle handlers
  const toggleForm = () => setModal(!modal);
  const togglePaymentForm = () => setPaymentModal(!paymentModal);

  // Delete handlers
  const dltItem = () => {
    dispatch(removeBillItem(deleteItem.data));
    setDeleteItem({ isOpen: false, data: null });
  };

  const dltPaymentItem = () => {
    dispatch(removePaymentAccount(deleteItem.data));
    setDeleteItem({ isOpen: false, data: null });
  };

  const cancelDeleteItem = () => setDeleteItem({ isOpen: false, data: null });

  // Fetch invoice items
  useEffect(() => {
    if (tab === "1") {
      dispatch(fetchBillItems({ centerIds: centers, page, limit, search }));
    }
    return;
  }, [dispatch, centers, page, limit, search, tab]);

  // Fetch payment accounts
  useEffect(() => {
    if (tab === "2") {
      dispatch(
        fetchPaymentAccounts({
          centerIds: centers,
          page: pageadv,
          limit: limitadv,
          search: searchadv,
        })
      );
    }
  }, [dispatch, centers, tab, pageadv, limitadv, searchadv]);

  return (
    <React.Fragment>
      <div className="w-100">
        <div className="mt-4 mx-4 mb-3">
          <Breadcrumb title="Billing" pageTitle="Billing" />
        </div>

        <Nav tabs className="py-2">
          <NavItem>
            <NavLink
              className={classNames({ active: tab === "1" })}
              onClick={() => setTab("1")}
            >
              Invoice
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classNames({ active: tab === "2" })}
              onClick={() => setTab("2")}
            >
               Payment
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={tab}>
          <TabPane tabId="1">
            <BillingBar toggleForm={toggleForm} setSearch={setSearch} />
            <ItemList
              items={billItems}
              setDeleteItem={setDeleteItem}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
              searchItem={search}
              totalItems={totalCount}
              totalPages={totalPages}
            />
            <AddItems modal={modal} toggle={toggleForm} />
            <DeleteModal
              show={deleteItem.isOpen}
              onDeleteClick={dltItem}
              onCloseClick={cancelDeleteItem}
            />
          </TabPane>

          <TabPane tabId="2">
            <PaymentBar
              toggleForm={togglePaymentForm}
              setSearchadv={setSearchadv}
            />
            <PaymentList
              items={paymentAccounts}
              setDeleteItem={setDeleteItem}
              currentPage={paymentCurrentPage}
              itemsPerPage={paymentItemsPerPage}
              onPageChange={setPageadv}
              onItemsPerPageChange={setLimitadv}
              searchItem={searchadv}
              totalItems={paymentTotalCount}
              totalPages={paymentTotalPages}
            />
            <AddPayment modal={paymentModal} toggle={togglePaymentForm} />
            <DeleteModal
              show={deleteItem.isOpen}
              onDeleteClick={dltPaymentItem}
              onCloseClick={cancelDeleteItem}
            />
          </TabPane>
        </TabContent>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    centers: state.User.centerAccess,
    billItems: state.Setting?.invoiceProcedures || [],
    totalCount: state.Setting?.totalCount || 0,
    totalPages: state.Setting?.totalPages || 1,
    currentPage: state.Setting?.currentPage || 1,
    itemsPerPage: state.Setting?.itemsPerPage || 10,

    // Advance Payment state
    paymentAccounts: state.Setting?.paymentAccounts || [],
    paymentTotalCount: state.Setting?.paymentTotalCount || 0,
    paymentTotalPages: state.Setting?.paymentTotalPages || 1,
    paymentCurrentPage: state.Setting?.paymentCurrentPage || 1,
    paymentItemsPerPage: state.Setting?.paymentItemsPerPage || 10,
  };
};
export default connect(mapStateToProps)(Billing);
