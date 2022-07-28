const Deudas = require("../models/Deudas");
const OrdenesFlow = require("../models/OrdenesFlow");
const { cancelarOrdenPago } = require("../controllers/pagosController");
const { handleError } = require("../utils/errorHandler");

exports.getDeudasPaciente = async (req, res) => {
  try {
    const { pagadas } = req.query;
    const filter = { rutPaciente: req.rutPaciente };
    if (pagadas === "false") filter.deuda = { $gt: 0 };
    if (pagadas === "true") filter.deuda = { $eq: 0 };

    const deudas = await Deudas.find(filter)
      .select("-_id -__v -correlativo")
      .sort({ fecha: 1 })
      .lean()
      .exec();

    for (let deuda of deudas) {
      if (deuda.rutPaciente === deuda.rutDeudor) deuda.nombreDeudor = null;
      delete deuda.rutDeudor;
      delete deuda.rutPaciente;
      // }

      const pagosEnProceso = await OrdenesFlow.find({
        "pagos.identificadorDeuda": deuda.identificador,
        "pagos.tipoDeuda": deuda.tipo,
        "pagos.codigoEstablecimientoDeuda": deuda.codigoEstablecimiento,
        estado: {
          $in: ["EN_PROCESO"],
        },
      }).exec();

      for (let pago of pagosEnProceso) {
        await cancelarOrdenPago(pago);
      }

      const pagoPendiente = await OrdenesFlow.findOne({
        "pagos.identificadorDeuda": deuda.identificador,
        "pagos.tipoDeuda": deuda.tipo,
        "pagos.codigoEstablecimientoDeuda": deuda.codigoEstablecimiento,
        estado: {
          $in: [
            "EN_PROCESO",
            "PAGADA",
            "ERROR_FLOW",
            "ERROR_FLOW_CONFIRMADO",
            "ERROR_FLOW_INFORMADO",
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
