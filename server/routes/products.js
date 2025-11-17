import express from "express";
import {
  getProductsController,
  getProductByIdController,
  createProductController,
  updateProductController,
  deleteProductController,
} from "../controllers/productController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload, processImage } from "../middleware/uploadImage.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// Productos públicos (visitantes pueden ver)
router.get("/", getProductsController);
router.get("/:id", getProductByIdController);

// Rutas protegidas para administración
router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.ASSISTANT),
  upload.single("image"),
  processImage,
  createProductController
);
router.put(
  "/:id",
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.ASSISTANT),
  upload.single("image"),
  processImage,
  updateProductController
);
router.delete(
  "/:id",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  deleteProductController
);

export default router;
