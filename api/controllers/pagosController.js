const { v4: uuidv4 } = require("uuid");
const OrdenesFlow = require("../models/OrdenesFlow");
const flowController = require("../controllers/flowController");
const { getParametrosFlow } = require("../config");
const { handleError, sendCustomError } = require("../utils/errorHandler");
const { isObjectEmpty } = require("../utils/utils");

const baseUrl = process.env.BASE_URL;

const crear = async (req, res) => {
  try {
    const pagos = req.body;
    const rutPaciente = req.rutPaciente;

    const commerceOrder = uuidv4();

    // TODO: obtener email pagador y rut pagador en caso de que pague el deudor
    const ordenFlow = {
      pagos,
      commerceOrder,
      rutPaciente,
      rutPagador: rutPaciente,
      emailPagador: req.emailPaciente,
    };

    const cancelacionFallida = await cancelarOrdenesPagosPendientes(
      ordenFlow?.pagos
    );
    if (cancelacionFallida)
      return await sendCustomError(
        res,
        200,
        "flowUnavailable",
        cancelacionFallida
      );

    // El Model.validate(obj) no entrega todos los mensajes de error
    await OrdenesFlow.validate(ordenFlow);

    const { subject, currency, paymentMethod, timeout, payment_currency } =
      await getParametrosFlow();

    console.log("urlConfirmation", `${baseUrl}/v1/pagos/flow-confirmation`)

    const params = {
      amount: calcularMonto(ordenFlow.pagos),
      commerceOrder: ordenFlow.commerceOrder,
      email: ordenFlow.emailPagador,
      subject,
      currency,
      paymentMethod,
      urlConfirmation: `${baseUrl}/v1/pagos/flow-confirmation`,
      urlReturn: `${baseUrl}/v1/pagos/flow-return`,
      optional: ordenFlow.pagos,
      timeout,
      payment_currency,
    };

    const flowPayment = await flowController.createFlowPayment(params);

    if (!flowPayment)
      return await sendCustomError(res, 200, "flowUnavailable", flowPayment);

    const { token, url, flowOrder } = flowPayment;

    if (!token || !url || !flowOrder)
      return await sendCustomError(res, 200, "flowUnavailable", flowPayment);

    ordenFlow.token = token;
    ordenFlow.flowOrder = flowOrder;

    await OrdenesFlow.create(ordenFlow);

    const urlPagar = `${url}?token=${token}`;

    res.status(200).send({ urlPagoFlow: urlPagar });
  } catch (error) {
    await handleError(res, error);
  }
};

const calcularMonto = (pagos) => {
  let monto = 0;
  for (let pago of pagos) {
    monto += pago.abono;
  }
  return monto;
};

const cancelarOrdenesPagosPendientes = async (pagos) => {
  if (isObjectEmpty(pagos)) return;
  for (let pago of pagos) {
    const pagosEnProceso = await OrdenesFlow.find({
      "pagos.identificadorDeuda": pago.identificadorDeuda,
      "pagos.tipoDeuda": pago.tipoDeuda,
      "pagos.codigoEstablecimientoDeuda": pago.codigoEstablecimientoDeuda,
      estado: { $in: ["EN_PROCESO"] },
    }).exec();
    for (let pagoEnProceso of pagosEnProceso) {
      if (pagoEnProceso) {
        const cancelacionFallida = await cancelarOrdenPago(pagoEnProceso);
        if (cancelacionFallida) return cancelacionFallida;
      }
    }
  }
  return false;
};

const cancelarOrdenPago = async (pago) => {
  const canceledOrder = await flowController.cancelPaymentOrder({
    token: pago.token,
  });
  if (!canceledOrder.flowOrder) {
    // si no se pudo cancelar la orden
    await OrdenesFlow.updateOne(
      { flowOrder: pago.flowOrder },
      { estado: "ERROR_FLOW" }
    ).exec();
    return canceledOrder;
  }
  await OrdenesFlow.updateOne(
    { flowOrder: pago.flowOrder },
    { estado: "ANULADA" }
  ).exec();
  return false;
};

module.exports = { cancelarOrdenPago, crear };
