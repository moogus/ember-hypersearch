import Controller from '@ember/controller';
import { set } from '@ember/object';

export default Controller.extend({
  selectedEmployee: null,
  results: null,

  actions: {
    selectResult(result) {
      set(this, 'selectedEmployee', result);
    },

    handleResults(results) {
      set(this, 'results', results);
    }
  }
});
