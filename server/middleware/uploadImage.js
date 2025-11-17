import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar almacenamiento
const storage = multer.memoryStorage();

// Filtro para aceptar solo JPG y PNG
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPG y PNG'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
});

// Middleware para procesar y redimensionar imagen
export const processImage = async (req, res, next) => {
  // Si no hay archivo nuevo, continuar (puede que se esté editando sin cambiar la imagen)
  if (!req.file) {
    return next();
  }

  try {
    const imagesDir = path.join(__dirname, '../scripts/images/products');
    
    // Asegurar que el directorio existe
    await fs.mkdir(imagesDir, { recursive: true });

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const originalName = path.parse(req.file.originalname).name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `${sanitizedName}-${timestamp}.jpg`;
    const filepath = path.join(imagesDir, filename);

    // Redimensionar y guardar imagen
    // Redimensionar a máximo 800x800 manteniendo aspect ratio
    await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    // Guardar la URL de la imagen en req.body
    req.body.imageUrl = `/images/products/${filename}`;
    
    next();
  } catch (error) {
    console.error('Error procesando imagen:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la imagen',
    });
  }
};

