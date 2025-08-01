document.addEventListener('DOMContentLoaded', function() {

    // --- CHAVES DE API ---
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
    const addLogoButton = document.getElementById('add-logo-button');
    const logoInput = document.getElementById('logo-input');
    const textStyleControls = document.getElementById('text-style-controls');
    const textColorInput = document.getElementById('text-color');
    const textBgColorInput = document.getElementById('text-bg-color');
    const transparentBgButton = document.getElementById('transparent-bg-button');
    const borderColorInput = document.getElementById('border-color');
    const borderWidthInput = document.getElementById('border-width');
    const toggleBoldButton = document.getElementById('toggle-bold-button');
    const aiAssistantButton = document.getElementById('ai-assistant-button');
    const aiDrawer = document.getElementById('ai-drawer');
    const closeAiDrawerButton = document.getElementById('close-ai-drawer-button');
    const postTitle = document.getElementById('post-title');
    const postTextarea = document.getElementById('post-text');
    const aiGoalInput = document.getElementById('ai-goal-input');
    const aiPostTypeButtonsContainer = document.getElementById('ai-post-type-buttons');
    const generateAiContentButton = document.getElementById('generate-ai-content-button');
    const aiResultsArea = document.getElementById('ai-results-area');

    // Inicialização da Fabric.js
    const fabricCanvas = new fabric.Canvas('image-canvas', { width: 800, height: 600, backgroundColor: '#ffffff' });

    // --- LÓGICA DO EDITOR DE IMAGEM ---
    function updateTextStyleControls() { const activeObject = fabricCanvas.getActiveObject(); if (activeObject && activeObject.type === 'i-text') { textStyleControls.hidden = false; textColorInput.value = activeObject.get('fill') || '#000000'; textBgColorInput.value = activeObject.get('backgroundColor') || '#ffffff'; borderColorInput.value = activeObject.get('stroke') || '#ffffff'; borderWidthInput.value = activeObject.get('strokeWidth') || 0; toggleBoldButton.classList.toggle('active', activeObject.get('fontWeight') === 'bold'); } else { textStyleControls.hidden = true; } }
    function loadBackgroundImage(imageUrl) { fabric.Image.fromURL(imageUrl, function(img) { const canvasWidth = fabricCanvas.width; const canvasHeight = fabricCanvas.height; const imgAspectRatio = img.width / img.height; const canvasAspectRatio = canvasWidth / canvasHeight; let scale = (imgAspectRatio > canvasAspectRatio) ? (canvasWidth / img.width) : (canvasHeight / img.height); img.set({ scaleX: scale, scaleY: scale, originX: 'center', originY: 'center' }); fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), { top: canvasHeight / 2, left: canvasWidth / 2 }); editorArea.hidden = false; imageSelectionArea.hidden = true; if (unsplashResultsContainer) unsplashResultsContainer.innerHTML = ''; }, { crossOrigin: 'Anonymous' }); }
    function addText() { const text = new fabric.IText('Edite este texto', { left: 100, top: 100, fontFamily: 'Roboto', fill: '#000000', fontSize: 40, padding: 5, paintFirst: 'stroke', cornerColor: 'blue', cornerSize: 10, transparentCorners: false }); fabricCanvas.add(text); fabricCanvas.setActiveObject(text); fabricCanvas.renderAll(); }
    function addLogo(imageUrl) { fabric.Image.fromURL(imageUrl, function(logoImg) { logoImg.scaleToWidth(150); logoImg.set({ left: 150, top: 150, cornerColor: 'blue', cornerSize: 10, transparentCorners: false }); fabricCanvas.add(logoImg); fabricCanvas.setActiveObject(logoImg); fabricCanvas.renderAll(); }, { crossOrigin: 'Anonymous' }); }
    function handleLogoFileSelect(file) { if (file && file.type.startsWith('image/')) { const reader = new FileReader(); reader.onload = (e) => addLogo(e.target.result); reader.readAsDataURL(file); } else if (file) { alert('Arquivo de logo inválido. Selecione um PNG ou JPG.'); } }
    function applyStyle(styleFunction) { const activeObject = fabricCanvas.getActiveObject(); if (activeObject && activeObject.type === 'i-text') { styleFunction(activeObject); fabricCanvas.renderAll(); fabricCanvas.setActiveObject(activeObject); } }
    function changeTextColor(color) { applyStyle(obj => obj.set('fill', color)); }
    function changeTextBackgroundColor(color) { applyStyle(obj => obj.set('backgroundColor', color)); }
    function makeBackgroundTransparent() { applyStyle(obj => obj.set('backgroundColor', '')); }
    function toggleBold() { applyStyle(obj => { const isBold = obj.get('fontWeight') === 'bold'; obj.set('fontWeight', isBold ? 'normal' : 'bold'); }); updateTextStyleControls(); }
    function changeBorder(color, width) { applyStyle(obj => { const widthFloat = parseFloat(width); if (widthFloat === 0) { obj.set('stroke', null); obj.set('strokeWidth', 0); } else { obj.set('stroke', color); obj.set('strokeWidth', widthFloat); } }); }
    function handleFileSelect(file) { if (file && file.type.startsWith('image/')) { const reader = new FileReader(); reader.onload = (e) => loadBackgroundImage(e.target.result); reader.readAsDataURL(file); } else if (file) { alert('Arquivo inválido.'); } }
    function resetEditor() { fabricCanvas.clear(); fabricCanvas.setBackgroundImage(null, fabricCanvas.renderAll.bind(fabricCanvas)); editorArea.hidden = true; imageSelectionArea.hidden = false; }
    async function searchUnsplash(query) { if (!query) return; unsplashSearchButton.textContent = 'Buscando...'; unsplashSearchButton.disabled = true; const endpoint = `https://api.unsplash.com/search/photos?query=${query}&per_page=12&client_id=${UNSPLASH_ACCESS_KEY}`; try { const response = await fetch(endpoint); const data = await response.json(); if (unsplashResultsContainer) unsplashResultsContainer.innerHTML = ''; if (data.results && data.results.length > 0) { data.results.forEach(photo => { const img = document.createElement('img'); img.src = photo.urls.small; img.classList.add('unsplash-image'); img.addEventListener('click', () => loadBackgroundImage(photo.urls.regular)); unsplashResultsContainer.appendChild(img); }); } else { if (unsplashResultsContainer) unsplashResultsContainer.innerHTML = '<p>Nenhum resultado encontrado.</p>'; } } catch (error) { if (unsplashResultsContainer) unsplashResultsContainer.innerHTML = '<p>Erro ao buscar imagens.</p>'; } finally { unsplashSearchButton.textContent = 'Buscar'; unsplashSearchButton.disabled = false; } }

    // --- LÓGICA DO ASSISTENTE DE IA (COM LIMPEZA DE OBSERVAÇÕES) ---
    let selectedPostType = '';
    function handlePostTypeSelection(event) {
        const clickedButton = event.target.closest('.post-type-button');
        if (!clickedButton) return;
        aiPostTypeButtonsContainer.querySelectorAll('.post-type-button').forEach(button => button.classList.remove('active'));
        clickedButton.classList.add('active');
        selectedPostType = clickedButton.dataset.type;
    }
    async function generateAiContent() {
        const goal = aiGoalInput.value;
        if (!goal || !selectedPostType) { alert('Por favor, preencha seu objetivo e selecione um tipo de postagem.'); return; }
        generateAiContentButton.textContent = 'Gerando...';
        generateAiContentButton.disabled = true;
        aiResultsArea.innerHTML = '<p>Pensando nas melhores ideias para você...</p>';
        const prompt = `Aja como um especialista em marketing para pequenos negócios locais no Brasil, com um tom de voz direto, persuasivo e que gera urgência, inspirado no estilo de Erico Rocha e com gatilhos mentais dos 7 pecados capitais. IMPORTANTE: Use exclusivamente vocabulário e expressões do Português do Brasil (pt-BR). Meu negócio tem o seguinte objetivo: "${goal}". O tipo de postagem que eu quero criar é: "${selectedPostType}". Crie uma sugestão de post para o Google Business Profile contendo: 1. Uma Headline (título) curta, magnética e que use no máximo 58 caracteres. 2. Uma Copy (texto do post) com no máximo 1500 caracteres, usando quebras de linha para facilitar a leitura, emojis relevantes e hashtags. Formate a sua resposta EXATAMENTE da seguinte forma, sem nenhuma palavra ou formatação adicional: Headline: [Aqui a sua sugestão de headline] Copy: [Aqui a sua sugestão de copy]`;
        const API_URL = '/.netlify/functions/generate-ideas';
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });
            if (!response.ok) throw new Error(`A resposta da rede não foi "ok". Status: ${response.status}`);
            const data = await response.json();
            const content = data.content;
            const headlineMatch = content.match(/Headline: (.*)/);
            let copyMatch = content.match(/Copy: ([\s\S]*)/);
            if (!headlineMatch || !copyMatch) {
                const headlineIndex = content.indexOf("Headline:");
                const copyIndex = content.indexOf("Copy:");
                if (headlineIndex !== -1 && copyIndex !== -1) {
                    let headline = content.substring(headlineIndex + 9, copyIndex).trim();
                    let copy = content.substring(copyIndex + 5).trim();
                    const obsIndex = copy.indexOf("Observações:");
                    if (obsIndex !== -1) { copy = copy.substring(0, obsIndex).trim(); }
                    displayAiResults(headline, copy);
                } else {
                    throw new Error(content);
                }
            } else {
                let headline = headlineMatch[1].trim();
                let copy = copyMatch[1].trim();
                const obsIndex = copy.indexOf("Observações:");
                if (obsIndex !== -1) { copy = copy.substring(0, obsIndex).trim(); }
                displayAiResults(headline, copy);
            }
        } catch (error) { console.error('Erro ao gerar conteúdo com IA:', error); aiResultsArea.innerHTML = `<p>Ocorreu um erro. A IA respondeu, mas o formato foi inesperado. Tente refazer a pergunta.</p><p style="font-size: 0.8em; color: grey;">Resposta recebida: ${error.message}</p>`; } finally { generateAiContentButton.textContent = 'Gerar Ideias'; generateAiContentButton.disabled = false; }
    }
    function displayAiResults(headline, copy) {
        aiResultsArea.innerHTML = `<div class="ai-result-item"><h4>Sugestão de Assunto</h4><p id="ai-headline-result">${headline}</p><button class="use-text-button" data-target="headline">Usar este assunto</button></div><div class="ai-result-item"><h4>Sugestão de Texto</h4><p id="ai-copy-result">${copy.replace(/\n/g, '<br>')}</p><button class="use-text-button" data-target="copy">Usar este Texto</button></div>`;
    }
    function useAiText(event) {
        if (!event.target.classList.contains('use-text-button')) return;
        const target = event.target.dataset.target;
        if (target === 'headline') {
            const headlineText = document.getElementById('ai-headline-result').innerText;
            postTitle.value = headlineText;
            aiDrawer.classList.remove('open');
        } else if (target === 'copy') {
            const copyText = document.getElementById('ai-copy-result').innerText;
            postTextarea.value = copyText;
            aiDrawer.classList.remove('open');
        }
    }

    // --- FUNÇÃO DE INICIALIZAÇÃO DOS EVENTOS ---
    function initializeEventListeners() {
        if (fabricCanvas) { fabricCanvas.on({ 'selection:created': updateTextStyleControls, 'selection:updated': updateTextStyleControls, 'selection:cleared': updateTextStyleControls }); }
        if (textColorInput) textColorInput.addEventListener('input', (e) => changeTextColor(e.target.value));
        if (textBgColorInput) textBgColorInput.addEventListener('input', (e) => changeTextBackgroundColor(e.target.value));
        if (transparentBgButton) transparentBgButton.addEventListener('click', makeBackgroundTransparent);
        if (borderColorInput) borderColorInput.addEventListener('input', (e) => changeBorder(e.target.value, borderWidthInput.value));
        if (borderWidthInput) borderWidthInput.addEventListener('input', (e) => changeBorder(borderColorInput.value, e.target.value));
        if (toggleBoldButton) toggleBoldButton.addEventListener('click', toggleBold);
        if (imageUploader) { imageUploader.addEventListener('click', () => { if (postImageInput) postImageInput.click(); }); imageUploader.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('drag-over'); }); imageUploader.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('drag-over'); }); imageUploader.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('drag-over'); if (e.dataTransfer.files) handleFileSelect(e.dataTransfer.files[0]); }); }
        if (unsplashSearchButton) { unsplashSearchButton.addEventListener('click', (e) => { e.stopPropagation(); searchUnsplash(unsplashSearchInput.value); }); }
        if (unsplashSearchInput) { unsplashSearchInput.addEventListener('click', (e) => e.stopPropagation()); unsplashSearchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); searchUnsplash(unsplashSearchInput.value); } }); }
        if (postImageInput) { postImageInput.addEventListener('change', (e) => handleFileSelect(e.target.files[0])); }
        if (addTextButton) { addTextButton.addEventListener('click', addText); }
        if (changeImageButton) { changeImageButton.addEventListener('click', resetEditor); }
        if (addLogoButton) { addLogoButton.addEventListener('click', () => logoInput.click()); }
        if (logoInput) { logoInput.addEventListener('change', (e) => { if (e.target.files.length > 0) { handleLogoFileSelect(e.target.files[0]); } }); }
        window.addEventListener('keydown', function(e) { if (e.key === 'Delete' || e.key === 'Backspace') { const activeObject = fabricCanvas.getActiveObject(); if (activeObject) { if (activeObject.isEditing) return; e.preventDefault(); fabricCanvas.remove(activeObject); fabricCanvas.renderAll(); } } });
        if (aiAssistantButton && aiDrawer) { aiAssistantButton.addEventListener('click', () => { aiDrawer.classList.add('open'); }); }
        if (closeAiDrawerButton && aiDrawer) { closeAiDrawerButton.addEventListener('click', () => { aiDrawer.classList.remove('open'); }); }
        if (aiPostTypeButtonsContainer) { aiPostTypeButtonsContainer.addEventListener('click', handlePostTypeSelection); }
        if (generateAiContentButton) { generateAiContentButton.addEventListener('click', generateAiContent); }
        if (aiResultsArea) { aiResultsArea.addEventListener('click', useAiText); }
    }

    // --- EXECUÇÃO ---
    initializeEventListeners();
});