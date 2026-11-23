import express from "express";
import pool from "../database/db.js";

const router = express.Router();

// GET all products
router.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

// GET product by ID
router.get("/products/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      productId,
    ]);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Produto não encontrado" });
    }
  } catch (err) {
    console.error("Erro ao buscar produto:", err);
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
});

// POST login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      "SELECT * FROM users WHERE user_email = $1 AND user_password = $2",
      [email, password]
    );

    console.log(req.body);
    console.log("login");
    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.status(200).json({
        isAdmin: user.is_admin,
        logged: true,
        id: user.id,
      });
    } else {
      res.status(401).json({ error: "Credenciais inválidas", logged: false });
    }
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

// GET cart items by user ID
router.get("/cart/:id", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const cartResult = await pool.query(
      "SELECT * FROM carts WHERE cart_id = $1",
      [userId]
    );
    console.log("get cart");
    if (cartResult.rows.length > 0) {
      const itemsResult = await poolNeon.query(
        `SELECT p.* 
         FROM cart_itens ci 
         JOIN products p ON ci.product_id = p.id 
         WHERE ci.cart_id = $1`,
        [userId]
      );

      const items = itemsResult.rows;
      if (items.length > 0) {
        res.status(200).json(items || []);
      } else {
        res.status(200).json([]);
      }
    } else {
      res.status(404).json({ error: "Carrinho não encontrado" });
    }
  } catch (err) {
    console.error("Erro ao buscar carrinho:", err);
    res.status(500).json({ error: "Erro ao buscar carrinho" });
  }
});

// POST add item to cart
router.post("/cart/:id", async (req, res) => {
  try {
    const userCart = Number(req.params.id);
    const productBodyId = req.body.id;

    const cartResult = await pool.query("SELECT * FROM carts WHERE cart_id = $1", [
      userCart,
    ]);

    if (cartResult.rows.length > 0) {

      const addToCart = await pool.query(
        "INSERT INTO cart_itens(product_id, cart_id) VALUES($1, $2)",
        [productBodyId, userCart]
      );

      if (addToCart.rowCount > 0) {
        const productResult = await pool.query(
          "SELECT * FROM products WHERE id = $1",
          [productBodyId]
        );
        const product = productResult.rows;
        if (product.length > 0) {
          res.status(201).json(product[0]);
        } else {
          res.status(404).json({
            error: "Produto não encontrado após adicionar ao carrinho",
          });
        }
      } else {
        res
          .status(400)
          .json({ error: "Não foi possível adicionar ao carrinho" });
      }
    } else {
      res.status(404).json({ error: "Carrinho não encontrado" });
    }
  } catch (err) {
    console.error("Erro no POST /cart/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE item from cart
router.delete("/cart/delete", async (req, res) => {
  try {
    const productId = req.body.product;

    const result = await pool.query(
      `DELETE FROM cart_itens 
       WHERE ctid IN (
         SELECT ctid FROM cart_itens WHERE product_id = $1 LIMIT 1
       )`,
      [productId]
    );

    if (result.rowCount > 0) {
      res.status(200).json({ message: "Produto deletado com sucesso" });
    } else {
      res.status(404).json({ error: "Produto não encontrado no carrinho" });
    }
  } catch (err) {
    console.error("Erro ao deletar item do carrinho:", err);
    res.status(500).json({ error: "Erro ao deletar item do carrinho" });
  }
});

// GET search products
router.get("/search", async (req, res) => {
  try {
    const searchFront = req.query.search;

    // No Postgres, para concatenar a string no ILIKE ou LIKE usamos ||
    const productsResult = await pool.query(
      "SELECT * FROM products WHERE product_name ILIKE $1",
      [`%${searchFront}%`]
    );

    const products = productsResult.rows;

    if (products.length > 0) {
      res.status(200).json(products);
    } else {
      res.status(404).json({ error: "Nenhum produto encontrado" });
    }
  } catch (err) {
    console.error("Erro na busca:", err);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});
//POST CREATE ACCOUNT

router.post("/create-account", async (req, res) => {
  console.log('post user');
  const body = req.body;

  try {
    
    const userCheck = await pool.query(
      `SELECT * FROM users WHERE user_name = $1 AND user_email = $2`, 
      [body.name, body.email2]
    );
    const users = userCheck.rows;
    console.log(users);

    if (users.length === 0) {
     
      await pool.query(
        `INSERT INTO users (user_name, user_email, user_password, is_admin) VALUES ($1, $2, $3, $4)`, 
        [body.name, body.email2, body.password2, 0]
      );
      console.log("user criado");

      const userIdResult = await pool.query(
        `SELECT * FROM users WHERE user_name = $1`, 
        [body.name]
      );
      const userId = userIdResult.rows;

      if (userId.length > 0) {
        await pool.query(
          `INSERT INTO carts (cart_id, user_id) VALUES ($1, $2)`, 
          [userId[0].id, userId[0].id]
        );
      }

      return res.json({ message: "Usuário criado com sucesso!" });
    } 
    
    if (users.length !== 0) {
      let err = true;
      return res.json({ message: err });
    }

  } catch (error) {
    console.error("Erro na rota /create-account:", error);
    res.status(500).json({ error: error.message });
  }
});
export default router;
