let events = {};
let features = {};
let faqs = {};
let holidays = {};
let aktuelles = {};
let currentGalleryIndex = 0;
let currentItemGallery = [];

// Daten aus JSON-Datei laden
async function loadData() {
    try {
        const response = await fetch('daten.json');
        const data = await response.json();
        
        events = data.events.de;
        features = data.features.de;
        faqs = data.faqs.de;
        holidays = data.holidays.de;
        
        // Nach dem Laden rendern
        renderEvents();
        renderFeatures();
        renderFAQ();
        renderHolidays();
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        alert('Die Daten konnten nicht geladen werden. Bitte überprüfen Sie, ob die Datei "daten.json" vorhanden ist.');
    }
}

// Aktuelles laden
async function loadAktuelles() {
    try {
        const response = await fetch('aktuelles.json');
        const data = await response.json();
        aktuelles = data.items;
        renderAktuelles();
    } catch (error) {
        console.error('Fehler beim Laden von Aktuelles:', error);
    }
}

// Countdown berechnen
function getCountdown(targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;
    
    if (diff < 0) return 'Vorbei';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `Noch ${days} Tage, ${hours} Stunden`;
}

// Events anzeigen
function renderEvents() {
    const grid = document.getElementById('eventsGrid');
    
    if (!events || events.length === 0) return;
    
    grid.innerHTML = events.map(event => `
        <div class="event-card">
            <div class="event-date">${event.date}</div>
            <h3>${event.title}</h3>
            <p>${event.description}</p>
            <div class="countdown">${getCountdown(event.countdown)}</div>
        </div>
    `).join('');
}

// Ferien anzeigen
function renderHolidays() {
    const grid = document.getElementById('holidayGrid');
    
    if (!holidays || holidays.length === 0) return;
    
    grid.innerHTML = holidays.map(holiday => `
        <div class="holiday-card">
            <div class="holiday-icon">${holiday.icon}</div>
            <h3>${holiday.title}</h3>
            <div class="holiday-date">${holiday.dates}</div>
        </div>
    `).join('');
}

// Aktuelles anzeigen
function renderAktuelles() {
    const grid = document.getElementById('aktuellesGrid');
    
    if (!aktuelles || aktuelles.length === 0) return;
    
    grid.innerHTML = aktuelles.map((item, index) => `
        <div class="aktuelles-card" onclick="openLightbox(${index})">
            ${item.type === 'video' ? 
                `<video class="aktuelles-media" src="${item.src}"></video>` :
                `<img class="aktuelles-media" src="${item.src}" alt="${item.title}">`
            }
            <div class="aktuelles-content">
                <div class="aktuelles-date">${item.date}</div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
        </div>
    `).join('');
}

// Lightbox öffnen mit Galerie-Unterstützung
function openLightbox(index) {
    const item = aktuelles[index];
    const lightbox = document.getElementById('lightbox');
    
    // Wenn das Item eine Galerie hat, verwende diese, sonst nur das einzelne Bild
    currentItemGallery = item.gallery || [{ type: item.type, src: item.src, caption: item.title }];
    currentGalleryIndex = 0;
    
    displayGalleryItem();
    renderThumbnails();
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Galerie-Item anzeigen
function displayGalleryItem() {
    const mediaContainer = document.getElementById('lightboxMediaContainer');
    const caption = document.getElementById('lightboxCaption');
    const counter = document.getElementById('lightboxCounter');
    const currentItem = currentItemGallery[currentGalleryIndex];
    
    if (currentItem.type === 'video') {
        mediaContainer.innerHTML = `<video class="lightbox-media" src="${currentItem.src}" controls autoplay></video>`;
    } else {
        mediaContainer.innerHTML = `<img class="lightbox-media" src="${currentItem.src}" alt="${currentItem.caption || ''}">`;
    }
    
    caption.textContent = currentItem.caption || '';
    counter.textContent = `${currentGalleryIndex + 1} / ${currentItemGallery.length}`;
    
    // Navigation buttons anzeigen/verstecken
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    if (currentItemGallery.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    }
    
    updateThumbnails();
}

// Thumbnails rendern
function renderThumbnails() {
    const thumbnailContainer = document.getElementById('lightboxThumbnails');
    
    if (currentItemGallery.length <= 1) {
        thumbnailContainer.style.display = 'none';
        return;
    }
    
    thumbnailContainer.style.display = 'flex';
    thumbnailContainer.innerHTML = currentItemGallery.map((item, index) => {
        if (item.type === 'video') {
            return `<video class="lightbox-thumbnail" src="${item.src}" onclick="jumpToGalleryItem(${index})"></video>`;
        } else {
            return `<img class="lightbox-thumbnail" src="${item.src}" alt="" onclick="jumpToGalleryItem(${index})">`;
        }
    }).join('');
}

// Thumbnails aktualisieren
function updateThumbnails() {
    const thumbnails = document.querySelectorAll('.lightbox-thumbnail');
    thumbnails.forEach((thumb, index) => {
        if (index === currentGalleryIndex) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

// Zu bestimmtem Galerie-Item springen
function jumpToGalleryItem(index) {
    currentGalleryIndex = index;
    displayGalleryItem();
}

// In der Galerie navigieren
function navigateGallery(direction) {
    // Video stoppen wenn vorhanden
    const video = document.querySelector('.lightbox-media video');
    if (video) {
        video.pause();
    }
    
    currentGalleryIndex += direction;
    
    // Loop um zur anderen Seite
    if (currentGalleryIndex < 0) {
        currentGalleryIndex = currentItemGallery.length - 1;
    } else if (currentGalleryIndex >= currentItemGallery.length) {
        currentGalleryIndex = 0;
    }
    
    displayGalleryItem();
}

// Lightbox schließen
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const mediaContainer = document.getElementById('lightboxMediaContainer');
    
    // Video stoppen wenn vorhanden
    const video = mediaContainer.querySelector('video');
    if (video) {
        video.pause();
    }
    
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentItemGallery = [];
    currentGalleryIndex = 0;
}

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
            navigateGallery(-1);
        } else if (e.key === 'ArrowRight') {
            navigateGallery(1);
        } else if (e.key === 'Escape') {
            closeLightbox();
        }
    }
});

// Lightbox schließen bei Klick außerhalb
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === this) {
                closeLightbox();
            }
        });
    }
});

// Features anzeigen
function renderFeatures() {
    const grid = document.getElementById('featureGrid');
    
    if (!features || features.length === 0) return;
    
    grid.innerHTML = features.map((feature, index) => `
        <div class="feature-card" onclick="openModal(${index})">
            <div class="feature-icon">${feature.icon}</div>
            <h3>${feature.title}</h3>
            <p>${feature.text}</p>
        </div>
    `).join('');
}

// FAQ anzeigen
function renderFAQ() {
    const container = document.getElementById('faqContainer');
    
    if (!faqs || faqs.length === 0) return;
    
    container.innerHTML = faqs.map((faq, index) => `
        <div class="faq-item" onclick="toggleFAQ(${index})">
            <div class="faq-question">
                <span>${faq.question}</span>
                <span class="faq-icon">+</span>
            </div>
            <div class="faq-answer">
                <p>${faq.answer}</p>
            </div>
        </div>
    `).join('');
}

// FAQ toggle
function toggleFAQ(index) {
    const items = document.querySelectorAll('.faq-item');
    items[index].classList.toggle('active');
}

// Modal öffnen
function openModal(index) {
    const feature = features[index];
    const modal = document.getElementById('featureModal');
    
    document.getElementById('modalIcon').textContent = feature.icon;
    document.getElementById('modalTitle').textContent = feature.title;
    document.getElementById('modalText').textContent = feature.fullText;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Modal schließen
function closeModal() {
    const modal = document.getElementById('featureModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Modal schließen bei Klick außerhalb
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('featureModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
});

// Mobile Menu
function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('active');
}

// Parallax Effect
document.addEventListener('mousemove', (e) => {
    const parallaxBg = document.getElementById('parallaxBg');
    if (parallaxBg) {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        parallaxBg.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        if (window.innerWidth <= 768) {
            document.getElementById('menu').classList.remove('active');
        }
    });
});

// Initialize - Daten laden und dann rendern
loadData();
loadAktuelles();

// Update countdowns every minute
setInterval(renderEvents, 60000);