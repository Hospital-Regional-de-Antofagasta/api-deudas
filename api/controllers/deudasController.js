const Deudas = require("../models/Deudas");
const { manejarError } = require("../utils/errorController");

exports.getDeudasPaciente = async (req, res) => {
  try {
    const deudas = await Deudas.find({ rutPaciente: req.rutPaciente }).exec();
    res.status(200).send(deudas)
  } catch (error) {
    manejarError(rea, res, error);
  }
}


