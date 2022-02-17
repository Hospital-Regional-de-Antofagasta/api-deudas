const Deudas = require("../models/Deudas");
const Pagos = require("../models/Pagos");
const { getMensajes } = require("../config");
const { handleError } = require("../utils/errorHandler");
const { isObjectEmpty } = require("../utils/utils");

exports.validarPagos = async (req, res, next) => {
  console.log("validarPagos", "validarPagos");
  try {
    const pagos = req.body;

    if (!pagos)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });

    if (isObjectEmpty(pagos))
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });

    if (pagos.length === 0)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("badRequest") });

    for (let pago of pagos) {
      if (!pago.idDeuda)
        return res
          .status(400)
          .send({ respuesta: await getMensajes("badRequest") });

      if (!pago.abono)
        return res
          .status(400)
          .send({ respuesta: await getMensajes("badRequest") });
    }

    next();
  } catch (error) {
    await handleError(error, req, res);
  }
};

exports.validarExisteDeuda = async (req, res, next) => {
  console.log("validarPagos", "validarExisteDeuda");
  try {
    const pagos = req.body;

    for (let pago of pagos) {
      const deuda = await Deudas.findOne({ _id: pago.idDeuda });

      if (!deuda)
        return res
          .status(400)
          .send({ respuesta: await getMensajes("deudaNoEncontrada") });
    }

    next();
  } catch (error) {
    await handleError(error, req, res);
  }
};

exports.validarDeudaNoTengaPagoPendiente = async (req, res, next) => {
  console.log("validarPagos", "validarDeudaNoTengaPagoPendiente");
  try {
    const pagos = req.body;

    for (let pago of pagos) {
      const pagosPendientes = await Pagos.findOne({
        "deudas.idDeuda": pago.idDeuda,
        estado: {
          $in: ["EN_PROCESO", "PAGADO", "ERROR_FLOW", "ERROR_VALIDACION"],
        },
      });

      if (pagosPendientes)
        return res
          .status(400)
          .send({ respuesta: await getMensajes("pagoPendiente") });
    }

    next();
  } catch (error) {
    await handleError(error, req, res);
  }
};

exports.validarMonto = async (req, res, next) => {
  console.log("validarPagos", "validarMonto");
  try {
    const pagos = req.body;

    for (let pago of pagos) {
      const deuda = await Deudas.findOne({ _id: pago.idDeuda });

      if (pago.abono > deuda.deuda)
        return res
          .status(400)
          .send({ respuesta: await getMensajes("badRequest") });

      if (pago.abono < 350)
        return res
          .status(400)
          .send({ respuesta: await getMensajes("badRequest") });
    }

    next();
  } catch (error) {
    await handleError(error, req, res);
  }
};
