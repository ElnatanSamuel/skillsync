import React, { createContext, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const showToast = (message, type = "success", options = {}) => {
    const defaultOptions = {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    };

    const toastOptions = { ...defaultOptions, ...options };

    switch (type) {
      case "success":
        toast.success(message, toastOptions);
        break;
      case "error":
        toast.error(message, toastOptions);
        break;
      case "info":
        toast.info(message, toastOptions);
        break;
      case "warning":
        toast.warning(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
    }
  };

  const success = (message, options = {}) =>
    showToast(message, "success", options);
  const error = (message, options = {}) => showToast(message, "error", options);
  const info = (message, options = {}) => showToast(message, "info", options);
  const warning = (message, options = {}) =>
    showToast(message, "warning", options);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <ToastContainer
        theme="dark"
        position="top-right"
        style={{ zIndex: 9999 }}
      />
    </ToastContext.Provider>
  );
};
