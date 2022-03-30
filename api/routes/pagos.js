const express = require("express");
const flowController = require("../controllers/flowController");
const pagosController = require("../controllers/pagosController");
const isAuthenticated = require("../middleware/auth");
const {
  validarPagos,
  validarExisteDeuda,
  validarMonto,
  validarDeudaNoTengaPagoPendiente,
} = require("../middleware/validarPagos");
const { validarPaciente } = require("../middleware/validarPaciente");
const { validarToken } = require("../middleware/validarFlow");

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

router.post(
  "/",
  isAuthenticated,
  validarPagos,
  validarExisteDeuda,
  // validarDeudaNoTengaPagoPendiente,
  validarMonto,
  validarPaciente,
  pagosController.crear
);

module.exports = router;
