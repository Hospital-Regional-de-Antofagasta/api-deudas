const { v4: uuidv4 } = require("uuid");
const OrdenesFlow = require("../models/OrdenesFlow");
const Deudas = require("../models/Deudas");
const flowController = require("../controllers/flowController");
const { getParametrosFlow } = require("../config");
const { handleError, sendCustomError } = require("../utils/errorHandler");

const baseUrl = process.env.BASE_URL;

exports.crear = async (req, res) => {
  try {
    const pagos = req.body;
    const rutPaciente = req.rutPaciente;

    const { subject, currency, paymentMethod, timeout, payment_currency } =
      await getParametrosFlow();

    const commerceOrder = uuidv4();

    const params = {
      amount: calcularMonto(pagos),
      commerceOrder,
      email: req.emailPaciente,
      subject,
      currency,
      paymentMethod,
      urlConfirmation: `${baseUrl}/v1/pagos/flow-confirmation`,
      urlReturn: `${baseUrl}/v1/pagos/flow-return`,
      optional: await detallesPago(pagos),
      timeout,
      payment_currency,
    };

    const flowPayment = await flowController.createFlowPayment(params);

    if (!flowPayment)
      return await sendCustomError(res, 500, "flowUnavailable", flowPayment);

    const { token, url, flowOrder } = flowPayment;

    if (!token || !url || !flowOrder)
      return await sendCustomError(res, 500, "flowUnavailable", flowPayment);

    await OrdenesFlow.create({
      token,
      flowOrder,
      pagos,
      commerceOrder,
      rutPaciente,
    });

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

const detallesPago = async (pagos) => {
  const detallesPago = [];
  for (let pago of pagos) {
    const deuda = await Deudas.findOne({ _id: pago.idDeuda }).exec();
    detallesPago.push({
      identificador: deuda.identificador,
      tipo: deuda.tipo,
      abono: pago.abono,
    });
  }
  return detallesPago;
};
