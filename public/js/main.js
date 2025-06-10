//Toggle button

document.addEventListener('DOMContentLoaded', () => {
  const pinToggleButtons = document.querySelectorAll('.pin-toggle-btn');

  pinToggleButtons.forEach((button) => {
    button.addEventListener('click', async function () {
      const noteId = this.dataset.noteId;
      const card = this.closest('.card');

      try {
        console.log(noteId);
        const response = await fetch(`/api/notetaking/${noteId}/toggle-pin`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            // CSRF protection - if I implement later- comes here (whatever that is, I have to search more about it)
          },
        });

        if (!response.ok) {
          let errorMsg = `Error: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch (e) {}
          console.error('Failed to toggle pin status:', errorMsg);
          alert(`Failed to toggle pin: ${errorMsg}`);
          return;
        }

        const result = await response.json();
        const updatedNote = result.data.note;

        // Update the button appearance and text
        this.textContent = updatedNote.isPinned ? 'Unpin' : 'Pin';
        if (updatedNote.isPinned) {
          this.classList.remove('btn-outline-secondary');
          this.classList.add('btn-info');
        } else {
          this.classList.remove('btn-info');
          this.classList.add('btn-outline-secondary');
        }

        // Update the card's visual style (for the border)
        if (card) {
          if (updatedNote.isPinned) {
            card.classList.add('note-is-pinned');
          } else {
            card.classList.remove('note-is-pinned');
          }
        }

        // Update the "Pinned" badge visibility

        if (card) {
          const pinnedBadge = card.querySelector('.badge.bg-info');
          if (pinnedBadge) {
            pinnedBadge.style.display = updatedNote.isPinned
              ? 'inline-block'
              : 'none';
          } else if (updatedNote.isPinned && card.querySelector('.card-body')) {
          }
        }

        // console.log('Pin status toggled successfully for note:', noteId);
      } catch (err) {
        console.error('Error in pin toggle fetch operation:', err);
        alert('An error occurred while toggling the pin. Please try again.');
      }
    });
  });
});

//To show the delete confirmation box (CSP was blocking it)

const deleteForms = document.querySelectorAll('.delete-form');

deleteForms.forEach((form) => {
  form.addEventListener('submit', function (event) {
    const isConfirmed = confirm('Are you sure you want to delete this note?');

    if (!isConfirmed) {
      event.preventDefault();
    }
  });
});
