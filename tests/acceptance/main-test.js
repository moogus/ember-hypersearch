import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupPretender from '../helpers/setup-pretender';
import MainPO from '../../tests/helpers/page-objects/main';

module('Acceptance | main', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    this.server = setupPretender();
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it renders results', async function(assert) {
    const page = new MainPO(assert, { routeName: '/' });
    await page.assertVisitUrl();
    await page.searchForUserByName('component-block', 'a');
    await page.assertResultLength('component-block', 1);
  });

  test('it handles selecting results', async function(assert) {
    const page = new MainPO(assert, { routeName: '/' });
    await page.assertVisitUrl();
    await page.searchForUserByName('component-block', 'a');
    await page.selectFirstResult();
    await page.assertEmployeeOfTheDay();
  });

  test(
    'it does not search if the query is shorter than the `minQueryLength`',
    async function(assert) {
    const page = new MainPO(assert, { routeName: '/' });
    await page.assertVisitUrl();
    await page.searchForUserByName('component-inline', 'a');
    await page.assertResultLength('component-inline', 0);
  });

  test('it accepts a `resultKey`', async function(assert) {
    const page = new MainPO(assert, { routeName: '/' });
    await page.assertVisitUrl();
    await page.searchForUserByName('component-inline', 'Miss Adan Gorczany');
    await page.assertResultLength('component-inline', 1);
  });

  test('it handles results', async function(assert) {
    const page = new MainPO(assert, { routeName: '/' });
    await page.assertVisitUrl();
    await page.searchForUserByName('component-inline', 'Miss Adan Gorczany');
    await page.assertClosureActionResultsLength('component-inline', 1);
  });
});
