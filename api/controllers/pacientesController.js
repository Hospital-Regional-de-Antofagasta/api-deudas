const { httpRequest } = require("../utils/httpRequests");

const urlPacientes = process.env.API_URL;

exports.getPaciente = async (token) => {
  console.log("pacientes", "getPaciente");
  const config = {
    headers: {
      Authorization: `${token}`,
    },
  };

  const respuesta = await httpRequest(
    "GET",
    `${urlPacientes}/v1/pacientes/informacion`,
    null,
    config,
    10
  );

  if (!respuesta?.data) return respuesta;

  return respuesta.data;
};
