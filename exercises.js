// Sample exercises data
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

// Initialize local storage for user data
function initializeStorage() {
  if (!localStorage.getItem('exercises')) {
    const storageData = {};
    exercisesData.forEach(exercise => {
      storageData[exercise.id] = {
        favorite: false,
        saved: false,
        comments: exercise.comments ? [...exercise.comments] : []
      };
    });
    localStorage.setItem('exercises', JSON.stringify(storageData));
  }
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

  exercisesData.forEach(exercise => {
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
      </div>
    </div>
    <div class="exercise-author">${exercise.author}</div>
    <div class="exercise-description">${exercise.description}</div>
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

  favoriteBtn.addEventListener('click', () => toggleFavorite(exercise.id, favoriteBtn));
  saveBtn.addEventListener('click', () => toggleSave(exercise.id, saveBtn));
  commentBtn.addEventListener('click', () => openCommentModal(exercise));

  return card;
}

// Toggle favorite
function toggleFavorite(exerciseId, btn) {
  const userData = getUserData(exerciseId);
  userData.favorite = !userData.favorite;
  updateUserData(exerciseId, userData);
  btn.classList.toggle('active');
}

// Toggle save
function toggleSave(exerciseId, btn) {
  const userData = getUserData(exerciseId);
  userData.saved = !userData.saved;
  updateUserData(exerciseId, userData);
  btn.classList.toggle('active');
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
function addComment() {
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

  // Update data
  const data = JSON.parse(localStorage.getItem('exercises'));
  if (!data[exerciseId].comments) {
    data[exerciseId].comments = [];
  }
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

  alert('Commentaar succesvol geplaatst!');
}

// Close modal
function closeModal() {
  document.getElementById('comment-modal').style.display = 'none';
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  initializeStorage();
  renderExercises();

  // Modal event listeners
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
});
