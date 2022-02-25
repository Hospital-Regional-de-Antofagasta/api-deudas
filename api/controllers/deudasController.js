const Deudas = require("../models/Deudas");
const OrdenesFlow = require("../models/OrdenesFlow");
const flowController = require("../controllers/flowController");
const { handleError } = require("../utils/errorHandler");

exports.getDeudasPaciente = async (req, res) => {
  try {
    const deudas = await Deudas.find({ rutPaciente: req.rutPaciente })
      .sort({ fecha: 1 })
      .lean()
      .exec();

    for (let deuda of deudas) {
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
          $in: ["EN_PROCESO", "PAGADA", "ERROR_FLOW", "ERROR_VALIDACION", "EN_REGULARIZACION"],
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

const cancelarOrdenPago = async (pago) => {
  const canceledOrder = await flowController.cancelPaymentOrder({
    token: pago.token,
  });
  // si no se pudo cancelar la orden actualizar estado a ERROR_FLOW
  if (!canceledOrder.flowOrder) {
    await OrdenesFlow.updateOne(
      { token: pago.token },
      { estado: "ERROR_FLOW" }
    ).exec();
    return;
  }
  await OrdenesFlow.updateOne(
    { token: pago.token },
    { estado: "ANULADA" }
  ).exec();
  return;
};
