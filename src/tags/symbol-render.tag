<symbol-render>
  <h2>{ this.opts.title }</h2>
  <div class="render-container">
    <div class="render-column" each="{ zoom in this.opts.zooms }">
    <span class="render-header">{ zoom }</span>
      <div if="{ this.symbols }" each="{ symbol in this.symbols }" class="render-item" style="min-height: { this.getMinHeight(symbol) }px;">
      <span style="font-size: { symbol[zoom].width }px; color: { symbol[zoom].color }; { this.casing[symbol.id] && this.casing[symbol.id][zoom] ? 'text-shadow: 0 0 ' + this.casing[symbol.id][zoom].width + 'px ' + this.casing[symbol.id][zoom].color + ';' : ''}">{ symbol.example || symbol.id }</span>
      </div>
    </div>
    <div class="render-column">
      <span class="render-header">id</span>
      <div if="{ this.symbols }" each="{ symbol in this.symbols }" class="render-item" style="min-height: { this.getMinHeight(symbol) }px;">
        { symbol.id }
      </div>
    </div>
  </div>
  <script type="text/javascript">
    const self = this;
    this.casing = {};
    if (typeof this.opts.zooms === 'undefined') {
      this.opts.zooms = window.taxonomy.zooms;
    } else if (typeof this.opts.zooms === 'number') {
      this.opts.zooms = [this.opts.zooms];
    }
    this.symbols = this.opts.layers.filter(function(layer) {
      return layer.metadata && layer.metadata['taxonomy:group'] === self.opts.group && layer.type == 'symbol';
    }).map(function(layer) {
      if (layer.paint['text-halo-color']) {
        self.casing[layer.id] = taxonomy.widthAndColorByZooms(layer, { width: layer.paint['text-halo-width'], color: layer.paint['text-halo-color'], zooms: self.opts.zooms})
      }
      const res = taxonomy.widthAndColorByZooms(layer, { width: layer.layout['text-size'], color: layer.paint['text-color'], zooms: self.opts.zooms});
      res.example = layer.metadata['taxonomy:example'];
      return res;
    });

    this.getMinHeight = function(symbol) {
      const res = 5 + symbol.maxWidth + (this.casing[symbol.id] ? this.casing[symbol.id].maxWidth : 0);
      return res > 25 ? res : 25;
    }
  </script>
</symbol-render>