var plastiq = require('plastiq');
var interact = require('../');
var h = plastiq.html;

function render(model) {
  return h('.page',
    interact({ binding: [model, 'animal'], draggable: true },
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
        scalable: true
      },
      h('.blue', 'Mineral')
    ),
    h('pre', JSON.stringify(model, null, 2))
  );
}

var model = {
  animal:    { x: 0,  y: 0, scale: 1.1, rotation: 1  },
  vegetable: { x: 30, y: 0, scale: 1.0, rotation: 0  },
  mineral:   { x: 60, y: 0, scale: 1.1, rotation: -3 }
}

plastiq.append(document.getElementById('example'), render, model);
