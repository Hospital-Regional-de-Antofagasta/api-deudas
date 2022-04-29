var CryptoJS = require("crypto-js");
const OrdenesFlow = require("../models/OrdenesFlow");
const { getMensajes } = require("../config");
const { httpRequest } = require("../utils/httpRequests");
const { handleError, sendCustomError } = require("../utils/errorHandler");

const apiKey = process.env.FLOW_API_KEY;
const secretKey = process.env.FLOW_SECRET_KEY;
const flowHosting = process.env.FLOW_HOSTING;

const flowConfirmation = async (req, res) => {
  try {
    res.sendStatus(200);
  } catch (error) {
    await handleError(res, error);
  }
};

const flowReturn = async (req, res) => {
  try {
    const { token } = req.body;

    const flowOrder = await OrdenesFlow.findOne({ token }).exec();

    let estado;
    let respuesta;

    if (!["EN_PROCESO", "ERROR_FLOW"].includes(flowOrder?.estado)) {
      switch (flowOrder.estado) {
        case "PAGADA":
          respuesta = await getMensajes("pagoRealizado");
          break;
        case "RECHAZADA":
          respuesta = await getMensajes("pagoRechazado");
          break;
        case "ANULADA":
          respuesta = await getMensajes("pagoAnulado");
          break;
      }
      estado = flowOrder.estado;
      return res.status(200).send({ estado, respuesta });
    }

    const paymentStatus = await getPaymentStatus({ token });

    if (!paymentStatus.flowOrder) {
      await OrdenesFlow.updateOne({ token }, { estado: "ERROR_FLOW" }).exec();
      return await sendCustomError(res, 200, "flowError", paymentStatus);
    }

    switch (paymentStatus.status) {
      case 1:
        estado = "ERROR_FLOW";
        respuesta = await getMensajes("flowError");
        break;
      case 2:
        estado = "PAGADA";
        respuesta = await getMensajes("pagoRealizado");
        break;
      case 3:
        estado = "RECHAZADA";
        respuesta = await getMensajes("pagoRechazado");
        break;
      case 4:
        estado = "ANULADA";
        respuesta = await getMensajes("pagoAnulado");
        break;
    }
    await OrdenesFlow.updateOne({ token }, { estado }).exec();

    res.status(200).send({ estado, respuesta });
  } catch (error) {
    await handleError(res, error);
  }
};

const createFlowPayment = async (params) => {
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

// const getTestPaymentStatus = async (req, res) => {
//   if (process.env.NODE_ENV !== "dev") return res.sendStatus("401");
//   const token = req.params.token;

//   const status = await getPaymentStatus({token});

//   res.status(200).send(status);
// };

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

// const cancelTestPayment = async (req, res) => {
//   if (process.env.NODE_ENV !== "dev") return res.sendStatus("401");
//   const token = req.body.token;

//   const status = await cancelPaymentOrder({token});

//   res.status(200).send(status);
// };

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

module.exports = {
  flowConfirmation,
  flowReturn,
  createFlowPayment,
  cancelPaymentOrder,
  // getTestPaymentStatus,
  // cancelTestPayment,
};
