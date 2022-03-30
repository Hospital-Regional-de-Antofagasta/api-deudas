const Deudas = require("../models/Deudas");
const OrdenesFlow = require("../models/OrdenesFlow");
const { cancelarOrdenPago } = require("../controllers/pagosController");
const { handleError } = require("../utils/errorHandler");

exports.getDeudasPaciente = async (req, res) => {
  try {
    const { filtro } = req.query;
    const filter = { rutPaciente: req.rutPaciente };
    if (filtro === "no_pagadas") filter.deuda = { $gt: 0 };
    if (filtro === "pagadas") filter.deuda = { $eq: 0 };

    const deudas = await Deudas.find(filter).sort({ fecha: 1 }).lean().exec();

    for (let deuda of deudas) {
      if (deuda.rutPaciente === deuda.rutDeudor) deuda.nombreDeudor = null;

      deuda.rutDeudor = null;
      deuda.rutPaciente = null;

      delete deuda.rutDeudor;
      delete deuda.rutPaciente;

      const pagosEnProceso = await OrdenesFlow.find({
        "pagos.idDeuda": deuda._id,
        estado: {
          $in: ["EN_PROCESO"],
        },
      }).exec();

      for (let pago of pagosEnProceso) {
        await cancelarOrdenPago(pago);
      }

      const pagoPendiente = await OrdenesFlow.findOne({
        "pagos.idDeuda": deuda._id,
        estado: {
          $in: [
            "EN_PROCESO",
            "PAGADA",
            "ERROR_FLOW",
            "EN_VALIDACION",
            "EN_REGULARIZACION",
          ],
        },
      }).exec();

      deuda.pagoEnProceso = false;
      if (pagoPendiente) deuda.pagoEnProceso = true;
    }

    res.status(200).send(deudas);
  } catch (error) {
    await handleError(res, error);
  }
};
