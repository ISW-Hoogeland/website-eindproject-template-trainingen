// Exercise data (same as in exercises.js)
const exercisesData = [
  {
    id: 1,
    title: "HTML Basis",
    description: "Leer de fundamentele HTML-elementen. Deze oefening behandelt tags, attributen en structuur van een webpagina.",
    author: "Jan de Vries",
    comments: [
      { author: "Maria Lopez", text: "Goede uitleg!", date: "2025-01-20" }
    ]
  },
  {
    id: 2,
    title: "CSS Layout",
    description: "Master CSS Grid en Flexbox. Leer hoe je professionele layouts maakt met moderne CSS technieken.",
    author: "Sophie Müller",
    comments: [
      { author: "Ahmed Hassan", text: "Zeer nuttig!", date: "2025-01-19" },
      { author: "Lisa Chen", text: "Perfect niveau voor beginners", date: "2025-01-18" }
    ]
  },
  {
    id: 3,
    title: "JavaScript Events",
    description: "Begrijp hoe JavaScript events werken. Interactiviteit toevoegen aan je webpagina's is essentieel.",
    author: "Marcus Johnson",
    comments: []
  },
  {
    id: 4,
    title: "Responsive Design",
    description: "Maak websites die goed werken op elk apparaat. Media queries en mobiele-first aanpak zijn het onderwerp.",
    author: "Emma Wilson",
    comments: [
      { author: "Tom Anderson", text: "Erg goed uitgelegd", date: "2025-01-17" }
    ]
  },
  {
    id: 5,
    title: "Git Basis",
    description: "Leer versiebeheersystemen. Git is essentieel voor elke developer. Repository, commits en branches.",
    author: "David Kumar",
    comments: [
      { author: "Sofia Rodriguez", text: "Eindelijk begrijp ik git!", date: "2025-01-16" },
      { author: "James White", text: "Duidelijke voorbeelden", date: "2025-01-15" }
    ]
  },
  {
    id: 6,
    title: "API Integratie",
    description: "Werk met externe API's. Leer hoe je data ophaalt en gebruikt via REST API's.",
    author: "Laura Bergström",
    comments: [
      { author: "Raj Patel", text: "Praktische voorbeelden zijn geweldig", date: "2025-01-14" }
    ]
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
