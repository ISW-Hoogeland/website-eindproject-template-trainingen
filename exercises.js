// Sample exercises data
const exercisesData = [
  {
    id: 1,
    title: "HTML Basis",
    description: "Leer de fundamentele HTML-elementen. Deze oefening behandelt tags, attributen en structuur van een webpagina.",
    author: "Jan de Vries",
    comments: [
      { author: "Maria Lopez", text: "Test", date: "2025-01-20" }
    ]
  }
];

// Load custom exercises from localStorage
function loadCustomExercises() {
  return JSON.parse(localStorage.getItem('customExercises') || '[]');
}

// Get all exercises (base + custom)
function getAllExercises() {
  return [...exercisesData, ...loadCustomExercises()];
}

// Initialize local storage for user data
function initializeStorage() {
  const storageData = JSON.parse(localStorage.getItem('exercises') || '{}');

  getAllExercises().forEach(exercise => {
    if (!storageData[exercise.id]) {
      storageData[exercise.id] = {
        favorite: false,
        saved: false,
        comments: exercise.comments ? [...exercise.comments] : []
      };
    }
  });

  localStorage.setItem('exercises', JSON.stringify(storageData));
}

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

// Render all exercises
function renderExercises() {
  const container = document.getElementById('exercises-list');
  container.innerHTML = '';

  const allExercises = getAllExercises();
  allExercises.forEach(exercise => {
    const userData = getUserData(exercise.id);
    const card = createExerciseCard(exercise, userData);
    container.appendChild(card);
  });
}

// Create exercise card element
function createExerciseCard(exercise, userData) {
  const card = document.createElement('div');
  card.className = 'exercise-card';
  card.id = `exercise-${exercise.id}`;

  const favoriteClass = userData.favorite ? 'active' : '';
  const saveClass = userData.saved ? 'active' : '';
  const commentCount = userData.comments.length;

  card.innerHTML = `
    <div class="exercise-header">
      <h2 class="exercise-title">${exercise.title}</h2>
      <div class="exercise-actions">
        <button class="action-btn favorite-btn ${favoriteClass}" data-exercise-id="${exercise.id}" title="Favorieten">★</button>
        <button class="action-btn save-btn ${saveClass}" data-exercise-id="${exercise.id}" title="Opslaan">💾</button>
        <button class="action-btn add-to-training-btn" data-exercise-id="${exercise.id}" title="Voeg toe aan training">📚</button>
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

  // Add event listeners
  const favoriteBtn = card.querySelector('.favorite-btn');
  const saveBtn = card.querySelector('.save-btn');
  const commentBtn = card.querySelector('.comment-btn');
  const addToTrainingBtn = card.querySelector('.add-to-training-btn');

  favoriteBtn.addEventListener('click', () => toggleFavorite(exercise.id, favoriteBtn));
  saveBtn.addEventListener('click', () => toggleSave(exercise.id, saveBtn));
  commentBtn.addEventListener('click', () => openCommentModal(exercise));
  addToTrainingBtn.addEventListener('click', () => openAddToTrainingModal(exercise));

  // If visual exists: render preview
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

// Toggle favorite
function toggleFavorite(exerciseId, btn) {
  const userData = getUserData(exerciseId);
  userData.favorite = !userData.favorite;
  updateUserData(exerciseId, userData);
  btn.classList.toggle('active');

  // Try to push to server (best-effort)
  fetch(`/api/userdata/${exerciseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ favorite: userData.favorite })
  }).catch(err => console.log('Server update failed (favorite):', err.message));
}

// Toggle save
function toggleSave(exerciseId, btn) {
  const userData = getUserData(exerciseId);
  userData.saved = !userData.saved;
  updateUserData(exerciseId, userData);
  btn.classList.toggle('active');

  // Try to push to server (best-effort)
  fetch(`/api/userdata/${exerciseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ saved: userData.saved })
  }).catch(err => console.log('Server update failed (save):', err.message));
}

// Open comment modal
function openCommentModal(exercise) {
  const modal = document.getElementById('comment-modal');
  const userData = getUserData(exercise.id);
  
  // Store current exercise ID for later use
  modal.dataset.exerciseId = exercise.id;
  
  // Clear input
  document.getElementById('comment-input').value = '';
  
  // Render comments
  renderComments(userData.comments, exercise.id);
  
  modal.style.display = 'block';
}

// Render comments in modal
function renderComments(comments, exerciseId) {
  const commentsList = document.getElementById('comments-list');
  commentsList.innerHTML = '';

  if (comments.length === 0) {
    commentsList.innerHTML = '<div class="no-comments">Geen commentaren nog. Wees de eerste!</div>';
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

// Add comment
async function addComment() {
  const modal = document.getElementById('comment-modal');
  const exerciseId = parseInt(modal.dataset.exerciseId);
  const commentText = document.getElementById('comment-input').value.trim();

  if (commentText === '') {
    alert('Voer alstublieft commentaar in');
    return;
  }

  // Get current user (simulated)
  const currentUser = prompt('Wat is je naam?', 'Anoniem');
  if (!currentUser) return;

  // Create comment object
  const newComment = {
    author: currentUser,
    text: commentText,
    date: new Date().toISOString().split('T')[0]
  };

  // Optimistically update localStorage
  const data = JSON.parse(localStorage.getItem('exercises'));
  if (!data[exerciseId]) data[exerciseId] = { favorite: false, saved: false, comments: [] };
  if (!data[exerciseId].comments) data[exerciseId].comments = [];
  data[exerciseId].comments.push(newComment);
  localStorage.setItem('exercises', JSON.stringify(data));

  // Update modal display
  renderComments(data[exerciseId].comments, exerciseId);
  document.getElementById('comment-input').value = '';

  // Update card comment count
  const card = document.getElementById(`exercise-${exerciseId}`);
  if (card) {
    const commentCount = card.querySelector('.comment-count');
    commentCount.textContent = data[exerciseId].comments.length;
  }

  // Try to post to server
  try {
    const resp = await fetch(`/api/exercises/${exerciseId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: currentUser, text: commentText })
    });

    if (!resp.ok) throw new Error('Server response not OK');

    alert('Commentaar succesvol geplaatst!');
  } catch (err) {
    console.log('Server update failed (comment):', err.message);
    alert('Commentaar lokaal opgeslagen (server niet bereikbaar).');
  }
}

// Close modal
function closeModal() {
  document.getElementById('comment-modal').style.display = 'none';
}

// Open modal to add exercise to training
function openAddToTrainingModal(exercise) {
  const modal = document.getElementById('add-to-training-modal');
  if (!modal) return; // Modal not available (not on exercises page)
  
  modal.dataset.exerciseId = exercise.id;
  document.getElementById('exercise-title-display').textContent = `Oefening: ${exercise.title}`;
  
  // Load trainingen
  renderTrainingenSelect();
  
  modal.style.display = 'block';
}

// Render trainingen in select modal
function renderTrainingenSelect() {
  const container = document.getElementById('trainingen-select');
  container.innerHTML = '';
  
  const trainingen = JSON.parse(localStorage.getItem('trainingen') || '[]');
  
  if (trainingen.length === 0) {
    container.innerHTML = '<p style="color: #999; text-align: center;">Geen trainingen beschikbaar. Maak eerst een training aan op de Trainingen pagina.</p>';
    return;
  }
  
  const ul = document.createElement('ul');
  ul.style.listStyle = 'none';
  ul.style.padding = '0';
  ul.style.margin = '0';
  
  trainingen.forEach(training => {
    const li = document.createElement('li');
    li.style.padding = '10px';
    li.style.borderBottom = '1px solid #eee';
    li.style.cursor = 'pointer';
    li.style.transition = 'background-color 0.2s';
    li.className = 'training-option';
    li.dataset.trainingId = training.id;
    
    li.innerHTML = `
      <strong>${training.name}</strong><br/>
      <small style="color: #666;">${training.description}</small>
    `;
    
    li.addEventListener('click', () => {
      document.querySelectorAll('.training-option').forEach(el => el.style.backgroundColor = 'transparent');
      li.style.backgroundColor = '#f0f7ff';
      document.getElementById('add-to-training-modal').dataset.selectedTrainingId = training.id;
    });
    
    li.addEventListener('mouseover', () => li.style.backgroundColor = '#f9f9f9');
    li.addEventListener('mouseout', function() {
      if (document.getElementById('add-to-training-modal').dataset.selectedTrainingId !== this.dataset.trainingId) {
        this.style.backgroundColor = 'transparent';
      }
    });
    
    ul.appendChild(li);
  });
  
  container.appendChild(ul);
}

// Confirm adding exercise to training
function confirmAddToTraining() {
  const modal = document.getElementById('add-to-training-modal');
  const exerciseId = parseInt(modal.dataset.exerciseId);
  const trainingId = parseInt(modal.dataset.selectedTrainingId);
  
  if (!trainingId) {
    alert('Selecteer alstublieft een training');
    return;
  }
  
  // Load trainingen and update
  const trainingen = JSON.parse(localStorage.getItem('trainingen') || '[]');
  const training = trainingen.find(t => t.id === trainingId);
  
  if (training && !training.exerciseIds.includes(exerciseId)) {
    training.exerciseIds.push(exerciseId);
    localStorage.setItem('trainingen', JSON.stringify(trainingen));
    alert('Oefening succesvol toegevoegd aan training!');
    closeAddToTrainingModal();
  } else if (training && training.exerciseIds.includes(exerciseId)) {
    alert('Deze oefening staat al in de training');
  }
}

// Close add to training modal
function closeAddToTrainingModal() {
  const modal = document.getElementById('add-to-training-modal');
  if (modal) {
    modal.style.display = 'none';
    modal.dataset.exerciseId = '';
    modal.dataset.selectedTrainingId = '';
  }
}

// Sync with server if available
async function syncFromServer() {
  try {
    const resp = await fetch('/api/all');
    if (!resp.ok) throw new Error('Server response not ok');
    const data = await resp.json();

    const baseIds = new Set(exercisesData.map(e => e.id));
    const custom = data.exercises.filter(e => !baseIds.has(e.id));
    localStorage.setItem('customExercises', JSON.stringify(custom));

    // server stores userData keyed by id
    localStorage.setItem('exercises', JSON.stringify(data.userData || {}));

    // Re-render with server data
    renderExercises();
  } catch (err) {
    // Server not available; remain using localStorage
    console.log('Kunnen niet syncen met server:', err.message);
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  initializeStorage();
  renderExercises();

  // Try to sync from server (non-blocking)
  syncFromServer();

  // Modal event listeners for comment modal
  const modal = document.getElementById('comment-modal');
  const closeBtn = document.querySelector('.close');
  const submitBtn = document.getElementById('submit-comment');

  closeBtn.addEventListener('click', closeModal);
  submitBtn.addEventListener('click', addComment);

  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Allow Enter key for comment input
  document.getElementById('comment-input').addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      addComment();
    }
  });

  // Add to training modal event listeners
  const addToTrainingModal = document.getElementById('add-to-training-modal');
  if (addToTrainingModal) {
    const addToTrainingCloseBtn = addToTrainingModal.querySelector('.close');
    const addToTrainingConfirmBtn = document.getElementById('add-to-training-confirm');
    
    addToTrainingCloseBtn.addEventListener('click', closeAddToTrainingModal);
    addToTrainingConfirmBtn.addEventListener('click', confirmAddToTraining);
    
    window.addEventListener('click', function(event) {
      if (event.target === addToTrainingModal) {
        closeAddToTrainingModal();
      }
    });
  }
});
