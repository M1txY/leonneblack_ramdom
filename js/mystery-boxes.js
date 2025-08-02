let gameItems = [];
let isFullscreenMode = false;
let currentGame = {
    isPlaying: false,
    boxes: [],
    openedCount: 0
};

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
document.getElementById('itemImage').addEventListener('change', function(e) {
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

// Ajouter un élément
function addItem() {
    const imageInput = document.getElementById('itemImage');
    const nameInput = document.getElementById('itemName');
    
    if (!nameInput.value.trim()) {
        alert('⚠️ Veuillez entrer un nom');
        return;
    }
    
    const itemData = {
        id: Date.now() + Math.random(),
        name: nameInput.value.trim(),
        imageData: null
    };
    
    if (imageInput.files[0]) {
        // Si une image est sélectionnée, la traiter
        const reader = new FileReader();
        reader.onload = function(e) {
            itemData.imageData = e.target.result;
            gameItems.push(itemData);
            updateItemsList();
            resetForm();
            showAddAnimation();
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        // Pas d'image, ajouter directement
        gameItems.push(itemData);
        updateItemsList();
        resetForm();
        showAddAnimation();
    }
}

// Animation d'ajout
function showAddAnimation() {
    setTimeout(() => {
        const lastItem = document.querySelector('.item:last-child');
        if (lastItem) {
            lastItem.style.animation = 'none';
            lastItem.offsetHeight;
            lastItem.style.animation = 'slideInLeft 0.5s ease';
        }
    }, 100);
}

// Réinitialiser le formulaire
function resetForm() {
    document.getElementById('itemImage').value = '';
    document.getElementById('itemName').value = '';
    document.getElementById('imagePreview').innerHTML = '';
}

// Mettre à jour la liste des éléments
function updateItemsList() {
    const itemsList = document.getElementById('itemsList');
    const itemCount = document.getElementById('itemCount');
    
    itemCount.textContent = gameItems.length;
    
    if (gameItems.length === 0) {
        itemsList.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Aucun élément ajouté</p>';
        return;
    }
    
    itemsList.innerHTML = '';
    gameItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        
        // Gestion de l'affichage avec ou sans image
        const imageHtml = item.imageData ? 
            `<img src="${item.imageData}" alt="${item.name}">` : 
            `<div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; margin-right: 12px; border: 2px solid white;">📦</div>`;
        
        itemDiv.innerHTML = `
            ${imageHtml}
            <div class="item-info">
                <div class="item-name">${item.name}</div>
            </div>
            <button class="btn btn-danger" onclick="removeItem(${index})" style="padding: 5px 10px; font-size: 12px;">
                🗑️
            </button>
        `;
        itemsList.appendChild(itemDiv);
    });
}

// Supprimer un élément
function removeItem(index) {
    if (confirm('🗑️ Êtes-vous sûr de vouloir supprimer cet élément ?')) {
        gameItems.splice(index, 1);
        updateItemsList();
    }
}

// Commencer le jeu
function startGame() {
    if (gameItems.length === 0) {
        alert('⚠️ Ajoutez au moins un élément avant de commencer !');
        return;
    }
    
    // Mélanger les éléments
    const shuffledItems = shuffleArray([...gameItems]);
    
    // Créer les boîtes
    currentGame = {
        isPlaying: true,
        boxes: [],
        openedCount: 0
    };
    
    // Générer les boîtes avec distribution aléatoire
    generateBoxes(shuffledItems);
    
    // Mettre à jour l'interface
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'inline-block';
    document.getElementById('revealBtn').style.display = 'inline-block';
    
    updateGameStats();
}

// Générer les boîtes
function generateBoxes(items) {
    const boxesGrid = document.getElementById('boxesGrid');
    boxesGrid.innerHTML = '';
    
    // Utiliser exactement le nombre d'éléments (pas de boîtes vides)
    const totalBoxes = items.length;
    
    // Créer les boîtes avec tous les éléments
    for (let i = 0; i < totalBoxes; i++) {
        const boxDiv = document.createElement('div');
        boxDiv.className = 'mystery-box';
        boxDiv.setAttribute('data-box-id', i);
        
        const boxNumber = document.createElement('div');
        boxNumber.className = 'box-number';
        boxNumber.textContent = i + 1;
        boxDiv.appendChild(boxNumber);
        
        // Chaque boîte contient un élément
        const item = items[i];
        
        // Contenu avec ou sans image
        const imageContent = item.imageData ? 
            `<img src="${item.imageData}" alt="${item.name}">` : 
            `<div style="font-size: 3em; margin-bottom: 10px;">🎁</div>`;
        
        boxDiv.innerHTML += `
            <div class="box-content">
                ${imageContent}
                <div class="box-content-name">${item.name}</div>
            </div>
        `;
        
        currentGame.boxes.push({
            id: i,
            hasItem: true,
            item: item,
            opened: false
        });
        
        boxDiv.addEventListener('click', () => openBox(i));
        boxesGrid.appendChild(boxDiv);
    }
    
    updateGameStats();
}

// Ouvrir une boîte
function openBox(boxId) {
    const boxElement = document.querySelector(`[data-box-id="${boxId}"]`);
    const boxData = currentGame.boxes.find(box => box.id === boxId);
    
    if (!boxData || boxData.opened) return;
    
    // Marquer comme ouvert
    boxData.opened = true;
    currentGame.openedCount++;
    
    // Animation d'ouverture
    boxElement.classList.add('opened');
    
    // Afficher le contenu après un délai
    setTimeout(() => {
        // Toutes les boîtes ont des éléments maintenant
        showItemReveal(boxData.item);
        
        updateGameStats();
        
        // Vérifier si toutes les boîtes sont ouvertes
        const allOpened = currentGame.boxes.every(box => box.opened);
        
        if (allOpened) {
            setTimeout(() => showGameComplete(), 1000);
        }
    }, 400);
}

// Afficher la révélation d'un élément
function showItemReveal(item) {
    const revealContent = document.getElementById('revealContent');
    
    // Image ou icône par défaut
    const imageContent = item.imageData ? 
        `<img src="${item.imageData}" alt="${item.name}" style="max-width: 200px; max-height: 200px; border-radius: 12px; margin: 20px 0;">` :
        `<div style="font-size: 6em; margin: 20px 0;">🎁</div>`;
    
    revealContent.innerHTML = `
        <h2>🎉 Trouvé !</h2>
        ${imageContent}
        <h3 style="color: #28a745; margin-bottom: 20px;">${item.name}</h3>
        <button class="btn btn-primary" onclick="closeReveal()">
            ✅ Continuer
        </button>
    `;
    
    document.getElementById('revealOverlay').classList.add('show');
}

// Fermer la révélation
function closeReveal() {
    document.getElementById('revealOverlay').classList.remove('show');
}

// Révéler toutes les boîtes
function openAllBoxes() {
    if (confirm('👁️ Révéler toutes les boîtes ? Cela terminera le jeu.')) {
        currentGame.boxes.forEach(boxData => {
            if (!boxData.opened) {
                const boxElement = document.querySelector(`[data-box-id="${boxData.id}"]`);
                boxData.opened = true;
                boxElement.classList.add('opened');
            }
        });
        
        currentGame.openedCount = currentGame.boxes.length;
        updateGameStats();
        
        setTimeout(() => showGameComplete(), 500);
    }
}

// Réinitialiser les boîtes
function resetBoxes() {
    if (confirm('🔄 Générer une nouvelle distribution des boîtes ?')) {
        startGame();
    }
}

// Afficher la fin de jeu
function showGameComplete() {
    const itemBoxes = currentGame.boxes; // Toutes les boîtes ont des éléments
    
    const completeContent = document.getElementById('completeContent');
    completeContent.innerHTML = `
        <h2>🎊 Toutes les boîtes ouvertes !</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">📊 Résumé</h3>
            <p><strong>Boîtes ouvertes:</strong> ${currentGame.openedCount}</p>
            <p><strong>Éléments trouvés:</strong> ${itemBoxes.length}</p>
        </div>
        <div style="margin: 20px 0;">
            <h4>🎁 Éléments découverts :</h4>
            ${itemBoxes.map(box => {
                const imageContent = box.item.imageData ? 
                    `<img src="${box.item.imageData}" alt="${box.item.name}">` :
                    `<div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">🎁</div>`;
                
                return `
                    <div class="reveal-item">
                        ${imageContent}
                        <div class="reveal-item-info">
                            <strong>Boîte ${box.id + 1}:</strong> ${box.item.name}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px; flex-wrap: wrap;">
            <button class="btn btn-success" onclick="startGame(); closeComplete();">
                🔄 Nouvelle Partie
            </button>
            <button class="btn btn-secondary" onclick="closeComplete()">
                ✅ Fermer
            </button>
        </div>
    `;
    
    document.getElementById('completeOverlay').classList.add('show');
}

// Fermer la fin de jeu
function closeComplete() {
    document.getElementById('completeOverlay').classList.remove('show');
    
    // Réinitialiser l'interface
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('resetBtn').style.display = 'none';
    document.getElementById('revealBtn').style.display = 'none';
    
    // Vider les boîtes
    document.getElementById('boxesGrid').innerHTML = '';
    
    currentGame = {
        isPlaying: false,
        boxes: [],
        openedCount: 0
    };
    
    updateGameStats();
}

// Mettre à jour les statistiques
function updateGameStats() {
    document.getElementById('openedBoxes').textContent = currentGame.openedCount;
    document.getElementById('totalBoxes').textContent = currentGame.boxes.length;
    document.getElementById('remainingBoxes').textContent = currentGame.boxes.length - currentGame.openedCount;
}

// Exporter la configuration
function exportConfig() {
    if (gameItems.length === 0) {
        alert('⚠️ Aucun élément à exporter');
        return;
    }
    
    const data = {
        items: gameItems,
        timestamp: new Date().toISOString(),
        version: "1.0"
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'mystery-boxes-config-' + new Date().toISOString().split('T')[0] + '.json';
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
            if (data.items && Array.isArray(data.items)) {
                gameItems = data.items;
                updateItemsList();
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

// Raccourcis clavier
document.addEventListener('keydown', function(e) {
    // F11 pour mode plein écran
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreenMode();
    }
    
    // Échap pour fermer les overlays
    if (e.key === 'Escape') {
        closeReveal();
        closeComplete();
    }
    
    // R pour réinitialiser
    if (e.key.toLowerCase() === 'r' && currentGame.isPlaying) {
        e.preventDefault();
        resetBoxes();
    }
    
    // V pour révéler tout
    if (e.key.toLowerCase() === 'v' && currentGame.isPlaying) {
        e.preventDefault();
        openAllBoxes();
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
    updateItemsList();
    updateGameStats();
});