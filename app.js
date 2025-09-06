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

