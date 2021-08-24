import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
  RESET_LINK_FAIL,
  RESET_LINK_SEND,
  RESET_SUCCESS,
  RESET_FAIL,
  FILE_LIST_SUCCESS,
  FILE_LIST_FAIL,
  FILE_DELETE_SUCCESS,
  FILE_DELETE_FAIL,
  FILE_UPLOAD_SUCCESS,
  FILE_UPLOAD_FAIL,
} from "../types";

// eslint-disable-next-line
export default (state, action) => {
  switch (action.type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        userRegistered: true,
        isAuthenticated: false,
        loading: false,
      };
    case LOGIN_SUCCESS:
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case RESET_LINK_SEND:
    case RESET_SUCCESS:
      return {
        ...state,
        message: action.payload,
        loading: false,
      };
    // case FILE_LIST_SUCCESS:
    //   return {
    //     ...state,
    //     files: action.payload,
    //     loading: false,
    //   }
    // case FILE_DELETE_SUCCESS:
    // case FILE_UPLOAD_SUCCESS:
    //   return {
    //     ...state,
    //     message: action.payload.message,
    //     loading: false,
    //   }
    // case FILE_LIST_FAIL:
    // case FILE_DELETE_FAIL:
    // case FILE_UPLOAD_FAIL:
    //   return {
    //     ...state,
    //     error: action.payload,
    //     loading: false,
    //   }
    case REGISTER_FAIL:
    case AUTH_ERROR:
    case LOGIN_FAIL:
    case LOGOUT:
    case RESET_LINK_FAIL:
    case RESET_FAIL:
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        userRegistered: null,
        error: action.payload,
        message: null,
        files: [],
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
        userRegistered: null,
        message: null,
      };
    default:
      return state;
  }
};
