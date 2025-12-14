const API_BASE = 'http://localhost:3847/api';

const i18n = {
    ru: {
        selectWindow: '-- Выберите окно --',
        loading: 'Загрузка...',
        ready: 'Готов',
        error: 'Ошибка',
        translations: 'Переводов',
        sprites: 'Спрайтов',
        loadingWindow: 'Загрузка',
        loaded: 'Загружено',
        loadError: 'Ошибка загрузки',
        saving: 'Сохранение...',
        saved: 'Сохранено',
        saveError: 'Ошибка сохранения',
        savingTranslation: 'Сохранение перевода...',
        translationSaved: 'Перевод сохранён',
        selectElement: 'Выберите элемент для редактирования',
        noText: 'Нет текста',
        basic: 'Основное',
        captionId: 'Caption ID',
        positionSize: 'Позиция и размер',
        position: 'Позиция',
        size: 'Размер',
        width: 'Ширина',
        height: 'Высота',
        font: 'Шрифт',
        fontSize: 'Размер шрифта',
        flags: 'Флаги',
        appearance: 'Внешний вид',
        sprite: 'Спрайт (ani)',
        textColor: 'Цвет текста',
        grid: 'Сетка',
        bounds: 'Границы',
        overflow: 'Переполнение',
        elements: 'Элементы',
        search: 'Поиск...',
        properties: 'Свойства',
        translation: 'Перевод',
        window: 'Окно',
        stringId: 'ID строки',
        currentText: 'Текущий текст',
        widthPreview: 'Предпросмотр ширины',
        saveTranslation: 'Сохранить перевод',
        windowId: 'ID окна',
        save: 'Сохранить',
        export: 'Экспорт',
        windowNotLoaded: 'Окно не загружено',
        reload: 'Перезагрузить',
        zoomIn: 'Увеличить',
        zoomOut: 'Уменьшить',
        zoomFit: 'Вписать',
        translationText: 'Текст перевода...',
        searchTranslation: 'Поиск перевода',
        searchByIdOrText: 'Поиск по ID или тексту...'
    },
    en: {
        selectWindow: '-- Select window --',
        loading: 'Loading...',
        ready: 'Ready',
        error: 'Error',
        translations: 'Translations',
        sprites: 'Sprites',
        loadingWindow: 'Loading',
        loaded: 'Loaded',
        loadError: 'Load error',
        saving: 'Saving...',
        saved: 'Saved',
        saveError: 'Save error',
        savingTranslation: 'Saving translation...',
        translationSaved: 'Translation saved',
        selectElement: 'Select element to edit',
        noText: 'No text',
        basic: 'Basic',
        captionId: 'Caption ID',
        positionSize: 'Position and size',
        position: 'Position',
        size: 'Size',
        width: 'Width',
        height: 'Height',
        font: 'Font',
        fontSize: 'Font size',
        flags: 'Flags',
        appearance: 'Appearance',
        sprite: 'Sprite (ani)',
        textColor: 'Text color',
        grid: 'Grid',
        bounds: 'Bounds',
        overflow: 'Overflow',
        elements: 'Elements',
        search: 'Search...',
        properties: 'Properties',
        translation: 'Translation',
        window: 'Window',
        stringId: 'String ID',
        currentText: 'Current text',
        widthPreview: 'Width preview',
        saveTranslation: 'Save translation',
        windowId: 'Window ID',
        save: 'Save',
        export: 'Export',
        windowNotLoaded: 'Window not loaded',
        reload: 'Reload',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        zoomFit: 'Fit',
        translationText: 'Translation text...',
        searchTranslation: 'Search translation',
        searchByIdOrText: 'Search by ID or text...'
    }
};

const state = {
    windows: [],
    currentWindow: null,
    selectedControl: null,
    sprites: {},
    spritesLower: {},
    translations: {},
    zoom: 1,
    isDirty: false,
    showGrid: true,
    showBounds: true,
    showOverflow: false,
    lang: localStorage.getItem('rh_editor_lang') || 'ru'
};

function t(key) {
    return i18n[state.lang][key] || i18n.ru[key] || key;
}

function setLang(lang) {
    state.lang = lang;
    localStorage.setItem('rh_editor_lang', lang);
    updateUILanguage();
}

function updateUILanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        el.placeholder = t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.dataset.i18nTitle;
        el.title = t(key);
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === state.lang);
    });
    if (elements.translationCount) {
        elements.translationCount.textContent = `${t('translations')}: ${Object.keys(state.translations).length}`;
    }
    if (elements.spriteCount) {
        elements.spriteCount.textContent = `${t('sprites')}: ${Object.keys(state.sprites).length}`;
    }
}

const elements = {
    windowSelect: document.getElementById('windowSelect'),
    controlsList: document.getElementById('controlsList'),
    controlSearch: document.getElementById('controlSearch'),
    windowPreview: document.getElementById('windowPreview'),
    canvas: document.getElementById('canvas'),
    canvasWrapper: document.getElementById('canvasWrapper'),
    propertiesPanel: document.getElementById('propertiesPanel'),
    saveBtn: document.getElementById('saveBtn'),
    reloadBtn: document.getElementById('reloadBtn'),
    zoomLevel: document.getElementById('zoomLevel'),
    windowInfo: document.getElementById('windowInfo'),
    mousePos: document.getElementById('mousePos'),
    statusText: document.getElementById('statusText'),
    translationCount: document.getElementById('translationCount'),
    spriteCount: document.getElementById('spriteCount'),
    transId: document.getElementById('transId'),
    transText: document.getElementById('transText'),
    widthFill: document.getElementById('widthFill'),
    widthInfo: document.getElementById('widthInfo'),
    windowId: document.getElementById('windowId'),
    windowWidth: document.getElementById('windowWidth'),
    windowHeight: document.getElementById('windowHeight'),
    windowX: document.getElementById('windowX'),
    windowY: document.getElementById('windowY')
};

async function init() {
    updateUILanguage();
    setStatus(t('loading'));
    
    try {
        const [windows, sprites, translations] = await Promise.all([
            fetch(`${API_BASE}/windows`).then(r => r.json()),
            fetch(`${API_BASE}/sprites`).then(r => r.json()),
            fetch(`${API_BASE}/translations`).then(r => r.json())
        ]);
        
        state.windows = windows;
        state.sprites = sprites;
        state.translations = translations;
        
        for (const [key, val] of Object.entries(sprites)) {
            state.spritesLower[key.toLowerCase()] = val;
        }
        
        populateWindowSelect();
        
        elements.translationCount.textContent = `Переводов: ${Object.keys(translations).length}`;
        elements.spriteCount.textContent = `Спрайтов: ${Object.keys(sprites).length}`;
        
        setStatus('Готов');
        
        await loadFonts();
        
    } catch (e) {
        setStatus(`Ошибка: ${e.message}`);
        console.error(e);
    }
    
    setupEventListeners();
}

async function loadFonts() {
    try {
        const fonts = await fetch(`${API_BASE}/fonts`).then(r => r.json());
        
        for (const fontFile of fonts) {
            const fontName = fontFile.replace('.ttf', '');
            const font = new FontFace(fontName, `url(${API_BASE}/font/${fontFile})`);
            await font.load();
            document.fonts.add(font);
        }
        
        console.log(`Loaded ${fonts.length} fonts`);
    } catch (e) {
        console.warn('Could not load fonts:', e);
    }
}

function populateWindowSelect() {
    elements.windowSelect.innerHTML = '<option value="">-- SELECT --</option>';
    
    for (const win of state.windows) {
        const option = document.createElement('option');
        option.value = win.name;
        option.textContent = win.name.replace('.xml', '');
        elements.windowSelect.appendChild(option);
    }
}

async function loadWindow(name) {
    if (!name) {
        state.currentWindow = null;
        renderPreview();
        renderControlsList();
        return;
    }
    
    setStatus(`Загрузка ${name}...`);
    
    try {
        const windowData = await fetch(`${API_BASE}/window/${name}`).then(r => r.json());
        state.currentWindow = windowData;
        state.currentWindow.fileName = name;
        state.selectedControl = null;
        state.isDirty = false;
        
        elements.saveBtn.disabled = true;
        
        renderPreview();
        renderControlsList();
        updateWindowPanel();
        
        elements.windowInfo.textContent = `${windowData.id} (${windowData.size.width}×${windowData.size.height})`;
        setStatus(`Загружено: ${name}`);
        
    } catch (e) {
        setStatus(`Ошибка загрузки: ${e.message}`);
        console.error(e);
    }
}

function renderPreview() {
    const preview = elements.windowPreview;
    preview.innerHTML = '';
    
    if (!state.currentWindow) {
        preview.style.width = '400px';
        preview.style.height = '300px';
        return;
    }
    
    const win = state.currentWindow;
    preview.style.width = `${win.size.width}px`;
    preview.style.height = `${win.size.height}px`;
    
    for (const control of win.controls) {
        const el = createControlElement(control);
        preview.appendChild(el);
    }
    
    updateZoom();
}

function createControlElement(control) {
    const el = document.createElement('div');
    el.className = 'preview-control';
    el.dataset.id = control.id;
    
    if (state.showBounds) {
        el.classList.add('show-bounds');
    }
    
    el.style.left = `${control.x}px`;
    el.style.top = `${control.y}px`;
    el.style.width = `${control.width}px`;
    el.style.height = `${control.height}px`;
    
    if (control.ani) {
        const sprite = getSprite(control.ani);
        if (sprite && sprite.textures && sprite.textures.length > 0) {
            renderSprite(el, control, sprite);
        }
    }
    
    const caption = control.caption;
    if (caption && caption !== '0' && caption !== '-1') {
        const text = state.translations[caption] || `[${caption}]`;
        
        const textEl = document.createElement('div');
        textEl.className = 'preview-control-text';
        textEl.dataset.captionId = caption;
        
        textEl.innerHTML = parseGameText(text);
        
        applyFontStyle(textEl, control);
        
        el.appendChild(textEl);
        
        setTimeout(() => {
            checkTextOverflow(el, textEl, control);
        }, 10);
    }
    
    if (state.selectedControl && state.selectedControl.id === control.id) {
        el.classList.add('selected');
        addResizeHandles(el);
    }
    
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectControl(control);
    });
    
    return el;
}

function parseGameText(text) {
    if (!text) return '';
    
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    html = html.replace(/&lt;BR&gt;/gi, '<br>');
    html = html.replace(/&lt;br&gt;/gi, '<br>');
    
    html = html.replace(/&lt;color:([0-9a-fA-F]{6})&gt;/gi, '<span style="color:#$1">');
    
    html = html.replace(/&lt;\/color&gt;/gi, '</span>');
    
    html = html.replace(/&lt;right&gt;/gi, '<span style="float:right">');
    html = html.replace(/&lt;\/right&gt;/gi, '</span>');
    
    html = html.replace(/&lt;center&gt;/gi, '<span style="text-align:center;display:block">');
    html = html.replace(/&lt;\/center&gt;/gi, '</span>');
    
    return html;
}

function updatePreviewText(captionId, newText) {
    const textElements = document.querySelectorAll(`[data-caption-id="${captionId}"]`);
    textElements.forEach(el => {
        el.innerHTML = parseGameText(newText);
    });
}

function getSprite(name) {
    if (!name) return null;
    return state.sprites[name] || state.spritesLower[name.toLowerCase()] || null;
}

function renderSprite(el, control, sprite) {
    const texCount = sprite.textures.length;
    const type = sprite.type;
    
    if (type === 'gauge' || type === 'gauge_nobg' || type === 'gauge_multi') {
        renderGauge(el, control, sprite);
        return;
    }
    
    if (type === 'v_scroll' || type === 'h_scroll' || type === 'combo' || 
        type === 'v_slider' || type === 'h_slider') {
        renderComplexWidget(el, control, sprite);
        return;
    }
    
    if (type === 'edit') {
        if (texCount === 9) {
            render9SliceSprite(el, control, sprite);
        } else if (texCount === 3) {
            render3SliceHorizontal(el, control, sprite);
        } else {
            renderSimpleSprite(el, control, sprite);
        }
        return;
    }
    
    if (type === 'number') {
        renderSimpleSprite(el, control, sprite);
        return;
    }
    
    if (type === 'static' && texCount === 9) {
        render9SliceSprite(el, control, sprite);
        return;
    }
    
    if (type === 'static' && texCount === 3) {
        render3SliceHorizontal(el, control, sprite);
        return;
    }
    
    if ((type === 'static_multiline' || type === 'static_multiline2') && texCount === 9) {
        render9SliceSprite(el, control, sprite);
        return;
    }
    
    if (type === 'button' || type === 'pushbutton' || type === 'checkbutton') {
        if (texCount === 9) {
            render9SliceSprite(el, control, sprite);
            return;
        }
        if (texCount === 12) {
            render3SliceButton(el, control, sprite);
            return;
        }
        if (texCount === 36) {
            render9SliceSprite(el, control, { textures: sprite.textures.slice(0, 9) });
            return;
        }
        if (texCount >= 1 && texCount <= 4) {
            renderSimpleSprite(el, control, sprite);
            return;
        }
    }
    
    if (type === 'anistatic') {
        renderSimpleSprite(el, control, sprite);
        return;
    }
    
    renderSimpleSprite(el, control, sprite);
}

function renderSimpleSprite(el, control, sprite) {
    const tex = sprite.textures[0];
    const img = document.createElement('img');
    img.className = 'preview-control-sprite';
    img.src = `${API_BASE}/resource/${tex.path}`;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'fill';
    img.onerror = () => { img.style.display = 'none'; };
    el.appendChild(img);
}

function renderGauge(el, control, sprite) {
    const textures = sprite.textures;
    const type = sprite.type;
    
    const container = document.createElement('div');
    container.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        overflow: hidden;
    `;
    
    if (type === 'gauge' && textures.length >= 2) {
        const bg = document.createElement('div');
        bg.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: url(${API_BASE}/resource/${textures[0].path});
            background-size: 100% 100%;
        `;
        container.appendChild(bg);
        
        const fill = document.createElement('div');
        fill.style.cssText = `
            position: absolute;
            top: 0; left: 0; width: 50%; bottom: 0;
            background-image: url(${API_BASE}/resource/${textures[1].path});
            background-size: cover;
        `;
        container.appendChild(fill);
    } else {
        const fill = document.createElement('div');
        fill.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: url(${API_BASE}/resource/${textures[0].path});
            background-size: 100% 100%;
        `;
        container.appendChild(fill);
    }
    
    el.appendChild(container);
}

function renderComplexWidget(el, control, sprite) {
    const textures = sprite.textures;
    const type = sprite.type;
    const texCount = textures.length;
    
    const container = document.createElement('div');
    container.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        overflow: hidden;
    `;
    
    if (type === 'v_scroll') {
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        
        const upBtn = document.createElement('div');
        upBtn.style.cssText = `
            height: ${textures[0].height}px;
            background-image: url(${API_BASE}/resource/${textures[0].path});
            background-size: 100% 100%;
            flex-shrink: 0;
        `;
        container.appendChild(upBtn);
        
        const trackIdx = texCount > 14 ? 15 : Math.min(8, texCount - 1);
        const track = document.createElement('div');
        track.style.cssText = `
            flex: 1;
            background-image: url(${API_BASE}/resource/${textures[trackIdx].path});
            background-repeat: repeat-y;
            background-size: 100% auto;
        `;
        container.appendChild(track);
        
        if (texCount > 4) {
            const downBtn = document.createElement('div');
            downBtn.style.cssText = `
                height: ${textures[4].height}px;
                background-image: url(${API_BASE}/resource/${textures[4].path});
                background-size: 100% 100%;
                flex-shrink: 0;
            `;
            container.appendChild(downBtn);
        }
    } else if (type === 'h_scroll' || type === 'h_slider' || type === 'v_slider') {
        container.style.display = 'flex';
        container.style.flexDirection = type === 'v_slider' ? 'column' : 'row';
        
        const first = document.createElement('div');
        first.style.cssText = type === 'v_slider' ? `
            height: ${textures[0].height}px;
            background-image: url(${API_BASE}/resource/${textures[0].path});
            background-size: 100% 100%;
            flex-shrink: 0;
        ` : `
            width: ${textures[0].width}px;
            background-image: url(${API_BASE}/resource/${textures[0].path});
            background-size: 100% 100%;
            flex-shrink: 0;
        `;
        container.appendChild(first);
        
        const track = document.createElement('div');
        track.style.cssText = `
            flex: 1;
            background-image: url(${API_BASE}/resource/${textures[1].path});
            background-repeat: ${type === 'v_slider' ? 'repeat-y' : 'repeat-x'};
            background-size: ${type === 'v_slider' ? '100% auto' : 'auto 100%'};
        `;
        container.appendChild(track);
        
        if (texCount > 2) {
            const last = document.createElement('div');
            last.style.cssText = type === 'v_slider' ? `
                height: ${textures[2].height}px;
                background-image: url(${API_BASE}/resource/${textures[2].path});
                background-size: 100% 100%;
                flex-shrink: 0;
            ` : `
                width: ${textures[2].width}px;
                background-image: url(${API_BASE}/resource/${textures[2].path});
                background-size: 100% 100%;
                flex-shrink: 0;
            `;
            container.appendChild(last);
        }
    } else if (type === 'combo') {
        const btn = document.createElement('div');
        btn.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: url(${API_BASE}/resource/${textures[0].path});
            background-size: 100% 100%;
        `;
        container.appendChild(btn);
        
        if (texCount > 3) {
            const arrow = document.createElement('div');
            arrow.style.cssText = `
                position: absolute;
                right: 4px;
                top: 50%;
                transform: translateY(-50%);
                width: ${textures[3].width}px;
                height: ${textures[3].height}px;
                background-image: url(${API_BASE}/resource/${textures[3].path});
                background-size: 100% 100%;
            `;
            container.appendChild(arrow);
        }
    }
    
    el.appendChild(container);
}

function render3SliceHorizontal(el, control, sprite) {
    const textures = sprite.textures;
    const leftTex = textures[0];
    const centerTex = textures[1];
    const rightTex = textures[2];
    
    const container = document.createElement('div');
    container.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        display: flex;
        flex-direction: row;
        pointer-events: none;
    `;
    
    const left = document.createElement('div');
    left.style.cssText = `
        width: ${leftTex.width}px;
        height: 100%;
        background-image: url(${API_BASE}/resource/${leftTex.path});
        background-size: 100% 100%;
        flex-shrink: 0;
    `;
    
    const center = document.createElement('div');
    center.style.cssText = `
        flex: 1;
        height: 100%;
        background-image: url(${API_BASE}/resource/${centerTex.path});
        background-size: 100% 100%;
    `;
    
    const right = document.createElement('div');
    right.style.cssText = `
        width: ${rightTex.width}px;
        height: 100%;
        background-image: url(${API_BASE}/resource/${rightTex.path});
        background-size: 100% 100%;
        flex-shrink: 0;
    `;
    
    container.appendChild(left);
    container.appendChild(center);
    container.appendChild(right);
    el.appendChild(container);
}

function render3SliceButton(el, control, sprite) {
    const textures = sprite.textures;
    const leftTex = textures[0];
    const centerTex = textures[1];
    const rightTex = textures[2];
    
    const container = document.createElement('div');
    container.className = 'three-slice-container';
    container.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        display: flex;
        flex-direction: row;
        pointer-events: none;
    `;
    
    const left = document.createElement('div');
    left.style.cssText = `
        width: ${leftTex.width}px;
        height: 100%;
        background-image: url(${API_BASE}/resource/${leftTex.path});
        background-size: 100% 100%;
        flex-shrink: 0;
    `;
    
    const center = document.createElement('div');
    center.style.cssText = `
        flex: 1;
        height: 100%;
        background-image: url(${API_BASE}/resource/${centerTex.path});
        background-size: 100% 100%;
        background-repeat: repeat-x;
    `;
    
    const right = document.createElement('div');
    right.style.cssText = `
        width: ${rightTex.width}px;
        height: 100%;
        background-image: url(${API_BASE}/resource/${rightTex.path});
        background-size: 100% 100%;
        flex-shrink: 0;
    `;
    
    container.appendChild(left);
    container.appendChild(center);
    container.appendChild(right);
    el.appendChild(container);
}

function render9SliceSprite(el, control, sprite) {
    const textures = sprite.textures;
    
    const cornerW = textures[0].width;
    const cornerH = textures[0].height;
    
    const container = document.createElement('div');
    container.className = 'nine-slice-container';
    container.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        display: grid;
        grid-template-columns: ${cornerW}px 1fr ${textures[2].width}px;
        grid-template-rows: ${cornerH}px 1fr ${textures[6].height}px;
        pointer-events: none;
    `;
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.style.cssText = `
            background-image: url(${API_BASE}/resource/${textures[i].path});
            background-size: 100% 100%;
            background-repeat: no-repeat;
        `;
        container.appendChild(cell);
    }
    
    el.appendChild(container);
}

function applyFontStyle(el, control) {
    let fontFamily = control.font_name || 'font';
    if (fontFamily === 'dotum') fontFamily = 'Dotum, sans-serif';
    el.style.fontFamily = fontFamily;
    
    el.style.fontSize = `${control.font_size || 10}px`;
    
    const flags = control.font_flag || '';
    
    if (flags.includes('ft_bold')) {
        el.style.fontWeight = 'bold';
    }
    
    if (flags.includes('ft_shadow')) {
        el.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
    }
    
    if (flags.includes('ft_outline')) {
        el.style.textShadow = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';
    }
    
    if (flags.includes('al_center')) {
        el.style.justifyContent = 'center';
        el.style.textAlign = 'center';
    } else if (flags.includes('al_right')) {
        el.style.justifyContent = 'flex-end';
        el.style.textAlign = 'right';
    } else {
        el.style.justifyContent = 'flex-start';
        el.style.textAlign = 'left';
    }
    
    if (flags.includes('al_vcenter')) {
        el.style.alignItems = 'center';
    } else if (flags.includes('al_bottom')) {
        el.style.alignItems = 'flex-end';
    }
    
    if (control.color) {
        const color = parseColor(control.color);
        el.style.color = color;
    } else {
        el.style.color = '#ffffff';
    }
}

function parseColor(colorStr) {
    if (!colorStr) return '#ffffff';
    
    let hex = colorStr.toLowerCase();
    if (hex.length === 8) {
        hex = hex.substring(2);
    }
    
    return `#${hex}`;
}

function checkTextOverflow(container, textEl, control) {
    const textWidth = textEl.scrollWidth;
    const containerWidth = control.width;
    
    if (textWidth > containerWidth) {
        container.classList.add('overflow');
        if (state.showOverflow) {
            container.style.overflow = 'visible';
            textEl.style.background = 'rgba(239, 68, 68, 0.3)';
        }
    }
}

function addResizeHandles(el) {
    const handles = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];
    
    for (const pos of handles) {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${pos}`;
        handle.addEventListener('mousedown', (e) => startResize(e, pos));
        el.appendChild(handle);
    }
}

let resizeState = null;

function startResize(e, position) {
    e.stopPropagation();
    e.preventDefault();
    
    if (!state.selectedControl) return;
    
    resizeState = {
        position,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: state.selectedControl.width,
        startHeight: state.selectedControl.height,
        startLeft: state.selectedControl.x,
        startTop: state.selectedControl.y
    };
    
    document.addEventListener('mousemove', onResize);
    document.addEventListener('mouseup', stopResize);
}

function onResize(e) {
    if (!resizeState || !state.selectedControl) return;
    
    const dx = (e.clientX - resizeState.startX) / state.zoom;
    const dy = (e.clientY - resizeState.startY) / state.zoom;
    
    const pos = resizeState.position;
    
    if (pos.includes('e')) {
        state.selectedControl.width = Math.max(10, resizeState.startWidth + dx);
    }
    if (pos.includes('w')) {
        state.selectedControl.width = Math.max(10, resizeState.startWidth - dx);
        state.selectedControl.x = resizeState.startLeft + dx;
    }
    if (pos.includes('s')) {
        state.selectedControl.height = Math.max(10, resizeState.startHeight + dy);
    }
    if (pos.includes('n')) {
        state.selectedControl.height = Math.max(10, resizeState.startHeight - dy);
        state.selectedControl.y = resizeState.startTop + dy;
    }
    
    markDirty();
    renderPreview();
    updatePropertiesPanel();
}

function stopResize() {
    resizeState = null;
    document.removeEventListener('mousemove', onResize);
    document.removeEventListener('mouseup', stopResize);
}

function selectControl(control) {
    state.selectedControl = control;
    renderPreview();
    renderControlsList();
    updatePropertiesPanel();
    updateTranslationPanel();
    
    switchTab('properties');
}

function renderControlsList() {
    const list = elements.controlsList;
    list.innerHTML = '';
    
    if (!state.currentWindow) return;
    
    const searchTerm = elements.controlSearch.value.toLowerCase();
    
    for (const control of state.currentWindow.controls) {
        if (searchTerm) {
            const id = control.id.toLowerCase();
            const caption = control.caption || '';
            const text = state.translations[caption] || '';
            
            if (!id.includes(searchTerm) && !caption.includes(searchTerm) && !text.toLowerCase().includes(searchTerm)) {
                continue;
            }
        }
        
        const item = document.createElement('div');
        item.className = 'control-item';
        
        if (state.selectedControl && state.selectedControl.id === control.id) {
            item.classList.add('selected');
        }
        
        const caption = control.caption;
        if (caption && caption !== '0' && caption !== '-1') {
            item.classList.add('has-text');
            
            const text = state.translations[caption] || '';
            if (text && measureTextWidth(text, control) > control.width) {
                item.classList.add('overflow');
            }
        }
        
        const icon = document.createElement('div');
        icon.className = 'control-icon';
        icon.textContent = getControlTypeIcon(control);
        
        const info = document.createElement('div');
        info.className = 'control-info';
        
        const idEl = document.createElement('div');
        idEl.className = 'control-id';
        idEl.textContent = control.id;
        
        const captionEl = document.createElement('div');
        captionEl.className = 'control-caption';
        if (caption && caption !== '0' && caption !== '-1') {
            const text = state.translations[caption];
            captionEl.textContent = text ? text.substring(0, 30) + (text.length > 30 ? '...' : '') : `[${caption}]`;
        } else if (control.ani) {
            captionEl.textContent = control.ani;
        }
        
        info.appendChild(idEl);
        info.appendChild(captionEl);
        
        item.appendChild(icon);
        item.appendChild(info);
        
        item.addEventListener('click', () => selectControl(control));
        
        list.appendChild(item);
    }
}

function getControlTypeIcon(control) {
    if (control.ani && control.ani.includes('button')) return 'BTN';
    if (control.ani && control.ani.includes('slot')) return 'SLT';
    if (control.ani && control.ani.includes('box')) return 'BOX';
    if (control.ani && control.ani.includes('gauge')) return 'GAU';
    if (control.caption && control.caption !== '0') return 'TXT';
    if (control.ani) return 'IMG';
    return 'CTL';
}

function measureTextWidth(text, control) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    let fontFamily = control.font_name || 'font';
    const fontSize = control.font_size || 10;
    const flags = control.font_flag || '';
    const fontWeight = flags.includes('ft_bold') ? 'bold' : 'normal';
    
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    
    return ctx.measureText(text).width;
}

function updatePropertiesPanel() {
    const panel = elements.propertiesPanel;
    
    if (!state.selectedControl) {
        panel.innerHTML = `<p class="placeholder">${t('selectElement')}</p>`;
        return;
    }
    
    const ctrl = state.selectedControl;
    
    panel.innerHTML = `
        <div class="property-section">
            <div class="property-section-title">${t('basic')}</div>
            <div class="form-group">
                <label>ID</label>
                <input type="text" value="${ctrl.id}" readonly class="input-readonly">
            </div>
            <div class="form-group">
                <label>${t('captionId')}</label>
                <input type="text" id="propCaption" value="${ctrl.caption || ''}">
            </div>
        </div>
        
        <div class="property-section">
            <div class="property-section-title">${t('positionSize')}</div>
            <div class="form-group">
                <label>${t('position')}</label>
                <div class="input-row">
                    <input type="number" id="propX" value="${ctrl.x}" placeholder="X">
                    <input type="number" id="propY" value="${ctrl.y}" placeholder="Y">
                </div>
            </div>
            <div class="form-group">
                <label>${t('size')}</label>
                <div class="input-row">
                    <input type="number" id="propWidth" value="${ctrl.width}" placeholder="${t('width')}">
                    <span>×</span>
                    <input type="number" id="propHeight" value="${ctrl.height}" placeholder="${t('height')}">
                </div>
            </div>
        </div>
        
        <div class="property-section">
            <div class="property-section-title">${t('font')}</div>
            <div class="form-group">
                <label>${t('font')}</label>
                <input type="text" id="propFontName" value="${ctrl.font_name || 'font'}">
            </div>
            <div class="form-group">
                <label>${t('fontSize')}</label>
                <input type="number" id="propFontSize" value="${ctrl.font_size || 10}">
            </div>
            <div class="form-group">
                <label>${t('flags')}</label>
                <div class="font-flags">
                    <span class="font-flag ${ctrl.font_flag?.includes('ft_bold') ? 'active' : ''}" data-flag="ft_bold">Bold</span>
                    <span class="font-flag ${ctrl.font_flag?.includes('ft_shadow') ? 'active' : ''}" data-flag="ft_shadow">Shadow</span>
                    <span class="font-flag ${ctrl.font_flag?.includes('ft_outline') ? 'active' : ''}" data-flag="ft_outline">Outline</span>
                    <span class="font-flag ${ctrl.font_flag?.includes('al_center') ? 'active' : ''}" data-flag="al_center">Center</span>
                    <span class="font-flag ${ctrl.font_flag?.includes('al_right') ? 'active' : ''}" data-flag="al_right">Right</span>
                    <span class="font-flag ${ctrl.font_flag?.includes('al_vcenter') ? 'active' : ''}" data-flag="al_vcenter">VCenter</span>
                </div>
            </div>
        </div>
        
        <div class="property-section">
            <div class="property-section-title">${t('appearance')}</div>
            <div class="form-group">
                <label>${t('sprite')}</label>
                <input type="text" id="propAni" value="${ctrl.ani || ''}">
            </div>
            <div class="form-group">
                <label>${t('textColor')}</label>
                <div class="color-input-wrapper">
                    <div class="color-preview" style="background: ${parseColor(ctrl.color)}"></div>
                    <input type="text" id="propColor" value="${ctrl.color || ''}">
                </div>
            </div>
        </div>
    `;
    
    setupPropertyListeners();
}

function setupPropertyListeners() {
    const inputs = {
        propCaption: 'caption',
        propX: 'x',
        propY: 'y',
        propWidth: 'width',
        propHeight: 'height',
        propFontName: 'font_name',
        propFontSize: 'font_size',
        propAni: 'ani',
        propColor: 'color'
    };
    
    for (const [inputId, prop] of Object.entries(inputs)) {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', () => {
                if (!state.selectedControl) return;
                
                let value = input.value;
                if (['x', 'y', 'width', 'height', 'font_size'].includes(prop)) {
                    value = parseInt(value) || 0;
                }
                
                state.selectedControl[prop] = value;
                markDirty();
                renderPreview();
                renderControlsList();
                updateTranslationPanel();
            });
        }
    }
    
    document.querySelectorAll('.font-flag').forEach(flag => {
        flag.addEventListener('click', () => {
            if (!state.selectedControl) return;
            
            const flagName = flag.dataset.flag;
            let flags = state.selectedControl.font_flag || '';
            
            if (flags.includes(flagName)) {
                flags = flags.replace(flagName + '|', '').replace(flagName, '');
            } else {
                flags += flagName + '|';
            }
            
            state.selectedControl.font_flag = flags;
            flag.classList.toggle('active');
            markDirty();
            renderPreview();
        });
    });
}

function updateTranslationPanel() {
    if (!state.selectedControl) {
        elements.transId.value = '';
        elements.transText.value = '';
        elements.widthFill.style.width = '0%';
        elements.widthInfo.textContent = '0 / 0 px';
        return;
    }
    
    const caption = String(state.selectedControl.caption || '');
    
    if (!caption || caption === '0' || caption === '-1' || caption === '') {
        elements.transId.value = t('noText');
        elements.transText.value = '';
        elements.widthFill.style.width = '0%';
        elements.widthInfo.textContent = '0 / 0 px';
        return;
    }
    
    elements.transId.value = caption;
    elements.transText.value = state.translations[caption] || '';
    
    updateWidthPreview();
}

function updateWidthPreview() {
    if (!state.selectedControl) return;
    
    const text = elements.transText.value;
    const textWidth = measureTextWidth(text, state.selectedControl);
    const maxWidth = state.selectedControl.width;
    
    const percent = Math.min(100, (textWidth / maxWidth) * 100);
    
    elements.widthFill.style.width = `${percent}%`;
    elements.widthFill.className = 'width-fill';
    
    if (percent > 100) {
        elements.widthFill.classList.add('danger');
    } else if (percent > 80) {
        elements.widthFill.classList.add('warning');
    }
    
    elements.widthInfo.textContent = `${Math.round(textWidth)} / ${maxWidth} px`;
}

function updateWindowPanel() {
    if (!state.currentWindow) return;
    
    elements.windowId.value = state.currentWindow.id;
    elements.windowWidth.value = state.currentWindow.size.width;
    elements.windowHeight.value = state.currentWindow.size.height;
    elements.windowX.value = state.currentWindow.pos.x;
    elements.windowY.value = state.currentWindow.pos.y;
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabName}`);
    });
}

function updateZoom() {
    elements.canvas.style.transform = `scale(${state.zoom})`;
    elements.zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
}

function zoomIn() {
    state.zoom = Math.min(3, state.zoom + 0.1);
    updateZoom();
}

function zoomOut() {
    state.zoom = Math.max(0.1, state.zoom - 0.1);
    updateZoom();
}

function zoomFit() {
    if (!state.currentWindow) return;
    
    const wrapper = elements.canvasWrapper;
    const win = state.currentWindow;
    
    const scaleX = (wrapper.clientWidth - 40) / win.size.width;
    const scaleY = (wrapper.clientHeight - 40) / win.size.height;
    
    state.zoom = Math.min(1, Math.min(scaleX, scaleY));
    updateZoom();
}

function markDirty() {
    state.isDirty = true;
    elements.saveBtn.disabled = false;
}

async function saveChanges() {
    if (!state.currentWindow || !state.isDirty) return;
    
    setStatus('Сохранение...');
    
    try {
        await fetch(`${API_BASE}/save-window`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: state.currentWindow.fileName,
                data: state.currentWindow
            })
        });
        
        state.isDirty = false;
        elements.saveBtn.disabled = true;
        setStatus('Сохранено');
        
    } catch (e) {
        setStatus(`Ошибка сохранения: ${e.message}`);
    }
}

async function saveTranslation() {
    if (!state.selectedControl) return;
    
    const caption = state.selectedControl.caption;
    if (!caption || caption === '0' || caption === '-1') return;
    
    const text = elements.transText.value;
    
    setStatus('Сохранение перевода...');
    
    state.translations[caption] = text;
    
    try {
        const files = await fetch(`${API_BASE}/translation-files`).then(r => r.json());
        
        const mainFile = files.find(f => f.name === 'string.rh.xlsx');
        if (mainFile) {
            await fetch(`${API_BASE}/save-translation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filePath: mainFile.path,
                    id: caption,
                    text: text
                })
            });
        }
        
        renderPreview();
        renderControlsList();
        setStatus('Перевод сохранён');
        
    } catch (e) {
        setStatus(`Ошибка: ${e.message}`);
    }
}

function setStatus(text) {
    elements.statusText.textContent = text;
}

function setupEventListeners() {
    elements.windowSelect.addEventListener('change', (e) => {
        loadWindow(e.target.value);
    });
    
    elements.reloadBtn.addEventListener('click', () => {
        if (state.currentWindow) {
            loadWindow(state.currentWindow.fileName);
        }
    });
    
    elements.saveBtn.addEventListener('click', saveChanges);
    
    elements.controlSearch.addEventListener('input', renderControlsList);
    
    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);
    document.getElementById('zoomFit').addEventListener('click', zoomFit);
    
    document.getElementById('showGrid').addEventListener('change', (e) => {
        state.showGrid = e.target.checked;
        elements.canvasWrapper.style.backgroundImage = state.showGrid ? '' : 'none';
    });
    
    document.getElementById('showBounds').addEventListener('change', (e) => {
        state.showBounds = e.target.checked;
        renderPreview();
    });
    
    document.getElementById('showOverflow').addEventListener('change', (e) => {
        state.showOverflow = e.target.checked;
        renderPreview();
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    elements.transText.addEventListener('input', () => {
        updateWidthPreview();
        if (state.selectedControl && state.selectedControl.caption) {
            const caption = state.selectedControl.caption;
            const newText = elements.transText.value;
            updatePreviewText(caption, newText);
        }
    });
    
    document.getElementById('saveTransBtn').addEventListener('click', saveTranslation);
    
    elements.windowWidth.addEventListener('change', () => {
        if (state.currentWindow) {
            state.currentWindow.size.width = parseInt(elements.windowWidth.value) || 100;
            markDirty();
            renderPreview();
        }
    });
    
    elements.windowHeight.addEventListener('change', () => {
        if (state.currentWindow) {
            state.currentWindow.size.height = parseInt(elements.windowHeight.value) || 100;
            markDirty();
            renderPreview();
        }
    });
    
    elements.canvasWrapper.addEventListener('mousemove', (e) => {
        const rect = elements.windowPreview.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left) / state.zoom);
        const y = Math.round((e.clientY - rect.top) / state.zoom);
        elements.mousePos.textContent = `X: ${x}, Y: ${y}`;
    });
    
    elements.windowPreview.addEventListener('click', (e) => {
        if (e.target === elements.windowPreview) {
            state.selectedControl = null;
            renderPreview();
            renderControlsList();
            updatePropertiesPanel();
            updateTranslationPanel();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveChanges();
        }
        
        if (e.key === 'Escape') {
            state.selectedControl = null;
            renderPreview();
            renderControlsList();
            updatePropertiesPanel();
        }
        
        if (state.selectedControl && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            
            switch (e.key) {
                case 'ArrowUp': state.selectedControl.y -= step; break;
                case 'ArrowDown': state.selectedControl.y += step; break;
                case 'ArrowLeft': state.selectedControl.x -= step; break;
                case 'ArrowRight': state.selectedControl.x += step; break;
            }
            
            markDirty();
            renderPreview();
            updatePropertiesPanel();
        }
    });
    
    elements.canvasWrapper.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        }
    });
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

document.addEventListener('DOMContentLoaded', init);
