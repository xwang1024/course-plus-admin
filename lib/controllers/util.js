'use strict';

module.exports = exports = function(req, res) {
  return {
    render: function(path, title, data, layout) {
      var context = {
        _POINT_: req.app.config.point,
        _TITLE_: title,
        _PATH_: req.path,
        _PARAMS_: req.params,
        _QUERY_: req.query,
        _DATA_: data
      };
      layout && (context.layout = layout);
      req.user && (context._USER_ = req.user.getVO());
      res.render(path, context);
    },
    sendError: function(err) {
      console.log(err);
      res.send({
        success: false,
        error: {
          message: err.message,
          stack: err.stack,
        }
      });
    }
  }
};
