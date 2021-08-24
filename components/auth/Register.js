import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import AlertContext from "../../context/alert/alertContext";
import AuthContext from "../../context/auth/authContext";

const Register = (props) => {
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);

  const { setAlert } = alertContext;
  const {
    register,
    error,
    clearErrors,
    isAuthenticated,
    userRegistered,
  } = authContext;

  useEffect(() => {
    if (isAuthenticated && authContext.user.isActivated) {
      props.history.push("/home");
    }

    if (error) {
      if (error.includes("E11000"))
        setAlert("Email already taken...", "danger");
      else setAlert(error, "danger");
      clearErrors();
    }

    if (userRegistered) {
      setAlert(
        "Account created. Please activate your account by clicking the link send to your e-mail and then login",
        "success"
      );
      clearErrors();
      setUser({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password2: "",
      });
    }
    // eslint-disable-next-line
  }, [error, isAuthenticated, props.history, userRegistered]);

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
  });

  const { first_name, last_name, email, password, password2 } = user;

  const onChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (
      first_name === "" ||
      last_name === "" ||
      email === "" ||
      password === ""
    ) {
      setAlert("Please enter all fields", "danger");
    } else if (password !== password2) {
      setAlert("Passwords do not match", "danger");
    } else {
      register({
        first_name,
        last_name,
        email,
        password,
      });
    }
  };

  return (
    <div className='form-container'>
      <h1>
        Account <span className='text-primary'>Register</span>
      </h1>
      <form onSubmit={onSubmit}>
        <div className='form-group'>
          <label htmlFor='name'>First Name</label>
          <input
            id='first_name'
            type='text'
            name='first_name'
            value={first_name}
            onChange={onChange}
            required
          />
        </div>
        <div className='form-group'>
          <label htmlFor='name'>Last Name</label>
          <input
            id='last_name'
            type='text'
            name='last_name'
            value={last_name}
            onChange={onChange}
            required
          />
        </div>
        <div className='form-group'>
          <label htmlFor='email'>Email Address</label>
          <input
            id='email'
            type='email'
            name='email'
            value={email}
            onChange={onChange}
            required
          />
          <small className='text-muted'>
            Please provide a valid e-mail to receive the link to activate your
            account
          </small>
        </div>
        <div className='form-group'>
          <label htmlFor='password'>Password</label>
          <input
            id='password'
            type='password'
            name='password'
            value={password}
            onChange={onChange}
            required
            minLength='6'
          />
        </div>
        <div className='form-group'>
          <label htmlFor='password2'>Confirm Password</label>
          <input
            id='password2'
            type='password'
            name='password2'
            value={password2}
            onChange={onChange}
            required
            minLength='6'
          />
        </div>
        <input
          type='submit'
          value='Register'
          className='btn btn-primary btn-block'
        />
        <Link to='/login'>
          <p className='text-center'>Already have an account? Login</p>
        </Link>
      </form>
    </div>
  );
};

export default Register;
