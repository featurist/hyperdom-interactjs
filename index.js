var plastiq = require('plastiq');
var interact = require('interact.js');

document.body.innerHTML += '<div id="debug">DEBUG</div>';

var translateReg = /translate\((-?\d+)px,\s*(-?\d+)px\)/i;
var rotateReg = /rotate\((-?\d+)deg\)/i;

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

function rotateMoveListener(event) {
  document.getElementById('debug').innerHTML = 'ROTATE';
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
    return plastiq.html.component(
      {
        onadd: function (element) {
          interact(element).gesturable({
            onmove: rotateMoveListener
          });
        },
        onupdate: function (element) {
        }
      },
      element
    );
  }
}
