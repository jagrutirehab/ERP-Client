import { Formik, Form, ErrorMessage, useFormikContext, getIn } from 'formik';
import { Input, Button } from 'reactstrap';
import * as Yup from 'yup';
import SearchableSelect from './SelectInput';
import { fetchAllCenters, fetchAllDoctorSchedule } from '../../../store/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

export const couponSchema = Yup.object().shape({
    code: Yup.string().required('Code is required'),
    discountType: Yup.string().oneOf(['FIXED', 'PERCENTAGE'], 'Invalid type').required('Discount type is required'),
    discountValue: Yup.number().min(0, 'Must be positive').required('Discount value is required'),
    minBookingAmount: Yup.number().min(0, 'Must be positive').optional(),
    newUsersOnly: Yup.boolean().optional(),
    visibleToAll: Yup.boolean().optional(),
    applicableCenters: Yup.array().of(Yup.string()).required('Select at least one center'),
    applicableServices: Yup.array().of(Yup.string()).required('Select at least one service'),
    applicableConsultants: Yup.array().of(Yup.string()).required('Select at least one consultant'),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date()
        .min(Yup.ref('startDate'), 'End date must be after start date')
        .required('End date is required'),
    usageLimitGlobal: Yup.number().min(0, 'Must be positive').required('Usage limit is required'),
    usageLimitPerUser: Yup.number().min(0, 'Must be positive').required('Per-user limit is required'),
    // status: Yup.boolean().optional(),
});


const initialValues = {
    code: '',
    discountType: '',
    discountValue: '',
    minBookingAmount: '',
    newUsersOnly: false,
    visibleToAll: false,
    applicableCenters: [],
    applicableServices: [],
    applicableConsultants: [],
    startDate: '',
    endDate: '',
    usageLimitGlobal: '',
    usageLimitPerUser: '',
    // status: true,
};

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


const CouponForm = () => {
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

    const centers = useSelector((state) => state.Center.data);
    const doctors = useSelector((state) => state.Setting.doctorSchedule);
     const doctorList = doctors && doctors?.filter((obj)=>obj.status !=='suspended')?.map((obj)=>{
        return{
            label:obj?.name,
            value:obj?._id
        }
     })
     const centerList = centers && centers.map((obj)=>{
        return{
          label:obj?.title,
          value:obj?._id       
        }
     }) 

    const serviceList = [
        {
          label:"DOCTOR",
          value:"DOCTOR"  
        },
         {
          label:"ACCOUNTANT",
          value:"ACCOUNTANT"  
        },
         {
          label:"CONSULTANT",
          value:"CONSULTANT"  
        },
          {
          label:"COUNSELLOR",
          value:"COUNSELLOR"  
        },
           {
          label:"NURSE",
          value:"NURSE"  
        },
    ]
    console.log(centers, "center");
    const handleSubmit = (values) => {
        console.log('Submitted:', values);
    };

    return (
        <Formik
            initialValues={initialValues}
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
                            <FormikInput name="endDate" type="date" />
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
    );
};

export default CouponForm;
