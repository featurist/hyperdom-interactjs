var plastiq = require('plastiq');
var interact = require('../');
var h = plastiq.html;

function render(model) {
  return h('.page',
    interact({ draggable: true },
      h('.red', 'Animal')
    ),
    interact({
        draggable: {
          snap: { targets: [ interact.createSnapGrid({ x: 20, y: 20 }) ] }
        }
      },
      h('.green', 'Vegetable')
    ),
    interact({ draggable: { inertia: true }, rotatable: true, scalable: true },
      h('.blue', 'Mineral')
    )
  );
}

plastiq.append(document.getElementById('example'), render, {});
