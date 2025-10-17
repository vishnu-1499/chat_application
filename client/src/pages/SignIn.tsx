import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from "yup";
import { Api } from '../config/Api';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

interface ResponseData {
    status: boolean,
    token: string,
    role: string,
    message: string
}

function SignIn() {
    const navigate = useNavigate()
    const { setType } = useStateContext();
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    const togglePassword = () => setShowPassword(!showPassword);
    const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
    const ToggleButton = (bool: boolean) => setIsLogin(bool);

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
            confirm: ""
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid Email").required("Enter your Email Address"),
            password: Yup.string().when([], {
                is: () => !isLogin,
                then: (schema) =>
                    schema
                        .min(6, "Password must be at least 6 characters")
                        .matches(/[A-Z]/, "Must include at least one uppercase letter")
                        .matches(/[a-z]/, "Must include at least one lowercase letter")
                        .matches(/[0-9]/, "Must include at least one number")
                        .matches(/[^A-Za-z0-9]/, "Must include at least one special character")
                        .required("Password is required"),
                otherwise: (schema) => schema.notRequired(),
            }),
            confirm: Yup.string().when([], {
                is: () => !isLogin,
                then: (schema) =>
                    schema
                        .oneOf([Yup.ref('password')], 'Passwords must match')
                        .required('Confirm Password is required'),
                otherwise: (schema) => schema.notRequired(),
            }),
        }),
        onSubmit: async (values) => {
            try {
                const apiUrl = !isLogin ? "/signUp" : "/signIn"
                const axiosResponse = await Api({
                    method: "POST",
                    url: apiUrl,
                    data: {
                        email: values.email.toLowerCase(),
                        password: values.password
                    }
                })

                const response: ResponseData = axiosResponse.data
                if (response.status) {
                    localStorage.setItem("token", response.token)
                    localStorage.setItem("role", response.role)
                    setType(response.role)
                    toast.success(response.message)
                    if (response.token) {
                        setTimeout(() => {
                            navigate("/user/list")
                        }, 3000);
                    } else {
                        setIsLogin(true)
                    }

                } else {
                    toast.error(response.message)
                    navigate("/")
                }

            } catch (error) {
                toast("Internal Error.")
            }
        }
    })

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <ToastContainer />
            <div className='shadow p-4 bg-white rounded' style={{ width: "100%", maxWidth: "500px" }}>
                <div className='text-center mb-4'>
                    <h2 className='fw-bold'> {!isLogin ? "Register" : "Login"} </h2>
                </div>

                <form onSubmit={formik.handleSubmit}>
                    <div className='mb-3'>
                        <label className="form-label">Email</label>
                        <input
                            type='email'
                            name='email'
                            className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                            placeholder='Type your Email Address'
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className='invalid-feedback'>{formik.errors.email}</div>
                        )}
                    </div>

                    <div className="mb-3 position-relative">
                        <label className="form-label">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name='password'
                            className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                            placeholder='Enter the Password'
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        <button
                            type="button"
                            onClick={togglePassword}
                            className="position-absolute"
                            style={{
                                top: `${formik.errors.password ? "50%" : "70%"}`,
                                right: `${formik.errors.password ? "30px" : "10px"}`,
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {formik.touched.password && formik.errors.password && (
                            <div className='invalid-feedback'>{formik.errors.password}</div>
                        )}
                    </div>

                    {!isLogin && (
                        <div className="mb-3 position-relative">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name='confirm'
                                className={`form-control ${formik.touched.confirm && formik.errors.confirm ? 'is-invalid' : ''}`}
                                placeholder='Re-enter your Password'
                                value={formik.values.confirm}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <button
                                type="button"
                                onClick={toggleConfirmPassword}
                                className="position-absolute"
                                style={{
                                    top: `${formik.errors.confirm ? "50%" : "70%"}`,
                                    right: `${formik.errors.confirm ? "30px" : "10px"}`,
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            {formik.touched.confirm && formik.errors.confirm && (
                                <div className='invalid-feedback'>{formik.errors.confirm}</div>
                            )}
                        </div>
                    )}

                    <div className='d-flex justify-content-center'>
                        <button
                            className={`btn ${isLogin ? 'btn-success' : 'btn-info'}`}
                            type='submit'
                            style={{ width: '30%' }}
                        >
                            Submit
                        </button>
                    </div>
                </form>


                <div className='text-center mt-3'>
                    {!isLogin ? (
                        <p>Already have an Account?{' '}
                            <span
                                style={{ color: "green", cursor: "pointer" }}
                                onClick={() => ToggleButton(true)}
                            >
                                Login
                            </span>
                        </p>
                    ) : (
                        <p>Register a New Account?{' '}
                            <span
                                style={{ color: "blue", cursor: "pointer" }}
                                onClick={() => ToggleButton(false)}
                            >
                                Register
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SignIn;
