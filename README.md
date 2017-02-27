# hyperdom-interactjs

Multi-touch gestures for hyperdom.

[Demo](http://featurist.co.uk/hyperdom-interactjs)

## Example

```JavaScript
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
    h('pre', JSON.stringify(model, null, 2))
  );
}

var model = {
  animal:    { x: 0,  y: 0, scale: 1.1, rotation: 1  },
  vegetable: { x: 30, y: 0, scale: 1.0, rotation: 0  },
  mineral:   { x: 60, y: 0, scale: 1.1, rotation: -3, moves: 0, gestures: 0 }
}
```
