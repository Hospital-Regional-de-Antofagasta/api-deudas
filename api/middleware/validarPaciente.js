const pacientesController = require("../controllers/pacientesController");
const { getMensajes } = require("../config");
const { handleError } = require("../utils/errorHandler");
const { isObjectEmpty } = require("../utils/utils");
const { regex } = require("../utils/regexValidaciones");

exports.validarPaciente = async (req, res, next) => {
  console.log("validarPaciente", "validarPaciente")
  try {
    const paciente = await pacientesController.getPaciente(
      req.headers.authorization
    );

    if (isObjectEmpty(paciente))
      return res
        .status(400)
        .send({ respuesta: await getMensajes("pacienteNoEncontrado") });

    if (!paciente.nombre)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("pacienteNoEncontrado"), detalles_error: paciente });

    if (!paciente.datosContactoActualizados)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("datosContactoNoConfirmados") });

    if (!paciente.correoCuerpo)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("emailNoEncontrado") });

    if (!paciente.correoExtension)
      return res
        .status(400)
        .send({ respuesta: await getMensajes("emailNoEncontrado") });

    const email = `${paciente.correoCuerpo}@${paciente.correoExtension}`;

    if (!regex.correo.test(email))
      return res
        .status(400)
        .send({ respuesta: await getMensajes("emailNoValido") });

    req.emailPaciente = email;

    next();
  } catch (error) {
    await handleError(error, req, res);
  }
};
