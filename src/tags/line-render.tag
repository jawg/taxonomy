<line-render>
  <h2>{ this.opts.title }</h2>
  <div class="line-render-container">
    <div class="line-render-column" each="{ zoom in window.taxonomy.zooms }">
    <span>{ zoom }</span>
      <div if="{ this.lines }" each="{ line in this.lines }" class="line-render-item">
      <canvas style="width: 55px; height: { line[zoom].width }px; background-color: { line[zoom].color }; {taxonomy.borderStyleFromCasing(this.casing[line.id], line, zoom)}"></canvas>
      </div>
    </div>
    <div class="line-render-column">
      <span>id</span>
      <div if="{ this.lines }" each="{ line in this.lines }" class="line-render-item">
        { line.id }
      </div>
    </div>
  </div>
  <script type="text/javascript">
    const self = this;
    this.casing = {};
    this.lines = this.opts.layers.filter(function(layer) {
      if (layer.metadata && layer.metadata['taxonomy:group'] === self.opts.group && layer.type == 'line') {
        if (!layer.metadata['taxonomy:casing']) {
          return true;
        }
        self.casing[layer.metadata['taxonomy:casing']] = layer;
      }
      return false;
    }).map(function(layer) {
      if (self.casing[layer.id]) {
        self.casing[layer.id] = taxonomy.renderLine(self.casing[layer.id]);
      }
      return taxonomy.renderLine(layer);
    });
  </script>
</line-render>