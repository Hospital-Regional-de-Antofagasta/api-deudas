const Pagos = require("../models/Pagos");
const { getMensajes } = require("../config");
const { handleError } = require("../utils/errorHandler");

exports.validarToken = async (req, res, next) => {
  console.log("validarToken");
  try {
    const { token } = req.body;

    if (!token)
      return res
        .status(401)
        .send({ respuesta: await getMensajes("forbiddenAccess") });

    const pago = await Pagos.findOne({token}).exec();

    if (!pago)
      return res
        .status(401)
        .send({ respuesta: await getMensajes("forbiddenAccess") });

    next();
  } catch (error) {
    await handleError(error, req, res);
  }
};
