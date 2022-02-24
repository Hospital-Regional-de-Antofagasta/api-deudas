const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrdenesFlow = mongoose.model(
  "ordenes_flow",
  new Schema(
    {
      token: { type: String, required: true },
      flowOrder: { type: String, required: true },
      estado: {
        type: String,
        default: "EN_PROCESO",
        enum: [
          "EN_PROCESO",
          "PAGADA",
          "ANULADA",
          "RECHAZADA",
          "ERROR_FLOW",
          "VALIDADA",
          "ERROR_VALIDACION",
        ],
      },
      pagos: {
        type: [
          {
            idDeuda: {
              type: Schema.Types.ObjectId,
              ref: "deudas",
              required: true,
            },
            abono: { type: Number, required: true },
          },
        ],
        required: true,
      },
      commerceOrder: { type: String, required: true },
    },
    { timestamps: true }
  ),
  "ordenes_flow"
);

module.exports = OrdenesFlow;
