document.addEventListener('DOMContentLoaded', function() {

    const UNSPLASH_ACCESS_KEY = 'KBW9bmH_7GwSA7phZx06SDUcQ4ZCatAmFFjCL5PLgLI';

    // ... (outras declarações de elementos)
    const imageSelectionArea = document.getElementById('image-selection-area');
    const editorArea = document.getElementById('editor-area');
    const imageUploader = document.getElementById('image-uploader');
    const postImageInput = document.getElementById('post-image');
    const unsplashSearchInput = document.getElementById('unsplash-search-input');
    const unsplashSearchButton = document.getElementById('unsplash-search-button');
    const unsplashResultsContainer = document.getElementById('unsplash-results');
    const changeImageButton = document.getElementById('change-image-button');
    const addTextButton = document.getElementById('add-text-button');
    const addLogoButton = document.getElementById('add-logo-button');

    // Inicialização da Fabric.js
    const fabricCanvas = new fabric.Canvas('image-canvas', {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff'
    });

    // --- FUNÇÃO DE CARREGAMENTO DE FUNDO (COM CORREÇÃO) ---
    function loadBackgroundImage(imageUrl) {
        fabric.Image.fromURL(imageUrl, function(img) {
            
            // Limpa qualquer fundo anterior
            fabricCanvas.setBackgroundImage(null, fabricCanvas.renderAll.bind(fabricCanvas));

            // Lógica corrigida para redimensionar mantendo a proporção
            const canvasWidth = fabricCanvas.width;
            const canvasHeight = fabricCanvas.height;
            const imgAspectRatio = img.width / img.height;
            const canvasAspectRatio = canvasWidth / canvasHeight;

            let scale;
            if (imgAspectRatio > canvasAspectRatio) {
                // Se a imagem é mais larga que o canvas, a largura do canvas dita a escala
                scale = canvasWidth / img.width;
            } else {
                // Se a imagem é mais alta ou com a mesma proporção, a altura do canvas dita a escala
                scale = canvasHeight / img.height;
            }

            img.set({
                scaleX: scale,
                scaleY: scale,
                originX: 'center', // Centraliza a imagem no eixo X
                originY: 'center'  // Centraliza a imagem no eixo Y
            });

            // Define a imagem como fundo
            fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
                top: canvasHeight / 2, // Posiciona o centro da imagem no centro do canvas
                left: canvasWidth / 2
            });
            
            // Mostra o editor
            editorArea.hidden = false;
            imageSelectionArea.hidden = true;
            if (unsplashResultsContainer) unsplashResultsContainer.innerHTML = '';
        }, { crossOrigin: 'Anonymous' });
    }


    // Função para adicionar texto
    function addText() {
        const text = new fabric.IText('Edite este texto', {
            left: 100, top: 100, fontFamily: 'Roboto', fill: '#000000', fontSize: 40,
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        fabricCanvas.renderAll();
    }

    // Função para lidar com o arquivo local
    function handleFileSelect(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => loadBackgroundImage(e.target.result);
            reader.readAsDataURL(file);
        } else if (file) {
            alert('Arquivo inválido.');
        }
    }

    // Função para resetar o editor
    function resetEditor() {
        fabricCanvas.clear();
        fabricCanvas.setBackgroundImage(null, fabricCanvas.renderAll.bind(fabricCanvas));
        editorArea.hidden = true;
        imageSelectionArea.hidden = false;
    }

    // Função de busca no Unsplash
    async function searchUnsplash(query) {
        if (!query) return;
        unsplashSearchButton.textContent = 'Buscando...';
        unsplashSearchButton.disabled = true;
        const endpoint = `https://api.unsplash.com/search/photos?query=${query}&per_page=12&client_id=${UNSPLASH_ACCESS_KEY}`;
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            if (unsplashResultsContainer) unsplashResultsContainer.innerHTML = '';
            if (data.results && data.results.length > 0) {
                data.results.forEach(photo => {
                    const img = document.createElement('img');
                    img.src = photo.urls.small;
                    img.classList.add('unsplash-image');
                    img.addEventListener('click', () => loadBackgroundImage(photo.urls.regular));
                    unsplashResultsContainer.appendChild(img);
                });
            } else {
                if (unsplashResultsContainer) unsplashResultsContainer.innerHTML = '<p>Nenhum resultado encontrado.</p>';
            }
        } catch (error) {
            if (unsplashResultsContainer) unsplashResultsContainer.innerHTML = '<p>Erro ao buscar imagens.</p>';
        } finally {
            unsplashSearchButton.textContent = 'Buscar';
            unsplashSearchButton.disabled = false;
        }
    }

    // --- Configuração dos Eventos ---
    if (imageUploader) {
        imageUploader.addEventListener('click', () => { if (postImageInput) postImageInput.click(); });
        imageUploader.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('drag-over'); });
        imageUploader.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('drag-over'); });
        imageUploader.addEventListener('drop', (e) => {
            e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('drag-over');
            if (e.dataTransfer.files) handleFileSelect(e.dataTransfer.files[0]);
        });
    }
    if (unsplashSearchButton) { unsplashSearchButton.addEventListener('click', (e) => { e.stopPropagation(); searchUnsplash(unsplashSearchInput.value); }); }
    if (unsplashSearchInput) {
        unsplashSearchInput.addEventListener('click', (e) => e.stopPropagation());
        unsplashSearchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); searchUnsplash(unsplashSearchInput.value); } });
    }
    if (postImageInput) { postImageInput.addEventListener('change', (e) => handleFileSelect(e.target.files[0])); }
    if (addTextButton) { addTextButton.addEventListener('click', addText); }
    if (changeImageButton) { changeImageButton.addEventListener('click', resetEditor); }
});