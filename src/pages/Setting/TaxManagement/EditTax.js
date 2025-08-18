import React from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";
import { Formik, Form, useFormikContext, getIn } from 'formik';
import { Input, Button } from 'reactstrap';
import * as Yup from 'yup';

import { fetchAllCenters } from '../../../store/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { updateTaxFunction } from "../../../store/features/tax/taxSlice";
import SearchableSelect from "../OfferCode/SelectInput";
import { toast } from "react-toastify";
import { useAuthError } from "../../../Components/Hooks/useAuthError";

export const schema = Yup.object().shape({
    taxName: Yup.string().required('Tax Name is required'),
    taxType: Yup.string().oneOf(['FIXED', 'PERCENTAGE'], 'Invalid type').required('Tax type is required'),
    taxValue: Yup.number().min(0, 'Must be positive').required('Tax value is required'),
    visibleToAll: Yup.boolean().optional(),
    applicableCenters: Yup.array().of(Yup.string()).optional(),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date()
        .min(Yup.ref('startDate'), 'End date must be after start date')
        .required('End date is required'),
    status: Yup.boolean().optional(),
});

const FormikSearchableSelect = ({ name, options = [], isMulti = false, placeholder = "Select..." }) => {
    const { values, setFieldValue, touched, errors } = useFormikContext();
    const value = getIn(values, name);
    const error = getIn(errors, name);
    const isTouched = getIn(touched, name);
    return (
        <div className="mb-3">
            <SearchableSelect
                options={options}
                isMulti={isMulti}
                defaultValue={value}
                onChange={(val) => setFieldValue(name, val)}
                placeholder={placeholder}
            />
            {isTouched && error && <div className="text-danger">{error}</div>}
        </div>
    );
};

const FormikInput = ({ name, type = "text", ...rest }) => {
    const { values, handleChange, handleBlur, errors, touched } = useFormikContext();
    const error = getIn(errors, name);
    const isTouched = getIn(touched, name);
    const value = getIn(values, name);

    const inputProps = {
        id: name,
        name,
        onChange: handleChange,
        onBlur: handleBlur,
        type,
        invalid: Boolean(isTouched && error),
        ...rest,
    };

    if (type === "checkbox") {
        inputProps.checked = value;
    } else {
        inputProps.value = value;
    }

    return (
        <div className="mb-3">
            <Input {...inputProps} />
            {isTouched && error && <div className="text-danger">{error}</div>}
        </div>
    );
};

const EditModal = ({ modal, toggle, data, setApiFlag, apiFlag }) => {
    const dispatch = useDispatch();
    const handleAuthError=useAuthError();
    useEffect(() => {
        dispatch(fetchAllCenters());
    }, [dispatch]);

    const centers = useSelector((state) => state.Center.allCenters);

    const centerList = centers && centers.map((obj) => {
        return {
            label: obj?.title,
            value: obj?._id
        }
    })

    const handleSubmit = async (data1) => {
        const dataToBeSend = {
            _id: data._id,
            ...data1
        };
        try {
            const response = await dispatch(updateTaxFunction(dataToBeSend)).unwrap();
            if (response.success) {
                toggle();
                setApiFlag(!apiFlag)
            };

        } catch (error) {
            if (!handleAuthError(error)) {
                console.error("Edit tax failed:", error);
                toast.error(error.message || "Failed to update tax.");
            }
        }
    };

    return (
        <React.Fragment>
            <CustomModal
                size={"xl"}
                isOpen={modal}
                toggle={toggle}
                centered
                title={"Edit Tax"}
            >
                <Formik
                    initialValues={{
                        taxName: data?.taxName || '',
                        taxType: data?.taxType || '',
                        taxValue: data?.taxValue || '',
                        visibleToAll: data?.visibleToAll || false,
                        applicableCenters: data?.applicableCenters?.map(id => id) || [],
                        startDate: data?.startDate ? data.startDate.split('T')[0] : '',
                        endDate: data?.endDate ? data.endDate.split('T')[0] : '',
                        status: data?.status || false,
                    }}
                    validationSchema={schema}
                    onSubmit={handleSubmit}
                >
                    {() => (
                        <Form>
                            <div className="row">
                                <div className='col-md-4'>
                                    <label>Tax Name</label>
                                    <FormikInput name="taxName" />
                                </div>
                                <div className='col-md-4'>
                                    <label>Tax Type</label>
                                    <FormikSearchableSelect
                                        name="taxType"
                                        isMulti={false}
                                        options={[
                                            { value: 'FIXED', label: 'Fixed' },
                                            { value: 'PERCENTAGE', label: 'Percentage' },
                                        ]}
                                    />
                                </div>
                                <div className='col-md-4'>
                                    <label>Tax Value</label>
                                    <FormikInput name="taxValue" type="number" />
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-md-4'>
                                    <label>Start Date</label>
                                    <FormikInput name="startDate" type="date" />
                                </div>
                                <div className='col-md-4'>
                                    <label>End Date</label>
                                    <FormikInput name="endDate" type="date" min={new Date().toISOString().split("T")[0]} />
                                </div>

                                <div className='col-md-4 mt-2'>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <label> Visible To All </label>
                                            <FormikInput name="visibleToAll" type="checkbox" className="mt-2" />
                                        </div>
                                        <div className='col-md-2'>
                                            <label> Active </label>
                                            <FormikInput name="status" type="checkbox" className="mt-2" />
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-md-4 '>
                                    <label>Applicable Centers</label>
                                    <FormikSearchableSelect
                                        name="applicableCenters"
                                        isMulti
                                        options={centerList ?? []}
                                    />
                                </div>
                                <div className='col-md-8 d-flex justify-content-end' style={{ height: '70px' }}>
                                    <Button type='submit' color="success" className="text-white" style={{ marginTop: '28px' }}>
                                        Submit
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </CustomModal>
        </React.Fragment>
    )
}

EditModal.propTypes = {
    modal: PropTypes.bool,
    toggle: PropTypes.func,
    data: PropTypes.any,
    setApiFlag: PropTypes.func,
    apiFlag: PropTypes.bool
};


export default EditModal;