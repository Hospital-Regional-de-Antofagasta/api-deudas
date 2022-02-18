const Deudas = require("../models/Deudas");
const Pagos = require("../models/Pagos");
const { handleError, sendCustomError } = require("../utils/errorHandler");
const { isObjectEmpty } = require("../utils/utils");

exports.validarPagos = async (req, res, next) => {
  try {
    const pagos = req.body;

    if (!pagos)
      return await sendCustomError(
        res,
        400,
        "badRequest",
        "Se debe ingresar los pagos."
      );

    if (isObjectEmpty(pagos))
      return await sendCustomError(
        res,
        400,
        "badRequest",
        "Se debe ingresar los pagos."
      );

    if (pagos.length === 0)
      return await sendCustomError(
        res,
        400,
        "badRequest",
        "Se debe ingresar los pagos."
      );

    for (let pago of pagos) {
      if (!pago.idDeuda)
        return await sendCustomError(
          res,
          400,
          "badRequest",
          "El 'idDeuda' es obligatorio."
        );

      if (!pago.abono)
        return await sendCustomError(
          res,
          400,
          "badRequest",
          "El 'abono' es obligatorio"
        );
    }

    next();
  } catch (error) {
    await handleError(res, error);
  }
};

exports.validarExisteDeuda = async (req, res, next) => {
  try {
    const pagos = req.body;

    for (let pago of pagos) {
      const deuda = await Deudas.findOne({ _id: pago.idDeuda });

      if (!deuda)
        return await sendCustomError(
          res,
          400,
          "deudaNoEncontrada",
          "No se pudo encontrar la deuda."
        );
    }

    next();
  } catch (error) {
    await handleError(res, error);
  }
};

exports.validarDeudaNoTengaPagoPendiente = async (req, res, next) => {
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
        return await sendCustomError(
          res,
          400,
          "pagoPendiente",
          "La deuda tiene un pago pendiente."
        );
    }

    next();
  } catch (error) {
    await handleError(res, error);
  }
};

exports.validarMonto = async (req, res, next) => {
  try {
    const pagos = req.body;

    for (let pago of pagos) {
      const deuda = await Deudas.findOne({ _id: pago.idDeuda });

      if (pago.abono > deuda.deuda)
        return await sendCustomError(
          res,
          400,
          "badRequest",
          "El 'abono' debe ser menor o igual a la deuda."
        );

      if (pago.abono < 350)
        return await sendCustomError(
          res,
          400,
          "badRequest",
          "El 'abono' debe ser mayor a $350."
        );
    }

    next();
  } catch (error) {
    await handleError(res, error);
  }
};
