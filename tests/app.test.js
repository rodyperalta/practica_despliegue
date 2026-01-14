const request = require('supertest');
const fs = require('fs');
const app = require('../index');

describe("API de usuarios", () => {
  const testUser = {
    id: "test123",
    name: "Test User",
    email: "test@example.com",
  };

  // Limpiar después de todos los tests
  afterAll(() => {
    // Limpieza: eliminar usuario de prueba si existe
    try {
      const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
      const filtered = users.filter((u) => u.id !== testUser.id);
      fs.writeFileSync("./users.json", JSON.stringify(filtered, null, 2), "utf8");
    } catch (error) {
      // Si el archivo no existe, no hacer nada
    }
  });

  // Crear el usuario de prueba antes de los tests que lo necesiten
  beforeAll(async () => {
    // Asegurarnos de que el usuario no existe primero
    try {
      const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
      const filtered = users.filter((u) => u.id !== testUser.id);
      fs.writeFileSync("./users.json", JSON.stringify(filtered, null, 2), "utf8");
    } catch (error) {
      // Si el archivo no existe, crear uno vacío
      fs.writeFileSync("./users.json", JSON.stringify([], null, 2), "utf8");
    }
  });

  // Test 1: Endpoint raíz
  it("Debe responder el endpoint raíz", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Servidor en ejecucion/i);
  });

  // Test 2: Crear usuario
  it("Debe crear un nuevo usuario", async () => {
    const res = await request(app).post("/users").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toMatchObject(testUser);
  });

  // Test 3: Obtener todos los usuarios
  it("Debe obtener todos los usuarios", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test 4: Buscar usuario específico
  it("Debe buscar el usuario creado", async () => {
    // Primero crear el usuario para asegurar que existe
    await request(app).post("/users").send(testUser);
    
    const res = await request(app).get(`/users/${testUser.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toMatchObject(testUser);
  });

  // Test adicional: Eliminar usuario
  it("Debe eliminar un usuario", async () => {
    // Crear usuario primero
    await request(app).post("/users").send(testUser);
    
    const res = await request(app).delete(`/users/${testUser.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/User deleted successfully/i);
  });
});