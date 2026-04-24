const Theme = (() => {
  const KEY = 'gnoke_hackend_theme';

  function apply(mode) {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    localStorage.setItem(KEY, mode);
  }

  function toggle() {
    const isDark = document.documentElement.classList.contains('dark');
    apply(isDark ? 'light' : 'dark');
  }

  function current() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  return { toggle, apply, current };
})();
