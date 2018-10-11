<symbol-render>
  <h2 id="{ this.opts.group }">{ this.opts.title }</h2>
  <div class="render-container">
    <div class="render-column" each="{ zoom in this.opts.zooms }">
    <span class="render-header">{ zoom }</span>
      <div if="{ this.symbols }" each="{ symbol in this.symbols }" class="render-item" style="min-height: { this.getMinHeight(symbol) }px;">
      <span style="font-size: { symbol[zoom].width }px; color: { symbol[zoom].color }; { this.casing[symbol.id] && this.casing[symbol.id][zoom] ? 'text-shadow: 0 0 ' + this.casing[symbol.id][zoom].width + 'px ' + this.casing[symbol.id][zoom].color + ';' : ''} { symbol.fontStyle } text-transform: { symbol['text-transform'] };">{ symbol.example || symbol.id }</span>
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
    this.fontPropsToStyle = function(props) {
      return 'font-style: ' + props.style + '; font-weight: ' + props.weight + '; font-family: \'' + props.family + '\';';
    }
    this.symbols = this.opts.layers.filter(function(layer) {
      return layer.metadata && layer.metadata['taxonomy:group'] === self.opts.group && layer.type == 'symbol';
    }).map(function(layer) {
      if (layer.paint['text-halo-color']) {
        self.casing[layer.id] = taxonomy.widthAndColorByZooms(layer, { width: layer.paint['text-halo-width'], color: layer.paint['text-halo-color'], zooms: self.opts.zooms})
      }
      const res = taxonomy.widthAndColorByZooms(layer, { width: layer.layout['text-size'], color: layer.paint['text-color'], zooms: self.opts.zooms});
      res['text-transform'] = layer.layout['text-transform'] || 'none';
      res.example = layer.metadata['taxonomy:example'];
      const fontProps = taxonomy.fonts.getProps(layer.layout['text-font'][0])
      res.fontStyle = self.fontPropsToStyle(fontProps);
      taxonomy.fonts.add(fontProps);
      return res;
    });

    this.getMinHeight = function(symbol) {
      const res = 8 + symbol.maxWidth + (this.casing[symbol.id] ? this.casing[symbol.id].maxWidth : 0);
      return res > 25 ? res : 25;
    }
  </script>
</symbol-render>