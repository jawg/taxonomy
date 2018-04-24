<polygon-render>
  <h2>{ this.opts.title }</h2>
  <div class="polygon-render-container">
    <div if="{ this.polygons }" each="{ polygon in this.polygons }" class="polygon-render-item">
      <canvas style="width: 100px; height: 100px; background-color: { polygon.color }; { this.casing[polygon.id] ? 'border: ' + this.casing[polygon.id].width + 'px solid ' + this.casing[polygon.id].color + ';' : ''}"></canvas>
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
          color: taxonomy.parseColor(layer, self.casing[layer.id].paint['fill-color'], self.opts.zoom),
          width: taxonomy.parseNumber(layer, self.casing[layer.id].paint['line-width'], self.opts.zoom),
          id: self.casing[layer.id].id
        };
      } else if (layer.paint['fill-outline-color']) {
        self.casing[layer.id] = {
          color: taxonomy.parseColor(layer, layer.paint['fill-outline-color'], self.opts.zoom),
          width: 1,
          id: layer.id
        };
      }
      return {color: taxonomy.parseColor(layer, layer.paint['fill-color'], self.opts.zoom), id: layer.id};
    });
  </script>
</polygon-render>