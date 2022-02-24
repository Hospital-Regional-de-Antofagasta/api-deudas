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

beforeEach(async () => {
  await mongoose.disconnect();
  await mongoose.connect(`${process.env.MONGO_URI}/pagos_test`, {
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

describe("Endpoints pagos", () => {
  describe("POST /v1/pagos", () => {
    it("Should not generate payment without token", async () => {
      const respuesta = await request.post("/v1/pagos");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Should not generate payment with invalid token", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", "no-token");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Should not generate payment with empty body", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Should not generate payment with empty array", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Should not generate payment with empty object", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send({});

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Should not generate payment with empty payment", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([{}]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Should not generate payment with payment without idDeuda", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([{ abono: 1000 }]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Should not generate payment with payment without abono", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([{ idDeuda: "000000000001" }]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Should not generate payment with payment without deuda", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([{ idDeuda: "000000000099", abono: 1000 }]);

      const mensaje = await getMensajes("deudaNoEncontrada");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Should not generate payment with payment with deuda with pending payment", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([{ idDeuda: "000000000001", abono: 1000 }]);

      const mensaje = await getMensajes("pagoPendiente");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Should not generate payment with payment with deuda with abono > deuda", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([{ idDeuda: "000000000002", abono: 1000 }]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Should not generate payment with payment with deuda with abono < $350", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([{ idDeuda: "000000000002", abono: 100 }]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
  });
  describe("POST /v1/pagos/flow-confirmation", () => {
    it("Should not access confirmation without token", async () => {
      const respuesta = await request.post("/v1/pagos/flow-confirmation");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Should not access confirmation with invalid token", async () => {
      const respuesta = await request
        .post("/v1/pagos/flow-confirmation")
        .send({ token: "token" });

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
  });
  describe("POST /v1/pagos/flow-return", () => {
    it("Should not access confirmation without token", async () => {
      const respuesta = await request.post("/v1/pagos/flow-return");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Should not access return with invalid token", async () => {
      const respuesta = await request
        .post("/v1/pagos/flow-return")
        .send({ token: "token" });

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
  });
});
