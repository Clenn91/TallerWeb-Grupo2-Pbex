import sequelize, { testConnection } from "../config/database.js";
import {
  User,
  Product,
  ProductionRecord,
  QualityControl,
  Defect,
  Certificate,
  Alert,
  NonConformity,
} from "../models/index.js";
import { USER_ROLES, DEFECT_TYPES, SHIFTS } from "../config/constants.js";
import dotenv from "dotenv";

dotenv.config();

const seedData = async () => {
  try {
    console.log("Iniciando carga de datos de ejemplo...\n");

    // Probar conexión
    const connected = await testConnection();
    if (!connected) {
      console.error("✗ No se pudo conectar a la base de datos");
      process.exit(1);
    }

    // Sincronizar modelos primero
    await sequelize.sync({ force: false, alter: false });

    // Crear usuarios
    console.log("Creando usuarios...");
    const admin = await User.findOrCreate({
      where: { username: "admin" },
      defaults: {
        username: "admin",
        email: "admin@pbex.com.pe",
        password: "admin123",
        fullName: "Administrador del Sistema",
        role: USER_ROLES.ADMIN,
        active: true,
      },
    });

    const supervisor = await User.findOrCreate({
      where: { username: "supervisor" },
      defaults: {
        username: "supervisor",
        email: "supervisor@pbex.com.pe",
        password: "super123",
        fullName: "Supervisor de Calidad",
        role: USER_ROLES.SUPERVISOR,
        active: true,
      },
    });

    const assistant = await User.findOrCreate({
      where: { username: "asistente" },
      defaults: {
        username: "asistente",
        email: "asistente@pbex.com.pe",
        password: "asist123",
        fullName: "Asistente de Calidad",
        role: USER_ROLES.ASSISTANT,
        active: true,
      },
    });

    const management = await User.findOrCreate({
      where: { username: "gerencia" },
      defaults: {
        username: "gerencia",
        email: "gerencia@pbex.com.pe",
        password: "geren123",
        fullName: "Gerencia General",
        role: USER_ROLES.MANAGEMENT,
        active: true,
      },
    });

    console.log("✓ Usuarios creados");

    // Crear productos (usando datos de Pbex2 como referencia)
    console.log("Creando productos...");
    const products = [
      {
        name: "Bidón 20 Litros",
        description:
          "Bidón plástico de alta resistencia, ideal para almacenamiento de líquidos industriales",
        category: "BIDONES",
        imageUrl: "/images/products/bidon-20l.jpg",
        specifications: "Capacidad: 20L, Material: HDPE, Color: Azul/Blanco",
        alertThreshold: 5.0,
        active: true,
      },
      {
        name: "Bidón 30 Litros",
        description: "Bidón de gran capacidad para uso industrial y comercial",
        category: "BIDONES",
        imageUrl: "/images/products/bidon-30l.jpg",
        specifications: "Capacidad: 30L, Material: HDPE, Color: Azul/Blanco",
        alertThreshold: 5.0,
        active: true,
      },
      {
        name: "Botellón 20 Litros",
        description:
          "Botellón para agua, fabricado con material grado alimenticio",
        category: "BOTELLONES",
        imageUrl: "/images/products/botellon-20l.jpg",
        specifications: "Capacidad: 20L, Material: PET, Uso: Agua potable",
        alertThreshold: 3.0,
        active: true,
      },
      {
        name: "Botella 1 Litro",
        description: "Botella de 1 litro ideal para bebidas y líquidos",
        category: "BOTELLAS",
        imageUrl: "/images/products/botella-1l.jpg",
        specifications: "Capacidad: 1L, Material: PET, Color: Transparente",
        alertThreshold: 4.0,
        active: true,
      },
      {
        name: "Botella 500ml",
        description:
          "Botella de medio litro perfecta para porciones individuales",
        category: "BOTELLAS",
        imageUrl: "/images/products/botella-500ml.jpg",
        specifications: "Capacidad: 500ml, Material: PET, Color: Transparente",
        alertThreshold: 4.0,
        active: true,
      },
    ];

    const createdProducts = [];
    for (const productData of products) {
      const [product] = await Product.findOrCreate({
        where: { name: productData.name },
        defaults: productData,
      });
      createdProducts.push(product);
    }
    console.log("✓ Productos creados");

    // Crear registros de producción de ejemplo
    console.log("Creando registros de producción...");
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const productionRecords = [];
    for (let i = 0; i < 5; i++) {
      const product = createdProducts[i % createdProducts.length];
      const record = await ProductionRecord.create({
        productId: product.id,
        userId: assistant[0].id,
        lotNumber: `LOTE-${Date.now()}-${i}`,
        productionDate: i < 2 ? today : yesterday,
        shift: Object.values(SHIFTS)[i % 3],
        productionLine: `Línea ${(i % 3) + 1}`,
        totalProduced: 1000 + i * 100,
        totalApproved: 950 + i * 95,
        totalRejected: 50 + i * 5,
        notes: `Registro de ejemplo ${i + 1}`,
      });
      productionRecords.push(record);
    }
    console.log("✓ Registros de producción creados");

    // Crear controles de calidad
    console.log("Creando controles de calidad...");
    for (let i = 0; i < 3; i++) {
      const record = productionRecords[i];
      const qualityControl = await QualityControl.create({
        productionRecordId: record.id,
        userId: assistant[0].id,
        weight: 500 + i * 10,
        diameter: 200 + i * 5,
        height: 300 + i * 10,
        wastePercentage: 3.5 + i * 0.5,
        approved: i < 2,
        notes: `Control de calidad ${i + 1}`,
      });

      // Crear defectos asociados
      if (i > 0) {
        await Defect.create({
          qualityControlId: qualityControl.id,
          defectType: DEFECT_TYPES.REBABA,
          quantity: 10 + i * 5,
          description: "Rebabas en el borde",
        });
        await Defect.create({
          qualityControlId: qualityControl.id,
          defectType: DEFECT_TYPES.MANCHA,
          quantity: 5 + i * 2,
          description: "Manchas en la superficie",
        });
      }
    }
    console.log("✓ Controles de calidad creados");

    // Crear certificado de ejemplo
    console.log("Creando certificados...");
    if (productionRecords[0] && productionRecords[0].qualityControls) {
      const qualityControl = await QualityControl.findOne({
        where: { productionRecordId: productionRecords[0].id },
      });

      if (qualityControl) {
        await Certificate.create({
          code: `CERT-${Date.now()}`,
          productId: productionRecords[0].productId,
          productionRecordId: productionRecords[0].id,
          qualityControlId: qualityControl.id,
          requestedBy: assistant[0].id,
          status: "pendiente",
        });
      }
    }
    console.log("✓ Certificados creados");

    // Crear alerta de ejemplo
    console.log("Creando alertas...");
    if (productionRecords[1]) {
      const qualityControl = await QualityControl.findOne({
        where: { productionRecordId: productionRecords[1].id },
      });

      if (qualityControl && qualityControl.wastePercentage > 5) {
        await Alert.create({
          productId: productionRecords[1].productId,
          productionRecordId: productionRecords[1].id,
          qualityControlId: qualityControl.id,
          alertType: "waste_threshold",
          threshold: 5.0,
          actualValue: qualityControl.wastePercentage,
          status: "activa",
        });
      }
    }
    console.log("✓ Alertas creadas");

    // Crear no conformidad de ejemplo
    console.log("Creando no conformidades...");
    await NonConformity.create({
      code: `NC-${Date.now()}`,
      productId: createdProducts[0].id,
      productionRecordId: productionRecords[0].id,
      reportedBy: assistant[0].id,
      description:
        "No conformidad de ejemplo: producto no cumple con especificaciones de peso",
      severity: "media",
      status: "abierta",
    });
    console.log("✓ No conformidades creadas");

    console.log("\n✓ Datos de ejemplo cargados correctamente");
    console.log("\nUsuarios de prueba:");
    console.log("  - admin / admin123 (Administrador)");
    console.log("  - supervisor / super123 (Supervisor)");
    console.log("  - asistente / asist123 (Asistente de Calidad)");
    console.log("  - gerencia / geren123 (Gerencia)");
    console.log(
      "\nNota: El catálogo de productos está disponible sin autenticación desde /products\n"
    );

    process.exit(0);
  } catch (error) {
    console.error("✗ Error al cargar datos de ejemplo:", error);
    process.exit(1);
  }
};

seedData();
