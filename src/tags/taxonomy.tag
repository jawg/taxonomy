<taxonomy>
  <div  if="{ this.style && this.style.metadata }" class="container" ref="container">
    <div class="taxonomy-item" each="{ group in this.style.metadata['taxonomy:groups'] }">
      <line-render if="{ group.type === 'line' }" layers="{this.style.layers}" title="{ group.title }" group="{ group.id }"></line-render>
      <polygon-render if="{ group.type === 'polygon' }" layers="{this.style.layers}" title="{ group.title }" group="{ group.id }" zoom="{ group.zoom }"></polygon-render>
    </div>
  </div>
  <script type="text/javascript">
    this.fetchStyleURL = function (callback) {
      var req = new XMLHttpRequest();
      req.addEventListener('load', function () {
        switch (this.status) {
          case 200:
            return callback(null, JSON.parse(this.responseText));
          case 400:
            return callback('You sent a bad request.');
          case 401:
            return callback('You are not authorized to use this geocode.');
          case 500:
            return callback('This server can not answer yet.');
        }
      });
      req.open('GET', this.opts.styleUrl);
      req.send();
    };

    this.setBackgroundColor = function () {
      var layers = this.style.layers;
      for (var i in layers) {
        if (layers[i].type === 'background') {
          this.refs['container'].style['background-color'] = layers[i].paint['background-color'] || '#fff';
          return;
        }
      }
    };

    this.one('mount', function () {
      var self = this;
      if (!this.opts.styleUrl) {
        return console.error('Style URL is missing');
      }
      this.fetchStyleURL(function (err, res) {
        if (err) {
          return console.error('Error in fetch style');
        }
        self.style = res;
        self.update();
      });
    });

    this.on('updated', function() {
      this.setBackgroundColor();
    });
  </script>
</taxonomy>