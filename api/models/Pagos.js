const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Pagos = mongoose.model(
  "pago",
  new Schema(
    {
      token: { type: String, required: true },
      flowOrder: { type: String, required: true },
      estado: { type: String, default: "EN_PROCESO" }, // EN_PROCESO, PAGADO, ANULADO, RECHAZADO, ERROR_FLOW, VALIDADO, ERROR_VALIDACION
      deudas: {
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
    },
    { timestamps: true }
  )
);

module.exports = Pagos;
