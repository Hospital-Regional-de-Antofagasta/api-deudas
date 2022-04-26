const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrdenesFlow = mongoose.model(
  "ordenes_flow",
  new Schema(
    {
      flowOrder: { type: String, required: true },
      token: { type: String, required: true },
      commerceOrder: { type: String, required: true },
      rutPaciente: { type: String, required: true },
      emailPagador: { type: String, required: true },
      rutPagador: { type: String, required: true },
      estado: {
        type: String,
        default: "EN_PROCESO",
        enum: [
          "EN_PROCESO",
          "PAGADA",
          "ANULADA",
          "RECHAZADA",
          "ERROR_FLOW",
          "ERROR_FLOW_CONFIRMADO",
          "ERROR_FLOW_INFORMADO",
        ],
      },
      registradoEnEstablecimiento: {
        type: Boolean,
        required: true,
        default: false,
      },
      pagos: {
        type: [
          {
            identificadorDeuda: { type: String, required: true },
            tipoDeuda: { type: String, required: true, enum: ["PAGARE"] },
            codigoEstablecimientoDeuda: {
              type: String,
              required: true,
              enum: ["HRA"],
            },
            abono: {
              type: Number,
              required: true,
            },
          },
        ],
        required: true,
      },
    },
    { timestamps: true }
  ),
  "ordenes_flow"
);

module.exports = OrdenesFlow;
