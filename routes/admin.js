import express from "express";
import pool from "../database/db.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

function uploadBufferToCloudinary(fileBuffer, folder = "simple_e_commerce") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}

function uploadSinglePic(req, res, fieldName) {
  return new Promise((resolve, reject) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

router.post("/admin", async (req, res) => {
  try {
    await uploadSinglePic(req, res, "image");
    console.log(req.body);

    const { inpNomeProduto, inpPreco, inpDesCurta, inpDesLonga } = req.body;
    const precoNum = Number(String(inpPreco ?? "").replace(",", "."));

    let filePath = null;
    if (req.file?.buffer) {
      const uploaded = await uploadBufferToCloudinary(req.file.buffer);
      filePath = uploaded.secure_url || uploaded.url || null;
    }

    console.log("FILE PATH -----------> O QUE VEM DO FRONT ---------<", filePath);

    const result = await pool.query(
      `INSERT INTO products(product_name, product_description, price, long_description, img)
       VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [inpNomeProduto, inpDesCurta, precoNum, inpDesLonga, filePath]
    );

    res.json({ message: "sucesso", image: filePath, product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "erro ao salvar produto" });
  }
});

export default router;