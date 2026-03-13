// Exercise data (same as in exercises.js)
const exercisesData = [
  { 
    id: 2,
    title: "Warming-up",
    description: "Een goede warming-up om de spieren warm te krijgen: begin met één keer heen en weer joggen van een lijn tot een andere lijn. Dan hakken billen heen en knieën heffen terug. Zijwaartse sprongen heen, kruispas terug. En ten slotte benen omhoog schoppen heen en sprinten terug.",
    author: "Thijs Beerkens"
  },
  {
    id: 3,
    title: "Rondje Korfschieten",
    description: "Spelers staan rondom de korf op verschillende afstanden. Iedereen neemt om de beurt een schot. Bij een doelpunt mag je een stap verder naar achteren.",
    author: "Thijs Beerkens"
  },
  {
    id: 4,
    title: "Rebound & Schot",
    description: "Één speler schiet, één vangt af (rebound). Na de vangst speelt de rebounder de bal terug voor een nieuw schot. Na 5 pogingen wisselen.",
    author: "Finne Elenbaas"
  },
  {
    id: 5,
    title: "Strafworpen Challenge",
    description: "Iedere speler neemt 10 strafworpen. Tel hoeveel er raak zijn en probeer de volgende ronde je eigen score te verbeteren.",
    author: "Thijs Beerkens"
  },
  {
    id: 6,
    title: "Schieten na Beweging",
    description: "Spelers lopen vanaf een pion naar de korf, ontvangen een pass en schieten direct. Focus op timing en balans.",
    author: "Finne Elenbaas"
  },
  {
    id: 7,
    title: "Doorloopbal Serie",
    description: "Spelers maken achter elkaar doorloopballen. Na de doorloopbal vang je zelf af en sluit je achteraan in de rij.",
    author: "Thijs Beerkens"
  },
  {
    id: 8,
    title: "Pionnen Pass Circuit",
    description: "Zet meerdere pionnen neer. Spelers passen de bal terwijl ze naar de volgende pion lopen. Oefent nauwkeurig passen in beweging.",
    author: "Finne Elenbaas"
  },
  {
    id: 9,
    title: "Driehoek Passen",
    description: "Drie spelers vormen een driehoek. Ze passen continu rond terwijl ze hun positie volgen na de pass.",
    author: "Thijs Beerkens"
  },
  {
    id: 10,
    title: "Snelle Balcirculatie",
    description: "Vier spelers rondom een korf passen zo snel mogelijk rond zonder te laten vallen. Tel hoeveel passes in 1 minuut.",
    author: "Finne Elenbaas"
  },
  {
    id: 11,
    title: "Pass & Cut",
    description: "Na een pass snijdt de speler direct richting korf voor een mogelijke doorloopbal of schot.",
    author: "Thijs Beerkens"
  },
  {
    id: 12,
    title: "Eén-Hand Pass Oefening",
    description: "Spelers passen alleen met één hand. Wissel elke ronde van hand om techniek te verbeteren.",
    author: "Finne Elenbaas"
  },
  {
    id: 13,
    title: "2 tegen 2 Miniwedstrijd",
    description: "Twee teams spelen op één korf. Korte wedstrijden tot bijvoorbeeld 3 doelpunten.",
    author: "Thijs Beerkens"
  },
  {
    id: 14,
    title: "Tikkertje met Bal",
    description: "Eén speler is tikker met een bal. De bal moet naar iemand gegooid worden voordat er getikt wordt.",
    author: "Finne Elenbaas"
  },
  {
    id: 15,
    title: "Schietwedstrijd Teams",
    description: "Twee teams proberen zo snel mogelijk een bepaald aantal doelpunten te maken.",
    author: "Thijs Beerkens"
  },
  {
    id: 16,
    title: "Koning van de Korf",
    description: "Eén speler staat bij de korf en probeert te scoren. Als een andere speler scoort, wisselt hij met de 'koning'.",
    author: "Finne Elenbaas"
  },
  {
    id: 17,
    title: "4 tegen 4 Aanval vs Verdediging",
    description: "Vier aanvallers proberen kansen te creëren tegen vier verdedigers. Focus op vrijlopen en samenspel.",
    author: "Thijs Beerkens"
  }
];

// Get user data from storage
function getUserData(exerciseId) {
  const data = JSON.parse(localStorage.getItem('exercises'));
  return data[exerciseId] || { favorite: false, saved: false, comments: [] };
}

// Update user data in storage
function updateUserData(exerciseId, updates) {
  const data = JSON.parse(localStorage.getItem('exercises'));
  data[exerciseId] = { ...data[exerciseId], ...updates };
  localStorage.setItem('exercises', JSON.stringify(data));
}

// Load custom exercises from localStorage
function loadCustomExercises() {
  return JSON.parse(localStorage.getItem('customExercises') || '[]');
}

// Get all exercises (base + custom)
function getAllExercises() {
  return [...exercisesData, ...loadCustomExercises()];
}

// Get exercise by ID
function getExerciseById(id) {
  return getAllExercises().find(ex => ex.id === id);
}

// Get filtered exercises
function getFavorites() {
  const data = JSON.parse(localStorage.getItem('exercises'));
  return getAllExercises().filter(exercise => data[exercise.id]?.favorite);
}

function getSaved() {
  const data = JSON.parse(localStorage.getItem('exercises'));
  return getAllExercises().filter(exercise => data[exercise.id]?.saved);
}

// Update counts
function updateCounts() {
  document.getElementById('favorite-count').textContent = getFavorites().length;
  document.getElementById('saved-count').textContent = getSaved().length;
}

// Create exercise card for collection view
function createExerciseCard(exercise) {
  const userData = getUserData(exercise.id);
  const card = document.createElement('div');
  card.className = 'exercise-card';
  card.id = `exercise-${exercise.id}`;

  const commentCount = userData.comments ? userData.comments.length : 0;

  card.innerHTML = `
    <div class="exercise-header">
      <h2 class="exercise-title">${exercise.title}</h2>
      <div class="exercise-actions">
        <button class="action-btn remove-btn" data-exercise-id="${exercise.id}" title="Verwijderen">✕</button>
      </div>
    </div>
    <div class="exercise-author">${exercise.author}</div>
    <div class="exercise-description">${exercise.description}</div>
    ${exercise.visual ? '<div class="visual-preview" data-ex-id="'+exercise.id+'"></div>' : ''}
    <div class="exercise-footer">
      <div class="comment-section">
        <button class="comment-btn" data-exercise-id="${exercise.id}">💬 Commentaar</button>
        <span class="comment-count">${commentCount}</span>
      </div>
    </div>
  `;

  const removeBtn = card.querySelector('.remove-btn');
  const commentBtn = card.querySelector('.comment-btn');

  removeBtn.addEventListener('click', () => removeExercise(exercise.id, card));
  commentBtn.addEventListener('click', () => openCommentModal(exercise, userData.comments || []));

  // If visual exists: render a preview similar to the main exercises page
  if (exercise.visual && exercise.visual.palette && exercise.visual.placed) {
    const preview = card.querySelector('.visual-preview');
    if (preview) {
      preview.innerHTML = '';
      exercise.visual.placed.forEach(p => {
        const imgSrc = exercise.visual.palette && exercise.visual.palette[p.imageIndex];
        if (!imgSrc) return;
        const el = document.createElement('img');
        el.src = imgSrc;
        el.style.left = `${p.x}%`;
        el.style.top = `${p.y}%`;
        el.style.width = `${p.w}%`;
        preview.appendChild(el);
      });
    }
  }

  return card;
}

// Remove exercise from collection
function removeExercise(exerciseId, cardElement) {
  const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
  const userData = getUserData(exerciseId);

  if (activeTab === 'favorites') {
    userData.favorite = false;
  } else if (activeTab === 'saved') {
    userData.saved = false;
  }

  updateUserData(exerciseId, userData);
  cardElement.remove();
  updateCounts();

  // Try to push to server
  fetch(`/api/userdata/${exerciseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  }).catch(err => console.log('Server update failed (remove):', err.message));

  // Show empty state if needed
  checkEmptyStates();
}

// Check and show empty states
function checkEmptyStates() {
  const favoritesList = document.getElementById('favorites-list');
  const favoritesEmpty = document.getElementById('favorites-empty');
  const savedList = document.getElementById('saved-list');
  const savedEmpty = document.getElementById('saved-empty');

  favoritesEmpty.style.display = favoritesList.children.length === 0 ? 'block' : 'none';
  savedEmpty.style.display = savedList.children.length === 0 ? 'block' : 'none';
}

// Render favorites
function renderFavorites() {
  const container = document.getElementById('favorites-list');
  container.innerHTML = '';

  const favorites = getFavorites();
  favorites.forEach(exercise => {
    const card = createExerciseCard(exercise);
    container.appendChild(card);
  });

  checkEmptyStates();
}

// Render saved
function renderSaved() {
  const container = document.getElementById('saved-list');
  container.innerHTML = '';

  const saved = getSaved();
  saved.forEach(exercise => {
    const card = createExerciseCard(exercise);
    container.appendChild(card);
  });

  checkEmptyStates();
}

// Open comment modal
function openCommentModal(exercise, comments) {
  const modal = document.getElementById('comment-modal');
  
  // Get the actual stored comments from localStorage
  const data = JSON.parse(localStorage.getItem('exercises'));
  const storedComments = data[exercise.id]?.comments || [];
  
  renderComments(storedComments.length > 0 ? storedComments : (exercise.comments || []));
  
  modal.style.display = 'block';
}

// Render comments in modal
function renderComments(comments) {
  const commentsList = document.getElementById('comments-list');
  commentsList.innerHTML = '';

  if (comments.length === 0) {
    commentsList.innerHTML = '<div class="no-comments">Geen commentaren nog.</div>';
  } else {
    comments.forEach(comment => {
      const commentEl = document.createElement('div');
      commentEl.className = 'comment-item';
      commentEl.innerHTML = `
        <div class="comment-author">${comment.author}</div>
        <div class="comment-text">${comment.text}</div>
        <div class="comment-date">${comment.date}</div>
      `;
      commentsList.appendChild(commentEl);
    });
  }
}

// Close modal
function closeModal() {
  document.getElementById('comment-modal').style.display = 'none';
}

// Tab switching
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;

      // Update active button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(tabName).classList.add('active');

      // Render content
      if (tabName === 'favorites') {
        renderFavorites();
      } else if (tabName === 'saved') {
        renderSaved();
      }
    });
  });
}

// Try to sync from server
async function syncFromServer() {
  try {
    const resp = await fetch('/api/all');
    if (!resp.ok) throw new Error('Server response not ok');
    const data = await resp.json();

    const baseIds = new Set(exercisesData.map(e => e.id));
    const custom = data.exercises.filter(e => !baseIds.has(e.id));
    localStorage.setItem('customExercises', JSON.stringify(custom));

    localStorage.setItem('exercises', JSON.stringify(data.userData || {}));

    // Re-render
    renderFavorites();
    updateCounts();
  } catch (err) {
    console.log('Kunnen niet syncen met server:', err.message);
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Setup tabs
  setupTabs();

  // Initial render
  renderFavorites();
  updateCounts();

  // Try server sync
  syncFromServer();

  // Modal event listeners
  const modal = document.getElementById('comment-modal');
  const closeBtn = document.querySelector('.close');

  closeBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });
});
