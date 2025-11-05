// ================== VARIÁVEIS GLOBAIS ==================
let cesto = []; // O cesto SÓ existe enquanto a página está aberta
let produtosCache = [];

const URL_PRODUTOS = "https://deisishop.pythonanywhere.com/products/";
const URL_CATEGORIAS = "https://deisishop.pythonanywhere.com/categories/";
const URL_BUY = "https://deisishop.pythonanywhere.com/buy/";

// ================== ARRANQUE (QUANDO A PÁGINA ABRE) ==================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Pôr o ano atual no rodapé
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  const container = document.getElementById("lista-produtos");
  if (!container) return; // Se não houver lista, não faz nada

  // 2. Mostrar "A carregar..."
  const loading = document.createElement("p");
  loading.id = "estado-carregamento";
  loading.textContent = "A carregar produtos...";
  container.appendChild(loading);

  // 3. Ir buscar os produtos ao servidor
  buscarProdutos()
    .then(produtosRecebidos => {
      // 3.1. Quando os produtos chegarem:
      produtosCache = produtosRecebidos;
      loading.remove();

      if (!produtosCache.length) {
        const aviso = document.createElement("p");
        aviso.textContent = "Não foi possível obter produtos neste momento.";
        container.appendChild(aviso);
      } else {
        aplicarFiltrosEAtualizarUI(); // Mostra os produtos
      }

      // 4. Agora, buscar as categorias
      return buscarCategorias();
    })
    .then(categoriasRecebidas => {
      // 4.1. Quando as categorias chegarem:
      let categorias = categoriasRecebidas;
      
      // Se a API não der categorias, tira-as dos produtos
      if (!categorias.length) {
        const set = new Set(produtosCache.map(p => p.category).filter(Boolean));
        categorias = Array.from(set);
      }
      popularSelectCategorias(categorias);
    });

  // 5. Ativar os botões de filtro/ordenar/pesquisa
  const selCat = document.getElementById("filtro-categoria");
  const selOrd = document.getElementById("ordenar");
  const inpSearch = document.getElementById("pesquisa");

  if (selCat) selCat.addEventListener("change", aplicarFiltrosEAtualizarUI);
  if (selOrd) selOrd.addEventListener("change", aplicarFiltrosEAtualizarUI);
  if (inpSearch) inpSearch.addEventListener("input", aplicarFiltrosEAtualizarUI);

  // 6. Ativar o formulário de "Comprar"
  const form = document.getElementById("form-checkout");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault(); // Impede a página de recarregar
      efetuarCompra(); // Chama a nossa função de compra
    });
  }

  // 7. Mostrar o cesto (que estará vazio)
  mostrarCesto();
});

// ================== PEDIDOS AO SERVIDOR (AJAX com .then) ==================

function buscarProdutos() {
  return fetch(URL_PRODUTOS, { headers: { "Accept": "application/json" } })
    .then(resp => {
      if (!resp.ok) return [];
      return resp.json();
    })
    .then(data => {
      if (!Array.isArray(data)) return [];
      
      // "Limpar" os dados para evitar erros
      return data.map(p => {
        return {
          id: p.id,
          title: p.title,
          price: Number(p.price ?? 0),
          description: p.description ?? "",
          category: p.category ?? "",
          image: p.image || "https://via.placeholder.com/300x200?text=Sem+imagem",
          rating: p.rating || { rate: 0, count: 0 }
        };
      });
    })
    .catch(e => {
      console.warn("Erro em /products/:", e);
      return []; // Se a ligação falhar, devolve lista vazia
    });
}

function buscarCategorias() {
  return fetch(URL_CATEGORIAS, { headers: { "Accept": "application/json" } })
    .then(resp => {
      if (!resp.ok) return [];
      return resp.json();
    })
    .then(data => {
      if (!Array.isArray(data)) return [];
      return data.map(String).filter(Boolean); // Garante que são strings
    })
    .catch(e => {
      console.warn("Erro em /categories/:", e);
      return [];
    });
}

// ================== FILTRO + SORT + SEARCH ==================
function aplicarFiltrosEAtualizarUI() {
  // 1. Ler o valor dos filtros
  const cat = (document.getElementById("filtro-categoria")?.value || "").trim();
  const ordem = (document.getElementById("ordenar")?.value || "").trim();
  const q = (document.getElementById("pesquisa")?.value || "").trim().toLowerCase();

  // 2. Aplicar filtros
  let lista = [];
  if (!cat) {
    lista = produtosCache.slice(); // Copia todos se não houver categoria
  } else {
    lista = produtosCache.filter(p => String(p.category).toLowerCase() === cat.toLowerCase());
  }

  if (q) {
    lista = lista.filter(p => String(p.title).toLowerCase().includes(q));
  }

  // 3. Ordenar
  if (ordem === "asc") {
    lista = lista.slice().sort((a, b) => a.price - b.price); // Mais barato
  } else if (ordem === "desc") {
    lista = lista.slice().sort((a, b) => b.price - a.price); // Mais caro
  }

  // 4. Mandar desenhar a lista final
  renderProdutos(lista);
}

// ================== DESENHAR PRODUTOS NA PÁGINA ==================
function renderProdutos(lista) {
  const container = document.getElementById("lista-produtos");
  container.textContent = ""; // Limpa a lista antiga

  if (!lista.length) {
    const vazio = document.createElement("p");
    vazio.textContent = "Sem produtos para apresentar.";
    container.appendChild(vazio);
    return;
  }

  // Cria um "cartão" (article) para cada produto
  lista.forEach(produto => {
    const art = document.createElement("article");

    const h3 = document.createElement("h3");
    h3.textContent = produto.title;

    const img = document.createElement("img");
    img.src = produto.image;
    img.alt = produto.title;

    const desc = document.createElement("p");
    desc.textContent = produto.description; // Descrição completa

    const preco = document.createElement("p");
    preco.textContent = "Preço: €" + produto.price.toFixed(2);

    const rating = document.createElement("p");
    rating.textContent = "⭐ " + (produto.rating?.rate ?? 0) + " (" + (produto.rating?.count ?? 0) + ")";

    const btn = document.createElement("button");
    btn.textContent = "Adicionar ao Cesto";
    btn.addEventListener("click", () => adicionarAoCesto(produto));

    art.appendChild(h3);
    art.appendChild(img);
    art.appendChild(desc);
    art.appendChild(preco);
    art.appendChild(rating);
    art.appendChild(btn);

    container.appendChild(art);
  });
}

// ================== MOSTRAR CATEGORIAS NO FILTRO ==================
function popularSelectCategorias(categorias) {
  const sel = document.getElementById("filtro-categoria");
  if (!sel) return;

  sel.innerHTML = '<option value="">Todas as categorias</option>';
  categorias.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    sel.appendChild(opt);
  });
}

// ================== FUNÇÕES DO CESTO (ADICIONAR/REMOVER) ==================
function adicionarAoCesto(produto) {
  const existe = cesto.find(i => i.id === produto.id);
  if (existe) {
    existe.quantidade += 1; // Se já existe, só aumenta a quantidade
  } else {
    // Se é novo, adiciona ao cesto
    cesto.push({
      id: produto.id,
      title: produto.title,
      price: produto.price,
      image: produto.image,
      quantidade: 1
    });
  }

  limparResultadoCompra(); // Limpa mensagens de erro/sucesso antigas
  mostrarCesto(); // Atualiza a lista do cesto na página
}

function removerDoCesto(id) {
  cesto = cesto.filter(i => i.id !== id); // Recria o cesto sem esse ID
  limparResultadoCompra();
  mostrarCesto();
}

function mostrarCesto() {
  const ul = document.getElementById("lista-cesto");
  const totalEl = document.getElementById("total");
  if (!ul || !totalEl) return;

  ul.textContent = ""; // Limpa o cesto antigo
  let total = 0;

  cesto.forEach(item => {
    const li = document.createElement("li");
    li.className = "cesto-item";

    const thumb = document.createElement("img");
    thumb.className = "cesto-thumb";
    thumb.src = item.image || "https://via.placeholder.com/120x120?text=Produto";

    const info = document.createElement("div");
    info.className = "cesto-info";
    info.textContent = `${item.title} — €${item.price.toFixed(2)} × ${item.quantidade}`;

    const btn = document.createElement("button");
    btn.textContent = "Remover";
    btn.addEventListener("click", () => removerDoCesto(item.id));

    li.appendChild(thumb);
    li.appendChild(info);
    li.appendChild(btn);
    ul.appendChild(li);

    total += item.price * item.quantidade; // Soma ao total
  });

  totalEl.textContent = "€" + total.toFixed(2); // Mostra o total
}

// ================== CHECKOUT (SIMPLIFICADO) ==================
function limparResultadoCompra() {
 const box = document.getElementById("resultado-compra");
 if (box) box.innerHTML = "";
}

function efetuarCompra() {
 const box = document.getElementById("resultado-compra");
 
 // 1. Ler os dados do formulário
 const nome = (document.getElementById("input-name")?.value || "").trim();
 
 // Lê os campos de desconto, mas não faz nada com eles.
 // Apenas os lê para enviar ao servidor.
 const isStudent = document.getElementById("chk-student")?.checked || false;
 const coupon = (document.getElementById("input-coupon")?.value || "").trim();

 // 2. Validações BÁSICAS (só o que é mesmo obrigatório)
 if (!cesto.length) {
 box.innerHTML = `<p style="color:#b91c1c">O cesto está vazio.</p>`;
 return;
 }
 if (!nome) {
 box.innerHTML = `<p style="color:#b91c1c">Por favor, indique o seu nome.</p>`;
 return;
 }

 // 3. Preparar dados para o servidor
 const productIds = [];
 cesto.forEach(item => {
  for (let i = 0; i < item.quantidade; i++) productIds.push(item.id);
 });

 const payload = {
  products: productIds,
  name: nome,
  student: isStudent,
    // =========================================================
  coupon: coupon  // <-- ESTA É A CORREÇÃO
    // Agora envia {"coupon": ""} em vez de remover o campo
    // =========================================================
 };

 box.innerHTML = `<p>A processar compra...</p>`;

 // 4. Fazer o pedido ao servidor
 fetch(URL_BUY, {
  method: "POST",
  headers: {
  "Accept": "application/json",
  "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
 })
 .then(response => {
  // Tenta ler a resposta e guarda o estado (ok/erro)
  return response.json()
  .catch(() => ({}))
  .then(data => ({
  ok: response.ok,
  status: response.status,
  data: data
  }));
 })
 .then(resultado => {
  // 5. Trata a resposta
  if (resultado.ok) {
  // SUCESSO
  const total = resultado.data.totalCost ?? "—";
  const ref = resultado.data.reference ?? "—";
  const msg = resultado.data.message || "Pedido efetuado com sucesso.";

  box.innerHTML = `
  <div class="compra-ok">
  <p><strong>Referência para pagamento:</strong> ${ref}</p>
  <p><strong>Total a pagar:</strong> €${Number(total).toFixed(2)}</p>
  <p>${msg}</p>
  </div>
  `;
  // Limpa o cesto da memória após a compra
  cesto = [];
  mostrarCesto(); 
  
  } else {
  // ERRO
  // Se o servidor der um erro (ex: 400), mostra-o aqui.
  const msgErro = resultado.data.error || `Erro inesperado (${resultado.status})`;
   box.innerHTML = `<p style="color:#b91c1c">${msgErro}</p>`;
  }
 })
 .catch(e => {
  // FALHA (Ex: Sem internet)
  box.innerHTML = `<p style="color:#b91c1c">Falha na ligação. Tenta novamente.</p>`;
  console.warn("Erro no checkout:", e);
 });
}