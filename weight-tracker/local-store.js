// local-store.js
export class LocalStore {
  constructor(storageKey, path = [], rootInstance = null) {
    this.storageKey = storageKey;
    this.path = path;
    this.root = rootInstance || this;
  }

  // Load full YAML data from localStorage
  _load() {
    const yamlStr = localStorage.getItem(this.storageKey);
    return yamlStr ? jsyaml.load(yamlStr) || {} : {};
  }

  // Save full YAML data to localStorage
  _save(data) {
    localStorage.setItem(this.storageKey, jsyaml.dump(data));
  }

  // Navigate into data by this.path
  _getNode(data) {
    return this.path.reduce((obj, key) => obj?.[key], data) || {};
  }

  // Set a value in this node
  set(key, value) {
    const data = this._load();
    let node = this._getNode(data);
    node[key] = value;
    this._save(data);
  }

  // Get a value from this node
  get(key) {
    return this._getNode(this._load())[key];
  }

  // Get a nested ORM object
  child(key) {
    return new LocalStore(this.storageKey, [...this.path, key], this.root);
  }

  // List keys in this node
  keys() {
    return Object.keys(this._getNode(this._load()));
  }

  // Export this subtree as plain nested object
  exportRaw() {
    return structuredClone(this._getNode(this._load()));
  }

  // Replace this subtree with a raw nested object
  importRaw(newData) {
    const data = this._load();
    if (this.path.length === 0) {
      // Root replacement
      Object.keys(data).forEach(k => delete data[k]); // clear root
      Object.assign(data, newData);
    } else {
      let parent = data;
      for (let i = 0; i < this.path.length - 1; i++) {
        parent = parent[this.path[i]] ||= {};
      }
      parent[this.path[this.path.length - 1]] = newData;
    }
    this._save(data);
  }

  // Recursively delete this subtree
  deleteRecursive() {
    const data = this._load();
    if (this.path.length === 0) {
      // Delete entire store
      this._save({});
    } else {
      let parent = data;
      for (let i = 0; i < this.path.length - 1; i++) {
        parent = parent[this.path[i]];
      }
      delete parent[this.path[this.path.length - 1]];
      this._save(data);
    }
  }
}
