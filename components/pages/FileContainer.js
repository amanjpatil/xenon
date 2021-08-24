import React, { useEffect, useContext } from 'react'
import AuthContext from '../../context/auth/authContext'
import AlertContext from '../../context/alert/alertContext'

const FileContainer = () => {
  const alertContext = useContext(AlertContext)
  const authContext = useContext(AuthContext)

  const { setAlert } = alertContext
  const {
    getFiles,
    files,
    error,
    clearErrors,
    removeFile,
    message,
  } = authContext

  useEffect(() => {
    if (error) {
      setAlert(error, 'danger')
      clearErrors()
    }
    if (message) {
      setAlert(message, 'success')
      getFiles()
      clearErrors()
    }

    if (files.length === 0) getFiles()
    // eslint-disable-next-line
  }, [files, message])

  const deleteHandler = (e, id) => {
    e.preventDefault()
    removeFile(id)
  }

  if (files.length === 0) return <h3>Loading...</h3>

  return (
    <div className='container'>
      <div className='file-container'>
        {files.files.length ? (
          files.files.map((file, index) => (
            <div className='file-box' key={index}>
              <span className='file-title'>
                <i className='fa fa-file'></i> {file.original_name}
              </span>
              <div className='overlay'>
                <a
                  title='download'
                  href={file.aws_data.Location}
                  target='_blank'
                  rel='noreferrer'>
                  <i className='fa fa-download'></i>
                </a>
                <a
                  href='#!'
                  title='delete'
                  onClick={(e) => deleteHandler(e, file._id)}>
                  <i className='fa fa-times delete'></i>
                </a>
              </div>
            </div>
          ))
        ) : (
          <h3 style={{ margin: 'auto' }}>
            Looks like you didn't stored anything yet
          </h3>
        )}
      </div>
    </div>
  )
}

export default FileContainer
