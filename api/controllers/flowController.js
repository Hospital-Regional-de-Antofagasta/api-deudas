var CryptoJS = require("crypto-js");
const Pagos = require("../models/Pagos");
const { getMensajes } = require("../config");
const { httpRequest } = require("../utils/httpRequests");
const { handleError, sendCustomError } = require("../utils/errorHandler");

const apiKey = process.env.FLOW_API_KEY;
const secretKey = process.env.FLOW_SECRET_KEY;
const flowHosting = process.env.FLOW_HOSTING;

exports.confirmation = async (req, res) => {
  try {
    res.sendStatus(200);
  } catch (error) {
    await handleError(res, error);
  }
};

exports.return = async (req, res) => {
  try {
    const { token } = req.body;

    const paymentStatus = await getPaymentStatus({ token });

    if (!paymentStatus.flowOrder) {
      await Pagos.updateOne({ token }, { estado: "ERROR_FLOW" }).exec();
      return await sendCustomError(res, 500, "flowError", paymentStatus);
    }

    let estado;
    let respuesta;

    switch (paymentStatus.status) {
      case 1:
        const canceledOrder = await cancelPaymentOrder({ token });
        if (!canceledOrder.flowOrder) {
          await Pagos.updateOne({ token }, { estado: "ERROR_FLOW" }).exec();
          return await sendCustomError(res, 500, "flowError", canceledOrder);
        }
        estado = "ANULADO";
        respuesta = await getMensajes("pagoAnulado");
        break;
      case 2:
        estado = "PAGADO";
        respuesta = await getMensajes("pagoRealizado");
        break;
      case 3:
        estado = "RECHAZADO";
        respuesta = await getMensajes("pagoRechazado");
        break;
      case 4:
        estado = "ANULADO";
        respuesta = await getMensajes("pagoAnulado");
        break;
    }
    await Pagos.updateOne({ token }, { estado }).exec();

    res.status(200).send({ estado, respuesta });
  } catch (error) {
    await handleError(res, error);
  }
};

exports.createFlowPayment = async (params) => {
  params = await signParameters(params);

  const config = {
    headers: {
      contentType: "application/x-www-form-urlencoded",
    },
  };

  var bodyFormData = new URLSearchParams();
  for (let key in params) {
    bodyFormData.append(key, params[key]);
  }

  const respuesta = await httpRequest(
    "POST",
    `${flowHosting}/api/payment/create`,
    bodyFormData,
    config,
    10
  );

  if (!respuesta?.data) return respuesta;

  return respuesta.data;
};

const getPaymentStatus = async (params) => {
  params = await signParameters(params);

  const config = { params };

  const respuesta = await httpRequest(
    "GET",
    `${flowHosting}/api/payment/getStatus`,
    null,
    config,
    10
  );

  if (!respuesta?.data) return respuesta;

  return respuesta.data;
};

const cancelPaymentOrder = async (params) => {
  params = await signParameters(params);

  const config = {
    headers: {
      contentType: "application/x-www-form-urlencoded",
    },
  };

  var bodyFormData = new URLSearchParams();
  for (let key in params) {
    bodyFormData.append(key, params[key]);
  }

  const respuesta = await httpRequest(
    "POST",
    `${flowHosting}/api/payment/cancel`,
    bodyFormData,
    config,
    10
  );

  if (!respuesta?.data) return respuesta;

  return respuesta.data;
};

const signParameters = async (params) => {
  params.apiKey = apiKey;
  // ordenar parametros alfabeticamente
  params = Object.keys(params)
    .sort()
    .reduce((r, k) => ((r[k] = params[k]), r), {});

  let paramsToSign = "";
  for (let key in params) {
    paramsToSign = `${paramsToSign}${key}${params[key]}`;
  }

  const signedParams = CryptoJS.HmacSHA256(paramsToSign, secretKey).toString(
    CryptoJS.enc.Hex
  );

  params.s = signedParams;
  return params;
};
