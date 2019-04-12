import Component from '@ember/component';
import { A as emberArray } from '@ember/array';
import { reject, resolve, Promise } from 'rsvp';
import { bind, debounce } from '@ember/runloop';
import { set, get } from '@ember/object';
import { typeOf, isPresent, isBlank } from '@ember/utils';
import { inject } from '@ember/service';
import layout from '../templates/components/hyper-search';
/* eslint-disable */

/**
 * Returns the key for the query in the cache. Only works in conjunction with
 * Ember.get.
 *
 *
 * @public
 * @param {String} query
 * @return {String} nested key name
 */
function keyForQuery(query) {
  return `_cache.${safeKeyString(query)}`;
}

/**
 * Ensure string does not contain characters that will cause Ember.get to break
 *
 * IE: Replaces periods (.) with dashes (-)
 *
 * @public
 * @param {String} query
 * @return {String} safe key name
*/
function safeKeyString(query) {
  return query.replace(/\./g, '-');
}

export default Component.extend({
  layout,
  minQueryLength: 3,
  debounceRate: 0,
  endpoint: null,
  resultKey: null,
  placeholder: null,
  ajax: inject(),
  idleEnabled: false,
  idleTime: 300,

  init() {
    this._super(...arguments);
    this._cache = {};
    this.results = emberArray();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.removeAllFromCache();
  },

  cache(query, results) {
    set(this, keyForQuery(query), results);
    this._handleAction('loadingHandler', false);
    return resolve(results);
  },

  getCacheForQuery(query) {
    return get(this, keyForQuery(query));
  },

  removeFromCache(query) {
    delete this._cache[safeKeyString(query)];
    this.notifyPropertyChange('_cache');
  },

  removeAllFromCache() {
    delete this._cache;
    set(this, '_cache', {});
  },

  clearResults() {
    get(this, 'results').clear();
    this.notifyPropertyChange('results');
  },

  fetch(query) {
    if (isBlank(query) || (query.length < get(this, 'minQueryLength'))) {
      return reject();
    }
    let cachedValue = this.getCacheForQuery(query);
    this._handleAction('loadingHandler', true);

    if (isPresent(cachedValue)) {
      this._handleAction('loadingHandler', false);
      return resolve(cachedValue);
    } else {
      return this.requestAndCache(...arguments);
    }
  },

  /**
   * Override to handle the fetching of data. Must return a `Promise`.
   *
   * @public
   * @method request
   * @param {String} query
   * @return {Promise}
   */
  request(query) {
    return new Promise((resolve, reject) => {
      const ajax = this.get('ajax');
      ajax.request(get(this, 'endpoint'), {
        dataType: 'json',
        method: 'GET',
        data: { q: query }
      })
      .then(resolve, reject);
    });
  },

  requestAndCache(query) {
    return this.request(query)
      .then((results) => this.cache(query, results))
      .catch((error) => reject(error));
  },

  sendOnIdle(val) {
    this.set('latestVal', val);
    Ember.run.later(() => {
        if(val === this.get('latestVal')) {
            this.get('_search').call(this, val);
        }
    }, this.get('idleTime'));
  },

  _search(value = this.$('input').val()) {
    return this.fetch(value)
      .then(bind(this, this._setResults));
  },

  _setResults(results) {
    this._handleAction('handleResults', results);

    return set(this, 'results', results);
  },

  _handleAction(actionName, ...args) {
    if (this.attrs && typeOf(this.attrs[actionName]) === 'function') {
      this.attrs[actionName](...args);
    } else {
      this.sendAction(actionName, ...args);
    }
  },

  actions: {
    search(_event, query) {
      if(get(this, 'idleEnabled')) {
        this.get('sendOnIdle').call(this, _event.target.value.trim());
      } else {
        debounce(this, '_search', query, get(this, 'debounceRate'), true);
      }
    },

    selectResult(result) {
      this._handleAction('selectResult', result);
    }
  }
});
