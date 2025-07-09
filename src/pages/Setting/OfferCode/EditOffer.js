import React from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";
import { Formik, Form, ErrorMessage, useFormikContext, getIn } from 'formik';
import { Input, Button } from 'reactstrap';
import * as Yup from 'yup';
import SearchableSelect from './SelectInput';
import { fetchAllCenters, fetchAllDoctorSchedule } from '../../../store/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { updateOfferFunction } from '../../../store/features/offer/offerSlice';

export const couponSchema = Yup.object().shape({
    code: Yup.string().required('Code is required'),
    discountType: Yup.string().oneOf(['FIXED', 'PERCENTAGE'], 'Invalid type').required('Discount type is required'),
    discountValue: Yup.number().min(0, 'Must be positive').required('Discount value is required'),
    minBookingAmount: Yup.number().min(0, 'Must be positive').optional(),
    newUsersOnly: Yup.boolean().optional(),
    visibleToAll: Yup.boolean().optional(),
    applicableCenters: Yup.array().of(Yup.string()).optional(),
    applicableServices: Yup.array().of(Yup.string()).optional(),
    applicableConsultants: Yup.array().of(Yup.string()).optional(),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date()
        .min(Yup.ref('startDate'), 'End date must be after start date')
        .required('End date is required'),
    usageLimitGlobal: Yup.number().min(0, 'Must be positive').required('Usage limit is required'),
    usageLimitPerUser: Yup.number().min(0, 'Must be positive').required('Per-user limit is required'),
    // status: Yup.boolean().optional(),
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

const EditOfferModal = ({ modal, toggle, data ,setApiFlag, apiFlag}) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchAllCenters());
    }, [dispatch]);
    const centerAccess = useSelector((state) => state.User.centerAccess);
    useEffect(() => {
        setTimeout(() => {
            dispatch(
                fetchAllDoctorSchedule({
                    name: '',
                    centerAccess: JSON.stringify(centerAccess),
                })
            );
        }, 1000);
    }, [dispatch, centerAccess]);

    const centers = useSelector((state) => state.Center.allCenters);
    const doctors = useSelector((state) => state.Setting.doctorSchedule);
    const doctorList = doctors && doctors?.filter((obj) => obj.status !== 'suspended')?.map((obj) => {
        return {
            label: obj?.name,
            value: obj?._id
        }
    })
    const centerList = centers && centers.map((obj) => {
        return {
            label: obj?.title,
            value: obj?._id
        }
    })

    const serviceList = [
        {
            label: "DOCTOR",
            value: "DOCTOR"
        },
        {
            label: "ACCOUNTANT",
            value: "ACCOUNTANT"
        },
        {
            label: "CONSULTANT",
            value: "CONSULTANT"
        },
        {
            label: "COUNSELLOR",
            value: "COUNSELLOR"
        },
        {
            label: "NURSE",
            value: "NURSE"
        },
    ]

    const handleSubmit = async (data1) => {
        const dataToBeSend = {
            _id: data._id,
            ...data1
        };
        try {
            const response = await dispatch(updateOfferFunction(dataToBeSend)).unwrap();
            if(response.success){
                toggle();
                setApiFlag(!apiFlag)
            };

        } catch (error) {
            console.error("Add offer failed:", error);
        }
    };

    return (
        <React.Fragment>
            <CustomModal
                size={"xl"}
                isOpen={modal}
                toggle={toggle}
                centered
                title={"Edit Offer"}
            >

                <Formik
                    initialValues={{
                        code: data?.code || '',
                        discountType: data?.discountType || '',
                        discountValue: data?.discountValue || '',
                        minBookingAmount: data?.minBookingAmount || '',
                        newUsersOnly: data?.newUsersOnly || false,
                        visibleToAll: data?.visibleToAll || false,
                        applicableCenters: data?.applicableCenters?.map(id => id) || [],
                        applicableServices: data?.applicableServices || [],
                        applicableConsultants: data?.applicableConsultants?.map(id => id) || [],
                        startDate: data?.startDate ? data.startDate.split('T')[0] : '',
                        endDate: data?.endDate ? data.endDate.split('T')[0] : '',
                        usageLimitGlobal: data?.usageLimitGlobal || '',
                        usageLimitPerUser: data?.usageLimitPerUser || '',
                        // status: data?.status || false,
                    }}
                    validationSchema={couponSchema}
                    onSubmit={handleSubmit}
                >
                    {() => (
                        <Form>
                            <div className="row">
                                <div className='col-md-4'>
                                    <label>Code</label>
                                    <FormikInput name="code" />
                                </div>
                                <div className='col-md-4'>
                                    <label>Discount Type</label>
                                    <FormikSearchableSelect
                                        name="discountType"
                                        isMulti={false}
                                        options={[
                                            { value: 'FIXED', label: 'Fixed' },
                                            { value: 'PERCENTAGE', label: 'Percentage' },
                                        ]}
                                    />
                                </div>
                                <div className='col-md-4'>
                                    <label>Discount Value</label>
                                    <FormikInput name="discountValue" type="number" />
                                </div>
                            </div>


                            <div className='row'>
                                <div className='col-md-4'>
                                    <label>Min Booking Amount</label>
                                    <FormikInput name="minBookingAmount" type="number" />
                                </div>
                                <div className='col-md-4 mt-2'>
                                    <label> New Users Only </label>
                                    <FormikInput name="newUsersOnly" type="checkbox" className="mt-2" />
                                </div>
                                <div className='col-md-4 mt-2'>
                                    <label> Visible To All  </label>
                                    <FormikInput name="visibleToAll" type="checkbox" className="mt-2" />
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-md-4'>
                                    <label>Applicable Centers</label>
                                    <FormikSearchableSelect
                                        name="applicableCenters"
                                        isMulti
                                        options={centerList ?? []}
                                    />
                                </div>

                                <div className='col-md-4'>
                                    <label>Applicable Services</label>
                                    <FormikSearchableSelect
                                        name="applicableServices"
                                        isMulti
                                        options={serviceList}
                                    />
                                </div>

                                <div className='col-md-4'>
                                    <label>Applicable Consultants</label>
                                    <FormikSearchableSelect
                                        name="applicableConsultants"
                                        isMulti
                                        options={doctorList}
                                    />
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

                                <div className='col-md-4'>
                                    <label>Usage Limit Global</label>
                                    <FormikInput name="usageLimitGlobal" type="number" />
                                </div>
                            </div>

                            <div className='row'>
                                <div className='col-md-4'>
                                    <label>Usage Limit Per User</label>
                                    <FormikInput name="usageLimitPerUser" type="number" />
                                </div>
                                <div className='col-md-4'>
                                    {/* <div className='col-md-4 mt-2'>
                                <label> isActive  </label>
                                <FormikInput name="status" type="checkbox" className="mt-2" />
                            </div> */}

                                </div>
                                <div className='col-md-4 d-flex justify-content-end' style={{ height: '70px' }}>

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

EditOfferModal.propTypes = {
    modal: PropTypes.bool,
    toggle: PropTypes.func,
    data: PropTypes.any,
    setApiFlag:PropTypes.func,
    apiFlag:PropTypes.bool
};


export default EditOfferModal;