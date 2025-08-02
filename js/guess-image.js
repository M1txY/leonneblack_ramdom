let gameImages = [];
let isFullscreenMode = false;
let currentGame = {
    isPlaying: false,
    currentImageIndex: 0,
    score: 0,
    timeLeft: 30,
    timer: null,
    depixelTimer: null,
    currentPixelLevel: 50,
    answered: false
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let currentImage = null;

// Mode plein écran amélioré
function toggleFullscreenMode() {
    isFullscreenMode = !isFullscreenMode;
    const container = document.querySelector('.container');
    const mainContent = document.getElementById('mainContent');
    const configSection = document.getElementById('configSection');
    const gameSection = document.getElementById('gameSection');
    const backToConfig = document.getElementById('backToConfig');
    const modeToggle = document.querySelector('.mode-toggle');
    
    if (isFullscreenMode) {
        // Activer le mode plein écran
        container.classList.add('fullscreen-mode');
        mainContent.classList.add('fullscreen');
        gameSection.classList.add('fullscreen');
        configSection.style.display = 'none';
        backToConfig.style.display = 'block';
        modeToggle.style.display = 'none';
        
        // Adapter la taille du canvas selon l'écran
        const maxSize = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.5, 500);
        canvas.width = maxSize;
        canvas.height = maxSize;
        
        // Redessiner si une image est chargée
        if (currentImage && currentGame.isPlaying) {
            drawPixelatedImage();
        } else {
            closeGameOver();
        }
    } else {
        // Désactiver le mode plein écran
        container.classList.remove('fullscreen-mode');
        mainContent.classList.remove('fullscreen');
        gameSection.classList.remove('fullscreen');
        configSection.style.display = 'block';
        backToConfig.style.display = 'none';
        modeToggle.style.display = 'block';
        
        // Remettre la taille originale du canvas
        canvas.width = 400;
        canvas.height = 400;
        
        // Redessiner si une image est chargée
        if (currentImage && currentGame.isPlaying) {
            drawPixelatedImage();
        } else {
            closeGameOver();
        }
    }
}

// Prévisualisation d'image lors de l'upload
document.getElementById('imageFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Aperçu">`;
        };
        reader.readAsDataURL(file);
    }
});

// Ajouter une image à la collection - MODIFIÉ sans catégorie
function addImage() {
    const fileInput = document.getElementById('imageFile');
    const nameInput = document.getElementById('imageName');
    
    if (!fileInput.files[0]) {
        alert('⚠️ Veuillez sélectionner une image');
        return;
    }
    
    if (!nameInput.value.trim()) {
        alert('⚠️ Veuillez entrer un nom/réponse');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = {
            id: Date.now() + Math.random(),
            name: nameInput.value.trim(),
            imageData: e.target.result
        };
        
        gameImages.push(imageData);
        updateImagesList();
        resetForm();
        
        // Animation d'ajout
        setTimeout(() => {
            const lastItem = document.querySelector('.image-item:last-child');
            if (lastItem) {
                lastItem.style.animation = 'none';
                lastItem.offsetHeight;
                lastItem.style.animation = 'slideInLeft 0.5s ease';
            }
        }, 100);
    };
    reader.readAsDataURL(fileInput.files[0]);
}

// Réinitialiser le formulaire
function resetForm() {
    document.getElementById('imageFile').value = '';
    document.getElementById('imageName').value = '';
    document.getElementById('imagePreview').innerHTML = '';
}

// Mettre à jour la liste des images - MODIFIÉ sans catégorie
function updateImagesList() {
    const imagesList = document.getElementById('imagesList');
    const imageCount = document.getElementById('imageCount');
    
    imageCount.textContent = gameImages.length;
    
    if (gameImages.length === 0) {
        imagesList.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Aucune image ajoutée</p>';
        return;
    }
    
    imagesList.innerHTML = '';
    gameImages.forEach((image, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'image-item';
        itemDiv.innerHTML = `
            <img src="${image.imageData}" alt="${image.name}">
            <div class="image-item-info">
                <div class="image-item-name">${image.name}</div>
            </div>
            <button class="btn btn-danger" onclick="removeImage(${index})" style="padding: 5px 10px; font-size: 12px;">
                🗑️
            </button>
        `;
        imagesList.appendChild(itemDiv);
    });
}

// Supprimer une image
function removeImage(index) {
    if (confirm('🗑️ Êtes-vous sûr de vouloir supprimer cette image ?')) {
        gameImages.splice(index, 1);
        updateImagesList();
    }
}

// Commencer le jeu
function startGame() {
    if (gameImages.length === 0) {
        alert('⚠️ Ajoutez au moins une image avant de commencer !');
        return;
    }
    
    // Mélanger les images
    gameImages = shuffleArray([...gameImages]);
    
    // Réinitialiser le jeu
    currentGame = {
        isPlaying: true,
        currentImageIndex: 0,
        score: 0,
        timeLeft: 30,
        timer: null,
        depixelTimer: null,
        currentPixelLevel: 50,
        answered: false
    };
    
    // Mettre à jour l'interface
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'inline-block';
    document.getElementById('skipBtn').style.display = 'inline-block';
    
    updateGameStats();
    loadCurrentImage();
}

// Arrêter le jeu
function stopGame() {
    if (confirm('🛑 Êtes-vous sûr de vouloir arrêter le jeu ?')) {
        endGame();
    }
}

// Charger l'image actuelle - MODIFIÉ sans catégorie
function loadCurrentImage() {
    if (currentGame.currentImageIndex >= gameImages.length) {
        endGame();
        return;
    }
    
    const imageData = gameImages[currentGame.currentImageIndex];
    currentImage = new Image();
    
    currentImage.onload = function() {
        // Réinitialiser pour la nouvelle image
        currentGame.timeLeft = 30;
        currentGame.currentPixelLevel = 50;
        currentGame.answered = false;
        
        // Démarrer les timers
        startImageTimer();
        startDepixelization();
        
        updateGameStats();
        drawPixelatedImage();
    };
    
    currentImage.src = imageData.imageData;
}

// Démarrer le timer pour l'image
function startImageTimer() {
    clearInterval(currentGame.timer);
    
    currentGame.timer = setInterval(() => {
        currentGame.timeLeft--;
        updateGameStats();
        
        if (currentGame.timeLeft <= 0) {
            timeUp();
        }
    }, 1000);
}

// Démarrer la dépixélisation
function startDepixelization() {
    clearInterval(currentGame.depixelTimer);
    
    currentGame.depixelTimer = setInterval(() => {
        if (currentGame.currentPixelLevel > 1) {
            // Dépixélisation progressive : l'image est complètement nette quand il reste 5 secondes
            if (currentGame.timeLeft > 5) {
                // Calculer la réduction pour arriver à 1 pixel quand timeLeft = 5
                const timeElapsed = 30 - currentGame.timeLeft;
                const totalTimeToDepixelize = 25; // 30s - 5s = 25s pour dépixeliser
                const targetPixelLevel = 50 - (timeElapsed / totalTimeToDepixelize) * 49;
                currentGame.currentPixelLevel = Math.max(1, targetPixelLevel);
            } else {
                // Après 25s (quand il reste 5s), l'image est complètement nette
                currentGame.currentPixelLevel = 1;
            }
            
            drawPixelatedImage();
        }
    }, 100);
}

// Dessiner l'image pixelisée - AMÉLIORÉ pour le mode plein écran
function drawPixelatedImage() {
    if (!currentImage) return;
    
    const pixelSize = Math.max(1, Math.floor(currentGame.currentPixelLevel));
    
    // Calculer les dimensions selon le mode
    const canvasSize = Math.min(canvas.width, canvas.height);
    const imgRatio = currentImage.width / currentImage.height;
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgRatio > 1) {
        drawWidth = canvasSize;
        drawHeight = canvasSize / imgRatio;
        offsetX = 0;
        offsetY = (canvasSize - drawHeight) / 2;
    } else {
        drawWidth = canvasSize * imgRatio;
        drawHeight = canvasSize;
        offsetX = (canvasSize - drawWidth) / 2;
        offsetY = 0;
    }
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (pixelSize <= 1) {
        // Image complètement nette
        ctx.drawImage(currentImage, offsetX, offsetY, drawWidth, drawHeight);
    } else {
        // Dessiner l'image pixelisée
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Dessiner l'image réduite
        const pixelWidth = Math.max(1, Math.floor(drawWidth / pixelSize));
        const pixelHeight = Math.max(1, Math.floor(drawHeight / pixelSize));
        
        tempCanvas.width = pixelWidth;
        tempCanvas.height = pixelHeight;
        
        tempCtx.drawImage(currentImage, 0, 0, pixelWidth, pixelHeight);
        
        // Redessiner agrandi sans lissage
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempCanvas, offsetX, offsetY, drawWidth, drawHeight);
        ctx.imageSmoothingEnabled = true;
    }
    
    // Mettre à jour la barre de progression
    const progress = ((50 - currentGame.currentPixelLevel) / 49) * 100;
    document.getElementById('progressFill').style.width = Math.max(0, progress) + '%';
    
    // Changer le texte de progression
    const progressText = document.querySelector('.progress-text');
    if (currentGame.timeLeft > 5) {
        progressText.textContent = `Dépixélisation en cours... (${currentGame.timeLeft}s)`;
        progressText.style.color = isFullscreenMode ? 'rgba(255, 255, 255, 0.9)' : '#6c757d';
        progressText.style.fontWeight = 'bold';
    } else {
        progressText.textContent = 'Image complètement visible !';
        progressText.style.color = '#28a745';
        progressText.style.fontWeight = 'bold';
    }
}

// Passer l'image - pour usage oral
function skipImage() {
    if (confirm('⏭️ Passer à l\'image suivante ?')) {
        currentGame.answered = true;
        clearInterval(currentGame.timer);
        clearInterval(currentGame.depixelTimer);
        showImageResult();
    }
}

// Temps écoulé
function timeUp() {
    currentGame.answered = true;
    clearInterval(currentGame.timer);
    clearInterval(currentGame.depixelTimer);
    showImageResult();
}

// Afficher le résultat de l'image - MODIFIÉ sans catégorie
function showImageResult() {
    const currentImageData = gameImages[currentGame.currentImageIndex];
    
    // Afficher l'image complète
    currentGame.currentPixelLevel = 1;
    drawPixelatedImage();
    
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = `
        <h2>📋 Réponse</h2>
        <img src="${currentImageData.imageData}" alt="${currentImageData.name}" class="result-image">
        <h3 style="color: #2c3e50; margin: 15px 0; font-size: 2rem;">${currentImageData.name}</h3>
        <div style="margin: 30px 0;">
            <button class="btn btn-success" onclick="markCorrect()" style="margin: 0 10px;">
                ✅ Trouvé !
            </button>
            <button class="btn btn-danger" onclick="markWrong()" style="margin: 0 10px;">
                ❌ Raté
            </button>
        </div>
        <button class="btn btn-primary" onclick="nextImage()" style="margin-top: 20px;">
            ${currentGame.currentImageIndex < gameImages.length - 1 ? '➡️ Image Suivante' : '🏁 Voir Résultats'}
        </button>
    `;
    
    document.getElementById('resultOverlay').classList.add('show');
}

// Marquer comme correct (pour jeu oral)
function markCorrect() {
    const points = Math.max(100, Math.floor((currentGame.timeLeft / 30) * 500 + (currentGame.currentPixelLevel / 50) * 500));
    currentGame.score += points;
    
    // Mise à jour visuelle
    const resultContent = document.getElementById('resultContent');
    const buttons = resultContent.querySelector('div');
    buttons.innerHTML = `<p style="color: #28a745; font-weight: bold; font-size: 1.3rem;">🎉 +${points} points !</p>`;
    
    updateGameStats();
}

// Marquer comme raté (pour jeu oral)
function markWrong() {
    // Mise à jour visuelle
    const resultContent = document.getElementById('resultContent');
    const buttons = resultContent.querySelector('div');
    buttons.innerHTML = `<p style="color: #dc3545; font-weight: bold; font-size: 1.3rem;">💔 Aucun point</p>`;
}

// Image suivante
function nextImage() {
    document.getElementById('resultOverlay').classList.remove('show');
    currentGame.currentImageIndex++;
    
    if (currentGame.currentImageIndex < gameImages.length) {
        setTimeout(() => loadCurrentImage(), 500);
    } else {
        endGame();
    }
}

// Fin de jeu
function endGame() {
    currentGame.isPlaying = false;
    clearInterval(currentGame.timer);
    clearInterval(currentGame.depixelTimer);
    
    // Réinitialiser l'interface
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('stopBtn').style.display = 'none';
    document.getElementById('skipBtn').style.display = 'none';
    
    // Calculer les statistiques
    const totalPossibleScore = gameImages.length * 1000;
    const percentage = totalPossibleScore > 0 ? Math.round((currentGame.score / totalPossibleScore) * 100) : 0;
    
    let rank = 'Débutant 🐣';
    if (percentage >= 90) rank = 'Maître 👑';
    else if (percentage >= 75) rank = 'Expert 🎯';
    else if (percentage >= 60) rank = 'Avancé 🌟';
    else if (percentage >= 40) rank = 'Intermédiaire 🎮';
    
    const gameOverContent = document.getElementById('gameOverContent');
    gameOverContent.innerHTML = `
        <h2>🏁 Jeu Terminé !</h2>
        <div class="final-score">${currentGame.score}</div>
        <p style="color: #6c757d; margin-bottom: 20px;">
            ${currentGame.currentImageIndex} image${currentGame.currentImageIndex > 1 ? 's' : ''} jouée${currentGame.currentImageIndex > 1 ? 's' : ''}
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">📊 Statistiques</h3>
            <p><strong>Score:</strong> ${currentGame.score} / ${totalPossibleScore}</p>
            <p><strong>Pourcentage:</strong> ${percentage}%</p>
            <p><strong>Rang:</strong> ${rank}</p>
        </div>
        <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px; flex-wrap: wrap;">
            <button class="btn btn-success" onclick="startGame(); closeGameOver();">
                🔄 Rejouer
            </button>
            <button class="btn btn-secondary" onclick="closeGameOver()">
                ✅ Fermer
            </button>
        </div>
    `;
    
    document.getElementById('gameOverOverlay').classList.add('show');
}

// Fermer l'overlay de fin de jeu
function closeGameOver() {
    document.getElementById('gameOverOverlay').classList.remove('show');
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Texte d'instruction adapté au mode
    const canvasSize = Math.min(canvas.width, canvas.height);
    ctx.fillStyle = isFullscreenMode ? 'rgba(255, 255, 255, 0.9)' : '#6c757d';
    ctx.font = `bold ${Math.max(16, canvasSize * 0.04)}px Segoe UI`;
    ctx.textAlign = 'center';
    ctx.fillText('🎤 Jeu Oral - Devinez à voix haute !', canvasSize / 2, canvasSize / 2 - 30);
    ctx.font = `${Math.max(12, canvasSize * 0.03)}px Segoe UI`;
    ctx.fillText('L\'image se dépixelise progressivement', canvasSize / 2, canvasSize / 2);
    ctx.fillText('Complètement visible à 5 secondes', canvasSize / 2, canvasSize / 2 + 30);
}

// Mettre à jour les statistiques de jeu
function updateGameStats() {
    document.getElementById('score').textContent = currentGame.score;
    document.getElementById('timer').textContent = currentGame.timeLeft;
    document.getElementById('currentImageNum').textContent = currentGame.currentImageIndex + 1;
    document.getElementById('totalImages').textContent = gameImages.length;
}

// Exporter la configuration - MODIFIÉ sans catégorie
function exportConfig() {
    if (gameImages.length === 0) {
        alert('⚠️ Aucune image à exporter');
        return;
    }
    
    const data = {
        images: gameImages,
        timestamp: new Date().toISOString(),
        version: "2.0"
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'devine-image-config-' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
}

// Importer la configuration
document.getElementById('importConfig').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.images && Array.isArray(data.images)) {
                gameImages = data.images;
                updateImagesList();
                alert('✅ Configuration importée avec succès !');
            } else {
                alert('❌ Format de fichier invalide');
            }
        } catch (error) {
            alert('❌ Erreur lors de l\'import: ' + error.message);
        }
    };
    reader.readAsText(file);
});

// Raccourcis clavier pour jeu oral
document.addEventListener('keydown', function(e) {
    // F11 pour mode plein écran
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreenMode();
    }
    
    if (!currentGame.isPlaying) return;
    
    // Espace pour passer
    if (e.key === ' ') {
        e.preventDefault();
        skipImage();
    }
    
    // Échap pour arrêter
    if (e.key === 'Escape') {
        e.preventDefault();
        stopGame();
    }
});

// Gestion du redimensionnement en mode plein écran
window.addEventListener('resize', function() {
    if (isFullscreenMode) {
        // Recalculer la taille du canvas
        const maxSize = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.5, 500);
        canvas.width = maxSize;
        canvas.height = maxSize;
        
        if (currentImage && currentGame.isPlaying) {
            drawPixelatedImage();
        } else {
            closeGameOver();
        }
    }
});

// Utilitaires
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    updateImagesList();
    closeGameOver(); // Afficher le message initial sur le canvas
});