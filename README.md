# plastiq-interactjs

Multi-touch gestures for plastiq.

## Example

```JavaScript
var plastiq = require('plastiq');
var interact = require('plastiq-interactjs');
var h = plastiq.html;

function render(model) {
  return h('.page',
    interact.draggable({ inertia: true },
      h('.red', 'Animal')
    ),
    interact.draggable({
      snap: { targets: [ interact.createSnapGrid({ x: 20, y: 20 }) ] } },
      h('.green', 'Vegetable')
    ),
    interact.draggable(
      interact.rotatable(
        interact.resizable(
          h('.blue', 'Mineral')
        )
      )
    )
  );
}

plastiq.append(document.body, render, {});
```
