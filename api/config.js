const ConfigApiDeudas = require("./models/ConfigApiDeudas");

const mensajesPorDefecto = {
  forbiddenAccess: {
    titulo: "Acceso denegado",
    mensaje: "Su sesión ha expirado.",
    color: "",
    icono: "",
  },
  serverError: {
    titulo: "Error de servidor",
    mensaje: "Ocurrió un error inesperado.",
    color: "",
    icono: "",
  },
  badRequest: {
    titulo: "Datos no validos",
    mensaje: "La solicitud no está bien formada.",
    color: "",
    icono: "",
  },
  deudaNoEncontrada: {
    titulo: "Deuda no encontrada",
    mensaje: "No se pudo encontrar la deuda.",
    color: "",
    icono: "",
  },
  pagoPendiente: {
    titulo: "Pago pendiente",
    mensaje: "Existe un pago pendiente para esa deuda.",
    color: "",
    icono: "",
  },
  pacienteNoEncontrado: {
    titulo: "Paciente no encontrado",
    mensaje: "No se pudo encontrar al paciente.",
    color: "",
    icono: "",
  },
  datosContactoNoConfirmados: {
    titulo: "Datos de contacto no confirmados",
    mensaje:
      "Se debe confirmar los datos de contacto antes de realizar un pago.",
    color: "",
    icono: "",
  },
  emailNoEncontrado: {
    titulo: "Correo no encontrado",
    mensaje: "No se pudo encontrar el correo electrónico.",
    color: "",
    icono: "",
  },
  emailNoValido: {
    titulo: "Correo no valido",
    mensaje: "El correo electrónico no es válido.",
    color: "",
    icono: "",
  },
  flowUnavailable: {
    titulo: "Problema de conexión al medio de pago",
    mensaje:
      "El medio de pago seleccionado no se encuentra disponible temporalmente.",
    color: "",
    icono: "",
  },
  pagoRealizado: {
    titulo: "Pago exitoso",
    mensaje:
      "El pago fue realizado exitosamente, la boleta le será enviada a su correo electrónico en menos de 48 hrs.",
    color: "",
    icono: "",
  },
  pagoAnulado: {
    titulo: "Pago anulado",
    mensaje: "No se pudo realizar el pago.",
    color: "",
    icono: "",
  },
  pagoRechazado: {
    titulo: "Pago anulado",
    mensaje: "No se pudo realizar el pago.",
    color: "",
    icono: "",
  },
  flowError: {
    titulo: "Problema de conexión al medio de pago",
    mensaje:
      "El pago no se pudo validar, la situación ha sido informada al departamento de finanzas y se regulará a la brevedad.",
    color: "",
    icono: "",
  },
  errorPaciente: {
    titulo: "Problema de conexión a la api de pacientes",
    mensaje: "No se pudo obtener el paciente.",
    color: "",
    icono: "",
  },
  fakeEmail: {
    titulo: "Problema de conexión al medio de pago",
    mensaje: "Su correo fue rechazado por Flow.",
    color: "",
    icono: "",
  },
};

exports.getMensajes = async (tipo) => {
  try {
    const { mensajes } = await ConfigApiDeudas.findOne({
      version: 1,
    }).exec();
    if (mensajes) {
      return mensajes[tipo];
    }
    return mensajesPorDefecto[tipo];
  } catch (error) {
    return mensajesPorDefecto[tipo];
  }
};

exports.getParametrosFlow = async () => {
  const { parametrosFlow } = await ConfigApiDeudas.findOne({
    version: 1,
  }).exec();

  if (!parametrosFlow?.subject)
    parametrosFlow.subject = "Pago prestación hospitalaria.";
  if (!parametrosFlow?.currency) parametrosFlow.currency = "CLP";
  if (!parametrosFlow?.paymentMethod) parametrosFlow.paymentMethod = 1;
  if (!parametrosFlow?.timeout) parametrosFlow.timeout = 120;
  if (!parametrosFlow?.payment_currency)
    parametrosFlow.payment_currency = "CLP";

  return parametrosFlow;
};
