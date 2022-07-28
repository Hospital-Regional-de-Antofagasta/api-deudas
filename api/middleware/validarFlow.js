const OrdenesFlow = require("../models/OrdenesFlow");
const { handleError, sendCustomError } = require("../utils/errorHandler");

exports.validarToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) return await sendCustomError(res, 401, "forbiddenAccess", "");

    const ordenFlow = await OrdenesFlow.findOne({ token }).exec();

    if (!ordenFlow) return await sendCustomError(res, 401, "forbiddenAccess", "");

    next();
  } catch (error) {
    await handleError(res, error);
  }
};
