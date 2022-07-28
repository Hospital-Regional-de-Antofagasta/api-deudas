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
  // await OrdenesFlow.create(pagosSeed);
  await ConfigApiDeudas.create(configSeed);
});

afterEach(async () => {
  await Deudas.deleteMany();
  // await OrdenesFlow.deleteMany();
  await ConfigApiDeudas.deleteMany();
  await mongoose.connection.close();
});

describe("Endpoints Deudas", () => {
  describe("GET /v1/deudas/paciente", () => {
    it("Debería retornar error si no se recibe token.", async () => {
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
    it("Debería retornar error si el token es invalido.", async () => {
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
    it("Debería retornar un arreglo vacío si el paciente no tiene deudas.", async () => {
      const respuesta = await request
        .get("/v1/deudas/paciente")
        .set("Authorization", tokenSinDeuda);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual([]);
    });
    it("Debería retornar todas las deudas de un paciente.", async () => {
      const respuesta = await request
        .get("/v1/deudas/paciente")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      expect(respuesta.body.length).toBe(6);
    });
    it("Debería retornar todos los datos de una deuda.", async () => {
      const respuesta = await request
        .get("/v1/deudas/paciente")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      expect(respuesta.body.length).toBe(6);

      expect(respuesta.body[0]._id).toBeFalsy();
      expect(respuesta.body[0].identificador).toBe("651456027");
      expect(respuesta.body[0].tipo).toBe("PAGARE");
      expect(respuesta.body[0].codigoEstablecimiento).toBe("HRA");
      expect(respuesta.body[0].correlativo).toBeFalsy();
      expect(respuesta.body[0].rutPaciente).toBeFalsy();
      expect(Date.parse(respuesta.body[0].fecha)).toBe(
        Date.parse("2021/10/01")
      );
      expect(respuesta.body[0].valor).toBe(6490);
      expect(respuesta.body[0].deuda).toBe(4999);
      expect(respuesta.body[0].rutDeudor).toBeFalsy();
      expect(respuesta.body[0].nombreDeudor).toBe("Berte Bingell");
      expect(respuesta.body[0].nombreEstablecimiento).toBe(
        "Hospital Regional Antofagasta Dr. Leonardo Guzmán"
      );
    });
    it("Debería retornar las deudas ordenadas por fecha de manera descendente.", async () => {
      const respuesta = await request
        .get("/v1/deudas/paciente")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      expect(respuesta.body.length).toBe(6);

      expect(respuesta.body[0].identificador).toBe("651456027"); // 2021/10/01
      expect(respuesta.body[1].identificador).toBe("152234576"); // 2021/10/06
      expect(respuesta.body[2].identificador).toBe("338485606"); // 2021/10/23
      expect(respuesta.body[3].identificador).toBe("134766680"); // 2021/11/25
      expect(respuesta.body[4].identificador).toBe("980338428"); // 2022/02/23
      expect(respuesta.body[5].identificador).toBe("947570447"); // 2022/03/07
    });
    it('Debería solo retornar deudas con deuda > 0 si se recibe "pagadas=false".', async () => {
      const respuesta = await request
        .get("/v1/deudas/paciente?pagadas=false")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      expect(respuesta.body.length).toBe(4);
    });
    it('Debería solo retornar deudas con deuda = 0 si se recibe "pagadas=true".', async () => {
      const respuesta = await request
        .get("/v1/deudas/paciente?pagadas=true")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      expect(respuesta.body.length).toBe(2);
    });
    it('Debería retornar todas las deudas si no se recibe "pagadas" o si es diferente a "true" o "false".', async () => {
      const respuesta = await request
        .get("/v1/deudas/paciente?pagadas=truee")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      expect(respuesta.body.length).toBe(6);
    });
    it('Debería retornar las deudas con "nombreDeudor" = "null" si "rutDeudor" = "rutPaciente".', async () => {
      const respuesta = await request
        .get("/v1/deudas/paciente?pagadas=truee")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      expect(respuesta.body.length).toBe(6);

      expect(respuesta.body[0].nombreDeudor).toBe("Berte Bingell");
      expect(respuesta.body[1].nombreDeudor).toBe(null);
    });
  });
});
