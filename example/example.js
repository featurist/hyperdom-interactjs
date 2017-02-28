var hyperdom = require('hyperdom');
var interact = require('../');
var h = hyperdom.html;

function render(model) {
  return h('.page',
    interact({
        binding: [model, 'animal'],
        draggable: true
      },
      h('.red', 'Animal')
    ),
    interact({
        binding: [model, 'vegetable'],
        draggable: {
          snap: { targets: [ interact.createSnapGrid({ x: 20, y: 20 }) ] }
        }
      },
      h('.green', 'Vegetable')
    ),
    interact({
        binding: [model, 'mineral'],
        draggable: { inertia: true },
        rotatable: true,
        scalable: true,
        withDraggable: function(draggable) {
          draggable.on('move', function() {
            model.mineral.moves++;
          });
        },
        withGesturable: function(gesturable) {
          gesturable.on('move', function() {
            model.mineral.gestures++;
          });
        }
      },
      h('.blue', 'Mineral')
    ),
    interact.dropzone({
      accept: '*',
      overlap: 0.5,
      ondrop: function(event) {
        event.target.style.backgroundColor = 'purple';
      }
    }, h('.bucket', 'Bucket')),
    h('.object-container',
      interact({
          binding: [model, 'restricted'],
          draggable: {
            restrict: {
              restriction: 'parent',
              endOnly: true,
              elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            }
          },
          resizable: {
            edges: { left: true, right: true, bottom: true, top: true }
          },
          rotatable: true,
          scalable: true
        },
        h('.pink', 'Restricted')
      )
    ),
    h('.scaled-container.js-interact-scaled-container', {
      style: { transform: 'scale(1.6)' }
    },
      interact({
          binding: [model, 'scaledContainer'],
          draggable: {
            restrict: {
              restriction: 'parent',
              endOnly: true,
              elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            }
          },
          resizable: {
            preserveAspectRatio: true,
            edges: { left: true, right: true, bottom: true, top: true }
          },
          rotatable: true,
          scalable: true
        },
        h('.pink', 'Scaled')
      )
    ),
    interact({
        binding: [model, 'resizable'],
        draggable: true,
        resizable: {
          preserveAspectRatio: true,
          edges: { left: true, right: true, bottom: true, top: true }
        },
        rotatable: true,
        scalable: true
      },
      h('.turquoise', 'Resizable')
    ),
    h('pre', JSON.stringify(model, null, 2))
  );
}

var model = {
  animal:     { x: 0,  y: 0, scale: 1.1, rotation: 1 },
  vegetable:  { x: 30, y: 0, scale: 1.0, rotation: 0 },
  mineral:    { x: 60, y: 0, scale: 1.1, rotation: -3, moves: 0, gestures: 0 },
  restricted: { x: 30, y: 0, scale: 1.0, rotation: 0 },
  scaledContainer:  { x: 30, y: 0, scale: 1.2, rotation: 0 },
  resizable:  { x: 600, y: -400, scale: 2.0, rotation: 0 }
}

hyperdom.append(document.getElementById('example'), render, model);
