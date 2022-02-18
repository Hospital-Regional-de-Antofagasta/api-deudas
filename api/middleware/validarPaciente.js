const pacientesController = require("../controllers/pacientesController");
const { handleError, sendCustomError } = require("../utils/errorHandler");
const { isObjectEmpty } = require("../utils/utils");
const { regex } = require("../utils/regexValidaciones");

exports.validarPaciente = async (req, res, next) => {
  try {
    const paciente = await pacientesController.getPaciente(
      req.headers.authorization
    );

    if (isObjectEmpty(paciente) || typeof paciente != "object")
      return await sendCustomError(
        res,
        400,
        "pacienteNoEncontrado",
        "Paciente no encontrado."
      );

    // retornar error de consulta
    if (!paciente.nombre)
      return await sendCustomError(res, 500, "errorPaciente", paciente);

    if (!paciente.datosContactoActualizados)
      return await sendCustomError(
        res,
        400,
        "datosContactoNoConfirmados",
        "El paciente.datosContactoActualizados debe ser true."
      );

    if (!paciente.correoCuerpo)
      return await sendCustomError(
        res,
        400,
        "emailNoEncontrado",
        "Debe exisitir el paciente.correoCuerpo."
      );

    if (!paciente.correoExtension)
      return await sendCustomError(
        res,
        400,
        "emailNoEncontrado",
        "Debe exisitir el paciente.correoExtension."
      );

    const email = `${paciente.correoCuerpo}@${paciente.correoExtension}`;

    if (!regex.correo.test(email))
      return await sendCustomError(
        res,
        400,
        "emailNoValido",
        "El correo electrónico del paciente debe ser válido"
      );

    req.emailPaciente = email;

    next();
  } catch (error) {
    await handleError(res, error);
  }
};
