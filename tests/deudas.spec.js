const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../api/app");
const mongoose = require("mongoose");
const { getMensajes } = require("../api/config");
const ConfigApiDeudas = require("../api/models/ConfigApiDeudas");
const configSeed = require("./testSeeds/configSeed.json");
const Deudas = require("../api/models/Deudas");
const deudasSeed = require("./testSeeds/deudasSeed.json");
const OrdenesFlow = require("../api/models/OrdenesFlow");
const pagosSeed = require("./testSeeds/pagosSeed.json");

const request = supertest(app);

const secreto = process.env.JWT_SECRET;

const token = jwt.sign(
  {
    _id: "000000000000",
    rut: "11111111-1",
  },
  secreto
);

const tokenSinDeuda = jwt.sign(
  {
    _id: "000000000000",
    rut: "33333333-3",
  },
  secreto
);

beforeEach(async () => {
  await mongoose.disconnect();
  await mongoose.connect(`${process.env.MONGO_URI}/deudas_test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await Deudas.create(deudasSeed);
  await OrdenesFlow.create(pagosSeed);
  await ConfigApiDeudas.create(configSeed);
});

afterEach(async () => {
  await Deudas.deleteMany();
  await OrdenesFlow.deleteMany();
  await ConfigApiDeudas.deleteMany();
  await mongoose.connection.close();
});

describe("Endpoints Deuda", () => {
  describe("GET /v1/deudas/paciente", () => {
    it("should not get deuda without token", async () => {
      const respuesta = await request.get("/v1/deudas/paciente");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });
    });
    it("should not get deuda with invalid token", async () => {
      const respuesta = await request
        .get("/v1/deudas/paciente")
        .set("Authorization", "no-token");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });
    });
    it("should get no deuda if paciente has none", async () => {
      const respuesta = await request
        .get("/v1/deudas/paciente")
        .set("Authorization", tokenSinDeuda);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual([]);
    });
    it("should get deuda from paciente", async () => {
      const respuesta = await request
        .get("/v1/deudas/paciente")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      const deudas = respuesta.body;
      const orderedDeudas = deudasSeed
        .filter((e) => e.rutPaciente === "11111111-1")
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      expect(deudas.length).toBe(9);

      for (let i = 0; i < orderedDeudas.length; i++) {
        expect(deudas[i].correlativo).toBe(orderedDeudas[i].correlativo);
        expect(deudas[i].rutPaciente).toBeFalsy();
        expect(Date.parse(deudas[i].fecha)).toBe(
          Date.parse(orderedDeudas[i].fecha)
        );
        expect(deudas[i].identificador).toBe(orderedDeudas[i].identificador);
        expect(deudas[i].valor).toBe(orderedDeudas[i].valor);
        expect(deudas[i].deuda).toBe(orderedDeudas[i].deuda);
        expect(deudas[i].tipo).toBe(orderedDeudas[i].tipo);
        expect(deudas[i].codigoEstablecimiento).toBe(
          orderedDeudas[i].codigoEstablecimiento
        );
        expect(deudas[i].nombreEstablecimiento).toBe(
          orderedDeudas[i].nombreEstablecimiento
        );
        if (deudas[i].correlativo === 1) {
          expect(deudas[i].pagoEnProceso).toBeTruthy();
        } else {
          expect(deudas[i].pagoEnProceso).toBeFalsy();
        }
      }
    });
  });
});
