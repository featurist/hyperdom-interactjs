var hyperdom = require('hyperdom');
var interact = require('interact.js');
var closest = require('element-closest');
var assign = Object.assign || require('object-assign');
var scaleReg = /scale\((-?[\d\.]+)\)/i;
var defaultTransform = { x: 0, y: 0, scale: 1, rotation: 0 };

function hyperdomInteractJs(selector, options, vnode) {
  var binding = hyperdom.html.binding(options.binding);
  var transform = getTransform(binding);
  var htmlOptions = options.html || {};

  return hyperdom.html.component(
    {
      onadd: function(element) {
        if (options.draggable) {
          var dragOpts = (options.draggable === true) ?
            {} : options.draggable || {};
          dragOpts.onmove = hyperdom.html.refreshify(makeDragMoveListener(options, binding));
          var draggable = interact(element).draggable(dragOpts);
          if (options.withDraggable) {
            options.withDraggable(draggable);
          }
        }
        if (options.resizable) {
          var resizeOpts = (options.resizable === true) ?
            {} : options.resizable || {};
          resizeOpts.onmove = hyperdom.html.refreshify(makeResizeListener(options, binding));
          var resizable = interact(element).resizable(resizeOpts);
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
      onupdate: function (element) { }
    },

    hyperdom.html(selector, assign({}, htmlOptions, {
      style: assign({
        transform: transformStyle(transform),
        width: transform.width != null ? transform.width + 'px' : undefined,
        height: transform.height != null ? transform.height + 'px' : undefined
      }, htmlOptions.style)
    }), vnode)
  );
}

module.exports = hyperdomInteractJs;

hyperdomInteractJs.dropzone = function(options, vnode) {
  return hyperdom.html.component({
    onadd: function(element) {
      interact(element).dropzone(options);
    }
  }, vnode);
};

hyperdomInteractJs.createSnapGrid = interact.createSnapGrid;

function getTransform(binding) {
  return binding.get() || defaultTransform;
}

function transformStyle(t) {
  return 'translate(' + t.x + 'px,' + t.y  + 'px) scale(' + t.scale + ') rotate(' + t.rotation + 'deg)';
}

function updateTransform(options, binding, updatedAttrs) {
  var transform = getTransform(binding);
  var newTransform = assign({}, transform, updatedAttrs);

  if (options.onbeforechange) {
    newTransform = options.onbeforechange(newTransform);
  }

  binding.set(newTransform);
}

function makeDragMoveListener(options, binding) {
  return function(event) {
    dragMoveListener(event, options, binding);
  }
}

function dragMoveListener(event, options, binding) {
  var target = event.target;
  var transform = getTransform(binding);
  var newX = transform.x;
  var newY = transform.y;

  // Account for scaled container when dragging
  var scaledContainer = target.closest('.js-interact-scaled-container');

  if (scaledContainer) {
    var existingScale = scaledContainer.style.transform.match(scaleReg);
    var scaleValue = Number(existingScale[1]);
    newX += event.dx / scaleValue;
    newY += event.dy / scaleValue;
  } else {
    newX += event.dx;
    newY += event.dy;
  }

  updateTransform(options, binding, { x: newX, y: newY });
}

function makeResizeListener(options, binding) {
  return function(event) {
    resizeListener(event, options, binding);
  }
}

function resizeListener(event, options, binding) {
  var target = event.target;
  var transform = getTransform(binding);
  var newWidth, newHeight;
  var scaledContainer = target.closest('.js-interact-scaled-container');
  var existingObjectScale = transform.scale;

  if (scaledContainer) {
    var containerScale = scaledContainer.style.transform.match(scaleReg);
    var containerScaleValue = Number(containerScale[1]);
    newWidth  = (event.rect.width / existingObjectScale) / containerScaleValue;
    newHeight = (event.rect.height / existingObjectScale) / containerScaleValue;
  } else {
    newWidth  = event.rect.width / existingObjectScale;
    newHeight = event.rect.height / existingObjectScale;
  }

  updateTransform(options, binding, { width: newWidth, height: newHeight });
}

function makeGestureMoveListener(options, binding) {
  return function(event) {
    if (options.rotatable) {
      rotateMoveListener(event, options, binding);
    }
    if (options.scalable) {
      scaleMoveListener(event, options, binding);
    }
  }
}

function rotateMoveListener(event, options, binding) {
  var target = event.target;
  var transform = getTransform(binding);
  var newRotation = transform.rotation;

  newRotation += event.da;

  updateTransform(options, binding, { rotation: newRotation });
}

function scaleMoveListener(event, options, binding) {
  var target = event.target;
  var transform = getTransform(binding);
  var newScale = transform.scale;

  newScale += event.ds;

  updateTransform(options, binding, { scale: newScale });
}
