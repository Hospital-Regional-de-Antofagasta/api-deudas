const Deudas = require("../models/Deudas");
const Pagos = require("../models/Pagos");
const flowController = require("../controllers/flowController");
const { handleError } = require("../utils/errorHandler");

exports.getDeudasPaciente = async (req, res) => {
  try {
    const deudas = await Deudas.find({ rutPaciente: req.rutPaciente })
      .sort({ fecha: 1 })
      .lean()
      .exec();

    for (let deuda of deudas) {
      const pagosEnProceso = await Pagos.find({
        "pagos.idDeuda": deuda._id,
        estado: {
          $in: ["EN_PROCESO"],
        },
      }).exec();

      for (let pago of pagosEnProceso) {
        await cancelarOrdenPago(pago);
      }

      const pagoPendiente = await Pagos.findOne({
        "pagos.idDeuda": deuda._id,
        estado: {
          $in: ["PAGADO", "ERROR_FLOW", "ERROR_VALIDACION"],
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
    await Pagos.updateOne(
      { token: pago.token },
      { estado: "ERROR_FLOW" }
    ).exec();
    return;
  }
  await Pagos.updateOne({ token: pago.token }, { estado: "ANULADO" }).exec();
  return;
};
