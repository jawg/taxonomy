<line-render>
  <h2>{ this.opts.title }</h2>
  <table if="{ this.lines }">
    <tr>
      <th each="{ zoom in window.taxonomy.zooms }">
        { zoom }
      </th>
      <th>
        id
      </th>
    </tr>
    <tr each={ line in this.lines }>
      <td each="{ zoom in window.taxonomy.zooms }">
        <canvas if="{ line[zoom].width !== 0 }" style="width: 55px; height: { line[zoom].width }px; background-color: { line[zoom].color }; {taxonomy.borderStyleFromCasing(this.casing[line.id], line, zoom)}"></canvas>
      </td>
      <td>
        { line.id }
      </td>
    </tr>
  </table>
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