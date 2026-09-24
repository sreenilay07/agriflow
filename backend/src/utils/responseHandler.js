const sendSuccess = (res, messageOrData = 'Success', dataOrMessage = {}, statusCode = 200, meta = undefined) => {
  let message = 'Success';
  let data = {};

  if (typeof messageOrData === 'string') {
    message = messageOrData;
    data = dataOrMessage !== undefined ? dataOrMessage : {};
  } else if (typeof dataOrMessage === 'string') {
    message = dataOrMessage;
    data = messageOrData !== undefined ? messageOrData : {};
  } else {
    data = messageOrData !== undefined ? messageOrData : {};
  }

  const response = {
    success: true,
    message,
    data
  };

  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, message = 'An error occurred', statusCode = 500, errorCode = 'INTERNAL_ERROR', errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    errors
  });
};

module.exports = {
  sendSuccess,
  sendError
};
