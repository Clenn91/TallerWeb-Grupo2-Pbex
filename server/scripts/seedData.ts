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

// Funciones auxiliares para generar descripciones
const getDefectDescription = (defectType: string): string => {
  const descriptions: Record<string, string> = {
    mancha: "Manchas visibles en la superficie del producto",
    rebaba: "Rebabas detectadas en los bordes del producto",
    incompleto: "Producto incompleto, falta de material en algunas áreas",
    deformacion: "Deformación detectada en la estructura del producto",
    rayon: "Rayones superficiales que afectan la apariencia",
    otro: "Otro tipo de defecto detectado durante la inspección",
  };
  return (
    descriptions[defectType] ||
    "Defecto detectado durante el control de calidad"
  );
};

const getCorrectiveAction = (severity: string): string => {
  const actions: Record<string, string> = {
    baja: "Revisión de proceso y ajuste menor en parámetros de producción",
    media: "Implementación de medidas correctivas y capacitación al personal",
    alta: "Parada temporal de línea, revisión completa y reentrenamiento",
    critica:
      "Suspensión de producción, auditoría completa y plan de acción inmediato",
  };
  return actions[severity] || "Acción correctiva implementada";
};

const getNonConformityDescription = (severity: string): string => {
  const descriptions: Record<string, string> = {
    baja: "Desviación menor detectada en especificaciones de peso. No afecta funcionalidad.",
    media:
      "Producto no cumple con especificaciones de diámetro. Requiere revisión del proceso.",
    alta: "Fallo crítico en control de calidad. Merma excesiva detectada en lote completo.",
    critica:
      "No conformidad crítica: producto presenta defectos estructurales que comprometen seguridad.",
  };
  return (
    descriptions[severity] ||
    "No conformidad detectada durante el control de calidad"
  );
};

const seedData = async (): Promise<void> => {
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
    const [_admin] = await User.findOrCreate({
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

    const [_supervisor] = await User.findOrCreate({
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

    const [assistant] = await User.findOrCreate({
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

    const [_management] = await User.findOrCreate({
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

    // Crear productos
    console.log("Creando productos...");
    const products = [
      {
        name: "CAPSULA CON LINER, CENTRAL Y ROMPEDOR, COLORES VARIOS",
        description: "Tapas para botellones PBEX",
        category: "ACCESORIOS",
        material: "POLIETILENO",
        imageUrl: "/images/products/CAP-CON-LINER1.png",
        alertThreshold: 4.5,
        active: true,
      },
      {
        name: "CAPSULA CON ANILLO CENTRAL Y ROMPEDOR, COLORES VARIOS",
        description: "Tapas para botellones PBEX",
        category: "ACCESORIOS",
        material: "POLIETILENO",
        imageUrl: "/images/products/CAP-SIN-LINER1.png",
        alertThreshold: 4.5,
        active: true,
      },
      {
        name: "TAPON CORTO",
        description: "Tapa para botellones PBEX",
        category: "ACCESORIOS",
        material: "POLIETILENO",
        imageUrl: "/images/products/TAPA-CORTA2.png",
        alertThreshold: 4.0,
        active: true,
      },
      {
        name: "ASA CON PIN",
        description: "Repuesto para bidón de polietileno PV004041",
        category: "ACCESORIOS",
        material: "POLIETILENO",
        imageUrl: "/images/products/ASA-PIN.png",
        alertThreshold: 3.5,
        active: true,
      },
      {
        name: "SOPORTE METALICO CON VALVULA",
        description: "Soporte para botellones PBEX",
        category: "ACCESORIOS",
        material: "ACERO INOXIDABLE",
        imageUrl: "/images/products/soporte-11.png",
        alertThreshold: 4.0,
        active: true,
      },
      {
        name: "CAÑO IMPORT. MANOS LIBRES, MANIJA AZUL",
        description:
          "Los caños son partes fundamentales para facilitar el vertido del agua de manera segura y sin derrames.",
        category: "ACCESORIOS",
        material: "POLIPROPILENO",
        imageUrl: "/images/products/cano1.png",
        alertThreshold: 4.2,
        active: true,
      },
      {
        name: "ANILLO",
        description: "Respuesto para caños PBEX",
        category: "ACCESORIOS",
        material: "PVC",
        imageUrl: "/images/products/ANILLO1.png",
        alertThreshold: 3.8,
        active: true,
      },
      {
        name: "LLAVE PARA AJUSTAR CAÑO M.L. MANIJA AZUL",
        description:
          "La llave para ajustar el caño del botellón de 20 litros es un accesorio esencial para garantizar un ajuste seguro y sin derrames.",
        category: "ACCESORIOS",
        material: "ACERO INOXIDABLE",
        imageUrl: "/images/products/llave1.png",
        alertThreshold: 4.0,
        active: true,
      },
      {
        name: "TERMOENCOGIBLE 96 X 68 X 0.05 mm",
        description:
          "Este termoencogible sirve para proteger de cualquier contaminante a la tapa y/o caño de un envase.",
        category: "ACCESORIOS",
        material: "OTRO",
        imageUrl: "/images/products/termo1.png",
        alertThreshold: 3.5,
        active: true,
      },
      {
        name: "PREFORMAS 90GR – 98GR",
        description:
          "Preformas PET para varias capacidades: 7 litros, 8 litros y 10 litros. Preformas brillosas.",
        category: "ACCESORIOS",
        material: "PET",
        imageUrl: "/images/products/preforma.png",
        alertThreshold: 4.5,
        active: true,
      },
      {
        name: "PREFORMA PET PICO D-109",
        description:
          "Preformas PET boca ancha, tenemos tapas en varios colores a consultar",
        category: "ACCESORIOS",
        material: "PET",
        imageUrl: "/images/products/preforma21.png",
        alertThreshold: 4.5,
        active: true,
      },
      {
        name: "PREFORMA PET PICO D-88",
        description:
          "Preformas PET boca ancha, tenemos tapas en varios colores a consultar",
        category: "ACCESORIOS",
        material: "PET",
        imageUrl: "/images/products/preforma1.png",
        alertThreshold: 4.5,
        active: true,
      },
      {
        name: "PREFORMA PET PICO D-62",
        description:
          "Preformas PET boca ancha, tenemos tapas en varios colores a consultar",
        category: "ACCESORIOS",
        material: "PET",
        imageUrl: "/images/products/BOCA-ANCHA.png",
        alertThreshold: 4.5,
        active: true,
      },
      {
        name: "FILTRO DE POLIPROPILENO DE 1 MICRA",
        description:
          "Un filtro de polipropileno utilizado para purificar líquidos, como agua u otros fluidos, mediante la retención de partículas sólidas. Estos filtros están fabricados con polipropileno, un material plástico resistente.",
        category: "ACCESORIOS",
        material: "POLIPROPILENO",
        imageUrl: "/images/products/PLASTICOS-BASICOS1111.png",
        alertThreshold: 4.0,
        active: true,
      },
      {
        name: "BASE SURTIDOR PARA BOTELLON 20 L, PC-B",
        description:
          "El surtidor de agua de mesa es un envase práctico que incorpora un caño para facilitar el servido de agua. Este diseño es conveniente para hogares y oficinas, ofreciendo comodidad y accesibilidad para el suministro de agua.",
        category: "BASES",
        material: "POLICARBONATO",
        imageUrl: "/images/products/base-pc.png",
        alertThreshold: 4.2,
        active: true,
      },
      {
        name: "BASE SURTIDOR PARA BOTELLON 20 L, PP-B",
        description:
          "El surtidor de agua de mesa es un envase práctico que incorpora un caño para facilitar el servido de agua. Este diseño es conveniente para hogares y oficinas, ofreciendo comodidad y accesibilidad para el suministro de agua.",
        category: "BASES",
        material: "POLIPROPILENO",
        imageUrl: "/images/products/surtidor21-1.png",
        alertThreshold: 4.2,
        active: true,
      },
      {
        name: "BASE SURTIDOR PARA BOTELLON 20 L, PP-A",
        description:
          "El surtidor de agua de mesa es un envase práctico que incorpora un caño para facilitar el servido de agua. Este diseño es conveniente para hogares y oficinas, ofreciendo comodidad y accesibilidad para el suministro de agua.",
        category: "BASES",
        material: "POLIPROPILENO",
        imageUrl: "/images/products/surtidor.png",
        alertThreshold: 4.2,
        active: true,
      },
      {
        name: "BIDON 20 LITROS PE REDONDO CON TAPA Y ASA",
        description:
          "Bidón de Polietileno. Alta resistencia al impacto. Inocuo y aprobado para alimentos. Con asa pin",
        category: "BIDONES",
        material: "POLIETILENO",
        imageUrl: "/images/products/BIDON1-1.png",
        alertThreshold: 5.0,
        active: true,
      },
      {
        name: "BIDON 20 LITROS PE RECTANGULAR",
        description:
          "Bidón de Polietileno, rectangular para optimizar espacios. Alta resistencia al impacto. Inocuo y aprobado para alimentos. Con asa",
        category: "BIDONES",
        material: "POLIETILENO",
        imageUrl: "/images/products/BIDON-1.png",
        alertThreshold: 5.0,
        active: true,
      },
      {
        name: "BIDON DE POLIPROPILENO CUADRADO X 10 LT C/TAPON Y TAPA COLOR NATURAL",
        description:
          "Bidón de 10 litros, un envase versátil utilizado en diversas industrias de aceite, agua destilada, urea, detergente y otros.",
        category: "BIDONES",
        material: "POLIPROPILENO",
        imageUrl: "/images/products/bidon-10-litros-cuadrado.png",
        alertThreshold: 4.8,
        active: true,
      },
      {
        name: "BIDON DE POLIETILENO CUADRADO  X 10 LT C/TAPON Y TAPA  NATURAL",
        description:
          "Bidón de 10 litros de polietileno, un envase versátil utilizado en diversas industrias. Una total transparencia visual para líquidos y semilíquidos.",
        category: "BIDONES",
        material: "POLIETILENO",
        imageUrl: "/images/products/bidon.png",
        alertThreshold: 4.8,
        active: true,
      },
      {
        name: "BIDON DE POLIETILENO CUADRADO X 20 LT C/ASA, TAPA Y ANILLO – AZUL",
        description:
          "Bidón de Polietileno. Alta resistencia al impacto. Inocuo y aprobado para alimentos. Con superficie para sujetar el envase",
        category: "BIDONES",
        material: "POLIETILENO",
        imageUrl: "/images/products/bidon-tapa-valvula1-1.png",
        alertThreshold: 5.0,
        active: true,
      },
      {
        name: "BIDON DE POLIETILENO CUADRADO X 20 LT C/TAPON Y TAPA  NATURAL",
        description:
          "Bidón de Polietileno. Alta resistencia al impacto. Inocuo y aprobado para alimentos. Con superficie para sujetar el envase",
        category: "BIDONES",
        material: "POLIETILENO",
        imageUrl: "/images/products/bidon1.png",
        alertThreshold: 5.0,
        active: true,
      },
      {
        name: "BIDON DE POLIETILENO CUADRADO X 20 LT C/TAPON Y TAPA NEGRA",
        description:
          "Bidón de Polietileno. Alta resistencia al impacto. Inocuo y aprobado para alimentos. Con superficie para sujetar el envase",
        category: "BIDONES",
        material: "POLIETILENO",
        imageUrl: "/images/products/bidon-tapa-negra.png",
        alertThreshold: 5.0,
        active: true,
      },
      {
        name: "BIDON DE POLIPROPILENO X 10 LT  DESCARTABLE NATURAL",
        description:
          "Bidón plástico de 10 litros, un envase versátil utilizado en diversas industrias, destacando por su capacidad y facilidad de vertido. Para productos como: aceite, agua de mesa, agua destilada, detergentes, etc.",
        category: "BIDONES",
        material: "POLIPROPILENO",
        imageUrl: "/images/products/bidon-10-litros.png",
        alertThreshold: 4.5,
        active: true,
      },
      {
        name: "BIDON DE POLIPROPILENO X 20 LT  DESCARTABLE COLOR",
        description:
          "Bidón plástico de 20 litros, un envase versátil utilizado en diversas industrias, destacando por su capacidad y facilidad de vertido.",
        category: "BIDONES",
        material: "POLIPROPILENO",
        imageUrl: "/images/products/bidon-21-litros.png",
        alertThreshold: 5.0,
        active: true,
      },
      {
        name: "BIDON PE X 20 LT NATURAL CON TAPA Y CAÑO",
        description:
          "Bidón de Polietileno. Alta resistencia al impacto. Inocuo y aprobado para alimentos. Con superficie para sujetar el envase",
        category: "BIDONES",
        material: "POLIETILENO",
        imageUrl: "/images/products/BIDON-20L.png",
        alertThreshold: 5.0,
        active: true,
      },
      {
        name: "BIDON DE POLIETILENO X 24 LT NATURAL – CILINDRICO",
        description:
          "Bidón plástico de 24 litros, un envase versátil utilizado en diversas industrias, destacando por su capacidad y facilidad de vertido. Para productos como: aceite, agua, pulpa de frutas, pisco, jarabes, etc.",
        category: "BIDONES",
        material: "POLIETILENO",
        imageUrl: "/images/products/1-2.png",
        alertThreshold: 5.0,
        active: true,
      },
      {
        name: "BIDON DE POLIETILENO CUADRADO X 20 LT C/ASA, TAPA Y ANILLO – AMARILLO",
        description:
          "Bidón de Polietileno. Alta resistencia al impacto. Inocuo y aprobado para alimentos. Con superficie para sujetar el envase",
        category: "BIDONES",
        material: "POLIETILENO",
        imageUrl: "/images/products/ebidon-1.png",
        alertThreshold: 5.0,
        active: true,
      },
      {
        name: "BIDON PE X 35 LT NATURAL CON TAPA Y CAÑO",
        description:
          "Bidón de Polietileno. Alta resistencia al impacto. Inocuo y aprobado para alimentos. Con superficie para sujetar el envase",
        category: "BIDONES",
        material: "POLIETILENO",
        imageUrl: "/images/products/bidon-35.png",
        alertThreshold: 5.0,
        active: true,
      },
      {
        name: "BIDON 20 LITROS PE REDONDO CON TAPA Y ASA PIN",
        description:
          "Bidón de Polietileno. Alta resistencia al impacto. Inocuo y aprobado para alimentos. Con asa pin",
        category: "BIDONES",
        material: "POLIETILENO",
        imageUrl: "/images/products/BIDON1-20.png",
        alertThreshold: 5.0,
        active: true,
      },
      {
        name: "BOTELLA PET 10 LT CUADRADO C/ASA Y TAPA ROSCA",
        description:
          "Botella PET para diferentes productos líquidos y semi-líquidos. Brilloso, forma cuadrada para optimizar espacios. Inocuo y aprobado para alimentos. Con asa ergonómica",
        category: "BOTELLAS",
        material: "PET",
        imageUrl: "/images/products/bidon-10-litros-pet1.png",
        alertThreshold: 4.5,
        active: true,
      },
      {
        name: "BOTELLA PET 10L 98 GR C/ASA Y TAPA",
        description:
          "Botella PET para diferentes productos líquidos y semi-líquidos. Brilloso. Inocuo y aprobado para alimentos. Con asa ergonómica",
        category: "BOTELLAS",
        material: "PET",
        imageUrl: "/images/products/bot-10-litros-redondo.png",
        alertThreshold: 4.5,
        active: true,
      },
      {
        name: "BOTELLA PET 4L C/ASA Y TAPA",
        description:
          "Botella PET para diferentes productos líquidos y semi-líquidos. Brilloso. Inocuo y aprobado para alimentos. Con asa incorporada",
        category: "BOTELLAS",
        material: "PET",
        imageUrl: "/images/products/botella-4-litros.png",
        alertThreshold: 4.0,
        active: true,
      },
      {
        name: "BOTELLA PET 7L C/ASA Y TAPA ROSCA",
        description:
          "Botella PET para diferentes productos líquidos y semi-líquidos. Brilloso. Inocuo y aprobado para alimentos. Con asa ergonómica",
        category: "BOTELLAS",
        material: "PET",
        imageUrl: "/images/products/botella-7-litros.png",
        alertThreshold: 4.3,
        active: true,
      },
      {
        name: "TOMATODO 350 ml COLORES VARIOS",
        description:
          "Los tomatodos de la marca PBEX son envases diseñados para transportar y disfrutar de bebidas de manera conveniente en cualquier lugar.",
        category: "BOTELLAS",
        material: "POLIPROPILENO",
        imageUrl: "/images/products/tomatodo-350-ml.png",
        alertThreshold: 3.5,
        active: true,
      },
      {
        name: "TOMATODO 500 ml COLORES VARIOS",
        description:
          "Los tomatodos de la marca PBEX son envases diseñados para transportar y disfrutar de bebidas de manera conveniente en cualquier lugar.",
        category: "BOTELLAS",
        material: "POLIPROPILENO",
        imageUrl: "/images/products/tomatodo-500-ml.png",
        alertThreshold: 3.5,
        active: true,
      },
      {
        name: "TOMATODO 750 ml COLORES VARIOS",
        description:
          "Los tomatodos de la marca PBEX son envases diseñados para transportar y disfrutar de bebidas de manera conveniente en cualquier lugar.",
        category: "BOTELLAS",
        material: "POLIPROPILENO",
        imageUrl: "/images/products/750-ml.png",
        alertThreshold: 3.5,
        active: true,
      },
      {
        name: "BOTELLA PET 3.8 LITROS",
        description:
          "Botella PET para diferentes productos líquidos y semi-líquidos. Brilloso. Inocuo y aprobado para alimentos. Con asa ergonómica",
        category: "BOTELLAS",
        material: "PET",
        imageUrl: "/images/products/3.8-litros1.png",
        alertThreshold: 4.2,
        active: true,
      },
      {
        name: "BOTELLA PET 3.3 LITROS",
        description:
          "Botella PET para diferentes productos líquidos y semi-líquidos. Brilloso. Inocuo y aprobado para alimentos. Con asa ergonómica",
        category: "BOTELLAS",
        material: "PET",
        imageUrl: "/images/products/3.3-litros.png",
        alertThreshold: 4.2,
        active: true,
      },
      {
        name: "BOTELLON PP X 19 LT C/CAÑO MANIJA AZUL",
        description:
          "Botellón de 19 litros con caño, un envase utilizado para agua de mesa, destacando por su resistencia y durabilidad.",
        category: "BOTELLONES",
        material: "POLIPROPILENO",
        imageUrl: "/images/products/pp.png",
        alertThreshold: 4.5,
        active: true,
      },
      {
        name: "BOTELLON PP X 19 LT S/CAÑO",
        description:
          "Botellón de 19 litros sin caño, un envase utilizado para agua de mesa, destacando por su resistencia y durabilidad.",
        category: "BOTELLONES",
        material: "POLIPROPILENO",
        imageUrl: "/images/products/botellon-celeste02.png",
        alertThreshold: 4.5,
        active: true,
      },
      {
        name: "BOTELLON PC X 20 LT C/CAÑO MANIJA AZUL",
        description:
          "Botellon de policarbonato 20 litros con caño, destacando por su gran transparencia cristalina y resistencia.",
        category: "BOTELLONES",
        material: "POLICARBONATO",
        imageUrl: "/images/products/pc-con-cano.png",
        alertThreshold: 4.8,
        active: true,
      },
      {
        name: "BOTELLON PC X 20 LT S/CAÑO",
        description:
          "Botellon de policarbonato 20 litros sin caño, destacando por su gran transparencia cristalina y resistencia.",
        category: "BOTELLONES",
        material: "POLICARBONATO",
        imageUrl: "/images/products/pc-sin-cano.png",
        alertThreshold: 4.8,
        active: true,
      },
      {
        name: "BOTELLON PET X 20 LT CON CAÑO M.L.",
        description:
          "Botellón de 20 litros con caño, un envase versátil utilizado en diversas industrias, destacando por su capacidad y transparencia para visualizar el agua. De fácil vertido gracias a su caño manos libres incorporado al modelo de botellón.",
        category: "BOTELLONES",
        material: "PET",
        imageUrl: "/images/products/pet-con-cano-1.png",
        alertThreshold: 4.5,
        active: true,
      },
      {
        name: "BOTELLON PET X 20 LT S/CAÑO",
        description:
          "Botellón de 20 litros sin caño, un envase versátil utilizado en diversas industrias, destacando por su capacidad y transparencia para visualizar el agua.",
        category: "BOTELLONES",
        material: "PET",
        imageUrl: "/images/products/pet-sin-cano.png",
        alertThreshold: 4.5,
        active: true,
      },
      {
        name: "FRASCO PET 3250 ML",
        description:
          "Frasco con tapa rosca. Inocuo y aprobado para alimentos. Tapa colores varios a consultar",
        category: "FRASCOS",
        material: "PET",
        imageUrl: "/images/products/FRASCO111.png",
        alertThreshold: 4.0,
        active: true,
      },
      {
        name: "FRASCO PET 1000 ML",
        description:
          "Frasco con tapa rosca. Inocuo y aprobado para alimentos. Tapa colores varios a consultar",
        category: "FRASCOS",
        material: "PET",
        imageUrl: "/images/products/FRASCO11.png",
        alertThreshold: 4.0,
        active: true,
      },
      {
        name: "FRASCO PET 235 ML",
        description:
          "Frasco con tapa rosca. Inocuo y aprobado para alimentos. Tapa colores varios a consultar",
        category: "FRASCOS",
        material: "PET",
        imageUrl: "/images/products/FRASCO1.png",
        alertThreshold: 3.8,
        active: true,
      },
      {
        name: "FRASCO PET 450 ML",
        description:
          "Frasco con tapa rosca. Inocuo y aprobado para alimentos. Tapa colores varios a consultar",
        category: "FRASCOS",
        material: "PET",
        imageUrl: "/images/products/FRASCO11-1.png",
        alertThreshold: 3.8,
        active: true,
      },
      {
        name: "TAPA ROSCADA C/ANILLO PARA BOTELLA, COLORES VARIOS (S/M)",
        description: "Tapas para botellas o preformas PET PBEX",
        category: "TAPAS Y ASAS",
        material: "POLIETILENO",
        imageUrl: "/images/products/TAPA-ROSCADA1.png",
        alertThreshold: 4.0,
        active: true,
      },
      {
        name: "ASA TRANSPORTADORA – COLORES VARIOS PARA BOTELLON",
        description: "Asa para botellones PBEX",
        category: "TAPAS Y ASAS",
        material: "POLIETILENO",
        imageUrl: "/images/products/asa-transportadora-principal.png",
        alertThreshold: 3.5,
        active: true,
      },
      {
        name: "ASA ERGONOMICA PARA BOTELLA PET  (COLORES VARIOS)",
        description:
          "Las asas ergonómicas para botellas PET son características diseñadas para facilitar el agarre y el manejo cómodo de las botellas. Estas asas suelen estar integradas en el diseño de la botella misma, ofreciendo una solución práctica para transportar y verter líquidos de manera segura y conveniente.",
        category: "TAPAS Y ASAS",
        material: "POLIETILENO",
        imageUrl: "/images/products/asa-ergonomica-azul.png",
        alertThreshold: 3.5,
        active: true,
      },
    ];

    // Buscar el último código en la BD para inicializar el contador
    const lastProduct = await Product.findOne({
      order: [["code", "DESC"]],
      attributes: ["code"],
    });

    let currentNumber = 0;
    if (lastProduct && lastProduct.code) {
      // Extraer el número del código (ej: PT000123 -> 123)
      const match = lastProduct.code.match(/PT(\d+)/);
      if (match) {
        currentNumber = parseInt(match[1], 10);
      }
    }

    // Función para generar código incremental: PT000000, PT000001, etc.
    const generateIncrementalCode = (): string => {
      currentNumber++;
      return `PT${currentNumber.toString().padStart(6, "0")}`;
    };

    const createdProducts = [];
    for (const productData of products) {
      // Primero verificar si el producto ya existe
      let product = await Product.findOne({
        where: { name: productData.name },
      });

      if (!product) {
        // Si no existe, generar código incremental
        const generatedCode = generateIncrementalCode();

        // Crear el producto con el código generado
        product = await Product.create({
          ...productData,
          code: generatedCode,
        });
      } else if (product && !product.code) {
        // Si el producto existe pero no tiene código, generarlo y actualizarlo
        const generatedCode = generateIncrementalCode();
        await product.update({ code: generatedCode });
      }

      createdProducts.push(product);
    }
    console.log("✓ Productos creados");

    // Crear registros de producción
    console.log("Creando registros de producción...");
    const today = new Date();
    const productionRecords = [];
    const shifts = Object.values(SHIFTS);
    const users = [assistant, _supervisor, _admin];

    // Crear ~25 registros de producción distribuidos en las últimas 3 semanas
    for (let i = 0; i < 25; i++) {
      const product = createdProducts[i % createdProducts.length];
      const daysAgo = Math.floor(i / 3); // Distribuir en días
      const productionDate = new Date(today);
      productionDate.setDate(productionDate.getDate() - daysAgo);

      const shift = shifts[i % shifts.length];
      const user = users[i % users.length];
      const lineNumber = (i % 5) + 1;

      // Variar las cantidades de producción
      const baseProduced = 800 + i * 50;
      const approvedRate = 0.92 + (i % 10) * 0.005; // Entre 92% y 97%
      const totalApproved = Math.floor(baseProduced * approvedRate);
      const totalRejected = baseProduced - totalApproved;

      const record = await ProductionRecord.create({
        productId: product.id,
        userId: user.id,
        lotNumber: `LOTE-${productionDate
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`,
        productionDate: productionDate.toISOString().split("T")[0] as any,
        shift: shift as any,
        productionLine: `Línea ${lineNumber}`,
        totalProduced: baseProduced,
        totalApproved: totalApproved,
        totalRejected: totalRejected,
        notes: i % 3 === 0 ? `Producción normal del turno ${shift}` : null,
      });
      productionRecords.push(record);
    }
    console.log("✓ Registros de producción creados");

    // Crear controles de calidad
    console.log("Creando controles de calidad...");
    const qualityControls = [];
    const defectTypes = Object.values(DEFECT_TYPES);

    // Crear ~18 controles de calidad con diferentes características
    for (let i = 0; i < 18; i++) {
      const record = productionRecords[i];
      const product = await Product.findByPk(record.productId);
      const alertThreshold = parseFloat(String(product?.alertThreshold || 5.0));

      // Variar el wastePercentage: algunos normales, algunos que generan alertas
      let wastePercentage: number;
      if (i < 12) {
        // Controles normales (bajo threshold)
        wastePercentage = 2.5 + (i % 8) * 0.3; // Entre 2.5% y 4.9%
      } else {
        // Controles que generan alertas (sobre threshold)
        wastePercentage = alertThreshold + 0.5 + ((i - 12) % 4) * 0.8; // Entre threshold+0.5 y threshold+2.9
      }

      // Aprobar aproximadamente el 70% de los controles
      const approved = i < 13;

      const qualityControl = await QualityControl.create({
        productionRecordId: record.id,
        userId: users[i % users.length].id,
        weight: 450 + i * 15 + (i % 3) * 5,
        diameter: 180 + i * 3 + (i % 2) * 2,
        height: 280 + i * 8 + (i % 4) * 3,
        width: i % 2 === 0 ? 150 + i * 2 : null,
        wastePercentage: parseFloat(wastePercentage.toFixed(2)),
        approved: approved,
        notes: approved
          ? `Control aprobado. Merma dentro de parámetros.`
          : `Control rechazado. Merma fuera de especificaciones.`,
      });
      qualityControls.push(qualityControl);

      // Crear defectos para controles rechazados y algunos aprobados
      if (!approved || (i % 5 === 0 && approved)) {
        const numDefects = !approved ? 2 + (i % 3) : 1; // Más defectos en rechazados
        for (let j = 0; j < numDefects; j++) {
          const defectType = defectTypes[(i + j) % defectTypes.length];
          await Defect.create({
            qualityControlId: qualityControl.id,
            defectType: defectType as any,
            quantity: 5 + (i % 10) + j * 3,
            description: getDefectDescription(defectType as string),
          });
        }
      }
    }
    console.log("✓ Controles de calidad creados");

    // Crear certificados
    console.log("Creando certificados...");
    const approvedControls = qualityControls.filter((qc) => qc.approved);
    let certCounter = 1;

    // Crear ~10 certificados con diferentes estados
    for (let i = 0; i < Math.min(10, approvedControls.length); i++) {
      const qualityControl = approvedControls[i];
      const record = await ProductionRecord.findByPk(
        qualityControl.productionRecordId
      );
      if (!record) continue;

      let status: "pendiente" | "aprobado" | "rechazado";
      let approvedBy: number | null = null;
      let approvedAt: Date | null = null;
      let rejectionReason: string | null = null;

      if (i < 4) {
        // 4 certificados pendientes
        status = "pendiente";
      } else if (i < 8) {
        // 4 certificados aprobados
        status = "aprobado";
        approvedBy = _supervisor.id;
        approvedAt = new Date();
        approvedAt.setDate(approvedAt.getDate() - (8 - i));
      } else {
        // 2 certificados rechazados
        status = "rechazado";
        approvedBy = _supervisor.id;
        approvedAt = new Date();
        approvedAt.setDate(approvedAt.getDate() - (10 - i));
        rejectionReason =
          "No cumple con los estándares de calidad requeridos. Se requiere revisión adicional.";
      }

      await Certificate.create({
        code: `CERT-${new Date().getFullYear()}-${String(
          certCounter++
        ).padStart(4, "0")}`,
        productId: record.productId,
        productionRecordId: record.id,
        qualityControlId: qualityControl.id,
        requestedBy: users[i % users.length].id,
        approvedBy: approvedBy,
        status: status,
        approvedAt: approvedAt,
        rejectionReason: rejectionReason,
      });
    }
    console.log("✓ Certificados creados");

    // Crear alertas
    console.log("Creando alertas...");
    let alertCounter = 0;

    // Crear alertas para controles con wastePercentage > threshold
    for (const qualityControl of qualityControls) {
      const record = await ProductionRecord.findByPk(
        qualityControl.productionRecordId
      );
      if (!record) continue;

      const product = await Product.findByPk(record.productId);
      const alertThreshold = parseFloat(String(product?.alertThreshold || 5.0));
      const wastePercentage = parseFloat(
        String(qualityControl.wastePercentage || 0)
      );

      if (wastePercentage > alertThreshold) {
        let status: "activa" | "resuelta" | "descartada";
        let resolvedBy: number | null = null;
        let resolvedAt: Date | null = null;
        let resolutionNotes: string | null = null;

        if (alertCounter < 3) {
          // 3 alertas activas
          status = "activa";
        } else if (alertCounter < 6) {
          // 3 alertas resueltas
          status = "resuelta";
          resolvedBy = _supervisor.id;
          resolvedAt = new Date();
          resolvedAt.setDate(resolvedAt.getDate() - (6 - alertCounter));
          resolutionNotes =
            "Alerta resuelta. Se implementaron medidas correctivas en la línea de producción.";
        } else {
          // 1 alerta descartada
          status = "descartada";
          resolvedBy = _supervisor.id;
          resolvedAt = new Date();
          resolvedAt.setDate(resolvedAt.getDate() - 2);
          resolutionNotes =
            "Alerta descartada. Falsa alarma debido a error en medición.";
        }

        await Alert.create({
          productId: record.productId,
          productionRecordId: record.id,
          qualityControlId: qualityControl.id,
          alertType: "waste_threshold",
          threshold: alertThreshold,
          actualValue: wastePercentage,
          status: status,
          resolvedBy: resolvedBy,
          resolvedAt: resolvedAt,
          resolutionNotes: resolutionNotes,
          emailSent: status === "activa" ? false : true,
        });

        alertCounter++;
        if (alertCounter >= 7) break; // Máximo 7 alertas
      }
    }
    console.log("✓ Alertas creadas");

    // Crear no conformidades
    console.log("Creando no conformidades...");
    const severities: Array<"baja" | "media" | "alta" | "critica"> = [
      "baja",
      "media",
      "alta",
      "critica",
    ];
    const ncStatuses: Array<
      "abierta" | "en_revision" | "resuelta" | "cerrada"
    > = ["abierta", "en_revision", "resuelta", "cerrada"];
    let ncCounter = 1;

    // Crear ~4 no conformidades con diferentes severidades y estados
    for (let i = 0; i < 4; i++) {
      const record = productionRecords[i * 5];
      const severity = severities[i];
      const status = ncStatuses[i];

      let resolvedBy: number | null = null;
      let resolvedAt: Date | null = null;
      let correctiveAction: string | null = null;

      if (status === "resuelta" || status === "cerrada") {
        resolvedBy = _supervisor.id;
        resolvedAt = new Date();
        resolvedAt.setDate(resolvedAt.getDate() - (4 - i));
        correctiveAction = `Acción correctiva implementada: ${getCorrectiveAction(
          severity
        )}`;
      }

      await NonConformity.create({
        code: `NC-${new Date().getFullYear()}-${String(ncCounter++).padStart(
          4,
          "0"
        )}`,
        productId: record.productId,
        productionRecordId: record.id,
        reportedBy: users[i % users.length].id,
        description: getNonConformityDescription(severity),
        severity: severity,
        status: status,
        correctiveAction: correctiveAction,
        resolvedBy: resolvedBy,
        resolvedAt: resolvedAt,
      });
    }
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
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("✗ Error al cargar datos de ejemplo:", errorMessage);
    process.exit(1);
  }
};

seedData();
