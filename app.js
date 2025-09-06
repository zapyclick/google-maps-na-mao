// ======= Seletores =======
const fileInput = document.getElementById("fileInput");
const imagePreview = document.getElementById("imagePreview");
const buttons = document.querySelectorAll(".btn[data-type]");
const generateBtn = document.getElementById("generateBtn");
const postText = document.getElementById("postText");
const saveBtn = document.getElementById("saveBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importInput = document.getElementById("importInput");

let selectedType = null;

// ======= Upload de imagens =======
fileInput.addEventListener("change", () => {
  imagePreview.innerHTML = "";
  [...fileInput.files].forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      imagePreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

// ======= Seleção do tipo =======
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedType = btn.dataset.type;
    buttons.forEach((b) => b.classList.remove("contrast"));
    btn.classList.add("contrast");
  });
});

// ======= Gerador de ideias (modo local) =======
function generateLocalIdea(type) {
  const ideas = {
    promo: [
      "Aproveite nossa promoção exclusiva! Descontos especiais apenas esta semana.",
      "Não perca: leve 2 e pague 1 em produtos selecionados!"
    ],
    novidade: [
      "Temos uma novidade incrível esperando por você!",
      "Confira nosso lançamento mais recente e surpreenda-se."
    ],
    evento: [
      "Participe do nosso evento especial neste fim de semana.",
      "Reserve sua agenda: teremos descontos e experiências únicas!"
    ],
  };
  const pool = ideas[type] || ["Digite seu texto aqui..."];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ======= Botão gerar =======
generateBtn.addEventListener("click", () => {
  if (!selectedType) {
    alert("Escolha um tipo de postagem primeiro.");
    return;
  }
  postText.value = generateLocalIdea(selectedType);
});

// ======= Salvar Local =======
saveBtn.addEventListener("click", () => {
  const data = {
    type: selectedType,
    text: postText.value,
    date: new Date().toISOString(),
  };
  localStorage.setItem("postData", JSON.stringify(data));
  alert("Postagem salva localmente!");
});

// ======= Exportar JSON =======
exportBtn.addEventListener("click", () => {
  const dataStr = localStorage.getItem("postData");
  if (!dataStr) {
    alert("Nenhum dado salvo para exportar.");
    return;
  }
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "postagem.json";
  a.click();
});

// ======= Importar JSON =======
importBtn.addEventListener("click", () => importInput.click());

importInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      selectedType = data.type;
      postText.value = data.text;
      alert("Postagem importada com sucesso!");
    } catch {
      alert("Arquivo inválido.");
    }
  };
  reader.readAsText(file);
});
// Contador de cliques nas doações
const donationButtons = document.querySelectorAll(".donation-buttons .btn");

donationButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    let count = localStorage.getItem("donationClicks") || 0;
    count = parseInt(count) + 1;
    localStorage.setItem("donationClicks", count);
    console.log(`Botões de doação clicados: ${count} vezes`);
  });
});
// --- Pix QR Code ---
const pixBtn = document.querySelector(".donation-buttons .btn[href*='PIX']");
const modal = document.getElementById("pixModal");
const closeModal = document.getElementById("closeModal");
const pixQRCodeDiv = document.getElementById("pixQRCode");

// Seu Pix (chave ou payload)
const pixKey = "SEU_PIX_AQUI"; // Ex: chave Pix ou payload Copia e Cola

// Ao clicar no botão Pix, abre modal e gera QR Code
pixBtn.addEventListener("click", (e) => {
  e.preventDefault();
  pixQRCodeDiv.innerHTML = ""; // Limpa QR anterior
  new QRCode(pixQRCodeDiv, {
    text: pixKey,
    width: 200,
    height: 200,
  });
  modal.style.display = "block";
});

// Fechar modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Fechar clicando fora do modal
window.addEventListener("click", (e) => {
  if (e.target == modal) {
    modal.style.display = "none";
  }
});
// --- Integração com Unsplash ---
const input = document.getElementById('unsplashQuery');
const results = document.getElementById('unsplashResults');

if (input && results) {
  let timer = null;
  const DEBOUNCE_MS = 500;

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (!q) {
      results.innerHTML = '';
      return;
    }
    timer = setTimeout(() => doSearch(q), DEBOUNCE_MS);
  });

  async function doSearch(q) {
    const cacheKey = `unsplash:${q}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      render(JSON.parse(cached));
      return;
    }

    try {
      const resp = await fetch(
        `/.netlify/functions/unsplash-search?q=${encodeURIComponent(q)}&per_page=12`
      );
      if (!resp.ok) {
        results.innerHTML = `<p>Erro na busca: ${resp.status}</p>`;
        return;
      }
      const data = await resp.json();
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      render(data);
    } catch (e) {
      console.error(e);
      results.innerHTML = `<p>Erro de conexão.</p>`;
    }
  }

  function render(data) {
    results.innerHTML = '';
    if (!data.results || data.results.length === 0) {
      results.innerHTML = '<p>Nenhuma imagem encontrada.</p>';
      return;
    }
    data.results.forEach((photo) => {
      const card = document.createElement('div');
      card.className = 'image-card';

      const img = document.createElement('img');
      img.src = photo.urls.small;
      img.alt = photo.alt_description || 'Imagem do Unsplash';
      img.loading = 'lazy';

      const credit = document.createElement('a');
      credit.href = `${photo.user.links.html}?utm_source=google-maps-na-mao&utm_medium=referral`;
      credit.target = '_blank';
      credit.rel = 'noopener noreferrer';
      credit.textContent = `${photo.user.name} / Unsplash`;

      card.appendChild(img);
      card.appendChild(credit);
      results.appendChild(card);
    });
  }
}


