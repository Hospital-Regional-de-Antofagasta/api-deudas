var CryptoJS = require("crypto-js");
const { httpRequest } = require("../utils/httpRequests");
const { handleError } = require("../utils/errorHandler");

const apiKey = process.env.FLOW_API_KEY;
const secretKey = process.env.FLOW_SECRET_KEY;
const flowHosting = process.env.FLOW_HOSTING;

exports.confirmation = async (req, res) => {
  console.log("flow", "confirmation");
  try {
    res.sendStatus(200);
  } catch (error) {
    await handleError(error, req, res);
  }
};

exports.return = async (req, res) => {
  console.log("flow", "return");
  try {
    res.status(200).send("<h1>Guarda el cambio inmundo animal.</h1>");
  } catch (error) {
    await handleError(error, req, res);
  }
};

exports.createFlowPayment = async (params) => {
  console.log("flow", "createFlowPayment");
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

const getFlowPaymentStatus = () => {};

const signParameters = async (params) => {
  console.log("flow", "signParameters");
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
