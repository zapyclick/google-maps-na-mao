document.addEventListener('DOMContentLoaded', function() {

    const UNSPLASH_ACCESS_KEY = 'KBW9bmH_7GwSA7phZx06SDUcQ4ZCatAmFFjCL5PLgLI';

    // Elementos da UI
    const imageSelectionArea = document.getElementById('image-selection-area');
    const editorArea = document.getElementById('editor-area');
    const imageUploader = document.getElementById('image-uploader');
    const postImageInput = document.getElementById('post-image');
    const unsplashSearchInput = document.getElementById('unsplash-search-input');
    const unsplashSearchButton = document.getElementById('unsplash-search-button');
    const unsplashResultsContainer = document.getElementById('unsplash-results');
    const changeImageButton = document.getElementById('change-image-button');
    const addTextButton = document.getElementById('add-text-button');
    const textStyleControls = document.getElementById('text-style-controls');
    const textColorInput = document.getElementById('text-color');
    const textBgColorInput = document.getElementById('text-bg-color');
    const transparentBgButton = document.getElementById('transparent-bg-button');
    const borderColorInput = document.getElementById('border-color');
    const borderWidthInput = document.getElementById('border-width');
    const toggleBoldButton = document.getElementById('toggle-bold-button');

    // Inicialização da Fabric.js
    const fabricCanvas = new fabric.Canvas('image-canvas', {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff'
    });

    // --- LÓGICA DO EDITOR ---

    function updateTextStyleControls() {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject && activeObject.type === 'i-text') {
            textStyleControls.hidden = false;
            textColorInput.value = activeObject.get('fill');
            textBgColorInput.value = activeObject.get('backgroundColor') || '#ffffff';
            borderColorInput.value = activeObject.get('stroke') || '#ffffff';
            borderWidthInput.value = activeObject.get('strokeWidth') || 0;
            if (activeObject.get('fontWeight') === 'bold') {
                toggleBoldButton.classList.add('active');
            } else {
                toggleBoldButton.classList.remove('active');
            }
        } else {
            textStyleControls.hidden = true;
        }
    }

    function loadBackgroundImage(imageUrl) {
        fabric.Image.fromURL(imageUrl, function(img) {
            const canvasWidth = fabricCanvas.width;
            const canvasHeight = fabricCanvas.height;
            const imgAspectRatio = img.width / img.height;
            const canvasAspectRatio = canvasWidth / canvasHeight;
            let scale = (imgAspectRatio > canvasAspectRatio) ? (canvasWidth / img.width) : (canvasHeight / img.height);
            img.set({ scaleX: scale, scaleY: scale, originX: 'center', originY: 'center' });
            fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), { top: canvasHeight / 2, left: canvasWidth / 2 });
            editorArea.hidden = false;
            imageSelectionArea.hidden = true;
            if (unsplashResultsContainer) unsplashResultsContainer.innerHTML = '';
        }, { crossOrigin: 'Anonymous' });
    }

    function addText() {
        const text = new fabric.IText('Edite este texto', {
            left: 100, top: 100, fontFamily: 'Roboto', fill: '#000000', fontSize: 40, padding: 5,
            paintFirst: 'stroke'
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        fabricCanvas.renderAll();
    }

    function applyStyle(styleFunction) {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject && activeObject.type === 'i-text') {
            styleFunction(activeObject);
            fabricCanvas.renderAll();
            fabricCanvas.setActiveObject(activeObject);
        }
    }
        
    function changeTextColor(color) { applyStyle(obj => obj.set('fill', color)); }
    function changeTextBackgroundColor(color) { applyStyle(obj => obj.set('backgroundColor', color)); }
    function makeBackgroundTransparent() { applyStyle(obj => obj.set('backgroundColor', '')); }
    function toggleBold() {
        applyStyle(obj => {
            const isBold = obj.get('fontWeight') === 'bold';
            obj.set('fontWeight', isBold ? 'normal' : 'bold');
        });
        updateTextStyleControls();
    }
    function changeBorder(color, width) {
        applyStyle(obj => {
            const widthFloat = parseFloat(width);
            if (widthFloat === 0) {
                obj.set('stroke', null);
                obj.set('strokeWidth', 0);
            } else {
                obj.set('stroke', color);
                obj.set('strokeWidth', widthFloat);
            }
        });
    }

    function handleFileSelect(file) { if (file && file.type.startsWith('image/')) { const reader = new FileReader(); reader.onload = (e) => loadBackgroundImage(e.target.result); reader.readAsDataURL(file); } else if (file) { alert('Arquivo inválido.'); } }
    function resetEditor() { fabricCanvas.clear(); fabricCanvas.setBackgroundImage(null, fabricCanvas.renderAll.bind(fabricCanvas)); editorArea.hidden = true; imageSelectionArea.hidden = false; }
    async function searchUnsplash(query) { if (!query) return; unsplashSearchButton.textContent = 'Buscando...'; unsplashSearchButton.disabled = true; const endpoint = `https://api.unsplash.com/search/photos?query=${query}&per_page=12&client_id=${UNSPLASH_ACCESS_KEY}`; try { const response = await fetch(endpoint); const data = await response.json(); if (unsplashResultsContainer) unsplashResultsContainer.innerHTML = ''; if (data.results && data.results.length > 0) { data.results.forEach(photo => { const img = document.createElement('img'); img.src = photo.urls.small; img.classList.add('unsplash-image'); img.addEventListener('click', () => loadBackgroundImage(photo.urls.regular)); unsplashResultsContainer.appendChild(img); }); } else { if (unsplashResultsContainer) unsplashResultsContainer.innerHTML = '<p>Nenhum resultado encontrado.</p>'; } } catch (error) { if (unsplashResultsContainer) unsplashResultsContainer.innerHTML = '<p>Erro ao buscar imagens.</p>'; } finally { unsplashSearchButton.textContent = 'Buscar'; unsplashSearchButton.disabled = false; } }

    // --- CONFIGURAÇÃO DOS EVENTOS ---
    fabricCanvas.on({ 'selection:created': updateTextStyleControls, 'selection:updated': updateTextStyleControls, 'selection:cleared': updateTextStyleControls });
    textColorInput.addEventListener('input', (e) => changeTextColor(e.target.value));
    textBgColorInput.addEventListener('input', (e) => changeTextBackgroundColor(e.target.value));
    transparentBgButton.addEventListener('click', makeBackgroundTransparent);
    borderColorInput.addEventListener('input', (e) => changeBorder(e.target.value, borderWidthInput.value));
    borderWidthInput.addEventListener('input', (e) => changeBorder(borderColorInput.value, e.target.value));
    toggleBoldButton.addEventListener('click', toggleBold);
    if (imageUploader) { imageUploader.addEventListener('click', () => { if (postImageInput) postImageInput.click(); }); imageUploader.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('drag-over'); }); imageUploader.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('drag-over'); }); imageUploader.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('drag-over'); if (e.dataTransfer.files) handleFileSelect(e.dataTransfer.files[0]); }); }
    if (unsplashSearchButton) { unsplashSearchButton.addEventListener('click', (e) => { e.stopPropagation(); searchUnsplash(unsplashSearchInput.value); }); }
    if (unsplashSearchInput) { unsplashSearchInput.addEventListener('click', (e) => e.stopPropagation()); unsplashSearchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); searchUnsplash(unsplashSearchInput.value); } }); }
    if (postImageInput) { postImageInput.addEventListener('change', (e) => handleFileSelect(e.target.files[0])); }
    if (addTextButton) { addTextButton.addEventListener('click', addText); }
    if (changeImageButton) { changeImageButton.addEventListener('click', resetEditor); }
});