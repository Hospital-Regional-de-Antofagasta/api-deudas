const Deudas = require("../models/Deudas");
const { handleError } = require("../utils/errorHandler");

exports.getDeudasPaciente = async (req, res) => {
  try {
    const deudas = await Deudas.find({ rutPaciente: req.rutPaciente })
      .sort({ fecha: 1 })
      .exec();
    res.status(200).send(deudas);
  } catch (error) {
    await handleError(error, req, res);
  }
};
