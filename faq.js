// FAQ page: accordion toggle + drag-and-drop reordering.

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('faq-list');
  if (!list) return;

  // --- Accordion expand/collapse ---
  list.querySelectorAll('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const expanded = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', String(!expanded));
      item.classList.toggle('is-open', !expanded);
      answer.style.maxHeight = expanded ? null : answer.scrollHeight + 'px';
    });
  });

  // --- Drag and drop reordering ---
  let draggedItem = null;

  list.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('dragstart', () => {
      draggedItem = item;
      setTimeout(() => item.classList.add('is-dragging'), 0);
    });

    item.addEventListener('dragend', () => {
      draggedItem = null;
      item.classList.remove('is-dragging');
      list.querySelectorAll('.faq-item').forEach((el) => el.classList.remove('drag-over'));
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!draggedItem || draggedItem === item) return;

      const rect = item.getBoundingClientRect();
      const isAfter = e.clientY - rect.top > rect.height / 2;

      list.querySelectorAll('.faq-item').forEach((el) => el.classList.remove('drag-over'));
      item.classList.add('drag-over');

      if (isAfter) {
        item.after(draggedItem);
      } else {
        item.before(draggedItem);
      }
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
    });
  });
});