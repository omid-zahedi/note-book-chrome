document.addEventListener('DOMContentLoaded', () => {
    const noteInput = document.getElementById('note-input');
    const addNoteButton = document.getElementById('add-note');
    const noteList = document.getElementById('note-list');
    const modal = document.getElementById('modal');
    const modalTextarea = document.getElementById('modal-textarea');
    const saveNoteButton = document.getElementById('save-note');
    const copyTextButton = document.getElementById('copy-text');
    const backButton = document.getElementById('back-button');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    let editingNote = null;
  
    chrome.storage.sync.get(['notes'], (result) => {
      const notes = result.notes || [];
      notes.reverse().forEach((note) => addNoteToDOM(note));
    });
  
    addNoteButton.addEventListener('click', () => {
      const noteText = noteInput.value.trim();
      if (noteText) {
        const note = { id: Date.now(), text: noteText };
        addNoteToDOM(note);
        saveNoteToStorage(note);
        noteInput.value = '';
      }
    });
  
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.toLowerCase();
      filterNotes(query);
    });
  
    function filterNotes(query) {
      chrome.storage.sync.get(['notes'], (result) => {
        const notes = result.notes || [];
        const filteredNotes = notes.filter(note => note.text.toLowerCase().includes(query));
        
        noteList.innerHTML = '';
        filteredNotes.forEach(note => addNoteToDOM(note));
      });
    }
  
    function saveNoteToStorage(note) {
      chrome.storage.sync.get(['notes'], (result) => {
        const notes = result.notes || [];
        notes.unshift(note);
        chrome.storage.sync.set({ notes });
      });
    }
  
    function updateNoteInStorage(updatedNote) {
      chrome.storage.sync.get(['notes'], (result) => {
        const notes = result.notes.map((note) =>
          note.id === updatedNote.id ? updatedNote : note
        );
        chrome.storage.sync.set({ notes });
      });
    }
  
    function deleteNoteFromStorage(noteId) {
      chrome.storage.sync.get(['notes'], (result) => {
        const notes = result.notes.filter((note) => note.id !== noteId);
        chrome.storage.sync.set({ notes });
      });
    }
  
    function addNoteToDOM(note) {
      const li = document.createElement('li');
      li.dataset.id = note.id;
  
      const textPreview = document.createElement('span');
      textPreview.textContent = note.text.length > 15 ? note.text.substring(0, 15) + '...' : note.text;
      textPreview.classList.add('note-preview');
  
      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('note-buttons');
  
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.classList.add('edit-note');
      editButton.addEventListener('click', () => editNoteInModal(note));
  
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('delete-note');
      deleteButton.addEventListener('click', () => {
        li.remove();
        deleteNoteFromStorage(note.id);
      });
  
      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(deleteButton);
  
      li.appendChild(textPreview);
      li.appendChild(buttonContainer);
      noteList.insertBefore(li, noteList.firstChild);
    }
  
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        alert("Text copied to clipboard!");
      }).catch(err => {
        console.error("Failed to copy text: ", err);
      });
    }
  
    function editNoteInModal(note) {
      modalTextarea.value = note.text;
      editingNote = note;
      showModal();
    }
  
    saveNoteButton.addEventListener('click', () => {
      if (editingNote) {
        editingNote.text = modalTextarea.value;
        updateNoteInStorage(editingNote);
        refreshNoteList();
        closeModal();
      }
    });
  
    copyTextButton.addEventListener('click', () => {
      if (editingNote) {
        copyToClipboard(editingNote.text);
      }
    });
  
    function refreshNoteList() {
      noteList.innerHTML = '';
      chrome.storage.sync.get(['notes'], (result) => {
        const notes = result.notes || [];
        notes.reverse().forEach((note) => addNoteToDOM(note));
      });
    }
  
    function showModal() {
      modal.style.display = 'flex';
    }
  
    function closeModal() {
      modal.style.display = 'none';
      editingNote = null;
    }
  
    backButton.addEventListener('click', closeModal);
  
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  });
  