let wheelItems = [];
let isSpinning = false;
let currentRotation = 0;
let isFullscreenMode = false;

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let radius = 180;

// Couleurs par défaut
const defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];

// Mise à jour de l'affichage de la couleur
document.getElementById('itemColor').addEventListener('input', function(e) {
    document.getElementById('colorValue').textContent = e.target.value;
});

// Mode plein écran amélioré
function toggleFullscreenMode() {
    isFullscreenMode = !isFullscreenMode;
    const container = document.querySelector('.container');
    const mainContent = document.getElementById('mainContent');
    const controlsSection = document.getElementById('controlsSection');
    const wheelSection = document.getElementById('wheelSection');
    const wheelContainer = document.getElementById('wheelContainer');
    const backToConfig = document.getElementById('backToConfig');
    const title = document.querySelector('h1');
    const modeToggle = document.querySelector('.mode-toggle');
    
    if (isFullscreenMode) {
        // Mode plein écran
        document.body.style.overflow = 'hidden';
        document.body.style.padding = '0';
        
        container.classList.add('fullscreen-mode');
        mainContent.classList.add('fullscreen');
        wheelSection.classList.add('fullscreen');
        wheelContainer.classList.add('fullscreen');
        
        controlsSection.style.display = 'none';
        backToConfig.style.display = 'block';
        title.style.display = 'none';
        modeToggle.style.display = 'none';
        
        // Redimensionner le canvas pour le mode plein écran
        const size = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.6, 600);
        canvas.width = size;
        canvas.height = size;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        
        // Recalculer les valeurs pour le nouveau canvas
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        radius = (size / 2) - 50;
        
        // Créer des particules
        createParticles();
        
        // Redessiner la roue
        drawWheel();
    } else {
        // Mode normal
        document.body.style.overflow = 'auto';
        document.body.style.padding = '20px';
        
        container.classList.remove('fullscreen-mode');
        mainContent.classList.remove('fullscreen');
        wheelSection.classList.remove('fullscreen');
        wheelContainer.classList.remove('fullscreen');
        
        controlsSection.style.display = 'block';
        backToConfig.style.display = 'none';
        title.style.display = 'block';
        modeToggle.style.display = 'block';
        
        // Remettre la taille normale
        canvas.width = 400;
        canvas.height = 400;
        canvas.style.width = '400px';
        canvas.style.height = '400px';
        
        // Remettre les valeurs par défaut
        centerX = 200;
        centerY = 200;
        radius = 180;
        
        // Supprimer les particules
        document.getElementById('particles').innerHTML = '';
        
        // Redessiner la roue
        drawWheel();
    }
}

// Créer des particules flottantes
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    particlesContainer.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (Math.random() * 5 + 5) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Créer des étincelles autour de la roue
function createSparkles() {
    const sparklesContainer = document.getElementById('sparkles');
    sparklesContainer.innerHTML = '';
    
    for (let i = 0; i < 12; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        const angle = (i / 12) * 360;
        const distance = radius + 30;
        const x = Math.cos(angle * Math.PI / 180) * distance;
        const y = Math.sin(angle * Math.PI / 180) * distance;
        
        sparkle.style.left = `calc(50% + ${x}px)`;
        sparkle.style.top = `calc(50% + ${y}px)`;
        sparkle.style.animationDelay = (i * 0.1) + 's';
        
        sparklesContainer.appendChild(sparkle);
    }
}

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (wheelItems.length === 0) {
        // Roue vide avec design moderne
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Texte d'instruction
        ctx.fillStyle = '#6c757d';
        ctx.font = `bold ${isFullscreenMode ? '28px' : '18px'} Segoe UI`;
        ctx.textAlign = 'center';
        ctx.fillText('Ajoutez des éléments', centerX, centerY - 10);
        ctx.font = `${isFullscreenMode ? '20px' : '14px'} Segoe UI`;
        ctx.fillText('pour commencer', centerX, centerY + 20);
        return;
    }

    const anglePerItem = (2 * Math.PI) / wheelItems.length;
    
    wheelItems.forEach((item, index) => {
        const startAngle = index * anglePerItem + currentRotation;
        const endAngle = startAngle + anglePerItem;
        
        // Dessiner le segment avec dégradé radial plus prononcé
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, lightenColor(item.color, 40));
        gradient.addColorStop(0.7, item.color);
        gradient.addColorStop(1, darkenColor(item.color, 20));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
        
        // Bordure élégante avec dégradé
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = isFullscreenMode ? 5 : 3;
        ctx.stroke();
        
        // Ombre interne
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Texte avec meilleure lisibilité
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerItem / 2);
        
        const textRadius = radius * 0.7;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Ombre du texte plus prononcée
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = `bold ${isFullscreenMode ? '24px' : '16px'} Segoe UI`;
        ctx.fillText(item.text, textRadius + 2, 2);
        
        // Texte principal avec contour
        ctx.strokeStyle = isColorDark(item.color) ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.fillStyle = isColorDark(item.color) ? '#ffffff' : '#000000';
        ctx.strokeText(item.text, textRadius, 0);
        ctx.fillText(item.text, textRadius, 0);
        
        // Image si présente
        if (item.image) {
            const img = new Image();
            img.onload = function() {
                ctx.save();
                ctx.beginPath();
                const imageSize = isFullscreenMode ? 25 : 15;
                ctx.arc(textRadius, -35, imageSize, 0, 2 * Math.PI);
                ctx.clip();
                ctx.drawImage(img, textRadius - imageSize, -35 - imageSize, imageSize * 2, imageSize * 2);
                ctx.restore();
            };
            img.src = item.image;
        }
        
        ctx.restore();
    });
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
        (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
        (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
}

function isColorDark(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness < 128;
}

function addItem() {
    const textInput = document.getElementById('itemText');
    const imageInput = document.getElementById('itemImage');
    const colorInput = document.getElementById('itemColor');
    
    if (!textInput.value.trim()) {
        alert('⚠️ Veuillez entrer un texte');
        return;
    }
    
    const item = {
        text: textInput.value.trim(),
        image: null,
        color: colorInput.value || defaultColors[wheelItems.length % defaultColors.length]
    };
    
    if (imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            item.image = e.target.result;
            wheelItems.push(item);
            updateItemsList();
            drawWheel();
            resetForm();
            
            // Animation d'ajout
            const lastItem = document.querySelector('.item:last-child');
            if (lastItem) {
                lastItem.style.animation = 'none';
                lastItem.offsetHeight; // Trigger reflow
                lastItem.style.animation = 'fadeInUp 0.5s ease';
            }
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        wheelItems.push(item);
        updateItemsList();
        drawWheel();
        resetForm();
    }
}

function resetForm() {
    document.getElementById('itemText').value = '';
    document.getElementById('itemImage').value = '';
    const nextColor = defaultColors[wheelItems.length % defaultColors.length];
    document.getElementById('itemColor').value = nextColor;
    document.getElementById('colorValue').textContent = nextColor;
}

function removeItem(index) {
    if (confirm('🗑️ Êtes-vous sûr de vouloir supprimer cet élément ?')) {
        wheelItems.splice(index, 1);
        updateItemsList();
        drawWheel();
    }
}

function editItemColor(index) {
    const newColor = prompt('🎨 Nouvelle couleur (format #RRGGBB):', wheelItems[index].color);
    if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
        wheelItems[index].color = newColor;
        updateItemsList();
        drawWheel();
    }
}

function updateItemsList() {
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';
    
    if (wheelItems.length === 0) {
        itemsList.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Aucun élément ajouté</p>';
        return;
    }
    
    wheelItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.innerHTML = `
            <div class="item-color" style="background-color: ${item.color}" onclick="editItemColor(${index})" title="Cliquer pour changer la couleur"></div>
            ${item.image ? `<img src="${item.image}" alt="${item.text}">` : ''}
            <span class="item-text">${item.text}</span>
            <button class="btn btn-danger" onclick="removeItem(${index})">🗑️</button>
        `;
        itemsList.appendChild(itemDiv);
    });
}

function spinWheel() {
    if (isSpinning || wheelItems.length === 0) {
        if (wheelItems.length === 0) {
            alert('⚠️ Ajoutez au moins un élément avant de faire tourner la roue !');
        }
        return;
    }
    
    isSpinning = true;
    const spinButton = document.getElementById('spinBtn');
    const wheelContainer = document.querySelector('.wheel-container');
    
    spinButton.textContent = '...';
    wheelContainer.classList.add('spinning');
    
    // Créer des étincelles
    createSparkles();
    
    // Animation plus spectaculaire
    const minSpins = 4;
    const maxSpins = 8;
    const spins = Math.random() * (maxSpins - minSpins) + minSpins;
    const finalRotation = currentRotation + spins * 2 * Math.PI + Math.random() * 2 * Math.PI;
    
    const duration = isFullscreenMode ? 5000 : 4000; // Plus long en mode plein écran
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function plus sophistiquée
        const easeOut = 1 - Math.pow(1 - progress, 4);
        currentRotation = currentRotation + (finalRotation - currentRotation) * easeOut;
        
        drawWheel();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Calculer le résultat
            const normalizedRotation = (2 * Math.PI - (currentRotation % (2 * Math.PI))) % (2 * Math.PI);
            const anglePerItem = (2 * Math.PI) / wheelItems.length;
            const winnerIndex = Math.floor(normalizedRotation / anglePerItem);
            
            setTimeout(() => {
                showResult(wheelItems[winnerIndex]);
                isSpinning = false;
                spinButton.textContent = 'SPIN';
                wheelContainer.classList.remove('spinning');
                
                // Supprimer les étincelles
                setTimeout(() => {
                    document.getElementById('sparkles').innerHTML = '';
                }, 1000);
            }, 800);
        }
    }
    
    animate();
}

function showResult(winner) {
    const resultDiv = document.getElementById('result');
    const overlay = document.getElementById('resultOverlay');
    
    resultDiv.innerHTML = `
        <h2>🎉 Résultat :</h2>
        ${winner.image ? `<img src="${winner.image}" alt="${winner.text}">` : ''}
        <div class="result-text" style="color: ${winner.color}">${winner.text}</div>
        <p style="font-size: 14px; margin-top: 20px; color: #6c757d;">Cliquez n'importe où pour fermer</p>
    `;
    
    overlay.className = 'result-overlay show';
    resultDiv.className = 'result show';
}

function closeResult() {
    document.getElementById('result').className = 'result';
    document.getElementById('resultOverlay').className = 'result-overlay';
}

function exportData() {
    const data = {
        items: wheelItems,
        timestamp: new Date().toISOString(),
        version: "2.0"
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'roue-pro-' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
}

document.getElementById('importFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.items && Array.isArray(data.items)) {
                wheelItems = data.items.map(item => ({
                    text: item.text,
                    image: item.image,
                    color: item.color || defaultColors[Math.floor(Math.random() * defaultColors.length)]
                }));
                updateItemsList();
                drawWheel();
                alert('✅ Données importées avec succès !');
            } else {
                alert('❌ Format de fichier invalide');
            }
        } catch (error) {
            alert('❌ Erreur lors de l\'import: ' + error.message);
        }
    };
    reader.readAsText(file);
});

// Raccourcis clavier CORRIGÉS
document.addEventListener('keydown', function(e) {
    // Vérifier si on n'est pas dans un champ de saisie
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.contentEditable === 'true'
    );
    
    // Entrée pour ajouter un élément (seulement si dans le champ texte)
    if (e.key === 'Enter' && activeElement && activeElement.id === 'itemText' && activeElement.value.trim()) {
        e.preventDefault();
        addItem();
    }
    
    // Espace pour spin (seulement si pas dans un champ)
    if (e.key === ' ' && !isInputFocused && !isSpinning) {
        e.preventDefault();
        spinWheel();
    }
    
    // Échap pour fermer le résultat
    if (e.key === 'Escape') {
        closeResult();
    }
    
    // F pour mode plein écran (seulement si pas dans un champ)
    if ((e.key === 'f' || e.key === 'F') && !isInputFocused) {
        e.preventDefault();
        toggleFullscreenMode();
    }
});

// Gestion du redimensionnement de la fenêtre en mode plein écran
window.addEventListener('resize', function() {
    if (isFullscreenMode) {
        // Recalculer la taille en mode plein écran
        const size = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.6, 600);
        canvas.width = size;
        canvas.height = size;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        radius = (size / 2) - 50;
        
        drawWheel();
    }
});

// Initialisation
drawWheel();
updateItemsList();
resetForm();