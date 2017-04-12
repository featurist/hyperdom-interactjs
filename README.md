# hyperdom-interactjs

Use [interact.js](http://interactjs.io/) through [hyperdom](https://github.com/featurist/hyperdom).

[Demo](http://featurist.co.uk/hyperdom-interactjs)

## Example

```JavaScript
function render(model) {
  return h('.page',
    interact('.red', {
        binding: [model, 'animal'],
        draggable: true
      },
      'Animal'
    ),
    interact('.green', {
        binding: [model, 'vegetable'],
        draggable: {
          snap: { targets: [ interact.createSnapGrid({ x: 20, y: 20 }) ] }
        }
      },
      'Vegetable'
    ),
    interact('.blue', {
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
      'Mineral'
    ),
    interact.dropzone({
      accept: '*',
      overlap: 0.5,
      ondrop: function(event) {
        event.target.style.backgroundColor = 'purple';
      }
    }, h('.bucket', 'Bucket')),
    interact('.object-container', {
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
    ),
    h('.scaled-container.js-interact-scaled-container', {
      style: { transform: 'scale(1.6)' }
    },
      interact('.pink', {
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
        'Scaled'
      )
    ),
    interact('.turquoise', {
        binding: [model, 'resizable'],
        draggable: true,
        resizable: {
          preserveAspectRatio: true,
          edges: { left: true, right: true, bottom: true, top: true }
        },
        rotatable: true,
        scalable: true
      },
      'Resizable'
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
```

## Additional Features

- Adding `.js-interact-scaled-container` to a [scaled](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale) container around the elements will fix the [dragging/resizing issue](https://github.com/taye/interact.js/issues/137).

- Passing an `onbeforechange` option will allow for normalization and validation of the transform before its value updates. This is useful for implementing certain application-specific constraints (e.g. minimum or maximum size).

```js
interact('.constrained', {
  binding: [model, 'transform'],
  resizable: true,

  onbeforechange: function(transform) {
    transform.width = Math.max(100, transform.width); // enforce a minimum width of 100
    return transform;
  }
})
```
