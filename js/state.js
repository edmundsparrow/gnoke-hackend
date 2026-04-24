const State = (() => {
  let _state = {
    currentPage: 'backend',
    backend: null,
    security: null,
    manifest: null
  };

  return {
    get: (key) => _state[key],
    set: (key, value) => { _state[key] = value; },
    getAll: () => ({ ..._state }),
    reset: () => {
      _state.backend = null;
      _state.security = null;
      _state.manifest = null;
    }
  };
})();
