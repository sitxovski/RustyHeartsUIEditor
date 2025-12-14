const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const xml2js = require('xml2js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Paths configuration
const CONFIG = {
    UI_PATH: 'F:/rsuty/gameclient/PckOutput/ui',
    TRANSLATIONS_PATH: 'F:/rsuty/translations/XLSX/Converted',
    RESOURCES_PATH: 'F:/rsuty/gameclient/PckOutput'
};

// Cache for parsed data
let spriteCache = null;
let translationsCache = {};
let allTranslationsCache = null;

// Parse defaultsprite.xml
async function loadSprites() {
    if (spriteCache) return spriteCache;
    
    const spritePath = path.join(CONFIG.UI_PATH, 'defaultsprite.xml');
    const xmlContent = fs.readFileSync(spritePath, 'utf-8');
    
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlContent);
    
    spriteCache = {};
    
    if (result.sprite && result.sprite.ani) {
        const animations = Array.isArray(result.sprite.ani) ? result.sprite.ani : [result.sprite.ani];
        
        for (const ani of animations) {
            const name = ani.$.name;
            const type = ani.$.type;
            
            if (ani.tex) {
                const textures = Array.isArray(ani.tex) ? ani.tex : [ani.tex];
                spriteCache[name] = {
                    type,
                    textures: textures.map(t => ({
                        path: t.$.name.replace(/\\/g, '/'),
                        width: parseInt(t.$.width) || 0,
                        height: parseInt(t.$.height) || 0
                    }))
                };
            }
        }
    }
    
    console.log(`Loaded ${Object.keys(spriteCache).length} sprites`);
    return spriteCache;
}

// Load translations from XLSX
function loadTranslations(filename) {
    const cacheKey = filename;
    if (translationsCache[cacheKey]) return translationsCache[cacheKey];
    
    const filePath = path.join(CONFIG.TRANSLATIONS_PATH, filename);
    if (!fs.existsSync(filePath)) {
        // Try to find in subdirectories
        const dirs = fs.readdirSync(CONFIG.TRANSLATIONS_PATH, { withFileTypes: true });
        for (const dir of dirs) {
            if (dir.isDirectory()) {
                const subPath = path.join(CONFIG.TRANSLATIONS_PATH, dir.name, filename);
                if (fs.existsSync(subPath)) {
                    return loadTranslationsFromFile(subPath, cacheKey);
                }
            }
        }
        return {};
    }
    
    return loadTranslationsFromFile(filePath, cacheKey);
}

function loadTranslationsFromFile(filePath, cacheKey) {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        const translations = {};
        const fileName = path.basename(filePath).toLowerCase();
        
        // Find ID and translation columns
        const headers = data[0] || [];
        const headersLower = headers.map(h => String(h || '').toLowerCase());
        
        let idCol = -1;
        let transCol = -1;
        
        // Find nID column
        idCol = headersLower.indexOf('nid');
        if (idCol === -1) idCol = 0;
        
        // Find translation column - must be wsz* column for actual translations
        // Priority: wszString > wszDesc > wszName > other wsz*
        const transPriority = ['wszstring', 'wszdesc', 'wszname', 'wszitemdescription', 
                               'wsztitlename', 'wszchampionname', 'wszattribute', 
                               'wszdescription', 'wszgroupname', 'wsztext00'];
        
        for (const prio of transPriority) {
            const idx = headersLower.indexOf(prio);
            if (idx !== -1) {
                transCol = idx;
                break;
            }
        }
        
        // If no priority column found, look for any wsz* column
        if (transCol === -1) {
            for (let i = 0; i < headersLower.length; i++) {
                if (headersLower[i].startsWith('wsz') && i !== idCol) {
                    transCol = i;
                    break;
                }
            }
        }
        
        // If still no wsz column, this file has no translations - skip it
        if (transCol === -1) {
            return {};
        }
        
        // Start from row 2 (skip header and type row)
        let startRow = 1;
        if (data[1] && data[1].length > 0) {
            const firstCell = String(data[1][0] || '').toLowerCase();
            if (['int32', 'string', 'string2', 'float'].includes(firstCell)) {
                startRow = 2;
            }
        }
        
        for (let i = startRow; i < data.length; i++) {
            const row = data[i];
            if (row && row[idCol] !== undefined && row[idCol] !== '') {
                const id = String(row[idCol]);
                const text = row[transCol] !== undefined ? String(row[transCol]) : '';
                if (id && text && text.trim() !== '') {
                    translations[id] = text;
                }
            }
        }
        
        if (Object.keys(translations).length > 0) {
            translationsCache[cacheKey] = translations;
            console.log(`Loaded ${Object.keys(translations).length} from ${path.basename(filePath)} (${headers[transCol]})`);
        }
        return translations;
    } catch (e) {
        console.error(`Error loading ${path.basename(filePath)}:`, e.message);
        return {};
    }
}

function loadAllTranslations() {
    if (allTranslationsCache) return allTranslationsCache;
    
    const allTranslations = {};
    const mainFile = path.join(CONFIG.TRANSLATIONS_PATH, 'string.rh.xlsx');
    
    if (fs.existsSync(mainFile)) {
        console.log('Loading UI translations from string.rh.xlsx...');
        const trans = loadTranslationsFromFile(mainFile, mainFile);
        Object.assign(allTranslations, trans);
    }
    
    const dialogFile = path.join(CONFIG.TRANSLATIONS_PATH, 'dialogstring.rh.xlsx');
    if (fs.existsSync(dialogFile)) {
        console.log('Loading dialog translations...');
        const trans = loadTranslationsFromFile(dialogFile, dialogFile);
        for (const [id, text] of Object.entries(trans)) {
            if (!allTranslations[id]) {
                allTranslations[id] = text;
            }
        }
    }
    
    const badIds = ['300'];
    badIds.forEach(id => delete allTranslations[id]);
    
    allTranslationsCache = allTranslations;
    console.log(`Total UI translations loaded: ${Object.keys(allTranslations).length}`);
    return allTranslations;
}

// Parse window XML
async function parseWindowXml(xmlPath) {
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false, attrkey: '$' });
    const result = await parser.parseStringPromise(xmlContent);
    
    if (!result.window) return null;
    
    const window = result.window;
    const windowData = {
        id: window.$.id,
        style: window.$.style,
        caption: window.$.caption,
        pos: window.pos ? { x: parseInt(window.pos.$.x) || 0, y: parseInt(window.pos.$.y) || 0 } : { x: 0, y: 0 },
        size: window.size ? { width: parseInt(window.size.$.width) || 0, height: parseInt(window.size.$.height) || 0 } : { width: 100, height: 100 },
        controls: []
    };
    
    if (window.control) {
        const controls = Array.isArray(window.control) ? window.control : [window.control];
        
        for (const ctrl of controls) {
            const control = {
                id: ctrl.$.id,
                caption: ctrl.$.caption,
                tooltip: ctrl.$.tooltip,
                ani: ctrl.$.ani,
                style: ctrl.$.style,
                font_name: ctrl.$.font_name,
                font_size: parseInt(ctrl.$.font_size) || 10,
                font_flag: ctrl.$.font_flag || '',
                x: parseInt(ctrl.$.x) || 0,
                y: parseInt(ctrl.$.y) || 0,
                width: parseInt(ctrl.$.width) || 0,
                height: parseInt(ctrl.$.height) || 0,
                color: ctrl.$.color,
                bg_color: ctrl.$.bg_color
            };
            windowData.controls.push(control);
        }
    }
    
    return windowData;
}

// API Routes

// Get list of window XML files
app.get('/api/windows', (req, res) => {
    const windowsPath = path.join(CONFIG.UI_PATH, 'window');
    const files = fs.readdirSync(windowsPath)
        .filter(f => f.endsWith('.xml'))
        .map(f => ({ name: f, path: path.join(windowsPath, f) }));
    res.json(files);
});

// Get window data
app.get('/api/window/:name', async (req, res) => {
    try {
        const windowPath = path.join(CONFIG.UI_PATH, 'window', req.params.name);
        if (!fs.existsSync(windowPath)) {
            return res.status(404).json({ error: 'Window not found' });
        }
        
        const windowData = await parseWindowXml(windowPath);
        res.json(windowData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get sprite info
app.get('/api/sprites', async (req, res) => {
    try {
        const sprites = await loadSprites();
        res.json(sprites);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get sprite image
app.get('/api/sprite/:name', async (req, res) => {
    try {
        const sprites = await loadSprites();
        let sprite = sprites[req.params.name];
        
        // Try case-insensitive search
        if (!sprite) {
            const lowerName = req.params.name.toLowerCase();
            for (const [key, val] of Object.entries(sprites)) {
                if (key.toLowerCase() === lowerName) {
                    sprite = val;
                    break;
                }
            }
        }
        
        if (!sprite || !sprite.textures || sprite.textures.length === 0) {
            return res.status(404).json({ error: 'Sprite not found' });
        }
        
        const texPath = path.join(CONFIG.RESOURCES_PATH, sprite.textures[0].path);
        if (fs.existsSync(texPath)) {
            res.sendFile(texPath);
        } else {
            res.status(404).json({ error: 'Texture file not found', path: texPath });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Serve resource files directly
app.get('/api/resource/*', (req, res) => {
    const resourcePath = req.params[0];
    const fullPath = path.join(CONFIG.RESOURCES_PATH, resourcePath);
    
    if (fs.existsSync(fullPath)) {
        res.sendFile(fullPath);
    } else {
        res.status(404).json({ error: 'Resource not found' });
    }
});

// Get all translations
app.get('/api/translations', (req, res) => {
    try {
        const translations = loadAllTranslations();
        res.json(translations);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get translation files list
app.get('/api/translation-files', (req, res) => {
    const files = [];
    
    function scanDir(dirPath, prefix = '') {
        if (!fs.existsSync(dirPath)) return;
        
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const item of items) {
            if (item.isDirectory()) {
                scanDir(path.join(dirPath, item.name), prefix + item.name + '/');
            } else if (item.name.endsWith('.xlsx')) {
                files.push({
                    name: item.name,
                    path: prefix + item.name,
                    fullPath: path.join(dirPath, item.name)
                });
            }
        }
    }
    
    scanDir(CONFIG.TRANSLATIONS_PATH);
    res.json(files);
});

// Save translation
app.post('/api/save-translation', (req, res) => {
    try {
        const { filePath, id, text } = req.body;
        
        const fullPath = path.join(CONFIG.TRANSLATIONS_PATH, filePath);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const workbook = XLSX.readFile(fullPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        // Find the row and update
        const headers = data[0] || [];
        let idCol = 0;
        let transCol = headers.length - 1;
        
        for (let i = 0; i < headers.length; i++) {
            const h = String(headers[i] || '').toLowerCase();
            if (h === 'id' || h.includes('id')) {
                idCol = i;
                break;
            }
        }
        
        for (let i = 0; i < headers.length; i++) {
            const h = String(headers[i] || '').toLowerCase();
            if (h.includes('ru') || h.includes('russian') || h.includes('translation')) {
                transCol = i;
                break;
            }
        }
        
        let found = false;
        for (let i = 1; i < data.length; i++) {
            if (String(data[i][idCol]) === String(id)) {
                data[i][transCol] = text;
                found = true;
                break;
            }
        }
        
        if (!found) {
            return res.status(404).json({ error: 'Translation ID not found' });
        }
        
        const newSheet = XLSX.utils.aoa_to_sheet(data);
        workbook.Sheets[sheetName] = newSheet;
        XLSX.writeFile(workbook, fullPath);
        
        // Clear cache
        delete translationsCache[fullPath];
        
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Save window XML
app.post('/api/save-window', (req, res) => {
    try {
        const { name, data } = req.body;
        const windowPath = path.join(CONFIG.UI_PATH, 'window', name);
        
        // Build XML
        const builder = new xml2js.Builder({
            xmldec: { version: '1.0' },
            renderOpts: { pretty: true, indent: '    ' }
        });
        
        const xmlObj = {
            window: {
                $: {
                    id: data.id,
                    style: data.style,
                    caption: data.caption
                },
                pos: { $: { x: data.pos.x, y: data.pos.y } },
                size: { $: { width: data.size.width, height: data.size.height } },
                control: data.controls.map(c => ({
                    $: {
                        id: c.id,
                        caption: c.caption,
                        tooltip: c.tooltip,
                        ani: c.ani,
                        style: c.style,
                        font_name: c.font_name,
                        font_size: c.font_size,
                        font_flag: c.font_flag,
                        x: c.x,
                        y: c.y,
                        width: c.width,
                        height: c.height,
                        ...(c.color && { color: c.color }),
                        ...(c.bg_color && { bg_color: c.bg_color })
                    }
                }))
            }
        };
        
        const xml = builder.buildObject(xmlObj);
        fs.writeFileSync(windowPath, xml);
        
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get fonts
app.get('/api/fonts', (req, res) => {
    const fonts = fs.readdirSync(CONFIG.RESOURCES_PATH)
        .filter(f => f.endsWith('.ttf'));
    res.json(fonts);
});

// Serve font files
app.get('/api/font/:name', (req, res) => {
    const fontPath = path.join(CONFIG.RESOURCES_PATH, req.params.name);
    if (fs.existsSync(fontPath)) {
        res.sendFile(fontPath);
    } else {
        res.status(404).json({ error: 'Font not found' });
    }
});

const PORT = 3847;

// Preload all data at startup
async function preloadData() {
    console.log('Preloading data...');
    console.log(`UI Path: ${CONFIG.UI_PATH}`);
    console.log(`Translations Path: ${CONFIG.TRANSLATIONS_PATH}`);
    
    // Load sprites
    console.log('Loading sprites...');
    await loadSprites();
    
    // Load translations
    console.log('Loading translations...');
    loadAllTranslations();
    
    console.log('Preload complete!');
}

preloadData().then(() => {
    app.listen(PORT, () => {
        console.log(`\nRusty Hearts UI Editor running at http://localhost:${PORT}`);
    });
});
