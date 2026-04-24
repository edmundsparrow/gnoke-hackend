'use strict';

const UI = (() => {
  function toast(msg, type) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show' + (type ? ' toast--' + type : '');
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.className = 'toast'; }, 3000);
  }

  function showLoading(msg) {
    const el = document.getElementById('loading-overlay');
    if (!el) return;
    const txt = el.querySelector('.loading-text');
    if (txt) txt.textContent = msg || 'Loading…';
    el.classList.remove('hidden');
  }

  function hideLoading() {
    const el = document.getElementById('loading-overlay');
    if (el) el.classList.add('hidden');
  }

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
  }

  function closeModal(id) {
    if (id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('open');
    } else {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  }

  function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.page === pageId);
    });
    State.set('currentPage', pageId);
  }

  return { toast, showLoading, hideLoading, openModal, closeModal, navigateTo };
})();
