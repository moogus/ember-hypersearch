import { click, fillIn, visit, currentURL, find } from '@ember/test-helpers';

export default class PageObject {
  constructor(assert, options) {
    this.assert = assert;
    this.options = options;
  }

  // finders
  findInputByName(name) {
    return find(`input[name="${name}"]`);
  }

  findInputsWithErrors(errorSelector = '.has-error') {
    return find(`input${errorSelector}`);
  }

  // assertions
  assertCurrentUrl(targetUrl = `/${this.options.routeName}`) {
    const currentUrl = currentURL();

    this.assert.equal(currentUrl, targetUrl, 'it redirects to the correct url');
  }

  async assertVisitUrl(targetUrl = `/${this.options.routeName}`) {
    await visit(targetUrl);

    return await this.assertCurrentUrl(targetUrl);
  }

  // interactions
  async fillInByName(name, value) {
    const input = this.findInputByName(name);

    await fillIn(input, value);
    input.blur();
  }

  /**
   * Embiggens the testing container for easier inspection.
   *
   * @public
   * @method embiggen
   * @param {String} testContainerId
   * @return {this}
   */
  embiggen(testContainerId = 'ember-testing-container') {
    $(`#${testContainerId}`).css({ width: '100vw', height: '100vh' })
  }

  /**
   * Throws a breakpoint via debugger within a PageObject chain.
   *
   * ```js
   *  test('foo', function(assert) {
   *    new SomePage(assert)
   *      .login()
   *      .debug()
   *      .doStuff();
   *  });
   * ```
   *
   * @public
   * @method debug
   * @param {Void}
   * @return {this}
   */
  debug() {
    // jshint ignore:start
    const poInstance = this; // deopt Babel so `this` is accessible
    return this.then((applicationInstance) => {
      console.info('Access the PageObject with `poInstance`, and the application instance with `applicationInstance`.');

      eval();
    });
    // jshint ignore:end
  }
}
