import express from "express";
import pool from "../database/db.js";
import multer from "multer";
import cloudinary from "cloudinary";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const CloudinaryStorage = require("multer-storage-cloudinary");
const router = express.Router();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "simple_e_commerce",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

router.post("/admin", upload.single("image"), async (req, res) => {
  try {
    console.log(req.body);
    const { inpNomeProduto, inpPreco, inpDesCurta, inpDesLonga } = req.body;
    const precoNum = Number(inpPreco);

  
    const filePath = req.file ? req.file.url : null;
    console.log("URL da imagem:", filePath);

   console.log("ARQUIVO:", req.file);
console.log("PATH:", req.file?.path);
console.log("URL:", req.file?.url);
    const result = await pool.query(
      `INSERT INTO products(product_name, product_description, price, long_description, img)
             VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [inpNomeProduto, inpDesCurta, precoNum, inpDesLonga, filePath],
    );

    res.json({ message: "sucesso", image: filePath, product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "erro ao salvar produto" });
  }
});
export default router;
