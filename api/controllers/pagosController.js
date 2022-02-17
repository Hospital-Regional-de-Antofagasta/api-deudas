const { v4: uuidv4 } = require("uuid");
const Pagos = require("../models/Pagos");
const Deudas = require("../models/Deudas");
const flowController = require("../controllers/flowController");
const { getParametrosFlow, getMensajes } = require("../config");
const { handleError } = require("../utils/errorHandler");

const baseUrl = process.env.BASE_URL;

exports.crear = async (req, res) => {
  console.log("pagos", "crear");
  try {
    const pagos = req.body;

    const { subject, currency, paymentMethod, timeout, payment_currency } =
      await getParametrosFlow();

    const params = {
      amount: calcularMonto(pagos),
      commerceOrder: uuidv4(),
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
      return res
        .status(200)
        .send({
          respuesta: await getMensajes("flowError"),
          detalles_error: flowPayment,
        });

    const { token, url, flowOrder } = flowPayment;

    if (!token || !url || !flowOrder)
      return res
        .status(200)
        .send({
          respuesta: await getMensajes("flowError"),
          detalles_error: flowPayment,
        });

    await Pagos.create({
      token,
      flowOrder,
      deudas: pagos,
    });

    const urlPagar = `${url}?token=${token}`;

    res.status(200).send({ urlPagoFlow: urlPagar });
  } catch (error) {
    await handleError(error, req, res);
  }
};

const calcularMonto = (pagos) => {
  console.log("pagos", "calcularMonto");
  let monto = 0;
  for (let pago of pagos) {
    monto += pago.abono;
  }
  return monto;
};

const detallesPago = async (pagos) => {
  console.log("pagos", "detallesPago");
  const detallesPago = [];
  for (let pago of pagos) {
    const deuda = await Deudas.findOne({ _id: pago.idDeuda }).exec();
    detallesPago.push({
      identificadorPrograma: deuda.identificadorPrograma,
      tipoPrograma: deuda.tipoPrograma,
      abono: pago.abono,
    });
  }
  return detallesPago;
};
