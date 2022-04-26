const { getMensajes } = require("../config");

const sendValidationError = async (res, error) => {
  let errors = {};
  for (let prop in error.errors) {
    errors[prop] = error.errors[prop].message;
  }
  return res.status(400).send({
    respuesta: await getMensajes("badRequest"),
    detalles_error: errors,
  });
};

const sendDevServerError = async (res, error) => {
  return res.status(500).send({
    respuesta: await getMensajes("serverError"),
    detalles_error: {
      nombre: error.name,
      mensaje: error.message,
    },
  });
};

const sendServerError = async (res) => {
  res.status(500).send({ respuesta: await getMensajes("serverError") });
};

exports.handleError = async (res, error) => {
  if (error.name === "ValidationError")
    return await sendValidationError(res, error);
  if (process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "test")
    return await sendDevServerError(res, error);
  await sendServerError(res);
};

exports.sendCustomError = async (
  res,
  statusCode,
  message,
  errorDetails
) => {
  if (process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "test")
    return res.status(statusCode).send({
      respuesta: await getMensajes(message),
      detalles_error: errorDetails,
    });
  return res.status(statusCode).send({
    respuesta: await getMensajes(message),
  });
};
