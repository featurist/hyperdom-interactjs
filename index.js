var hyperdom = require('hyperdom');
var interact = require('interact.js');

var translateReg = /translate\((-?[\d\.]+)px,\s*(-?[\d\.]+)px\)/i;
var rotateReg = /rotate\((-?[\d\.]+)deg\)/i;
var scaleReg = /scale\((-?[\d\.]+)\)/i;

function hyperdomInteractJs(options, vnode) {
  var binding = hyperdom.html.binding(options.binding);
  var transform = binding.get();
  return hyperdom.html.component(
    {
      onadd: function (element) {
        if (transform) {
          element.style.transform = writeTransform(transform);
        }
        if (options.draggable) {
          var opts = (options.draggable === true) ?
            {} : options.draggable || {};
          opts.onmove = hyperdom.html.refreshify(makeDragMoveListener(binding));
          var draggable = interact(element).draggable(opts);
          if (options.withDraggable) {
            options.withDraggable(draggable);
          }
        }
        if (options.resizable) {
          var opts = (options.resizable === true) ?
            {} : options.resizable || {};
          opts.onmove = hyperdom.html.refreshify(makeResizeListener(binding));
          var resizable = interact(element).resizable(opts);
          if (options.withResizable) {
            options.withResizable(resizable);
          }
        }
        if (options.rotatable || options.scalable) {
          var gesturable = interact(element).gesturable({
            onmove: hyperdom.html.refreshify(makeGestureMoveListener(options, binding))
          });
          if (options.withGesturable) {
            options.withGesturable(gesturable);
          }
        }
      },
      onupdate: function (element) {
      }
    },
    vnode
  );
}
module.exports = hyperdomInteractJs;

hyperdomInteractJs.dropzone = function(options, vnode) {
  return hyperdom.html.component({
    onadd: function(element) {
      interact(element).dropzone(options);
    }
  }, vnode);
}

hyperdomInteractJs.createSnapGrid = interact.createSnapGrid;

function writeTransform(t) {
  return "translate(" + t.x + "px," + t.y + "px) scale(" + t.scale + ") rotate(" + t.rotation + "deg)";
}

function makeDragMoveListener(binding) {
  return function(event) {
    dragMoveListener(event, binding);
  }
}

function dragMoveListener(event, binding) {
  var target = event.target;
  var x, y;
  var transform = target.style.transform || target.style.webkitTransform;
  var existing = transform.match(translateReg);
  if (existing) {
    x = Number(existing[1]);
    y = Number(existing[2]);
  } else {
    x = y = 0;
  }
  x += event.dx;
  y += event.dy;
  var newTranslate = 'translate(' + x + 'px, ' + y + 'px)';
  if (existing) {
    target.style.webkitTransform = target.style.transform = transform.replace(translateReg, newTranslate);
  } else {
    target.style.webkitTransform = target.style.transform = transform + ' ' + newTranslate;
  }

  if (binding) {
    var transform = binding.get() || {};
    transform.x = x;
    transform.y = y;
    binding.set(transform);
  }
}

function makeResizeListener(binding) {
  return function(event) {
    resizeListener(event, binding);
  }
}

function resizeListener(event, binding) {
  var target = event.target;
  var x = (parseFloat(target.getAttribute('data-x')) || 0);
  var y = (parseFloat(target.getAttribute('data-y')) || 0);

  // update the element's style
  target.style.width  = event.rect.width + 'px';
  target.style.height = event.rect.height + 'px';

  // translate when resizing from top or left edges
  x += event.deltaRect.left;
  y += event.deltaRect.top;

  target.style.webkitTransform = target.style.transform =
      'translate(' + x + 'px,' + y + 'px)';

  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
  target.textContent = Math.round(event.rect.width) + '×' + Math.round(event.rect.height);
}

function makeGestureMoveListener(options, binding) {
  return function(event) {
    if (options.rotatable) {
      rotateMoveListener(event, binding);
    }
    if (options.scalable) {
      scaleMoveListener(event, binding);
    }
  }
}

function rotateMoveListener(event, binding, refresh) {
  var target = event.target;
  var rotation;
  var transform = target.style.transform || target.style.webkitTransform;
  var existing = transform.match(rotateReg);
  if (existing) {
    rotation = Number(existing[1]);
  } else {
    rotation = 0;
  }
  rotation += event.da;
  var newTranslate = 'rotate(' + rotation + 'deg)';
  if (existing) {
    target.style.webkitTransform = target.style.transform = transform.replace(rotateReg, newTranslate);
  } else {
    target.style.webkitTransform = target.style.transform = transform + ' ' + newTranslate;
  }

  if (binding) {
    var transform = binding.get() || {};
    transform.rotation = rotation;
  }
}

function scaleMoveListener(event, binding, refresh) {
  var target = event.target;
  var scale;
  var transform = target.style.transform || target.style.webkitTransform;
  var existing = transform.match(scaleReg);
  if (existing) {
    scale = Number(existing[1]);
  } else {
    scale = 1;
  }
  scale += event.ds;
  var newTranslate = 'scale(' + scale + ')';
  if (existing) {
    target.style.webkitTransform = target.style.transform = transform.replace(scaleReg, newTranslate);
  } else {
    target.style.webkitTransform = target.style.transform = transform + ' ' + newTranslate;
  }

  if (binding) {
    var transform = binding.get() || {};
    transform.scale = scale;
  }
}
