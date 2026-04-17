const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3001;
const SECRET = "segredo_supermercado";

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

// Criar tabelas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      cpf TEXT NOT NULL
    )
  `);
db.get("SELECT * FROM usuarios WHERE email = ?", ["admin@admin.com"], async (err, row) => {
  if (err) {
    console.log("Erro ao verificar admin:", err.message);
    return;
  }

  if (!row) {
    const senhaCriptografada = await bcrypt.hash("123456", 10);

    db.run(
      "INSERT INTO usuarios (nome, email, senha, cpf) VALUES (?, ?, ?, ?)",
      ["Administrador", "admin@admin.com", senhaCriptografada, "00000000000"],
      (err) => {
        if (err) {
          console.log("Erro ao criar admin:", err.message);
        } else {
          console.log("Admin padrão criado: admin@admin.com / 123456");
        }
      }
    );
  }
});

  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      precoAtual REAL NOT NULL,
      precoPromocao REAL,
      tipo TEXT NOT NULL,
      descricao TEXT,
      validade TEXT
    )
  `);
});

app.get("/", (req, res) => {
  res.send("Backend do supermercado rodando");
});


// =========================
// CRUD DE PRODUTOS
// =========================

// Criar produto
app.post("/produtos", (req, res) => {
  const { nome, precoAtual, precoPromocao, tipo, descricao, validade } = req.body;

  const sql = `
    INSERT INTO produtos (nome, precoAtual, precoPromocao, tipo, descricao, validade)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [nome, precoAtual, precoPromocao, tipo, descricao, validade], function (err) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.status(201).json({
      mensagem: "Produto criado com sucesso",
      id: this.lastID
    });
  });
});

// Listar produtos
app.get("/produtos", (req, res) => {
  db.all("SELECT * FROM produtos", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json(rows);
  });
});

// Buscar produto por id
app.get("/produtos/:id", (req, res) => {
  db.get("SELECT * FROM produtos WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    if (!row) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }
    res.json(row);
  });
});

// Atualizar produto
app.put("/produtos/:id", (req, res) => {
  const { nome, precoAtual, precoPromocao, tipo, descricao, validade } = req.body;

  const sql = `
    UPDATE produtos
    SET nome = ?, precoAtual = ?, precoPromocao = ?, tipo = ?, descricao = ?, validade = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [nome, precoAtual, precoPromocao, tipo, descricao, validade, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: "Produto não encontrado" });
      }
      res.json({ mensagem: "Produto atualizado com sucesso" });
    }
  );
});

// Deletar produto
app.delete("/produtos/:id", (req, res) => {
  db.run("DELETE FROM produtos WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }
    res.json({ mensagem: "Produto removido com sucesso" });
  });
});


// =========================
// CRUD DE USUÁRIOS
// =========================

// Criar usuário
app.post("/usuarios", async (req, res) => {
  const { nome, email, senha, cpf } = req.body;

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const sql = `
      INSERT INTO usuarios (nome, email, senha, cpf)
      VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [nome, email, senhaCriptografada, cpf], function (err) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }
      res.status(201).json({
        mensagem: "Usuário criado com sucesso",
        id: this.lastID
      });
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar usuário" });
  }
});

// Listar usuários
app.get("/usuarios", (req, res) => {
  db.all("SELECT id, nome, email, cpf FROM usuarios", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json(rows);
  });
});

// Buscar usuário por id
app.get("/usuarios/:id", (req, res) => {
  db.get(
    "SELECT id, nome, email, cpf FROM usuarios WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }
      if (!row) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }
      res.json(row);
    }
  );
});

// Atualizar usuário
app.put("/usuarios/:id", async (req, res) => {
  const { nome, email, senha, cpf } = req.body;

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const sql = `
      UPDATE usuarios
      SET nome = ?, email = ?, senha = ?, cpf = ?
      WHERE id = ?
    `;

    db.run(sql, [nome, email, senhaCriptografada, cpf, req.params.id], function (err) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }
      res.json({ mensagem: "Usuário atualizado com sucesso" });
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar usuário" });
  }
});

// Deletar usuário
app.delete("/usuarios/:id", (req, res) => {
  db.run("DELETE FROM usuarios WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    res.json({ mensagem: "Usuário removido com sucesso" });
  });
});


// =========================
// LOGIN
// =========================
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.get("SELECT * FROM usuarios WHERE email = ?", [email], async (err, usuario) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    if (!usuario) {
      return res.status(401).json({ erro: "Usuário ou senha incorretos" });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Usuário ou senha incorretos" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      mensagem: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});