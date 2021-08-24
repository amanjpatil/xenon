import React from "react";

import { Upload, message, Input as InputAntd } from "antd";
import {
  UploadOutlined,
  FolderAddOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";

import {
  Button,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  FormControlLabel,
  Divider,
  InputAdornment,
  Checkbox,
} from "@material-ui/core";
import FolderIcon from "@material-ui/icons/Folder";
import LockIcon from "@material-ui/icons/Lock";
import FolderSharedIcon from "@material-ui/icons/FolderShared";
import SearchIcon from "@material-ui/icons/Search";
import SettingsIcon from "@material-ui/icons/Settings";
import DraftsIcon from "@material-ui/icons/Drafts";

import Modal from "react-bootstrap/Modal";
import { Row } from "reactstrap";
import "bootstrap/dist/css/bootstrap.css";

import AuthContext from "../context/auth/authContext";
import AlertContext from "../context/alert/alertContext";
import "./Home.css";
import { useState, useEffect, useContext } from "react";

var timerId, hide;
const Home = (props) => {
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);

  const { setAlert } = alertContext;
  const { owner, token, error, clearErrors } = authContext;

  useEffect(
    () => {
      if (error) {
        setAlert(error, "danger");
        clearErrors();
      }
      if (message) {
        setAlert(message, "success");
        clearErrors();
      }

      // if (files.length === 0) getFiles();
      // eslint-disable-next-line
    },
    // [files, message]
    [message]
  );

  const initialState = {
    path: window.location.href,
    name: "",
    password: [],
    sizeFile: 0,
    visible: false,
    showModal: false,
    showModalPassword: false,
    disableBottons: false,
    showPassword: false,
    folders: [],
    files: [],
    search: "",
    viewLink: null,
    passwords: [],
    modifyFolder: false,
    isType: "",
    previewImg: [],

    url: null,
    downloading: false,
    viewFileClicked: false,
    downloadFileClicked: false,
    showModalFile: false,

    mouseX: null,
    mouseY: null,
    showFoldersMenu: false,
    showMainMenu: false,
    infos: null,

    showModalAccount: false,

    isMobile: window.matchMedia("only screen and (max-width: 760px)").matches,
  };

  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (window.localStorage.getItem("passwords") === null) {
      window.localStorage.setItem("passwords", JSON.stringify([]));
    } else {
      setState({
        passwords: JSON.parse(window.localStorage.getItem("passwords")),
      });
    }
    getFoldersAndFiles();
    if (window.localStorage.getItem("message1") === null) {
      if (getParent() === "/") {
        var msg = "";
        if (state.isMobile === false) {
          msg = "Right click on file/folder for more actions";
        } else {
          msg = "Long press on file/folder for more actions";
        }
        message.info(msg, 6);
      }

      window.localStorage.setItem("message1", "true");
    }
  }, []);

  const getFoldersAndFiles = () => {
    var viewLink;
    if (state.path.includes("/file/")) {
      viewLink = state.path.split("/file/");
      viewLink = viewLink[viewLink.length - 1];

      setState(
        {
          viewLink: viewLink,
        },
        () => {
          getSharedFile();
        }
      );

      return;
    }
    console.log("present");
    var data = {
      parent: getParent(),
      owner: owner,
      token: token,
      passwords: state.passwords,
    };

    fetch("/api/folder/getFolders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((data) => data.json())
      .then((data) => {
        console.log(data);
        if (data.err === undefined) {
          if (data.passwordRequired === true) {
            openModalPassword();
          } else {
            setState(
              {
                folders: data,
              },
              () => {
                getFiles();
              }
            );
          }
        } else {
          console.error("Error:", data.err);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const getFiles = () => {
    var data = {
      parent: getParent(),
      owner: owner,
      token: token,
      passwords: state.passwords,
    };

    fetch("/api/file/getFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.err === undefined) {
          let nulls = [];
          for (let a = 0; a < data.length; ++a) {
            nulls.push(null);
          }
          setState(
            {
              files: data,
              previewImg: nulls,
            },
            () => {
              getPreviewsImgs(data);
            }
          );
        } else {
          message.error(data.err);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const getParent = () => {
    var parent = state.path.split("/");
    parent = parent[parent.length - 1];

    if (parent.length === 0) {
      parent = "/";
    }

    return parent;
  };

  const createFolder = () => {
    if (state.name.length === 0) {
      message.error(`Insert a name please\n`);
      return;
    }

    var data = {
      owner: owner,
      token: token,
      parent: getParent(),
      name: state.name,
      password: state.password,
      visibleToEveryone: state.visible,
    };
    fetch("/api/folder/createFolder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.err === undefined) {
          getFoldersAndFiles();
          message.success(`${state.name} folder uploaded successfully`);
        } else {
          message.error(`Folder upload failed.`);
        }

        setState({
          showModal: false,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const accessFolder = () => {
    var data = {
      owner: owner,
      token: token,
      idFolder: getParent(),
      parent: getParent(),
      password: state.password,
    };
    fetch("/api/folder/getFolderWithPassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.err === undefined) {
          var newPasswords = [...state.passwords, state.password];
          window.localStorage.setItem(
            "passwords",
            JSON.stringify(newPasswords)
          );

          setState(
            {
              showModalPassword: false,
              disableBottons: false,
              folders: data,
              passwords: newPasswords,
            },
            () => {
              getFiles();
            }
          );
        } else {
          message.error(data.err);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const getShareLink = (type) => {
    var path = state.path.split("/");
    path.pop();
    path = path.join("/") + "/";

    var text = "";
    if (type === "folder") {
      text = path + state.infos.idFolder;
    } else if (type === "file") {
      text = path + "file/" + state.infos.linkView;
    }

    if (!navigator.clipboard) {
      var textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        var successful = document.execCommand("copy");
        if (successful) {
          message.success("Link copied to clipboard!");
        } else {
          message.error("Failed to copy");
        }
      } catch (err) {
        message.error("Failed to copy");
      }
      document.body.removeChild(textArea);
      return;
    }
    navigator.clipboard.writeText(text).then(
      function () {
        message.success("Link copied to clipboard!");
      },
      function (err) {
        message.error("Failed to copy");
      }
    );
  };

  const modifyFolder = () => {
    if (state.name.length === 0) {
      message.error(`Insert a name please\n`);
      return;
    }

    var data = {
      owner: owner,
      token: token,
      idFolder: state.infos.idFolder,
      name: state.name,
      password: state.password,
      visibleToEveryone: state.visible,
    };
    fetch("/api/folder/modifyFolder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.err === undefined) {
          getFoldersAndFiles();

          message.success(`${state.name} folder updated successfully`);
        } else {
          message.error(`Folder update failed.`);
        }

        setState({
          showModal: false,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const searchFilesAndFolders = (e) => {
    setState({
      search: e.target.value,
    });
  };

  const getSharedFile = () => {
    var data = {
      link: state.viewLink,
      owner: owner,
      token: token,
    };

    fetch("/api/file/getSharedFile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.err === undefined) {
          setState(
            {
              files: [data],
              previewImg: [null],
            },
            () => {
              if (data.type.startsWith("image")) {
                getSharedFileDownload(false, true);
              }
            }
          );
        } else {
          console.error("Error:", data.err);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const getSharedFileDownload = (showModel, showPreviewImg) => {
    var data = {
      link: state.viewLink,
      owner: owner,
      token: token,
    };

    setState({
      downloading: true,
    });

    fetch("/api/file/getSharedFileDownload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((data) => data.blob())
      .then((data) => {
        if (data.err === undefined) {
          setState(
            {
              url: URL.createObjectURL(data),
              downloading: false,
            },
            () => {
              if (showPreviewImg === true) {
                setState((prevState) => {
                  let p = prevState.previewImg;
                  p[0] = state.url;
                  return {
                    previewImg: p,
                  };
                });
                return;
              }

              if (showModel === true) {
                var win = window.open(state.url, "_blank");
                win.focus();
              }

              if (state.viewFileClicked === true) {
                setState(
                  {
                    viewFileClicked: false,
                  },
                  () => {
                    viewFile();
                  }
                );
              }
              if (state.downloadFileClicked === true) {
                setState(
                  {
                    downloadFileClicked: false,
                  },
                  () => {
                    downloadFile();
                  }
                );
              }
            }
          );
        } else {
          console.error("Error:", data.err);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const downloadFile = () => {
    if (state.downloading === false) {
      var link = document.createElement("a");
      link.href = state.url;
      link.setAttribute("download", state.name);
      link.click();
    } else {
      setState({
        downloadFileClicked: true,
      });
    }
  };

  const showMessageUploadFile = (info) => {
    if (info.file.status === "done") {
      setTimeout(hide, 0);
      message.success(`${info.file.name} file uploaded successfully`);
      getFoldersAndFiles();
    } else if (info.file.status === "error") {
      setTimeout(hide, 0);
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const clickFolder = () => {
    window.location.href = "/" + state.infos.idFolder;
  };

  const clickFile = (showModel = true) => {
    if (state.path.includes("/file/")) {
      return getSharedFileDownload(showModel, false);
    }

    var data = {
      idFile: state.infos.idFile,
      owner: owner,
      token: token,
      parent: getParent(),
      passwords: state.passwords,
    };

    setState({
      name: state.infos.name,
      // showModalFile: showModel,
      downloading: true,
    });

    fetch("/api/file/getFile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((data) => data.blob())
      .then((data) => {
        setState(
          {
            url: URL.createObjectURL(data),
            downloading: false,
          },
          () => {
            if (showModel === true) {
              var win = window.open(state.url, "_blank");
              win.focus();
            }

            if (state.viewFileClicked === true) {
              setState(
                {
                  viewFileClicked: false,
                },
                () => {
                  viewFile();
                }
              );
            }
            if (state.downloadFileClicked === true) {
              setState(
                {
                  downloadFileClicked: false,
                },
                () => {
                  downloadFile();
                }
              );
            }
          }
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const viewFile = () => {
    if (state.downloading === false) {
      window.location.href = state.url;
    } else {
      setState({
        viewFileClicked: true,
      });
    }
  };

  const openModal = (modifyFolder = false) => {
    if (modifyFolder === true) {
      setState(
        {
          showModal: true,
          modifyFolder: modifyFolder,
          name: state.infos.name,
          password: state.infos.password,
          visible: state.infos.visibleToEveryone,
          showPassword: state.infos.password.length > 0 ? true : false,
        },
        () => {}
      );
    } else {
      setState(
        {
          showModal: true,
          modifyFolder: modifyFolder,
          name: "",
          visible: false,
          password: "",
          showPassword: false,
        },
        () => {}
      );
    }
  };

  const openModalPassword = () => {
    setState(
      {
        showModalPassword: true,
        password: "",
        disableBottons: true,
      },
      () => {}
    );
  };

  const closeModal = () => {
    setState(
      {
        showModal: false,
        modifyFolder: false,
        showModalPassword: false,
        showModalFile: false,
        showModalAccount: false,
      },
      () => {}
    );
  };

  const closeMenu = () => {
    setState({
      mouseX: null,
      mouseY: null,
      showFoldersMenu: false,
      showMainMenu: false,
    });
  };

  const remove = () => {
    var data = {};
    var url = "";

    if (state.isType === "file") {
      data = {
        idFile: state.infos.idFile,
        owner: owner,
        token: token,
      };
      url = "/api/file/deleteFile";
    } else if (state.isType === "folder") {
      data = {
        idFolder: state.infos.idFolder,
        owner: owner,
        token: token,
      };
      url = "/api/folder/deleteFolders";
    }

    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.err === undefined) {
          message.success(`${state.isType} deleted`);
          getFoldersAndFiles();
        } else {
          message.error(data.err);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const getMineType = (mime_type) => {
    let icon_classes = {
      // Media
      image: "far fa-file-image",
      audio: "far fa-file-audio",
      video: "far fa-file-video",
      // Documents
      "application/pdf": "far fa-file-pdf",
      "application/msword": "far fa-file-word",
      "application/vnd.ms-word": "far fa-file-word",
      "application/vnd.oasis.opendocument.text": "far fa-file-word",
      "application/vnd.openxmlformats-officedocument.wordprocessingml":
        "far fa-file-word",
      "application/vnd.ms-excel": "far fa-file-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml":
        "far fa-file-excel",
      "application/vnd.oasis.opendocument.spreadsheet": "far fa-file-excel",
      "application/vnd.ms-powerpoint": "far fa-file-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml":
        "far fa-file-powerpoint",
      "application/vnd.oasis.opendocument.presentation":
        "far fa-file-powerpoint",
      "text/plain": "far fa-file-text",
      "text/html": "far fa-file-code",
      "application/json": "far fa-file-code",
      // Archives
      "application/gzip": "far fa-file-archive",
      "application/zip": "far fa-file-archive",
    };

    for (let k in icon_classes) {
      if (mime_type.indexOf(k) === 0) {
        return icon_classes[k];
      }
    }
    return "far fa-file";
  };

  const openFoldersMenu = () => {
    setState({
      showMainMenu: false,
      showFoldersMenu: true,
    });
  };

  const moveToFolder = (folder) => {
    var data = {};
    var url = "";

    if (state.isType === "file") {
      data = {
        idFile: state.infos.idFile,
        owner: owner,
        token: token,
        parent: folder.idFolder,
      };
      url = "/api/file/changeFolder";
    }
    fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.err === undefined) {
          // message.success(`${state.isType} deleted`)
          getFoldersAndFiles();
        } else {
          message.error(data.err);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const validURL = (str) => {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  };

  const getPreviewsImgs = (data) => {
    console.log(data);
    for (let a = 0; a < data.length; ++a) {
      if (data[a].type.startsWith("image")) {
        getImagePreview(data[a], a);
      }
    }
  };

  const getImagePreview = (item, idx) => {
    var data = {
      idFile: item.idFile,
      owner: owner,
      token: token,
      parent: getParent(),
      passwords: state.passwords,
    };

    fetch("/api/file/getFile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((data) => data.blob())
      .then((data) => {
        let url = URL.createObjectURL(data);
        setState((prevState) => {
          let p = prevState.previewImg;
          p[idx] = url;
          return {
            previewImg: p,
          };
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div>
      <Menu
        keepMounted
        open={state.showFoldersMenu === true}
        onClose={closeMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          state.mouseY !== null && state.mouseX !== null
            ? { top: state.mouseY, left: state.mouseX }
            : undefined
        }
        PaperProps={{
          style: {
            maxHeight: 48 * 4.5,
            width: "250px",
          },
        }}
      >
        {state.folders.length > 0 &&
          state.folders
            .filter((item) => {
              if (item.password.length !== 0) {
                return false;
              }
              return true;
            })
            .map((item, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  moveToFolder(item);
                  closeMenu();
                }}
              >
                <Typography variant="inherit" noWrap>
                  {item.name}
                </Typography>
              </MenuItem>
            ))}
      </Menu>

      {/* right click folder / file */}
      <Menu
        keepMounted
        open={state.showMainMenu === true}
        onClose={closeMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          state.mouseY !== null && state.mouseX !== null
            ? { top: state.mouseY, left: state.mouseX }
            : undefined
        }
      >
        {state.isType === "file" && (
          <div style={{ width: "250px" }}>
            {state.infos !== null &&
              owner === state.infos.owner &&
              state.path.includes("/file/") === false && (
                <div>
                  <MenuItem
                    onClick={() => {
                      remove();
                      closeMenu();
                    }}
                  >
                    <ListItemIcon>
                      <DraftsIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="inherit" noWrap>
                      Remove
                    </Typography>
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      openFoldersMenu();
                    }}
                  >
                    <ListItemIcon>
                      <DraftsIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="inherit" noWrap>
                      Move to Folder
                    </Typography>
                  </MenuItem>
                </div>
              )}

            <MenuItem
              onClick={() => {
                downloadFile();
                closeMenu();
              }}
            >
              <ListItemIcon>
                <DraftsIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit" noWrap>
                Download
              </Typography>
            </MenuItem>

            <MenuItem
              onClick={() => {
                getShareLink("file");
                closeMenu();
              }}
            >
              <ListItemIcon>
                <DraftsIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit" noWrap>
                Get shareable link
              </Typography>
            </MenuItem>
          </div>
        )}

        {state.isType === "folder" && (
          <div style={{ width: "250px" }}>
            {state.infos !== null && owner === state.infos.owner && (
              <MenuItem
                onClick={() => {
                  remove();
                  closeMenu();
                }}
              >
                <ListItemIcon>
                  <DraftsIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  Remove
                </Typography>
              </MenuItem>
            )}

            <MenuItem
              onClick={() => {
                getShareLink("folder");
                closeMenu();
              }}
            >
              <ListItemIcon>
                <DraftsIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit" noWrap>
                Get shareable link
              </Typography>
            </MenuItem>

            {state.infos !== null && owner === state.infos.owner && (
              <MenuItem
                onClick={() => {
                  openModal(true);
                  closeMenu();
                }}
              >
                <ListItemIcon>
                  <DraftsIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  Modify
                </Typography>
              </MenuItem>
            )}
          </div>
        )}
      </Menu>

      {/* change account */}
      <Modal
        show={state.showModalAccount}
        onHide={closeModal}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title
            id="contained-modal-title-vcenter"
            style={{ width: "100%" }}
          >
            Settings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            overflowY: "auto",
            wordBreak: "break-word",
            width: "100%",
            maxHeight: "calc(100vh - 200px)",
            minHeight: "400px",
          }}
        >
          <div>
            <h4>Your secret token:</h4>
            <TextField
              label="Secret token"
              defaultValue={token}
              InputProps={{ readOnly: true }}
              variant="filled"
            />

            <h4 style={{ paddingTop: "30px" }}>Change account:</h4>
            <TextField
              label="New secret token"
              defaultValue=""
              variant="outlined"
              style={{ width: "70%", marginTop: "5px" }}
              onChange={(e) =>
                setState({
                  newToken: e.target.value,
                })
              }
            />
            <Button
              variant="contained"
              style={{
                backgroundColor: "#4caf50",
                marginTop: "15px",
                marginLeft: "10px",
              }}
              // onClick={saveNewToken}
            >
              Save
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* create file with name, password, visible */}
      <Modal
        show={state.showModal}
        onHide={closeModal}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {state.modifyFolder === true ? "Modify Folder" : "New Folder"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ paddingLeft: "30px", paddingRight: "30px" }}>
            <div>
              <InputAntd
                defaultValue={state.name}
                placeholder="Folder name"
                onChange={(e) =>
                  setState({
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <FormControlLabel
                checked={state.showPassword}
                value="password"
                control={
                  <Checkbox
                    color="primary"
                    onClick={() =>
                      setState({
                        showPassword: !state.showPassword,
                      })
                    }
                  />
                }
                label="Password"
              />
              {state.showPassword === true ? (
                <InputAntd
                  defaultValue={state.password}
                  placeholder="Password"
                  type="password"
                  onChange={(e) =>
                    setState({
                      password: e.target.value,
                    })
                  }
                />
              ) : null}
            </div>
            {getParent() !== "/" ? (
              <div>
                <FormControlLabel
                  value="Visible to everyone"
                  checked={state.visible}
                  control={
                    <Checkbox
                      color="primary"
                      onClick={() =>
                        setState({
                          visible: !state.visible,
                        })
                      }
                    />
                  }
                  label="Visible to everyone"
                />
              </div>
            ) : null}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="contained"
            style={{ backgroundColor: "white" }}
            onClick={closeModal}
          >
            Cancel
          </Button>
          {state.modifyFolder === true ? (
            <Button
              variant="contained"
              style={{
                backgroundColor: "#4caf50",
                marginLeft: "20px",
                marginRight: "20px",
              }}
              onClick={modifyFolder}
            >
              Save
            </Button>
          ) : (
            <Button
              variant="contained"
              style={{
                backgroundColor: "#4caf50",
                marginLeft: "20px",
                marginRight: "20px",
              }}
              onClick={createFolder}
            >
              Create
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* ask for password */}
      <Modal
        show={state.showModalPassword}
        onHide={closeModal}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Password Folder
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ paddingLeft: "30px", paddingRight: "30px" }}>
            <InputAntd
              placeholder="Password"
              type="password"
              onChange={(e) =>
                setState({
                  password: e.target.value,
                })
              }
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="contained"
            style={{ backgroundColor: "white" }}
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            style={{
              backgroundColor: "#4caf50",
              marginLeft: "20px",
              marginRight: "20px",
            }}
            onClick={accessFolder}
          >
            Access
          </Button>
        </Modal.Footer>
      </Modal>

      {/* show view or download on click file */}
      <Modal
        show={state.showModalFile}
        onHide={closeModal}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            File{" "}
            {state.name.length > 15
              ? state.name.split("").splice(0, 15).join("") + "..."
              : state.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              paddingLeft: "30px",
              paddingRight: "30px",
              textAlign: "center",
            }}
          >
            <Button
              variant="contained"
              style={{ backgroundColor: "#fbc02d" }}
              onClick={viewFile}
            >
              View
            </Button>
            <Button
              variant="contained"
              style={{
                backgroundColor: "#4caf50",
                marginLeft: "20px",
                marginRight: "20px",
              }}
              onClick={downloadFile}
            >
              Download
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <div className="container">
        <div>
          <TextField
            label="Search"
            type="search"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            style={{
              marginTop: "20px",
              maxWidth: "600px",
              width: "80%",
              paddingLeft: "0px",
              backgroundColor: "white",
            }}
            onChange={searchFilesAndFolders}
          />

          <IconButton
            onClick={() =>
              setState({
                showModalAccount: true,
                newToken: "",
              })
            }
            style={{ marginTop: "20px", marginLeft: "5px" }}
          >
            <SettingsIcon className="icons" />
          </IconButton>
        </div>

        <div style={{ margin: "20px" }}>
          <Row style={{ justifyContent: "center" }}>
            <div>
              <div
                style={{ margin: "10px" }}
                onClick={() => {
                  if (getParent() === "/") {
                    message.error(
                      "Select or create a folder before uploading files"
                    );
                  }
                }}
              >
                <Upload
                  {...{
                    disabled:
                      getParent() === "/" || state.disableBottons === true
                        ? true
                        : false,
                    name: "file",
                    action: "/api/file/uploadFile",
                    beforeUpload: (file, fileList) => {
                      var files = fileList;
                      let size = 16000000;
                      for (var a = 0; a < files.length; a++) {
                        if (files[a].size > size) {
                          message.error(
                            `${files[a].name} is too large, please pick a smaller file\n`
                          );
                          return false;
                        } else {
                          setState({
                            sizeFile: files[a].size,
                          });
                        }
                      }

                      hide = message.loading("Uploading..", 0);

                      return true;
                    },
                    data: {
                      owner: owner,
                      token: token,
                      parent: getParent(),
                      password: "", // TODO
                      visibleToEveryone: true, // TODO
                      sizeFile: state.sizeFile,
                    },
                    showUploadList: false,
                    onChange: showMessageUploadFile,
                  }}
                >
                  <Button
                    variant="contained"
                    className="buttons-folders"
                    disabled={state.disableBottons}
                    style={{
                      textAlign: "left",
                      justifyContent: "left",
                      backgroundColor: "#2196f3",
                      borderRadius: "7px",
                      width: "auto",
                    }}
                    startIcon={<UploadOutlined />}
                  >
                    Upload File
                  </Button>
                </Upload>
              </div>
            </div>

            <div>
              <Button
                variant="contained"
                className="buttons-folders"
                disabled={state.disableBottons}
                style={{
                  margin: "10px",
                  textAlign: "left",
                  justifyContent: "left",
                  backgroundColor: "#ff9800",
                  borderRadius: "7px",
                  marginLeft: "20px",
                  width: "auto",
                }}
                startIcon={<FolderAddOutlined />}
                onClick={openModal}
              >
                Create Folder
              </Button>
            </div>
          </Row>
        </div>

        <Row
          style={{
            maxHeight: "230px",
            overflow: "auto",
            overflowY: "scroll",
            justifyContent: "center",
          }}
        >
          {state.folders.length > 0 &&
            state.folders
              .filter((item) => {
                if (state.search.length > 0) {
                  let re = new RegExp(state.search.toLowerCase(), "i");
                  return re.test(item.name.toLowerCase());
                } else {
                  return true;
                }
              })
              .map((item) => {
                return (
                  <div className="folders" key={item._id}>
                    <Button
                      variant="contained"
                      className="buttons-folders"
                      style={{
                        textTransform: "none",
                        backgroundColor: "white",
                        textAlign: "left",
                        justifyContent: "left",
                        borderRadius: "7px",
                        fontSize: "17px",
                        paddingLeft: "20px",
                      }}
                      startIcon={
                        item.password.length !== 0 ? (
                          <LockIcon
                            className="icons"
                            style={{ marginRight: "10px" }}
                          />
                        ) : item.visibleToEveryone === true ? (
                          <FolderSharedIcon
                            className="icons"
                            style={{ marginRight: "10px" }}
                          />
                        ) : (
                          <FolderIcon
                            className="icons"
                            style={{ marginRight: "10px" }}
                          />
                        )
                      }
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setState({
                          mouseX: e.clientX - 2,
                          mouseY: e.clientY - 4,
                          showMainMenu: true,
                          isType: "folder",
                          infos: item,
                        });
                      }}
                      onClick={() => {
                        setState(
                          {
                            isType: "folder",
                            infos: item,
                          },
                          () => {
                            clickFolder();
                          }
                        );
                      }}
                    >
                      <Typography variant="inherit" noWrap>
                        {item.name}
                      </Typography>
                    </Button>
                  </div>
                );
              })}
        </Row>

        <Divider />

        <Row
          style={{
            overflow: "auto",
            overflowY: "scroll",
            justifyContent: "center",
            height: "auto",
          }}
        >
          {state.files.length > 0 &&
            state.files
              .filter((item) => {
                if (state.search.length > 0) {
                  let re = new RegExp(state.search.toLowerCase(), "i");
                  return re.test(item.name.toLowerCase());
                } else {
                  return true;
                }
              })
              .map((item, idx) => {
                return (
                  <div className="files" key={item._id}>
                    <Button
                      props={item}
                      variant="contained"
                      className="buttons-files"
                      style={{
                        textTransform: "none",
                        backgroundColor: "white",
                        textAlign: "left",
                        justifyContent: "left",
                        fontSize: "17px",
                        paddingLeft: "20px",
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setState(
                          {
                            mouseX: e.clientX - 2,
                            mouseY: e.clientY - 4,
                            showMainMenu: true,
                            isType: "file",
                            infos: item,
                          },
                          () => clickFile(false)
                        );
                      }}
                      onClick={() => {
                        setState(
                          {
                            isType: "file",
                            infos: item,
                          },
                          () => {
                            clickFile();
                          }
                        );
                      }}
                    >
                      {item.type.startsWith("image") ? (
                        <img
                          width="210"
                          height="210"
                          src={
                            state.previewImg.length - 1 >= idx &&
                            state.previewImg[idx] !== null
                              ? state.previewImg[idx]
                              : ""
                          }
                        />
                      ) : (
                        <i
                          className={getMineType(item.type)}
                          style={{ fontSize: "50px", marginRight: "10px" }}
                        ></i>
                      )}
                      {item.type.startsWith("image") === false && (
                        <Typography variant="inherit" noWrap>
                          {item.name}
                        </Typography>
                      )}
                    </Button>
                  </div>
                );
              })}
        </Row>
      </div>
    </div>
  );
};

export default Home;
