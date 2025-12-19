let toastRef;

export const registerToast = (ref) => {
  toastRef = ref;
};

export const toast = {
  success: (message) => toastRef?.show(message, 'success'),
  error: (message) => toastRef?.show(message, 'error'),
  info: (message) => toastRef?.show(message, 'info'),
};
