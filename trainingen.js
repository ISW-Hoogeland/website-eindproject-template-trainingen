// Sample exercises data (for reference)
const exercisesData = [
  {
    id: 1,
    title: "HTML Basis",
    description: "Leer de fundamentele HTML-elementen. Deze oefening behandelt tags, attributen en structuur van een webpagina.",
    author: "Jan de Vries"
  }
];

// Load trainingen from localStorage
function loadTrainingen() {
  const saved = localStorage.getItem('trainingen');
  if (saved) {
    return JSON.parse(saved);
  }
  // Default trainingen
  return [
    {
      id: 1,
      name: "Web Fundamentals",
      description: "Complete introductie tot webontwikkeling",
      exerciseIds: [1, 2],
      createdAt: "2025-01-20"
    },
    {
      id: 2,
      name: "Geavanceerde JavaScript",
      description: "Dieper ingaan op JavaScript en interactiviteit",
      exerciseIds: [3, 5],
      createdAt: "2025-01-19"
    }
  ];
}

// Save trainingen to localStorage
function saveTrainingen(trainingen) {
  localStorage.setItem('trainingen', JSON.stringify(trainingen));
}

// Get exercise details by ID
function getExerciseById(id) {
  const custom = JSON.parse(localStorage.getItem('customExercises') || '[]');
  const allExercises = [...exercisesData, ...custom];
  return allExercises.find(e => e.id === id);
}

// Create a new training
function createTraining(name, description, exerciseIds = []) {
  const trainingen = loadTrainingen();
  const newId = Math.max(...trainingen.map(t => t.id), 0) + 1;
  
  const newTraining = {
    id: newId,
    name: name,
    description: description,
    exerciseIds: exerciseIds,
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  trainingen.push(newTraining);
  saveTrainingen(trainingen);
  
  return newTraining;
}

// Update an existing training
function updateTraining(trainingId, name, description, exerciseIds) {
  const trainingen = loadTrainingen();
  const training = trainingen.find(t => t.id === trainingId);
  
  if (training) {
    training.name = name;
    training.description = description;
    training.exerciseIds = exerciseIds;
    saveTrainingen(trainingen);
    return training;
  }
  
  return null;
}

// Delete a training
function deleteTraining(trainingId) {
  const trainingen = loadTrainingen();
  const index = trainingen.findIndex(t => t.id === trainingId);
  
  if (index !== -1) {
    trainingen.splice(index, 1);
    saveTrainingen(trainingen);
    return true;
  }
  
  return false;
}

// Add exercise to training
function addExerciseToTraining(trainingId, exerciseId) {
  const trainingen = loadTrainingen();
  const training = trainingen.find(t => t.id === trainingId);
  
  if (training && !training.exerciseIds.includes(exerciseId)) {
    training.exerciseIds.push(exerciseId);
    saveTrainingen(trainingen);
    return true;
  }
  
  return false;
}

// Remove exercise from training
function removeExerciseFromTraining(trainingId, exerciseId) {
  const trainingen = loadTrainingen();
  const training = trainingen.find(t => t.id === trainingId);
  
  if (training) {
    training.exerciseIds = training.exerciseIds.filter(id => id !== exerciseId);
    saveTrainingen(trainingen);
    return true;
  }
  
  return false;
}

// Render all trainingen
function renderTrainingen() {
  const container = document.getElementById('trainingen-list');
  if (!container) return;
  
  container.innerHTML = '';
  const trainingen = loadTrainingen();
  
  trainingen.forEach(training => {
    const card = createTrainingCard(training);
    container.appendChild(card);
  });
}

// Create training card element
function createTrainingCard(training) {
  const card = document.createElement('div');
  card.className = 'training-card';
  card.id = `training-${training.id}`;
  
  const exerciseCount = training.exerciseIds.length;
  
  card.innerHTML = `
    <div class="training-header">
      <h2 class="training-title">${training.name}</h2>
      <div class="training-actions">
        <button class="action-btn edit-btn" data-training-id="${training.id}" title="Bewerken">✏️</button>
        <button class="action-btn delete-btn" data-training-id="${training.id}" title="Verwijderen">🗑️</button>
      </div>
    </div>
    <div class="training-description">${training.description}</div>
    <div class="training-info">
      <strong>Oefeningen:</strong> ${exerciseCount}
    </div>
    <button class="btn btn-secondary view-exercises-btn" data-training-id="${training.id}" style="width: 100%; margin-top: 12px;">Bekijk oefeningen</button>
    <div class="training-date">Gemaakt: ${training.createdAt}</div>
  `;
  
  // Add event listeners
  const editBtn = card.querySelector('.edit-btn');
  const deleteBtn = card.querySelector('.delete-btn');
  const viewBtn = card.querySelector('.view-exercises-btn');
  
  editBtn.addEventListener('click', () => openEditTrainingModal(training));
  deleteBtn.addEventListener('click', () => {
    if (confirm('Weet je zeker dat je deze training wilt verwijderen?')) {
      deleteTraining(training.id);
      renderTrainingen();
    }
  });
  viewBtn.addEventListener('click', () => openTrainingExercisesModal(training));
  
  return card;
}

// Open modal to view exercises in training
function openTrainingExercisesModal(training) {
  const modal = document.getElementById('training-exercises-modal');
  if (!modal) return;
  
  modal.dataset.trainingId = training.id;
  document.getElementById('training-exercises-title').textContent = training.name;
  
  renderTrainingExercises(training.exerciseIds);
  
  modal.style.display = 'block';
}

// Render exercises in training modal
function renderTrainingExercises(exerciseIds) {
  const container = document.getElementById('training-exercises-list');
  container.innerHTML = '';
  
  if (exerciseIds.length === 0) {
    container.innerHTML = '<div class="no-exercises">Geen oefeningen in deze training</div>';
    return;
  }
  
  exerciseIds.forEach(exId => {
    const exercise = getExerciseById(exId);
    if (exercise) {
      const card = createTrainingExerciseCard(exercise);
      container.appendChild(card);
    }
  });
}

// Create exercise card for training modal
function createTrainingExerciseCard(exercise) {
  const card = document.createElement('div');
  card.className = 'training-exercise-card';
  
  card.innerHTML = `
    <div class="training-exercise-header">
      <h3 class="training-exercise-title">${exercise.title}</h3>
    </div>
    <div class="training-exercise-author">${exercise.author}</div>
    <div class="training-exercise-description">${exercise.description}</div>
    ${exercise.visual ? '<div class="training-visual-preview" data-ex-id="'+exercise.id+'"></div>' : ''}
  `;
  
  // If visual exists: render preview
  if (exercise.visual && exercise.visual.palette && exercise.visual.placed) {
    const preview = card.querySelector('.training-visual-preview');
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

// Close training exercises modal
function closeTrainingExercisesModal() {
  const modal = document.getElementById('training-exercises-modal');
  if (modal) {
    modal.style.display = 'none';
    modal.dataset.trainingId = '';
  }
}

// Open modal to create new training
function openCreateTrainingModal() {
  const modal = document.getElementById('training-modal');
  const form = document.getElementById('training-form');
  
  // Reset form
  form.reset();
  modal.dataset.mode = 'create';
  modal.dataset.trainingId = '';
  
  // Clear selected exercises
  document.getElementById('selected-exercises').innerHTML = '';
  
  modal.style.display = 'block';
}

// Open modal to edit training
function openEditTrainingModal(training) {
  const modal = document.getElementById('training-modal');
  const form = document.getElementById('training-form');
  
  modal.dataset.mode = 'edit';
  modal.dataset.trainingId = training.id;
  
  document.getElementById('training-name').value = training.name;
  document.getElementById('training-description').value = training.description;
  
  // Load selected exercises
  renderSelectedExercises(training.exerciseIds);
  
  modal.style.display = 'block';
}

// Render selected exercises in modal
function renderSelectedExercises(exerciseIds) {
  const container = document.getElementById('selected-exercises');
  container.innerHTML = '';
  
  if (exerciseIds.length === 0) {
    container.innerHTML = '<div class="no-selected">Geen oefeningen geselecteerd</div>';
    return;
  }
  
  const ul = document.createElement('ul');
  exerciseIds.forEach(exId => {
    const exercise = getExerciseById(exId);
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${exercise ? exercise.title : `Oefening #${exId}`}</span>
      <button type="button" class="remove-exercise-btn" data-exercise-id="${exId}">✕</button>
    `;
    li.querySelector('.remove-exercise-btn').addEventListener('click', () => {
      // Remove from selected
      const modal = document.getElementById('training-modal');
      const currentIds = JSON.parse(modal.dataset.selectedExercises || '[]');
      modal.dataset.selectedExercises = JSON.stringify(currentIds.filter(id => id !== exId));
      renderSelectedExercises(currentIds.filter(id => id !== exId));
    });
    ul.appendChild(li);
  });
  
  container.appendChild(ul);
}

// Save training
function saveTrainingFromModal() {
  const modal = document.getElementById('training-modal');
  const name = document.getElementById('training-name').value.trim();
  const description = document.getElementById('training-description').value.trim();
  
  if (!name) {
    alert('Voer alstublieft een trainingsnaam in');
    return;
  }
  
  const selectedExercisesStr = modal.dataset.selectedExercises || '[]';
  const selectedExercises = JSON.parse(selectedExercisesStr);
  
  if (selectedExercises.length === 0) {
    alert('Voeg alstublieft minstens één oefening toe aan de training');
    return;
  }
  
  const mode = modal.dataset.mode;
  
  if (mode === 'create') {
    createTraining(name, description, selectedExercises);
  } else {
    const trainingId = parseInt(modal.dataset.trainingId);
    updateTraining(trainingId, name, description, selectedExercises);
  }
  
  closeTrainingModal();
  renderTrainingen();
}

// Close training modal
function closeTrainingModal() {
  document.getElementById('training-modal').style.display = 'none';
  document.getElementById('training-form').reset();
}

// Handle exercise search and selection
function setupExerciseSearch() {
  const searchInput = document.getElementById('exercise-search');
  const resultsContainer = document.getElementById('available-exercises');
  
  searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const modal = document.getElementById('training-modal');
    const selectedIds = JSON.parse(modal.dataset.selectedExercises || '[]');
    
    if (query.length === 0) {
      resultsContainer.innerHTML = '';
      return;
    }
    
    const custom = JSON.parse(localStorage.getItem('customExercises') || '[]');
    const allExercises = [...exercisesData, ...custom];
    
    const results = allExercises.filter(ex => 
      !selectedIds.includes(ex.id) && 
      (ex.title.toLowerCase().includes(query) || ex.description.toLowerCase().includes(query))
    );
    
    resultsContainer.innerHTML = '';
    
    results.forEach(exercise => {
      const div = document.createElement('div');
      div.className = 'exercise-result';
      div.innerHTML = `
        <div class="result-info">
          <div class="result-title">${exercise.title}</div>
          <div class="result-description">${exercise.description.substring(0, 50)}...</div>
        </div>
        <button type="button" class="add-to-training-btn" data-exercise-id="${exercise.id}">+</button>
      `;
      
      div.querySelector('.add-to-training-btn').addEventListener('click', () => {
        const currentIds = JSON.parse(modal.dataset.selectedExercises || '[]');
        if (!currentIds.includes(exercise.id)) {
          currentIds.push(exercise.id);
          modal.dataset.selectedExercises = JSON.stringify(currentIds);
          renderSelectedExercises(currentIds);
          searchInput.value = '';
          resultsContainer.innerHTML = '';
        }
      });
      
      resultsContainer.appendChild(div);
    });
  });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('training-modal');
  const exercisesModal = document.getElementById('training-exercises-modal');
  if (!modal) return; // Only initialize if on trainingen page
  
  renderTrainingen();
  setupExerciseSearch();
  
  const createBtn = document.getElementById('create-training-btn');
  const closeBtn = document.querySelector('.training-modal .close');
  const saveBtn = document.getElementById('save-training-btn');
  
  if (createBtn) createBtn.addEventListener('click', openCreateTrainingModal);
  if (closeBtn) closeBtn.addEventListener('click', closeTrainingModal);
  if (saveBtn) saveBtn.addEventListener('click', saveTrainingFromModal);
  
  // Close modals when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeTrainingModal();
    }
    if (event.target === exercisesModal) {
      closeTrainingExercisesModal();
    }
  });
  
  // Close exercises modal
  if (exercisesModal) {
    const exercisesCloseBtn = exercisesModal.querySelector('.close');
    if (exercisesCloseBtn) {
      exercisesCloseBtn.addEventListener('click', closeTrainingExercisesModal);
    }
  }
  
  // Initialize modal.dataset.selectedExercises
  modal.dataset.selectedExercises = '[]';
});
