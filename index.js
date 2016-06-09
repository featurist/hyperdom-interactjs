var plastiq = require('plastiq');
var interact = require('interact.js');

var translateReg = /translate\((-?[\d\.]+)px,\s*(-?[\d\.]+)px\)/i;
var rotateReg = /rotate\((-?[\d\.]+)deg\)/i;
var scaleReg = /scale\((-?[\d\.]+)\)/i;

function plastiqInteractJs(options, vnode) {
  var binding = plastiq.html.binding(options.binding);
  var transform = binding.get();
  return plastiq.html.component(
    {
      onadd: function (element) {
        if (transform) {
          element.style.transform = writeTransform(transform);
        }
        if (options.draggable) {
          var opts = (options.draggable === true) ?
            {} : options.draggable || {};
          opts.onmove = plastiq.html.refreshify(makeDragMoveListener(binding));
          interact(element).draggable(opts);
        }
        if (options.rotatable || options.scalable) {
          interact(element).gesturable({
            onmove: plastiq.html.refreshify(makeGestureMoveListener(options, binding))
          });
        }
      },
      onupdate: function (element) {
      }
    },
    vnode
  );
}
module.exports = plastiqInteractJs;

plastiqInteractJs.dropzone = function(options, vnode) {
  return plastiq.html.component({
    onadd: function(element) {
      interact(element).dropzone(options);
    }
  }, vnode);
}

plastiqInteractJs.createSnapGrid = interact.createSnapGrid;

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
