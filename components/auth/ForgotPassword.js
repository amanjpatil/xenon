import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../context/auth/authContext";
import AlertContext from "../../context/alert/alertContext";

const ForgotPassword = (props) => {
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);

  const { setAlert } = alertContext;
  const { error, clearErrors, forgotPassword, message } = authContext;

  const [email, setEmail] = useState("");

  useEffect(() => {
    if (error) {
      setAlert(error, "danger");
      clearErrors();
    }

    if (message) {
      setAlert(message, "success");
      clearErrors();
    }
    // eslint-disable-next-line
  }, [error, message, props.history]);

  const onSubmit = (e) => {
    e.preventDefault();
    forgotPassword({ email });
  };

  const onChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <div className='form-container'>
      <h1>
        Forgot <span className='text-primary'>Password</span>
      </h1>
      <form onSubmit={onSubmit}>
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
        </div>
        <input
          type='submit'
          value='Get Password Reset Link'
          className='btn btn-primary btn-block'
        />
        <Link to='/login'>
          <p className='text-center'>Already have an account? Login</p>
        </Link>
      </form>
    </div>
  );
};

export default ForgotPassword;
