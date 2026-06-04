export const isForbiddenError = (err) => {
  return err.response?.status === 403;
};

export const isUnauthorizedError = (err) => {
  return err.response?.status === 401;
};

export const getApiErrorMessage = (err, fallback = "Something went wrong") => {
  return err.response?.data?.message || fallback;
};