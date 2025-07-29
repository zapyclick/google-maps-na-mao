/*
 ========================================
 MÓDULO 5 (REFINADO 2): BOTÃO DE TROCA DE IMAGEM
 ========================================
*/

document.addEventListener('DOMContentLoaded', function() {

  // 1. Pegar todos os elementos da página
  const imageUploader = document.getElementById('image-uploader');
  const postImageInput = document.getElementById('post-image');
  const imagePreviewContainer = document.getElementById('image-preview');
  const changeImageButton = document.getElementById('change-image-button'); // Nosso novo botão

  // --- FUNÇÕES REUTILIZÁVEIS ---

  // Função que mostra a pré-visualização da imagem
  function showImagePreview(file) {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        // Limpa o container antes de adicionar a nova imagem
        const existingImg = imagePreviewContainer.querySelector('img');
        if (existingImg) {
          existingImg.remove();
        }

        const img = document.createElement('img');
        img.src = e.target.result;
        // Insere a imagem ANTES do botão de troca
        imagePreviewContainer.insertBefore(img, changeImageButton);

        imagePreviewContainer.hidden = false;
        imageUploader.hidden = true;
      }
      reader.readAsDataURL(file);
    } else if (file) { // Se um arquivo foi selecionado mas não é imagem
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, etc).');
      resetUploaderState(); // Reseta se o arquivo for inválido
    }
  }

  // Função que reseta tudo para o estado inicial
  function resetUploaderState() {
    // Limpa o valor do input de arquivo. ESSENCIAL!
    postImageInput.value = '';

    // Remove a imagem antiga do preview
    const existingImg = imagePreviewContainer.querySelector('img');
    if (existingImg) {
      existingImg.remove();
    }

    // Esconde o preview e mostra a área de upload
    imagePreviewContainer.hidden = true;
    imageUploader.hidden = false;
  }

  // --- LÓGICA DOS EVENTOS ---

  // Lógica do CLIQUE
  imageUploader.addEventListener('click', () => postImageInput.click());
  postImageInput.addEventListener('change', (event) => showImagePreview(event.target.files[0]));

  // Lógica de ARRASTAR E SOLTAR
  imageUploader.addEventListener('dragover', (event) => {
    event.preventDefault();
    imageUploader.classList.add('drag-over');
  });
  imageUploader.addEventListener('dragleave', () => imageUploader.classList.remove('drag-over'));
  imageUploader.addEventListener('drop', (event) => {
    event.preventDefault();
    imageUploader.classList.remove('drag-over');
    showImagePreview(event.dataTransfer.files[0]);
  });

  // Lógica do nosso NOVO BOTÃO
  changeImageButton.addEventListener('click', resetUploaderState);
});