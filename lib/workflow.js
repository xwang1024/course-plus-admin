'use strict';

exports = module.exports = function(req, res) {
  var workflow = new (require('events').EventEmitter)();

  workflow.outcome = {
    success: false,
    error: {
      message: [],
      for: {}
    }
  };

  workflow.hasErrors = function() {
    return Object.keys(workflow.outcome.error.for).length !== 0 || workflow.outcome.error.message.length !== 0;
  };

  workflow.on('response', function() {
    workflow.outcome.success = !workflow.hasErrors();
    if(workflow.outcome.success) delete workflow.outcome.error;
    res.send(workflow.outcome);
  });

  return workflow;
};