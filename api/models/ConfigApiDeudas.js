const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConfigApiDeudas = mongoose.model(
  "config_api_deuda",
  new Schema({
    mensajes: {
      forbiddenAccess: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      serverError: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      badRequest: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      deudaNoEncontrada: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      pagoPendiente: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      pacienteNoEncontrado: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      datosContactoNoConfirmados: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      emailNoEncontrado: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      emailNoValido: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      flowUnavailable: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      pagoRealizado: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      pagoAnulado: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      pagoRechazado: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      flowError: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
      errorPaciente: {
        titulo: String,
        mensaje: String,
        color: String,
        icono: String,
      },
    },
    parametrosFlow: {
      subject: String,
      currency: String,
      paymentMethod: Number,
      timeout: Number,
      payment_currency: String,
    },
    version: Number,
  })
);

module.exports = ConfigApiDeudas;
