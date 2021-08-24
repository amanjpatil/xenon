import React from "react";
import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div className='text-center'>
      <h1 style={{ fontSize: "6vw" }}>WELCOME</h1>
      <i className='fas fa-box-open fa-5x' />
      <h1 style={{ fontSize: "4vw" }}>M-Drive</h1>
      <p>Easy and secure to store & access all of your content</p>
      <Link to='/login'>
        <button className='btn btn-primary my-1'>Get Started</button>
      </Link>
    </div>
  );
};

export default Welcome;
