document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('create-exercise-form');
  const messageEl = document.getElementById('form-message');

  // Visual editor state
  // Fixed palette: edit these paths to add/remove images integrated in the website
  const FIXED_PALETTE = [
    // Files from images/readme/ — pas aan naar eigen bestanden
    'images/readme/korfbalpaal.png',
    'images/readme/andersomkorfbalpaal.png',
    'images/readme/avatar.png',
    'images/readme/avatar2.png',
    'images/readme/dopje.png',
    'images/readme/pion.png',
    'images/readme/laddertje.png',
    'images/readme/korfbal.png',
  ];
  const PALETTE_SLOTS = FIXED_PALETTE.length;
  const palette = FIXED_PALETTE.slice();
  let placed = JSON.parse(localStorage.getItem('visualPlaced') || '[]');
  let dragState = null; // {type: 'palette'|'placed', index, ghostEl, offsetX, offsetY} 

  try {
    initVisualEditor();
    console.log('Visual editor initialized');
  } catch (err) {
    console.error('Visual editor failed to initialize:', err);
    messageEl.textContent = 'Visual editor laden mislukt; je kunt nog steeds een oefening toevoegen zonder visual.';
    messageEl.style.color = '#b00020';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addExercise();
  });

  // Also attach click handler to submit button as a fallback
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addExercise();
    });
  }

  // Initialize the visual editor UI
  function initVisualEditor() {
    const grid = document.getElementById('palette-grid');
    grid.innerHTML = '';

    for (let i = 0; i < PALETTE_SLOTS; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.index = i;

      const placeholder = document.createElement('div');
      placeholder.className = 'placeholder';
      placeholder.textContent = '+';
      slot.appendChild(placeholder);

      // show fixed image if available
      if (palette[i]) {
        const img = document.createElement('img');
        img.src = palette[i];
        slot.appendChild(img);
        placeholder.style.display = 'none';

        // pointerdown for drag from palette
        img.addEventListener('pointerdown', (ev) => startPaletteDrag(ev, i));
        img.style.touchAction = 'none';
      } else {
        // no image configured for this slot
        slot.classList.add('empty-slot');
      }

      // clicking slot will allow placing the image if present
      slot.addEventListener('click', (ev) => {
        if (palette[i]) {
          // place centered
          placeFromPalette(i, 50, 50);
        }
      });

      grid.appendChild(slot);
    }

    // Re-render placed items
    renderPlacedItems();

    const playfield = document.getElementById('playfield');
    playfield.addEventListener('click', (ev) => {
      // if user had selected a palette item for click-placement, handled by slot click
    });

    const clearBtn = document.getElementById('clear-palette');
    if (clearBtn) {
      clearBtn.disabled = true;
      clearBtn.title = 'Palette is vast; wijzig afbeeldingen in maak-oefening.js';
      clearBtn.textContent = 'Leegmaken (niet beschikbaar)';
    }

    document.getElementById('reset-playfield').addEventListener('click', () => {
      if (confirm('Reset speelveld (verwijdert geplaatste items)?')) {
        placed = [];
        localStorage.removeItem('visualPlaced');
        renderPlacedItems();
      }
    });

    // Pointer move/up for drag ghost
    document.addEventListener('pointermove', (ev) => {
      if (!dragState) return;
      ev.preventDefault();
      const g = dragState.ghostEl;
      g.style.left = `${ev.pageX - dragState.offsetX}px`;
      g.style.top = `${ev.pageY - dragState.offsetY}px`;
    });

    document.addEventListener('pointerup', (ev) => {
      if (!dragState) return;
      const playfield = document.getElementById('playfield');
      const rect = playfield.getBoundingClientRect();
      const x = ev.clientX;
      const y = ev.clientY;
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        // place item
        const relX = ((x - rect.left) / rect.width) * 100; // percent
        const relY = ((y - rect.top) / rect.height) * 100;
        placeFromPalette(dragState.index, relX, relY);
      }

      // cleanup
      if (dragState.ghostEl && dragState.ghostEl.parentNode) dragState.ghostEl.parentNode.removeChild(dragState.ghostEl);
      dragState = null;
    });
  }

  // file upload removed — palette is fixed via FIXED_PALETTE

  // start dragging a palette image
  function startPaletteDrag(ev, index) {
    ev.preventDefault();
    const imgSrc = palette[index];
    if (!imgSrc) return;
    const ghost = document.createElement('img');
    ghost.src = imgSrc;
    ghost.style.position = 'absolute';
    ghost.style.width = '80px';
    ghost.style.zIndex = 9999;

    document.body.appendChild(ghost);

    dragState = { type: 'palette', index, ghostEl: ghost, offsetX: ev.offsetX, offsetY: ev.offsetY };
    ghost.style.left = `${ev.pageX - dragState.offsetX}px`;
    ghost.style.top = `${ev.pageY - dragState.offsetY}px`;
  }

  // place image from palette into playfield at given percent coords
  function placeFromPalette(index, xPct, yPct) {
    const id = Date.now() + '-' + Math.floor(Math.random() * 9999);
    const playfield = document.getElementById('playfield');
    const pfRect = playfield.getBoundingClientRect();

    const item = {
      id,
      imageIndex: index,
      x: xPct, // percent
      y: yPct,
      w: 10 // width as percent of playfield width
    };

    placed.push(item);
    localStorage.setItem('visualPlaced', JSON.stringify(placed));
    renderPlacedItems();
  }

  // render placed items inside playfield
  function renderPlacedItems() {
    const playfield = document.getElementById('playfield');
    playfield.innerHTML = '';

    placed.forEach((p) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'placed-item';
      wrapper.dataset.id = p.id;
      wrapper.style.left = `calc(${p.x}% - ${p.w / 2}%)`;
      wrapper.style.top = `calc(${p.y}% - ${p.w / 2}%)`;
      wrapper.style.width = `${p.w}%`;

      const img = document.createElement('img');
      img.src = palette[p.imageIndex] || '';
      img.alt = '';

      wrapper.appendChild(img);

      // resize handle (drag to resize)
      const handle = document.createElement('div');
      handle.className = 'resize-handle';
      handle.title = 'Sleep om te vergroten/verkleinen (of gebruik scroll)';
      wrapper.appendChild(handle);

      // allow dragging placed items and resizing
      let moving = false;
      let resizing = false;
      let startX = 0, startY = 0, startLeft = 0, startTop = 0, startW = 0;

      // Use document-level pointer handlers for robust dragging/resizing
      wrapper.addEventListener('pointerdown', (ev) => {
        // clicks on handle are handled by handle listener
        if (ev.target === handle) return;
        ev.stopPropagation();
        moving = true;
        startX = ev.clientX;
        startY = ev.clientY;
        startLeft = p.x;
        startTop = p.y;
        wrapper.style.cursor = 'grabbing';

        const onDocMove = (mv) => {
          if (!moving) return;
          const pf = document.getElementById('playfield');
          const rect = pf.getBoundingClientRect();
          const dx = mv.clientX - startX;
          const dy = mv.clientY - startY;
          const deltaXPct = (dx / rect.width) * 100;
          const deltaYPct = (dy / rect.height) * 100;
          p.x = Math.min(100, Math.max(0, startLeft + deltaXPct));
          p.y = Math.min(100, Math.max(0, startTop + deltaYPct));
          wrapper.style.left = `calc(${p.x}% - ${p.w / 2}%)`;
          wrapper.style.top = `calc(${p.y}% - ${p.w / 2}%)`;
        };

        const onDocUp = (up) => {
          if (moving) {
            moving = false;
            wrapper.style.cursor = 'grab';
            document.removeEventListener('pointermove', onDocMove);
            document.removeEventListener('pointerup', onDocUp);
            localStorage.setItem('visualPlaced', JSON.stringify(placed));
          }
        };

        document.addEventListener('pointermove', onDocMove);
        document.addEventListener('pointerup', onDocUp);
      });

      handle.addEventListener('pointerdown', (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        resizing = true;
        startX = ev.clientX;
        startW = p.w;
        wrapper.classList.add('resizing');

        const onDocMove = (mv) => {
          if (!resizing) return;
          const pf = document.getElementById('playfield');
          const rect = pf.getBoundingClientRect();
          const dx = mv.clientX - startX;
          const deltaPct = (dx / rect.width) * 100;
          const newW = Math.min(80, Math.max(2, startW + deltaPct));
          p.w = newW;
          wrapper.style.width = `${p.w}%`;
          wrapper.style.left = `calc(${p.x}% - ${p.w / 2}%)`;
          wrapper.style.top = `calc(${p.y}% - ${p.w / 2}%)`;
        };

        const onDocUp = () => {
          if (resizing) {
            resizing = false;
            wrapper.classList.remove('resizing');
            document.removeEventListener('pointermove', onDocMove);
            document.removeEventListener('pointerup', onDocUp);
            localStorage.setItem('visualPlaced', JSON.stringify(placed));
          }
        };

        document.addEventListener('pointermove', onDocMove);
        document.addEventListener('pointerup', onDocUp);
      });

      // pointercancel for touch or interruptions
      wrapper.addEventListener('pointercancel', (ev) => {
        moving = false;
        resizing = false;
        wrapper.style.cursor = 'grab';
        wrapper.classList.remove('resizing');
      });

      // wheel to fine-tune size
      wrapper.addEventListener('wheel', (ev) => {
        ev.preventDefault();
        const step = ev.shiftKey ? 10 : 2;
        p.w = Math.min(80, Math.max(2, p.w + (ev.deltaY < 0 ? step : -step)));
        wrapper.style.width = `${p.w}%`;
        wrapper.style.left = `calc(${p.x}% - ${p.w / 2}%)`;
        wrapper.style.top = `calc(${p.y}% - ${p.w / 2}%)`;
        localStorage.setItem('visualPlaced', JSON.stringify(placed));
      }, { passive: false });

      // double click to remove
      wrapper.addEventListener('dblclick', (ev) => {
        ev.stopPropagation();
        if (confirm('Verwijder dit geplaatste item?')) {
          placed = placed.filter(pp => pp.id !== p.id);
          localStorage.setItem('visualPlaced', JSON.stringify(placed));
          renderPlacedItems();
        }
      });

      playfield.appendChild(wrapper);
    });
  }

  // Main submit - includes visual data
  async function addExercise() {
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!title || !author || !description) {
      showMessage('Vul alstublieft alle velden in.', true);
      return;
    }

    showMessage('Versturen…', false);
    console.log('Submitting exercise', { title, author, description, paletteCount: palette.length, placedCount: placed.length });

    const visual = { palette, placed };

    // Try to post to server first
    try {
      const resp = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, author, visual })
      });

      if (!resp.ok) throw new Error('Server error');

      const created = await resp.json();

      // Update localStorage mirror
      const custom = JSON.parse(localStorage.getItem('customExercises') || '[]');
      custom.push(created);
      localStorage.setItem('customExercises', JSON.stringify(custom));

      const exercisesMap = JSON.parse(localStorage.getItem('exercises') || '{}');
      exercisesMap[created.id] = { favorite: false, saved: false, comments: [] };
      localStorage.setItem('exercises', JSON.stringify(exercisesMap));

      // clear draft visual (placed items only — palette is fixed)
      localStorage.removeItem('visualPlaced');

      showMessage('Oefening succesvol toegevoegd! Je wordt doorgestuurd naar de oefeningenpagina...', false);
      setTimeout(() => { window.location.href = 'exercises.html'; }, 1000);
      return;
    } catch (err) {
      console.log('Server not reachable, falling back to localStorage:', err.message);
      // Fallback to localStorage (offline)
      const custom = JSON.parse(localStorage.getItem('customExercises') || '[]');

      // Determine new unique id by checking existing exercises storage
      const exercisesMap = JSON.parse(localStorage.getItem('exercises') || '{}');
      let maxId = 0;
      Object.keys(exercisesMap).forEach(k => {
        const id = parseInt(k);
        if (!isNaN(id) && id > maxId) maxId = id;
      });

      const newId = maxId + 1;

      const newExercise = {
        id: newId,
        title,
        description,
        author,
        comments: [],
        visual
      };

      custom.push(newExercise);
      localStorage.setItem('customExercises', JSON.stringify(custom));

      // Ensure user data entry exists for the new exercise
      exercisesMap[newId] = { favorite: false, saved: false, comments: [] };
      localStorage.setItem('exercises', JSON.stringify(exercisesMap));

      // clear draft visual (placed items only — palette is fixed)
      localStorage.removeItem('visualPlaced');

      showMessage('Oefening lokaal toegevoegd (server niet bereikbaar). Je wordt doorgestuurd...', false);
      setTimeout(() => { window.location.href = 'exercises.html'; }, 1200);
    }
  }

  function showMessage(msg, isError = false) {
    messageEl.textContent = msg;
    messageEl.style.color = isError ? '#b00020' : '#0a8a00';
  }
});
