const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Deudas = mongoose.model(
  "deuda",
  new Schema({
    correlativo: { type: Number, required: true },
    rutPaciente: { type: String, required: true, select: false },
    fecha: { type: Date, required: true },
    identificadorPrograma: { type: String, required: true },
    valor: { type: Number, required: true },
    deuda: { type: Number, required: true },
    tipoPrograma: { type: String, required: true, enum: ["DAU", "OA", "CH"] },
    codigoEstablecimiento: { type: String, required: true, enum: ["HRA"] },
    nombreEstablecimiento: {
      type: String,
      required: true,
      enum: ["Hospital Regional Antofagasta Dr. Leonardo Guzmán"],
    },
  },
  { timestamps: true })
);

module.exports = Deudas;