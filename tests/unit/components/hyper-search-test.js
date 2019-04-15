import { resolve, Promise, all } from 'rsvp';
import { get } from '@ember/object';
import { run, later } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

let sandbox;
const stubResolve = x => resolve(x);

module('Unit | Component | hyper search', function(hooks) {
  setupTest(hooks);

  test('#requestAndCache caches queries and their results', function (assert) {
    const component = this.owner.factoryFor('component:hyper-search').create({ endpoint: '/' });
    // no need to actually do an ajax request
    component.request = sinon.spy(stubResolve);

    return component.requestAndCache('foo')
      .then((results) => {
        assert.ok(component.request.calledWith(results), 'spy is called with expected param');
        assert.equal(results, 'foo', 'should return results');
        assert.equal(get(component, '_cache.foo'), 'foo', 'should return and cache results');
      });
    component.request.restore();
  });

  test('#requestAndCache caches queries with periods', function(assert) {
    const component = this.owner.factoryFor('component:hyper-search').create({ endpoint: '/' });
    // no need to actually do an ajax request
    component.request = sinon.spy(stubResolve);

    return component.requestAndCache('pizza@party.com')
      .then((results) => {
        assert.ok(component.request.calledWith(results), 'spy is called with expected param');
        assert.equal(results, 'pizza@party.com', 'should return results');
        assert.equal(get(component, '_cache.pizza@party-com'), 'pizza@party.com', 'should return and cache results');
      });
    component.request.restore();
  });

  test('#requestAndCache caches queries with more than one period', function(assert) {
    const component = this.owner.factoryFor('component:hyper-search').create({ endpoint: '/' });
    // no need to actually do an ajax request
    component.request = sinon.spy(stubResolve);

    return component.requestAndCache('lots.of.periods')
      .then((results) => {
        assert.ok(component.request.calledWith(results), 'spy is called with expected param');
        assert.equal(results, 'lots.of.periods', 'should return results');
        assert.equal(get(component, '_cache.lots-of-periods'), 'lots.of.periods', 'should return and cache results');
      });
    component.request.restore();
  });

  test('#removeFromCache removes a result from the cache', function(assert) {
    const expectedResult = { poo: '💩' };
    const component = this.owner.factoryFor('component:hyper-search').create({ endpoint: '/' });

    run(() => {
      component.set('_cache', {
        foo: 'foo',
        poo: '💩'
      });
      component.removeFromCache('foo');
      assert.deepEqual(get(component, '_cache'), expectedResult, 'should remove the cached result');
    });
  });

  test('#removeFromCache removes a result with period from cache', function(assert) {
    const expectedResult = { poo: '💩' };
    const component = this.owner.factoryFor('component:hyper-search').create({ endpoint: '/' });

    run(() => {
      component.set('_cache', {
        'foo-zle': 'foo',
        poo: '💩'
      });
      component.removeFromCache('foo.zle');
      assert.deepEqual(get(component, '_cache'), expectedResult, 'should remove the cached result');
    });
  });

  test('#removeFromCache removes a result with multiple periods from cache', function(assert) {
    const expectedResult = { poo: '💩' };
    const component = this.owner.factoryFor('component:hyper-search').create({ endpoint: '/' });

    run(() => {
      component.set('_cache', {
        'lots-of-periods': 'foo',
        poo: '💩'
      });
      component.removeFromCache('lots-of-periods');
      assert.deepEqual(get(component, '_cache'), expectedResult, 'should remove the cached result');
    });
  });
  test('#removeAllFromCache removes all results from the cache', function(assert) {
    const expectedResult = {};
    const component = this.owner.factoryFor('component:hyper-search').create({
      endpoint: '/',
      _cache: {
        foo: 'foo',
        poo: '💩'
      }
    });

    component.removeAllFromCache();
    assert.deepEqual(get(component, '_cache'), expectedResult, 'should remove all cached results');
  });

  test('#actions#search debounces the search', function(assert) {
    const done = assert.async();
    const expectedResult = { foo: 'foo', poo: 'poo' };
    const component = this.owner.factoryFor('component:hyper-search').create({
      endpoint: '/',
      debounceRate: 5
    });
    component.request = sinon.spy(stubResolve);

    component.send('search', null, 'foo'); // first call is not debounced
    assert.deepEqual(
      get(component, '_cache'),
      { foo: 'foo' },
      'should return result immediately on first query'
    );

    const actionOne = (resolve) => later(this, () => {
        component.send('search', null, 'poo');
        resolve();
      }, get(component, 'debounceRate') + 1);

    const actionTwo = (resolve) => later(this, () => resolve(), get(component, 'debounceRate') + 2);

    all([new Promise((r) => actionOne(r)), new Promise((r) => actionTwo(r))])
      .then(() => {
        assert.deepEqual(get(component, '_cache'), expectedResult, 'should debounce');
        assert.ok(component.request.called, 'spy is called with expected param');
        component._cache = {};
        done();
      });
  });

  test('#actions#search when sendOnIdle set to true', function (assert) {
    const done = assert.async();
    const component = this.owner.factoryFor('component:hyper-search').create({
      endpoint: '/',
      debounceRate: 5,
      idleEnabled: true,
      idleTime: 100
    });
    component.request = sinon.spy(stubResolve);

    assert.notOk(get(component, '_cache.foo'), 'should not have cached foo yet');

    component.get('actions.search').call(component, {
      target: {
        value: 'foo'
      }
    }).then((val) => {
      assert.equal(get(component, '_cache.foo'), 'foo', 'should have cached value for foo now');
      assert.ok(component.request.called, 'spy is called with expected param');
      done();
    });

  });

});
