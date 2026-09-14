import get from 'lodash/get';
import set from 'lodash/set';
import unset from 'lodash/unset';
import has from 'lodash/has';
import merge from 'lodash/merge';
import Field from './Field';

const escapeRegExp = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const collectPaths = (value, prefix, output) => {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    if (prefix) {
      output.add(prefix);
    }
    return;
  }
  Object.keys(value).forEach(key => {
    const next = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value[key])) {
      value[key].forEach((item, index) => {
        collectPaths(item, `${next}["${index}"]`, output);
      });
      return;
    }
    collectPaths(value[key], next, output);
  });
};

export const createPendingStore = () => {
  let data = {};
  const paths = new Set();
  const forgotten = new Set();
  const declaredSources = new Map();

  const forget = path => {
    if (!path) {
      return;
    }
    unset(data, path);
    paths.delete(path);
    forgotten.add(path);
  };

  return {
    getData() {
      return data;
    },
    setPath(path, value) {
      if (!path) {
        return;
      }
      forgotten.delete(path);
      paths.add(path);
      set(data, path, value);
    },
    hasPath(path) {
      if (!path || forgotten.has(path)) {
        return false;
      }
      return paths.has(path) || has(data, path);
    },
    getPath(path) {
      if (!this.hasPath(path)) {
        return undefined;
      }
      return get(data, path);
    },
    isForgotten(path) {
      return !!path && forgotten.has(path);
    },
    forget,
    forgetByPrefix(prefix) {
      if (!prefix) {
        return;
      }
      [...paths].forEach(path => {
        if (path === prefix || path.startsWith(`${prefix}.`) || path.startsWith(`${prefix}[`)) {
          forget(path);
        }
      });
      forget(prefix);
    },
    shiftAfterGroupRemove(groupName, deletedIndex) {
      if (groupName == null || deletedIndex == null || deletedIndex < 0) {
        return;
      }
      const re = new RegExp(`^${escapeRegExp(groupName)}\\["(\\d+)"\\](.*)$`);
      const buckets = new Map();
      [...paths].forEach(path => {
        const match = path.match(re);
        if (!match) {
          return;
        }
        const idx = Number(match[1]);
        if (!buckets.has(idx)) {
          buckets.set(idx, []);
        }
        buckets.get(idx).push({ path, rest: match[2], value: get(data, path) });
      });
      if (buckets.size === 0) {
        const list = get(data, groupName);
        if (Array.isArray(list) && deletedIndex < list.length) {
          list.splice(deletedIndex, 1);
        }
        return;
      }
      const maxIndex = Math.max(...buckets.keys());
      buckets.forEach(items => {
        items.forEach(({ path }) => {
          paths.delete(path);
          unset(data, path);
        });
      });
      buckets.forEach((items, idx) => {
        if (idx === deletedIndex) {
          items.forEach(({ path }) => forgotten.add(path));
          return;
        }
        const nextIdx = idx > deletedIndex ? idx - 1 : idx;
        items.forEach(({ rest, value }) => {
          const nextPath = `${groupName}["${nextIdx}"]${rest}`;
          paths.add(nextPath);
          set(data, nextPath, value);
          forgotten.delete(nextPath);
        });
      });
      const list = get(data, groupName);
      if (Array.isArray(list) && list.length > maxIndex) {
        list.length = maxIndex;
      }
      this.forgetByPrefix(`${groupName}["${maxIndex}"]`);
    },
    mergeFormData(formData) {
      if (!formData || typeof formData !== 'object') {
        return;
      }
      data = merge({}, data, formData);
      collectPaths(formData, '', paths);
      [...paths].forEach(path => forgotten.delete(path));
    },
    getValueForField(field) {
      const path = field.path || Field.getFieldValuePath(field);
      if (this.isForgotten(path) || !path) {
        return { found: false };
      }
      if (!this.hasPath(path) && !has(data, path)) {
        return { found: false };
      }
      return { found: true, value: get(data, path) };
    },
    clear() {
      data = {};
      paths.clear();
      forgotten.clear();
    },
    registerDeclaredPaths(sourceId, nextPaths) {
      declaredSources.set(sourceId, new Set((nextPaths || []).filter(Boolean)));
    },
    unregisterDeclaredPaths(sourceId) {
      declaredSources.delete(sourceId);
    },
    hasDeclaredSources() {
      return declaredSources.size > 0;
    },
    getDeclaredPaths() {
      const all = new Set();
      declaredSources.forEach(item => {
        item.forEach(path => all.add(path));
      });
      return all;
    },
    getTrackedPaths() {
      return new Set(paths);
    },
    reconcile(mountedPaths) {
      if (declaredSources.size === 0) {
        return;
      }
      const declared = this.getDeclaredPaths();
      const mounted = mountedPaths || new Set();
      [...paths].forEach(path => {
        if (!declared.has(path) && !mounted.has(path)) {
          forget(path);
        }
      });
    }
  };
};

export const collectMountedPaths = formState => {
  const mounted = new Set();
  if (!formState) {
    return mounted;
  }
  Array.from(formState.values()).forEach(field => {
    if (field && field.path) {
      mounted.add(field.path);
    } else if (field) {
      mounted.add(Field.getFieldValuePath(field));
    }
  });
  return mounted;
};

export default createPendingStore;
