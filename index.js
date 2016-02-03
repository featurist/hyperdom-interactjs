var plastiq = require('plastiq');
var interact = require('interact.js');

function dragMoveListener(event) {
  var target = event.target,
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  target.style.webkitTransform =
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

module.exports = {
  draggable: function(options, element) {
    if (!element) { element = options; }
    options = options || {};
    options.onmove = dragMoveListener;
    return plastiq.html.component(
      {
        onadd: function (element) {
          interact(element).draggable(options);
        },
        onupdate: function (element) {
        }
      },
      element
    );
  },

  createSnapGrid: interact.createSnapGrid,

  rotatable: function(element) {
    var angle = 0;

    return plastiq.html.component(
      {
        onadd: function (element) {
          interact(element.parentNode).gesturable({
            onmove: function (event) {
              angle += event.da;

              element.style.webkitTransform =
              element.style.transform =
                'rotate(' + angle + 'deg)';
            }
          });
        },
        onupdate: function (element) {
        }
      },
      element
    );
  }
}
