import React, { useState, useEffect } from "react";
import { isEmpty } from "lodash";

import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  CardBody,
  Button,
  Label,
  Input,
  FormFeedback,
  Form,
  ButtonGroup,
  CardHeader,
} from "reactstrap";

//compress image
import Compressor from "compressorjs";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//redux
import { useSelector, useDispatch } from "react-redux";

import avatar from "../../assets/images/users/user-dummy-img.jpg";
import GeneralInformation from "./Components/GeneralInformation";
import {
  ATTENDENCE,
  EXIT_FORMALITIES,
  GENERAL_INFORMATION,
  JOINING_DETAILS,
  LEAVE_INFORMATION,
} from "../../Components/constants/user";
import RenderWhen from "../../Components/Common/RenderWhen";
import { addUserProfilePicture } from "../../store/actions";
import { toast } from "react-toastify";
import ChangePasswordForm from "./Components/ChangePasswordForm";

const UserProfile = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState(GENERAL_INFORMATION);

  const [email, setemail] = useState("admin@gmail.com");
  const [idx, setidx] = useState("1");

  const [userName, setUserName] = useState("Admin");
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

  const { user } = useSelector((state) => ({
    user: state.User.user,
  }));

  useEffect(() => {
    if (sessionStorage.getItem("authUser")) {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));

      if (!isEmpty(user)) {
        obj.data.first_name = user.first_name;
        sessionStorage.removeItem("authUser");
        sessionStorage.setItem("authUser", JSON.stringify(obj));
      }

      setUserName(obj.data.first_name);
      setemail(obj.data.email);
      setidx(obj.data._id || "1");

      setTimeout(() => { }, 3000);
    }
  }, [dispatch, user]);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      first_name: userName || "Admin",
      idx: idx || "",
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required("Please Enter Your UserName"),
    }),
    onSubmit: (values) => { },
  });

  const handleTab = (tab) => {
    setTab(tab);
  };

  document.title = "Profile | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col lg="12">
              {/* {error && error ? <Alert color="danger">{error}</Alert> : null}
              {success ? <Alert color="success">Username Updated To {userName}</Alert> : null} */}

              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="profile-user position-relative d-inline-block me-4 mx-auto mb-2">
                      <img
                        src={user?.profilePicture?.url || avatar}
                        className="rounded-circle avatar-lg img-thumbnail user-profile-image"
                        alt=""
                      />
                      <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                        <Input
                          id="profile-img-file-input"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) {
                              return;
                            }
                            new Compressor(file, {
                              quality: 0.5,
                              // The compression process is asynchronous,
                              // which means you have to access the `result` in the `success` hook function.
                              success(result) {
                                const formData = new FormData();
                                if (user.profilePicture?.path)
                                  formData.append(
                                    "prevFile",
                                    user?.profilePicture?.path
                                  );
                                formData.append("profile-picture", result);
                                formData.append("id", user._id);

                                dispatch(addUserProfilePicture(formData));
                              },
                              error(err) {
                                toast.error(err.message);
                              },
                            });
                          }}
                          type="file"
                          className="profile-img-file-input"
                          accept="image/*"
                        />
                        <Label
                          htmlFor="profile-img-file-input"
                          className="profile-photo-edit avatar-xs"
                        >
                          <span className="avatar-title rounded-circle bg-info bg-opacity-50 text-body">
                            <i className="ri-camera-fill fs-5"></i>
                          </span>
                        </Label>
                      </div>
                    </div>
                    {/* <div className="mx-3">
                      <img
                        src={avatar}
                        alt=""
                        className="avatar-md rounded-circle img-thumbnail"
                      />
                    </div> */}
                    <div className="flex-grow-1 align-self-center">
                      <div className="text-muted">
                        <h5>{user.name || "Admin"}</h5>
                        <p className="mb-1">Email Id : {user.email}</p>
                        <p className="mb-0">Role : {user.role}</p>
                        <Button size="sm" className="text-white mt-2" type="primary" onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}>Change Password</Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <div className="mb-4">
            <ButtonGroup>
              <Button
                outline={tab !== GENERAL_INFORMATION}
                onClick={() => handleTab(GENERAL_INFORMATION)}
              >
                General Information
              </Button>
              <Button
                outline={tab !== ATTENDENCE}
                onClick={() => handleTab(ATTENDENCE)}
              >
                Attendence
              </Button>
              <Button
                outline={tab !== LEAVE_INFORMATION}
                onClick={() => handleTab(LEAVE_INFORMATION)}
              >
                Leave Information
              </Button>
              <Button
                outline={tab !== JOINING_DETAILS}
                onClick={() => handleTab(JOINING_DETAILS)}
              >
                Joining Details
              </Button>
              <Button
                outline={tab !== EXIT_FORMALITIES}
                onClick={() => handleTab(EXIT_FORMALITIES)}
              >
                Exit Formalities
              </Button>
            </ButtonGroup>
          </div>

          <RenderWhen isTrue={tab === GENERAL_INFORMATION}>
            <GeneralInformation />
          </RenderWhen>
        </Container>
      </div>
      <ChangePasswordForm isOpen={showChangePasswordForm} toggle={() => setShowChangePasswordForm(!showChangePasswordForm)} />
    </React.Fragment>
  );
};

export default UserProfile;
