import React, { useState, useContext } from "react";
import AlertContext from "../../context/alert/alertContext";
import AuthContext from "../../context/auth/authContext";

const ResetPassword = (props) => {
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);

  const { setAlert } = alertContext;
  const { resetPassword } = authContext;

  const [user, setUser] = useState({
    password: "",
    password2: "",
  });

  const { password, password2 } = user;

  const onSubmit = (e) => {
    e.preventDefault();
    console.log(props.match.params.id);
    if (password !== password2) {
      setAlert("Passwords do not match", "danger");
    } else {
      resetPassword({ password, _id: props.match.params.id });
      props.history.push("/login");
    }
  };

  const onChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  return (
    <div className='form-container'>
      <h1>
        Password <span className='text-primary'>Reset</span>
      </h1>
      <form onSubmit={onSubmit}>
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
          value='Reset Password'
          className='btn btn-primary btn-block'
        />
      </form>
    </div>
  );
};

export default ResetPassword;
