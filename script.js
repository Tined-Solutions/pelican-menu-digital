// script.js

// CONFIGURACIÓN
const ID_SHEET = '1LiGbdm7bjF9qVY8y2kDB30ldVyHtSBgu8QSrosrDmsY'; // TU ID DE SHEET

const CONFIG = {
    menuUrl: `https://opensheet.elk.sh/${ID_SHEET}/menu`,
    instagramUrl: 'https://www.instagram.com/pelicanbar_',
    // Reemplaza esto con tu link real de Google Reviews:
    reviewUrl: 'https://www.google.com/search?sca_esv=7c46294b4fa32043&sxsrf=ANbL-n5AsXxB5GAvfLiKewv1hCH7Xfg3hQ:1769804275389&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOVQ1_hk4GoTx9BXeBJPllKjmkB40vlDv5Zjy3AWdtxesO6p0FwyMawYGVoXgFKomAip1jI6P3ISwxESmsRzLoChh1zCG&q=Pelican+Bar+Opiniones&sa=X&ved=2ahUKEwjL_p_ZirSSAxUHqpUCHXXkM-UQ0bkNegQIKRAF&biw=1280&bih=585&dpr=1.5&aic=0#lrd=0x95ae33001acc2041:0x7c85ee44397d2b26,3,,,,', 
    mapsUrl: 'https://goo.gl/maps/TU_LINK_DE_MAPS',
};

// IMPORTANTE: Definición de columnas. 
const KEYS = { 
    categoria: 'categoria', 
    producto: 'producto', 
    precio: 'precio', 
    descripcion: 'descripcion', 
    imagen: 'imagen', 
    disponible: 'disponible', // Disponibilidad normal
    destacado: 'destacado',
    precioFiesta: 'precioFiesta', // Nuevo: Precio para fiestas
    disponibilidadFiesta: 'disponibilidadFiesta' // Nuevo: Switch maestro de fiesta
};

// Asignar links al cargar
document.getElementById('link-instagram').href = CONFIG.instagramUrl;
// Asignamos el link de reseñas si existe el elemento en el HTML
const reviewLink = document.getElementById('link-review');
if (reviewLink) {
    reviewLink.href = CONFIG.reviewUrl;
}

// Función Helper para validar booleanos de Google Sheets
function isTrue(val) {
    if (!val) return false; 
    const strVal = String(val).trim().toUpperCase();
    return strVal === "TRUE" || strVal === "VERDADERO" || strVal === "1" || strVal === "SI" || strVal === "SÍ";
}

window.addEventListener('scroll', () => {
    const heroWrapper = document.getElementById('hero-bg-wrapper');
    if (heroWrapper) {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        let opacity = 1 - (scrollPosition / (windowHeight * 0.7));
        opacity = Math.max(0, Math.min(1, opacity));
        heroWrapper.style.opacity = opacity;
        heroWrapper.style.transform = `translateY(${scrollPosition * 0.3}px)`;
    }
});

document.addEventListener('DOMContentLoaded', () => { initApp(); });

async function initApp() {
    try {
        const response = await fetch(CONFIG.menuUrl);
        if (!response.ok) throw new Error('Error al cargar menú');
        const menuData = await response.json();
        
        renderApp(menuData);

    } catch (error) {
        console.error("Error inicializando:", error);
        document.getElementById('main-content').innerHTML = '<div class="text-center text-red-500 py-10">Hubo un error al cargar el menú.</div>';
    }
}

function renderApp(data) {
    const navContainer = document.getElementById('nav-tabs');
    const mainContainer = document.getElementById('main-content');
    
    navContainer.innerHTML = '';
    mainContainer.innerHTML = '';

    // --- LÓGICA DE DETECCIÓN DE FIESTA ---
    const isPartyModeActive = data.some(item => isTrue(item[KEYS.disponibilidadFiesta]));

    // 2. Filtramos los items basándonos en el modo activo
    let filteredItems = [];

    if (isPartyModeActive) {
        filteredItems = data.filter(item => isTrue(item[KEYS.disponibilidadFiesta]));
    } else {
        filteredItems = data.filter(item => isTrue(item[KEYS.disponible]));
    }

    // 3. Definimos las Categorías según el modo
    let categories;

    if (isPartyModeActive) {
        categories = [
            { id: 'tab-fiesta', label: ' CARTA FIESTA ', isPartyTab: true } 
        ];
    } else {
        categories = [
            { id: 'tab-platos-dia', label: '⭐ Platos del Día', keywords: ['plato del dia', 'sugerencia', 'menu del dia', 'plato del día', 'menú del día'] },
            { id: 'tab-promociones', label: '🔥 Promociones', keywords: ['promocion', 'promo', 'descuento'] },
            { id: 'tab-directos', label: 'Directos', keywords: ['trago', 'fernet', 'vermut', 'campari', 'aperol', 'negroni', 'directos'] },
            { id: 'tab-cervezas', label: 'Cervezas', keywords: ['cerveza', 'porron', 'pinta'] },
            { id: 'tab-vino', label: 'Vino', keywords: ['vino'] },
            { id: 'tab-clasicos', label: 'Clásicos', keywords: ['clásicos que nunca mueren'] },
            { id: 'tab-frutales', label: 'Frutales', keywords: ['frutales'] },
            { id: 'tab-frozen', label: 'Frozen', keywords: ['frozen'] }, 
            { id: 'tab-whiskys', label: 'Whiskies', keywords: ['whisky', 'whiskys'] },
            { id: 'tab-sin-alcohol', label: 'Sin Alcohol', keywords: ['sin alcohol'] },
            { id: 'tab-picoteo', label: 'Picoteo', keywords: ['papas fritas', 'bastones', 'fingers', 'rabas', 'picoteo'] },
            { id: 'tab-pizzas', label: 'Pizzas', keywords: ['pizza'] },
            { id: 'tab-sandwiches', label: 'Sándwiches', keywords: ['sandwich', 'bondiola'] },
            { id: 'tab-milanesas', label: 'Milanesas', keywords: ['milanesas'] },
            { id: 'tab-empandas', label: 'Empanadas', keywords: ['teque', 'empanada'] },
            { id: 'tab-ensaladas', label: 'Ensaladas', keywords: ['ensaladas'] },
        ];
    }

    // Ordenar por destacado
    filteredItems.sort((a, b) => {
        const destA = isTrue(a[KEYS.destacado]);
        const destB = isTrue(b[KEYS.destacado]);
        return (destA === destB) ? 0 : destA ? -1 : 1;
    });

    let firstTabId = null;

    categories.forEach((cat) => {
        let catItems = [];

        if (cat.isPartyTab) {
            catItems = filteredItems;
        } else {
            catItems = filteredItems.filter(item => {
                const itemCat = (item[KEYS.categoria] || '').toLowerCase();
                
                if (cat.id === 'tab-tragos-autor') return itemCat.includes('autor') || itemCat.includes('especial');
                if (cat.id === 'tab-tragos-clasicos') {
                    if(itemCat.includes('autor')) return false; 
                    return cat.keywords.some(k => itemCat.includes(k));
                }
                if (cat.id === 'tab-gins') {
                    if(itemCat.includes('promo')) return false;
                    return cat.keywords.some(k => itemCat.includes(k));
                }
                return cat.keywords.some(k => itemCat.includes(k));
            });
        }

        if (catItems.length > 0) {
            if (!firstTabId) firstTabId = cat.id;

            const li = document.createElement('li');
            li.className = 'snap-center';
            li.innerHTML = `<button onclick="switchTab('${cat.id}', this)" class="nav-btn whitespace-nowrap px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-pelican-surface text-pelican-muted border border-white/10 hover:text-white hover:border-pelican-gold/50 transition-all duration-300">${cat.label}</button>`;
            navContainer.appendChild(li);

            const section = document.createElement('section');
            section.id = cat.id;
            section.className = 'menu-section hidden gap-5';
            
            let sectionHtml = `<h2 class="font-serif italic text-3xl text-white mb-2 border-b border-pelican-gold/30 pb-3 inline-block pr-10"><span class="text-pelican-gold not-italic text-lg mr-2">/</span> ${cat.label}</h2>`;
            
            catItems.forEach(item => {
                sectionHtml += createCardHtml(item, isPartyModeActive);
            });

            section.innerHTML = sectionHtml;
            mainContainer.appendChild(section);
        }
    });

    if (firstTabId) {
        const firstBtn = navContainer.querySelector('button');
        if (firstBtn) switchTab(firstTabId, firstBtn);
    } else {
        mainContainer.innerHTML = '<div class="text-center py-20 text-white opacity-60 font-sans">No hay productos disponibles por el momento.</div>';
    }
}

function createCardHtml(item, isPartyMode) {
    let rawPrice = item[KEYS.precio]; 
    
    if (isPartyMode && item[KEYS.precioFiesta]) {
        const pFiesta = String(item[KEYS.precioFiesta]).trim();
        if (pFiesta !== '') {
            rawPrice = pFiesta;
        }
    }

    let cleanPrice = rawPrice ? String(rawPrice).replace('$', '').trim() : '';
    const processedUrl = procesarURLImagen(item[KEYS.imagen]);
    const imgSrc = processedUrl || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400&fit=crop';
    
    const isDestacado = isTrue(item[KEYS.destacado]);
    const destacadoBadge = isDestacado ? `<div class="badge-destacado">Recomendado</div>` : '';
    const borderClass = isDestacado ? 'border-pelican-gold/60 shadow-gold-glow' : 'border-white/5';

    // Escapamos comillas para evitar errores
    const safeTitle = (item[KEYS.producto] || '').replace(/"/g, '"');
    const safeDesc = (item[KEYS.descripcion] || '').replace(/"/g, '"');

    return `
    <article 
        onclick="openProductModal(this)"
        data-title="${safeTitle}"
        data-price="${cleanPrice}"
        data-desc="${safeDesc}"
        data-img="${imgSrc}"
        class="glass-card rounded-xl p-3 flex gap-4 items-center fade-in-up transition-all duration-300 group hover:border-pelican-gold/40 hover:shadow-gold-glow relative overflow-hidden ${borderClass} cursor-pointer active:scale-95">
        
        ${destacadoBadge}

        <div class="absolute bottom-0 right-0 w-32 h-32 pointer-events-none z-0 overflow-hidden">
            <svg class="absolute bottom-[-5px] right-[-5px] w-14 h-14 text-pelican-leaf opacity-40 rotate-[-45deg]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7 7 5 14 12 22C19 14 17 7 12 2Z" /></svg>
            <svg class="absolute bottom-[20px] right-[-15px] w-10 h-10 text-pelican-leaf opacity-30 rotate-[10deg]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7 7 5 14 12 22C19 14 17 7 12 2Z" /></svg>
            <svg class="absolute bottom-[5px] right-[25px] w-8 h-8 text-pelican-leaf opacity-30 rotate-[-70deg]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7 7 5 14 12 22C19 14 17 7 12 2Z" /></svg>
            <svg class="absolute bottom-[40px] right-[5px] w-6 h-6 text-pelican-leaf opacity-20 rotate-[-15deg]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7 7 5 14 12 22C19 14 17 7 12 2Z" /></svg>
        </div>

        <div class="w-24 h-24 rounded-lg overflow-hidden bg-black flex-shrink-0 relative border border-white/5 z-10">
            <img src="${imgSrc}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" alt="${item[KEYS.producto]}" loading="lazy">
        </div>
        
        <div class="flex-1 min-w-0 py-1 flex flex-col justify-between h-full z-10 relative">
            <div>
                <div class="flex justify-between items-start gap-2 mb-1">
                    <h3 class="font-serif italic font-medium text-lg text-white leading-tight group-hover:text-pelican-gold transition-colors">
                        ${item[KEYS.producto]}
                    </h3>
                    <span class="text-pelican-gold font-serif font-bold text-lg whitespace-nowrap bg-pelican-gold/10 px-2 rounded-md">
                        $${cleanPrice}
                    </span>
                </div>
                <p class="text-xs text-pelican-muted leading-snug font-sans font-light line-clamp-2">
                    ${item[KEYS.descripcion] || ''}
                </p>
            </div>
        </div>

        <div class="absolute bottom-0 right-0 w-24 h-24 pointer-events-none z-20 overflow-hidden">
            <svg class="absolute bottom-[-8px] right-[-8px] w-14 h-14 text-pelican-leaf opacity-80 rotate-[-40deg]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7 7 5 14 12 22C19 14 17 7 12 2Z" /></svg>
            <svg class="absolute bottom-[28px] right-[-5px] w-8 h-8 text-pelican-leaf opacity-70 rotate-[5deg]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7 7 5 14 12 22C19 14 17 7 12 2Z" /></svg>
            <svg class="absolute bottom-[-2px] right-[25px] w-8 h-8 text-pelican-leaf opacity-70 rotate-[-75deg]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7 7 5 14 12 22C19 14 17 7 12 2Z" /></svg>
            <svg class="absolute bottom-[40px] right-[10px] w-6 h-6 text-pelican-leaf opacity-60 rotate-[25deg]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7 7 5 14 12 22C19 14 17 7 12 2Z" /></svg>
            <svg class="absolute bottom-[15px] right-[38px] w-6 h-6 text-pelican-leaf opacity-60 rotate-[-95deg]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7 7 5 14 12 22C19 14 17 7 12 2Z" /></svg>
        </div>
    </article>
    `;
}

function switchTab(sectionId, btn) {
    document.querySelectorAll('.menu-section').forEach(sec => {
        sec.classList.add('hidden');
        sec.classList.remove('grid');
    });

    const activeSec = document.getElementById(sectionId);
    if(activeSec) {
        activeSec.classList.remove('hidden');
        activeSec.classList.add('grid');
        activeSec.querySelectorAll('.fade-in-up').forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; 
            el.style.animation = null;
        });
    }

    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('active', 'border-pelican-gold');
        b.classList.add('bg-pelican-surface', 'text-pelican-muted', 'border-white/10');
    });

    btn.classList.remove('bg-pelican-surface', 'text-pelican-muted', 'border-white/10');
    btn.classList.add('active', 'border-pelican-gold');

    const headerHeight = document.querySelector('header').offsetHeight;
    window.scrollTo({ top: headerHeight * 0.9, behavior: 'smooth' });
    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function procesarURLImagen(url) {
    if (!url) return null;
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/\/d\/(.*?)(?:\/|$)/);
        if (idMatch && idMatch[1]) { return `https://lh3.googleusercontent.com/d/${idMatch[1]}`; }
    }
    return url;
}

/* --- LÓGICA DEL MODAL --- */
const modal = document.getElementById('product-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalPanel = document.getElementById('modal-panel');

function openProductModal(cardElement) {
    // 1. Extraer datos del elemento clickeado
    const title = cardElement.getAttribute('data-title');
    const price = cardElement.getAttribute('data-price');
    const desc = cardElement.getAttribute('data-desc');
    const img = cardElement.getAttribute('data-img');
    
    // 2. Llenar el modal
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-price').textContent = '$' + price;
    document.getElementById('modal-desc').textContent = desc || 'Una excelente elección para disfrutar el momento.'; // Texto por defecto si no hay descripción
    document.getElementById('modal-img').src = img;
    
    // 3. Mostrar modal (quitar hidden)
    modal.classList.remove('hidden');
    
    // 4. Animar entrada (pequeño timeout para que el navegador procese el cambio de display)
    requestAnimationFrame(() => {
        modalBackdrop.classList.remove('opacity-0');
        modalPanel.classList.remove('opacity-0', 'translate-y-8', 'scale-95');
        modalPanel.classList.add('opacity-100', 'translate-y-0', 'scale-100');
    });

    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    // 1. Animar salida
    modalBackdrop.classList.add('opacity-0');
    modalPanel.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
    modalPanel.classList.add('opacity-0', 'translate-y-8', 'scale-95');
    
    // 2. Esperar a que termine la transición para ocultar el div
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restaurar scroll
    }, 300); 
}

// Cerrar con la tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape" && !modal.classList.contains('hidden')) {
        closeProductModal();
    }
});