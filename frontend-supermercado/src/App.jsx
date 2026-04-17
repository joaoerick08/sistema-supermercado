import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario"))
  );

  const [pagina, setPagina] = useState("produtos");

  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [promocao, setPromocao] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const [usuarios, setUsuarios] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [senhaUsuario, setSenhaUsuario] = useState("");
  const [cpfUsuario, setCpfUsuario] = useState("");
  const [editandoUsuarioId, setEditandoUsuarioId] = useState(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");

  const fazerLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3001/login", {
        email,
        senha,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
      setUsuario(response.data.usuario);
      setMensagem("");
    } catch (error) {
      setMensagem("Usuário ou senha incorretos");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUsuario(null);
    setProdutos([]);
    setUsuarios([]);
  };

  const carregarProdutos = async () => {
    const response = await axios.get("http://localhost:3001/produtos");
    setProdutos(response.data);
  };

  const carregarUsuarios = async () => {
    const response = await axios.get("http://localhost:3001/usuarios");
    setUsuarios(response.data);
  };

  useEffect(() => {
    if (usuario) {
      carregarProdutos();
      carregarUsuarios();
    }
  }, [usuario]);

  const limparFormularioProduto = () => {
    setNome("");
    setPreco("");
    setPromocao("");
    setEditandoId(null);
  };

  const salvarProduto = async (e) => {
    e.preventDefault();

    const dadosProduto = {
      nome,
      precoAtual: Number(preco),
      precoPromocao: promocao ? Number(promocao) : null,
      tipo: "Geral",
      descricao: "",
      validade: "2026-12-31",
    };

    if (editandoId) {
      await axios.put(`http://localhost:3001/produtos/${editandoId}`, dadosProduto);
    } else {
      await axios.post("http://localhost:3001/produtos", dadosProduto);
    }

    limparFormularioProduto();
    carregarProdutos();
  };

  const deletarProduto = async (id) => {
    await axios.delete(`http://localhost:3001/produtos/${id}`);
    carregarProdutos();
  };

  const editarProduto = (produto) => {
    setEditandoId(produto.id);
    setNome(produto.nome);
    setPreco(produto.precoAtual);
    setPromocao(produto.precoPromocao || "");
    setPagina("produtos");
  };

  const removerPromocao = async (produto) => {
    await axios.put(`http://localhost:3001/produtos/${produto.id}`, {
      nome: produto.nome,
      precoAtual: produto.precoAtual,
      precoPromocao: null,
      tipo: produto.tipo || "Geral",
      descricao: produto.descricao || "",
      validade: produto.validade || "2026-12-31",
    });

    carregarProdutos();
  };

  const limparFormularioUsuario = () => {
    setNomeUsuario("");
    setEmailUsuario("");
    setSenhaUsuario("");
    setCpfUsuario("");
    setEditandoUsuarioId(null);
  };

  const salvarUsuario = async (e) => {
    e.preventDefault();

    const dadosUsuario = {
      nome: nomeUsuario,
      email: emailUsuario,
      senha: senhaUsuario,
      cpf: cpfUsuario,
    };

    if (editandoUsuarioId) {
      await axios.put(
        `http://localhost:3001/usuarios/${editandoUsuarioId}`,
        dadosUsuario
      );
    } else {
      await axios.post("http://localhost:3001/usuarios", dadosUsuario);
    }

    limparFormularioUsuario();
    carregarUsuarios();
  };

  const deletarUsuario = async (id) => {
    await axios.delete(`http://localhost:3001/usuarios/${id}`);
    carregarUsuarios();
  };

  const editarUsuario = (u) => {
    setEditandoUsuarioId(u.id);
    setNomeUsuario(u.nome);
    setEmailUsuario(u.email);
    setSenhaUsuario("");
    setCpfUsuario(u.cpf);
    setPagina("usuarios");
  };

  if (!usuario) {
    return (
      <div className="container">
  <h1>Sistema Administrativo do Supermercado</h1>
  <p style={{ textAlign: "center", color: "#64748b", marginBottom: "30px" }}>
    Gerencie produtos, usuários e promoções de forma simples
  </p>

  <div className="form-box" style={{ maxWidth: "500px", margin: "0 auto" }}>
    <h2 style={{ textAlign: "center" }}>Login</h2>

    <form onSubmit={fazerLogin} className="form-grid">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <button type="submit">Entrar</button>
    </form>

    {mensagem && (
      <p style={{ textAlign: "center", marginTop: "10px", color: "#dc2626" }}>
        {mensagem}
      </p>
    )}
  </div>
</div>

  )}

  return (
    <div className="container">
      <h1>Sistema Administrativo do Supermercado</h1>

      <div className="topbar">
        <button onClick={() => setPagina("produtos")}>Produtos</button>
        <button onClick={() => setPagina("usuarios")}>Usuários</button>
        <button onClick={logout}>Sair</button>
      </div>

      {pagina === "produtos" && (
        <>
          <h2>Gerenciamento de Produtos</h2>

          <div className="form-box">
            <form onSubmit={salvarProduto} className="form-grid">
              <input
                placeholder="Nome do produto"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />

              <input
                placeholder="Preço normal"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
              />

              <input
                placeholder="Preço promocional"
                value={promocao}
                onChange={(e) => setPromocao(e.target.value)}
              />

              <button type="submit">
                {editandoId ? "Atualizar" : "Cadastrar"}
              </button>

              {editandoId && (
                <button type="button" onClick={limparFormularioProduto}>
                  Cancelar
                </button>
              )}
            </form>
          </div>

          <div className="list-grid">
            {produtos.length > 0 ? (
              produtos.map((p) => (
                <div key={p.id} className="card">
                  <div className="card-header">
                    <h3>{p.nome}</h3>
                    <span className="badge">
                      {p.precoPromocao ? "Em promoção" : "Produto"}
                    </span>
                  </div>

                  <p className={`info-text ${p.precoPromocao ? "preco-antigo" : ""}`}>
                    Preço normal: R$ {p.precoAtual}
                  </p>

                  {p.precoPromocao ? (
                    <p className="preco-promocional">
                      Preço promocional: R$ {p.precoPromocao}
                    </p>
                  ) : (
                    <p className="info-text">Sem promoção</p>
                  )}

                  <div className="card-actions">
                    <button onClick={() => editarProduto(p)}>Editar</button>
                    <button onClick={() => deletarProduto(p.id)}>Deletar</button>

                    {p.precoPromocao && (
                      <button onClick={() => removerPromocao(p)}>
                        Remover promoção
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-text">Nenhum produto cadastrado.</div>
            )}
          </div>
        </>
      )}

      {pagina === "usuarios" && (
        <>
          <h2>Gerenciamento de Usuários</h2>

          <div className="form-box">
            <form onSubmit={salvarUsuario} className="form-grid">
              <input
                placeholder="Nome"
                value={nomeUsuario}
                onChange={(e) => setNomeUsuario(e.target.value)}
              />

              <input
                placeholder="Email"
                value={emailUsuario}
                onChange={(e) => setEmailUsuario(e.target.value)}
              />

              <input
                type="password"
                placeholder="Senha"
                value={senhaUsuario}
                onChange={(e) => setSenhaUsuario(e.target.value)}
              />

              <input
                placeholder="CPF"
                value={cpfUsuario}
                onChange={(e) => setCpfUsuario(e.target.value)}
              />

              <button type="submit">
                {editandoUsuarioId ? "Atualizar" : "Cadastrar"}
              </button>

              {editandoUsuarioId && (
                <button type="button" onClick={limparFormularioUsuario}>
                  Cancelar
                </button>
              )}
            </form>
          </div>

          <div className="list-grid">
            {usuarios.length > 0 ? (
              usuarios.map((u) => (
                <div key={u.id} className="card">
                  <div className="card-header">
                    <h3>{u.nome}</h3>
                    <span className="badge">Funcionário</span>
                  </div>

                  <p className="info-text">Email: {u.email}</p>
                  <p className="info-text">CPF: {u.cpf}</p>

                  <div className="card-actions">
                    <button onClick={() => editarUsuario(u)}>Editar</button>
                    <button onClick={() => deletarUsuario(u.id)}>Deletar</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-text">Nenhum usuário cadastrado.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;