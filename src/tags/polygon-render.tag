<polygon-render>
  <h2>{ this.opts.title }</h2>
  <div class="polygon-render-container">
    <div if="{ this.polygons }" each="{ polygon in this.polygons }" class="polygon-render-item">
      <canvas style="width: 100px; height: 100px; background-color: { polygon.color };"></canvas>
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
          color: self.casing[layer.id].paint['fill-color'],
          id: self.casing[layer.id].id
        };
      }
      return {color: layer.paint['fill-color'], id: layer.id};
    });
  </script>
</polygon-render>