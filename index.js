var hyperdom = require('hyperdom');
var interact = require('interact.js');
var closest = require('element-closest');

var translateReg = /translate\((-?[\d\.]+)px,\s*(-?[\d\.]+)px\)/i;
var rotateReg = /rotate\((-?[\d\.]+)deg\)/i;
var scaleReg = /scale\((-?[\d\.]+)\)/i;

function hyperdomInteractJs(options, vnode) {
  var binding = hyperdom.html.binding(options.binding);
  var transform = binding.get();
  return hyperdom.html.component(
    {
      onadd: function(element) {
        if (transform) {
          element.style.transform = writeTransform(transform);
          if (transform.width) {
            element.style.width = transform.width + 'px';
          }
          if (transform.height) {
            element.style.height = transform.height + 'px';
          }
        }
        if (options.draggable) {
          var dragOpts = (options.draggable === true) ?
            {} : options.draggable || {};
          dragOpts.onmove = hyperdom.html.refreshify(makeDragMoveListener(binding));
          var draggable = interact(element).draggable(dragOpts);
          if (options.withDraggable) {
            options.withDraggable(draggable);
          }
        }
        if (options.resizable) {
          var resizeOpts = (options.resizable === true) ?
            {} : options.resizable || {};
          resizeOpts.onmove = hyperdom.html.refreshify(makeResizeListener(binding));
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
  return 'translate(' + t.x + 'px,' + t.y + 'px) scale(' + t.scale + ') rotate(' + t.rotation + 'deg)';
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
  var existingTranslate = transform.match(translateReg);
  if (existingTranslate) {
    x = Number(existingTranslate[1]);
    y = Number(existingTranslate[2]);
  } else {
    x = y = 0;
  }

  // Account for scaled container when dragging
  var scaledContainer = target.closest('.js-interact-scaled-container');
  if (scaledContainer) {
    var existingScale = scaledContainer.style.transform.match(scaleReg);
    var scaleValue = Number(existingScale[1]);
    x += event.dx / scaleValue;
    y += event.dy / scaleValue;
  } else {
    x += event.dx;
    y += event.dy;
  }

  var newTranslate = 'translate(' + x + 'px, ' + y + 'px)';
  if (existingTranslate) {
    target.style.webkitTransform = target.style.transform = transform.replace(translateReg, newTranslate);
  } else {
    target.style.webkitTransform = target.style.transform = transform + ' ' + newTranslate;
  }

  if (binding) {
    var bindingTransform = binding.get() || {};
    bindingTransform.x = x;
    bindingTransform.y = y;
    binding.set(bindingTransform);
  }
}

function makeResizeListener(binding) {
  return function(event) {
    resizeListener(event, binding);
  }
}

function resizeListener(event, binding) {
  var target = event.target;
  var targetWidth, targetHeight;
  var scaledContainer = target.closest('.js-interact-scaled-container');
  var existingObjectTransform = target.style.transform || target.style.webkitTransform;
  var existingObjectScale = existingObjectTransform.match(scaleReg);

  if (existingObjectScale) {
    var existingObjectScaleValue = Number(existingObjectScale[1]);
  }

  if (scaledContainer) {
    var containerScale = scaledContainer.style.transform.match(scaleReg);
    var containerScaleValue = Number(containerScale[1]);
    if (existingObjectScale) {
      targetWidth  = (event.rect.width / existingObjectScaleValue) / containerScaleValue;
      targetHeight = (event.rect.height / existingObjectScaleValue) / containerScaleValue;
    } else {
      targetWidth  = event.rect.width / containerScaleValue;
      targetHeight = event.rect.height / containerScaleValue;
    }
  } else if (existingObjectScale) {
    targetWidth  = event.rect.width / existingObjectScaleValue;
    targetHeight = event.rect.height / existingObjectScaleValue;
  } else {
    targetWidth  = event.rect.width;
    targetHeight = event.rect.height;
  }

  target.style.width = targetWidth + 'px';
  target.style.height = targetHeight + 'px';

  if (binding) {
    var bindingTransform = binding.get() || {};
    bindingTransform.width = targetWidth;
    bindingTransform.height = targetHeight;
    binding.set(bindingTransform);
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
  var existingRotate = transform.match(rotateReg);
  if (existingRotate) {
    rotation = Number(existingRotate[1]);
  } else {
    rotation = 0;
  }
  rotation += event.da;
  var newRotate = 'rotate(' + rotation + 'deg)';
  if (existingRotate) {
    target.style.webkitTransform = target.style.transform = transform.replace(rotateReg, newRotate);
  } else {
    target.style.webkitTransform = target.style.transform = transform + ' ' + newRotate;
  }

  if (binding) {
    var bindingTransform = binding.get() || {};
    bindingTransform.rotation = rotation;
    binding.set(bindingTransform);
  }
}

function scaleMoveListener(event, binding, refresh) {
  var target = event.target;
  var scale;
  var transform = target.style.transform || target.style.webkitTransform;
  var existingScale = transform.match(scaleReg);
  if (existingScale) {
    scale = Number(existingScale[1]);
  } else {
    scale = 1;
  }
  scale += event.ds;
  var newScale = 'scale(' + scale + ')';
  if (existingScale) {
    target.style.webkitTransform = target.style.transform = transform.replace(scaleReg, newScale);
  } else {
    target.style.webkitTransform = target.style.transform = transform + ' ' + newScale;
  }

  if (binding) {
    var bindingTransform = binding.get() || {};
    bindingTransform.scale = scale;
    binding.set(bindingTransform);
  }
}
