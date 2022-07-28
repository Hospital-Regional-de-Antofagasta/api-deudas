const express = require("express");
const deudasController = require("../controllers/deudasController");
const isAuthenticated = require("../middleware/auth");

const router = express.Router();

router.get("/paciente", isAuthenticated, deudasController.getDeudasPaciente);

module.exports = router;
