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

function uploadSinglePic(req, res, fieldName) {
  return new Promise ((resolve, reject)=> {
    upload.single(fieldName)(req, res, (err)=> {
      if (err) return reject(err);
      resolve();
    })
  })
}



router.post("/admin", upload.single("image"), async (req, res) => {
  try {
    await uploadSinglePic(req, res, "image");
    console.log(req.body);
    const { inpNomeProduto, inpPreco, inpDesCurta, inpDesLonga } = req.body;
    const precoNum = Number(inpPreco);
    console.log('FILE PATH -----------> O QUE VEM DO FRONT ---------<', filePath)
    const filePath = req.file ? req.file.secure_url || req.file.url || req.file.path : null;
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
