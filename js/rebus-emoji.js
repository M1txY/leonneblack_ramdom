let gameRebus = [];
let isFullscreenMode = false;
let currentGame = {
    isPlaying: false,
    currentRebusIndex: 0,
    score: 0,
    timeLeft: 45,
    timer: null,
    answered: false,
    hintUsed: false
};

let emojiPickerInitialized = false;

// Mode plein écran
function toggleFullscreenMode() {
    isFullscreenMode = !isFullscreenMode;
    const container = document.querySelector('.container');
    const mainContent = document.getElementById('mainContent');
    const configSection = document.getElementById('configSection');
    const gameSection = document.getElementById('gameSection');
    const backToConfig = document.getElementById('backToConfig');
    const modeToggle = document.querySelector('.mode-toggle');
    
    if (isFullscreenMode) {
        container.classList.add('fullscreen-mode');
        mainContent.classList.add('fullscreen');
        gameSection.classList.add('fullscreen');
        configSection.style.display = 'none';
        backToConfig.style.display = 'block';
        modeToggle.style.display = 'none';
    } else {
        container.classList.remove('fullscreen-mode');
        mainContent.classList.remove('fullscreen');
        gameSection.classList.remove('fullscreen');
        configSection.style.display = 'block';
        backToConfig.style.display = 'none';
        modeToggle.style.display = 'block';
    }
}

// Prévisualisation d'image
document.getElementById('rebusImage').addEventListener('change', function(e) {
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

// Ouvrir le sélecteur d'emoji
function openEmojiPicker() {
    const modal = document.getElementById('emojiModal');
    modal.style.display = 'flex';
    
    // Initialiser le picker une seule fois
    if (!emojiPickerInitialized) {
        initEmojiPicker();
        emojiPickerInitialized = true;
    }
}

// Fermer le sélecteur d'emoji
function closeEmojiPicker() {
    const modal = document.getElementById('emojiModal');
    modal.style.display = 'none';
}

// Vider les emojis
function clearEmojis() {
    if (confirm('🗑️ Vider tous les emojis ?')) {
        document.getElementById('rebusEmojis').value = '';
    }
}

// Initialiser le picker d'emoji
function initEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    
    picker.addEventListener('emoji-click', event => {
        const emoji = event.detail.emoji.unicode;
        const textarea = document.getElementById('rebusEmojis');
        textarea.value += emoji;
    });
}

// Fermer le modal en cliquant en dehors
document.getElementById('emojiModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeEmojiPicker();
    }
});

// Fermer le picker en cliquant en dehors (mobile)
document.addEventListener('click', function(e) {
    const container = document.getElementById('emojiPickerContainer');
    const btn = document.querySelector('.emoji-picker-btn');
    
    if (emojiPickerVisible && 
        !container.contains(e.target) && 
        !btn.contains(e.target) &&
        window.innerWidth <= 768) {
        toggleEmojiPicker();
    }
});

// Ajouter un rébus
function addRebus() {
    const imageInput = document.getElementById('rebusImage');
    const nameInput = document.getElementById('rebusName');
    const emojisInput = document.getElementById('rebusEmojis');
    
    if (!nameInput.value.trim()) {
        alert('⚠️ Veuillez entrer un nom/réponse');
        return;
    }
    
    if (!emojisInput.value.trim()) {
        alert('⚠️ Veuillez entrer une suite d\'emojis');
        return;
    }
    
    const rebusData = {
        id: Date.now() + Math.random(),
        name: nameInput.value.trim(),
        emojis: emojisInput.value.trim(),
        image: null
    };
    
    if (imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            rebusData.image = e.target.result;
            gameRebus.push(rebusData);
            updateRebusList();
            resetForm();
            showAddAnimation();
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        gameRebus.push(rebusData);
        updateRebusList();
        resetForm();
        showAddAnimation();
    }
}

// Animation d'ajout
function showAddAnimation() {
    setTimeout(() => {
        const lastItem = document.querySelector('.rebus-item:last-child');
        if (lastItem) {
            lastItem.style.animation = 'none';
            lastItem.offsetHeight;
            lastItem.style.animation = 'slideInLeft 0.5s ease';
        }
    }, 100);
}

// Réinitialiser le formulaire
function resetForm() {
    document.getElementById('rebusImage').value = '';
    document.getElementById('rebusName').value = '';
    document.getElementById('rebusEmojis').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('emojiPreview').textContent = '🧩 Vos emojis apparaîtront ici';
}

// Mettre à jour la liste des rébus
function updateRebusList() {
    const rebusList = document.getElementById('rebusList');
    const rebusCount = document.getElementById('rebusCount');
    
    rebusCount.textContent = gameRebus.length;
    
    if (gameRebus.length === 0) {
        rebusList.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Aucun rébus ajouté</p>';
        return;
    }
    
    rebusList.innerHTML = '';
    gameRebus.forEach((rebus, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'rebus-item';
        itemDiv.innerHTML = `
            ${rebus.image ? `<img src="${rebus.image}" alt="${rebus.name}">` : ''}
            <div class="rebus-item-info">
                <div class="rebus-item-name">${rebus.name}</div>
                <div class="rebus-item-emojis">${rebus.emojis}</div>
                <div class="rebus-item-answer">Réponse: ${rebus.name}</div>
            </div>
            <button class="btn btn-danger" onclick="removeRebus(${index})" style="padding: 5px 10px; font-size: 12px;">
                🗑️
            </button>
        `;
        rebusList.appendChild(itemDiv);
    });
}

// Supprimer un rébus
function removeRebus(index) {
    if (confirm('🗑️ Êtes-vous sûr de vouloir supprimer ce rébus ?')) {
        gameRebus.splice(index, 1);
        updateRebusList();
    }
}

// Commencer le jeu
function startGame() {
    if (gameRebus.length === 0) {
        alert('⚠️ Ajoutez au moins un rébus avant de commencer !');
        return;
    }
    
    // Mélanger les rébus
    gameRebus = shuffleArray([...gameRebus]);
    
    // Réinitialiser le jeu
    currentGame = {
        isPlaying: true,
        currentRebusIndex: 0,
        score: 0,
        timeLeft: 45,
        timer: null,
        answered: false,
        hintUsed: false
    };
    
    // Mettre à jour l'interface
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'inline-block';
    document.getElementById('revealBtn').style.display = 'inline-block';
    document.getElementById('hintBtn').style.display = 'inline-block';
    document.getElementById('nextBtn').style.display = 'none';
    
    updateGameStats();
    loadCurrentRebus();
}

// Charger le rébus actuel
function loadCurrentRebus() {
    if (currentGame.currentRebusIndex >= gameRebus.length) {
        endGame();
        return;
    }
    
    const rebusData = gameRebus[currentGame.currentRebusIndex];
    
    // Afficher les emojis
    const emojisDisplay = document.getElementById('rebusEmojisDisplay');
    const hintDisplay = document.getElementById('rebusHint');
    
    emojisDisplay.textContent = rebusData.emojis;
    emojisDisplay.style.display = 'block';
    hintDisplay.textContent = '';
    
    // Réinitialiser pour le nouveau rébus
    currentGame.timeLeft = 45;
    currentGame.answered = false;
    currentGame.hintUsed = false;
    
    // Réafficher les boutons
    document.getElementById('revealBtn').style.display = 'inline-block';
    document.getElementById('hintBtn').style.display = 'inline-block';
    document.getElementById('nextBtn').style.display = 'none';
    
    // Démarrer le timer
    startTimer();
    updateGameStats();
}

// Démarrer le timer
function startTimer() {
    clearInterval(currentGame.timer);
    
    currentGame.timer = setInterval(() => {
        currentGame.timeLeft--;
        updateGameStats();
        
        if (currentGame.timeLeft <= 0) {
            timeUp();
        }
    }, 1000);
}

// Temps écoulé
function timeUp() {
    if (currentGame.answered) return;
    
    currentGame.answered = true;
    clearInterval(currentGame.timer);
    showRebusResult(false);
}

// Révéler la réponse
function revealAnswer() {
    if (currentGame.answered) return;
    
    currentGame.answered = true;
    clearInterval(currentGame.timer);
    
    const rebusData = gameRebus[currentGame.currentRebusIndex];
    const hintDisplay = document.getElementById('rebusHint');
    
    // Afficher la réponse avec l'image si disponible
    hintDisplay.innerHTML = `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-top: 20px;">
            <div style="font-size: 24px; font-weight: bold; color: #28a745; margin-bottom: 10px;">
                ✅ ${rebusData.name}
            </div>
            ${rebusData.image ? `<img src="${rebusData.image}" alt="${rebusData.name}" style="max-width: 200px; max-height: 150px; border-radius: 8px; object-fit: cover;">` : ''}
        </div>
    `;
    
    // Cacher les boutons de jeu et montrer "Suivant"
    document.getElementById('revealBtn').style.display = 'none';
    document.getElementById('hintBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'inline-block';
}

// Rébus suivant
function nextRebus() {
    currentGame.currentRebusIndex++;
    
    if (currentGame.currentRebusIndex < gameRebus.length) {
        loadCurrentRebus();
    } else {
        endGame();
    }
}

// Fin de jeu
function endGame() {
    currentGame.isPlaying = false;
    clearInterval(currentGame.timer);
    
    // Réinitialiser l'interface
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('stopBtn').style.display = 'none';
    document.getElementById('revealBtn').style.display = 'none';
    document.getElementById('hintBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    
    const gameOverContent = document.getElementById('gameOverContent');
    gameOverContent.innerHTML = `
        <h2>🏁 Jeu Terminé !</h2>
        <p style="font-size: 18px; color: #6c757d; margin-bottom: 20px;">
            ${currentGame.currentRebusIndex} rébus présenté${currentGame.currentRebusIndex > 1 ? 's' : ''}
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">🎯 Bonne partie !</h3>
            <p>Vous avez vu tous les rébus de la collection.</p>
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
    
    // Réinitialiser l'affichage
    document.getElementById('rebusImageDisplay').innerHTML = '';
    document.getElementById('rebusEmojisDisplay').textContent = '🧩 Cliquez sur "Commencer" pour jouer !';
    document.getElementById('rebusHint').textContent = '';
}

// Mettre à jour les statistiques
function updateGameStats() {
    document.getElementById('score').textContent = currentGame.score;
    document.getElementById('timer').textContent = currentGame.timeLeft;
    document.getElementById('currentRebusNum').textContent = currentGame.currentRebusIndex + 1;
    document.getElementById('totalRebus').textContent = gameRebus.length;
}

// Exporter la configuration
function exportConfig() {
    if (gameRebus.length === 0) {
        alert('⚠️ Aucun rébus à exporter');
        return;
    }
    
    const data = {
        rebus: gameRebus,
        timestamp: new Date().toISOString(),
        version: "1.0"
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'rebus-emoji-config-' + new Date().toISOString().split('T')[0] + '.json';
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
            if (data.rebus && Array.isArray(data.rebus)) {
                gameRebus = data.rebus;
                updateRebusList();
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

// Raccourcis clavier simplifiés
document.addEventListener('keydown', function(e) {
    // Échap pour fermer les overlays
    if (e.key === 'Escape') {
        closeEmojiPicker();
        document.getElementById('resultOverlay').classList.remove('show');
        document.getElementById('gameOverOverlay').classList.remove('show');
    }
    
    // F11 pour mode plein écran
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreenMode();
    }
    
    if (!currentGame.isPlaying) return;
    
    // R pour révéler la réponse
    if (e.key.toLowerCase() === 'r' && !currentGame.answered) {
        e.preventDefault();
        revealAnswer();
    }
    
    // H pour indice
    if (e.key.toLowerCase() === 'h' && !currentGame.answered && !currentGame.hintUsed) {
        e.preventDefault();
        showHint();
    }
    
    // Espace ou Entrée pour suivant
    if ((e.key === ' ' || e.key === 'Enter') && currentGame.answered) {
        e.preventDefault();
        nextRebus();
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
    // Permettre l'édition directe du textarea emoji
    document.getElementById('rebusEmojis').addEventListener('input', function(e) {
        // Permettre la saisie directe d'emojis
    });

    // Supprimer readonly du textarea
    document.addEventListener('DOMContentLoaded', function() {
        const emojiInput = document.getElementById('rebusEmojis');
        emojiInput.removeAttribute('readonly');
        updateRebusList();
        closeGameOver();
    });
});