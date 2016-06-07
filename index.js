var plastiq = require('plastiq');
var interact = require('interact.js');

var translateReg = /translate\((-?[\d\.]+)px,\s*(-?\d+)px\)/i;
var rotateReg = /rotate\((-?[\d\.]+)deg\)/i;
var scaleReg = /scale\((-?[\d\.]+)\)/i;

function plastiqInteractJs(options, vnode) {
  return plastiq.html.component(
    {
      onadd: function (element) {
        if (options.draggable) {
          interact(element).draggable({
            onmove: dragMoveListener
          });
        }
        if (options.rotatable || options.scalable) {
          interact(element).gesturable({
            onmove: makeGestureMoveListener(options)
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

plastiqInteractJs.createSnapGrid = interact.createSnapGrid;

function dragMoveListener(event) {
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
}

function makeGestureMoveListener(options) {
  return function(event) {
    if (options.rotatable) {
      rotateMoveListener(event);
    }
    if (options.scalable) {
      scaleMoveListener(event);
    }
  }
}

function rotateMoveListener(event) {
  var target = event.target;
  var deg;
  var transform = target.style.transform || target.style.webkitTransform;
  var existing = transform.match(rotateReg);
  if (existing) {
    deg = Number(existing[1]);
  } else {
    deg = 0;
  }
  deg += event.da;
  var newTranslate = 'rotate(' + deg + 'deg)';
  if (existing) {
    target.style.webkitTransform = target.style.transform = transform.replace(rotateReg, newTranslate);
  } else {
    target.style.webkitTransform = target.style.transform = transform + ' ' + newTranslate;
  }
}

function scaleMoveListener(event) {
  var target = event.target;
  var deg;
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
}
