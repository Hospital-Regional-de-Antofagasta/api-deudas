const Pagos = require("../models/Pagos");
const { handleError, sendCustomError } = require("../utils/errorHandler");

exports.validarToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token)
      return await sendCustomError(
        res,
        401,
        "forbiddenAccess",
        ""
      );

    const pago = await Pagos.findOne({ token }).exec();

    if (!pago)
      return await sendCustomError(
        res,
        401,
        "forbiddenAccess",
        ""
      );

    next();
  } catch (error) {
    await handleError(res, error);
  }
};
