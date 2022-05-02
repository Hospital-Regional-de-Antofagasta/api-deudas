const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../api/app");
const mongoose = require("mongoose");
const { getMensajes } = require("../api/config");
const ConfigApiDeudas = require("../api/models/ConfigApiDeudas");
const configSeed = require("./testSeeds/configSeed.json");
const Deudas = require("../api/models/Deudas");
const deudasSeed = require("./testSeeds/deudasSeed.json");

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
  await Deudas.create(deudasSeed, { validateBeforeSave: false });
  await ConfigApiDeudas.create(configSeed);
});

afterEach(async () => {
  await Deudas.deleteMany();
  await ConfigApiDeudas.deleteMany();
  await mongoose.connection.close();
});

describe("Endpoints pagos", () => {
  describe("POST /v1/pagos", () => {
    it("Debería retornar error si no se recibe token.", async () => {
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
    it("Debería retornar error si el token es invalido.", async () => {
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
    it("Debería retornar error si no se envían pagos (body vacío).", async () => {
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
    it("Debería retornar error si no se envían pagos (arreglo vacío).", async () => {
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
    it("Debería retornar error si no se envían pagos (objeto vacío).", async () => {
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
    it("Debería retornar error si no se envían pagos (algún pago vacío).", async () => {
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
    it('Debería retornar error si no se envía un "identificadorDeuda".', async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([
          {
            tipoDeuda: "PAGARE",
            codigoEstablecimientoDeuda: "HRA",
            abono: 3000,
          },
        ]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it('Debería retornar error si no se envía un "tipoDeuda".', async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([
          {
            identificadorDeuda: "651456027",
            codigoEstablecimientoDeuda: "HRA",
            abono: 3000,
          },
        ]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it('Debería retornar error si no se envía un "codigoEstablecimiento".', async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([
          {
            identificadorDeuda: "651456027",
            tipoDeuda: "PAGARE",
            abono: 3000,
          },
        ]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it('Debería retornar error si no se envía un "abono".', async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([
          {
            identificadorDeuda: "651456027",
            tipoDeuda: "PAGARE",
            codigoEstablecimientoDeuda: "HRA",
          },
        ]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Debería retornar error si no existe una deuda para ese pago.", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([
          {
            identificadorDeuda: "651456028",
            tipoDeuda: "PAGARE",
            codigoEstablecimientoDeuda: "HRA",
            abono: 3000,
          },
        ]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Debería retornar error si el monto abonado es mayor a la deuda.", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([
          {
            identificadorDeuda: "651456027",
            tipoDeuda: "PAGARE",
            codigoEstablecimientoDeuda: "HRA",
            abono: 7000,
          },
        ]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Debería retornar error si el monto abonado es mayor a $999999999.", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([
          {
            identificadorDeuda: "651456027",
            tipoDeuda: "PAGARE",
            codigoEstablecimientoDeuda: "HRA",
            abono: 1000000000,
          },
        ]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Debería retornar error si el monto abonado es menor a $350.", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([
          {
            identificadorDeuda: "651456027",
            tipoDeuda: "PAGARE",
            codigoEstablecimientoDeuda: "HRA",
            abono: 300,
          },
        ]);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.respuesta).toEqual({
        titulo: mensaje.titulo,
        mensaje: mensaje.mensaje,
        color: mensaje.color,
        icono: mensaje.icono,
      });
    });
    it("Debería retornar error si se recibe mas de un pago para la misma deuda.", async () => {
      const respuesta = await request
        .post("/v1/pagos")
        .set("Authorization", token)
        .send([
          {
            identificadorDeuda: "651456027",
            tipoDeuda: "PAGARE",
            codigoEstablecimientoDeuda: "HRA",
            abono: 3000,
          },
          {
            identificadorDeuda: "651456027",
            tipoDeuda: "PAGARE",
            codigoEstablecimientoDeuda: "HRA",
            abono: 3000,
          },
        ]);

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
    it("Debería retornar error si no se recibe token.", async () => {
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
    it("Debería retornar error si el token es invalido.", async () => {
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
    it("Debería retornar error si no se recibe token.", async () => {
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
    it("Debería retornar error si el token es invalido.", async () => {
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
