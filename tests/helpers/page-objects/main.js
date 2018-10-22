import { click, fillIn, find } from '@ember/test-helpers';
import PageObject from './base';

export default class MainPO extends PageObject {
  constructor() {
    super(...arguments);
  }

  async searchForUserByName(id, value) {
    const input = find(`#${id} input`);
    await fillIn(input, value);
    input.blur();
  }

  async selectFirstResult() {
    await click('.hypersearch-result:first-of-type span');
  }

  assertResultLength(id, expectedLength) {
    this.assert.ok(
      find(`#${id} .hypersearch-results li`).children.length >= expectedLength,
      `it displays ${expectedLength} results`
    );
  }

  assertClosureActionResultsLength(expectedLength) {
    this.assert.ok(find(`.inline-results-length:contains("${expectedLength}")`), `it displays ${expectedLength} results from the closure action`);
  }

  assertEmployeeOfTheDay() {
    this.assert.ok(find('#eotd'), 'it displays the selected result');
    this.assert.ok(find('marquee'), 'it displays the selected result');
  }
}
