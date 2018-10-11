<polygon-render>
  <h2 id="{ this.opts.group }">{ this.opts.title }</h2>
  <div class="render-container">
    <div if="{ this.polygons }" each="{ polygon in this.polygons }" class="render-item">
      <canvas style="width: 100px; height: 100px; background-color: { polygon.color }; { this.casing[polygon.id] ? 'border: ' + this.casing[polygon.id].width + 'px solid ' + this.casing[polygon.id].color + ';' : ''} opacity: { polygon.opacity };"></canvas>
      <span>{ polygon.id }</span>
    </div>
  </div>
  <script type="text/javascript">
    const self = this;
    this.casing = {};
    this.polygons = this.opts.layers.filter(function (layer) {
      if (layer.metadata && layer.metadata['taxonomy:group'] === self.opts.group) {
        if (layer.type == 'fill' && !layer.metadata['taxonomy:casing']) {
          return true;
        } else if (layer.type == 'line' && layer.metadata['taxonomy:casing']) {
          self.casing[layer.metadata['taxonomy:casing']] = layer;
        }
      }
      return false;
    }).map(function (layer) {
      if (self.casing[layer.id]) {
        self.casing[layer.id] = {
          color: taxonomy.parseColor(layer, self.casing[layer.id].paint['line-color'], self.opts.zooms[0]),
          width: taxonomy.parseNumber(layer, self.casing[layer.id].paint['line-width'], self.opts.zooms[0]),
          id: self.casing[layer.id].id
        };
      } else if (layer.paint['fill-outline-color']) {
        self.casing[layer.id] = {
          color: taxonomy.parseColor(layer, layer.paint['fill-outline-color'], self.opts.zooms[0]),
          width: 1,
          id: layer.id
        };
      }
      return {color: taxonomy.parseColor(layer, layer.paint['fill-color'], self.opts.zooms[0]), id: layer.id, opacity: taxonomy.parseNumber(layer, layer.paint['fill-opacity'], self.opts.zooms[0])};
    });
  </script>
</polygon-render>