const express = require("express");
const flowController = require("../controllers/flowController");
const pagosController = require("../controllers/pagosController");
const isAuthenticated = require("../middleware/auth");
const { validarToken } = require("../middleware/validarFlow");
const { validarPaciente } = require("../middleware/validarPaciente");

const router = express.Router();

router.post(
  "/flow-confirmation",
  express.urlencoded({ extended: true }),
  validarToken,
  flowController.flowConfirmation
);

router.post(
  "/flow-return",
  express.urlencoded({ extended: true }),
  validarToken,
  flowController.flowReturn
);

router.post("/", isAuthenticated, validarPaciente, pagosController.crear);

// solo testing
// router.get("/flow-order/status/:token", flowController.getTestPaymentStatus);
// router.delete("/flow-order", flowController.cancelTestPayment);

module.exports = router;
