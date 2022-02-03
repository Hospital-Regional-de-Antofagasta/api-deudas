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
    },
    version: Number,
  })
);

module.exports = ConfigApiDeudas;
