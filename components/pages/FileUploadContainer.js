import React, { useContext, useEffect, useState } from "react";
// import Dropzone from 'react-dropzone'
import AuthContext from "../../context/auth/authContext";

const FileContainer = () => {
  const authContext = useContext(AuthContext);

  const { storeFile } = authContext;

  const [fileNames, setFileNames] = useState([]);

  useEffect(() => {
    if (fileNames.length !== 0) {
      for (let file of fileNames) {
        const formData = new FormData();
        formData.append("file", file);
        storeFile(formData);
      }
      setFileNames([]);
    }
    // eslint-disable-next-line
  }, [fileNames]);

  const handleDrop = (acceptedFiles) => {
    setFileNames(acceptedFiles.map((file) => file));
  };

  const uploadHandler = (e) => {
    for (let file of e.target.files) {
      const formData = new FormData();
      formData.append("file", file);
      storeFile(formData);
    }
  };

  return (
    <div className="container">
      {/* <Dropzone onDrop={handleDrop} noClick={true}>
        {({ getRootProps, getInputProps, open }) => (
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} onChange={(e) => uploadHandler(e)} />
            <p>
              Drag 'n' drop some file<small>(s)</small> here to store it
            </p>
            <button type="button" onClick={open}>
              Open File Dialog
            </button>
          </div>
        )}
      </Dropzone> */}
    </div>
  );
};

export default FileContainer;
