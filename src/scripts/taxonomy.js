if (typeof window.taxonomy === 'undefined') {
  const taxonomy = window.taxonomy = {};
  taxonomy.zooms = [];
  for (var i = 1; i < 20; i++) {
    taxonomy.zooms.push(i);
  }
  taxonomy.stops = {};
  taxonomy.stops.interpolate = {
    number: function(a, b, t) {
      return (a * (1 - t)) + (b * t);
    },
    array: function(from, to, t) {
      return from.map(function(d, i) {
        return taxonomy.stops.interpolate.number(d, to[i], t);
      });
    }
  };

  taxonomy.stops.findStopLessThanOrEqualTo = function(stops, input) {
    const n = stops.length;
    var lowerIndex = 0;
    var upperIndex = n - 1;
    var currentIndex = 0;
    var currentValue,
      upperValue;

    while (lowerIndex <= upperIndex) {
      currentIndex = Math.floor((lowerIndex + upperIndex) / 2);
      currentValue = stops[currentIndex][0];
      upperValue = stops[currentIndex + 1][0];
      if (input === currentValue || input > currentValue && input < upperValue) { // Search complete
        return currentIndex;
      } else if (currentValue < input) {
        lowerIndex = currentIndex + 1;
      } else if (currentValue > input) {
        upperIndex = currentIndex - 1;
      }
    }

    return Math.max(currentIndex - 1, 0);
  };

  taxonomy.stops.interpolationFactor = function(input, base, lowerValue, upperValue) {
    // var upperValue, lowerValue;
    const difference = upperValue - lowerValue;
    const progress = input - lowerValue;

    if (difference === 0) {
      return 0;
    } else if (base === 1) {
      return progress / difference;
    } else {
      return (Math.pow(base, progress) - 1) / (Math.pow(base, difference) - 1);
    }
  };

  taxonomy.parseNumber = function(layer, width, zoom) {
    if ((layer.minzoom !== undefined && zoom < layer.minzoom) || layer.maxzoom !== undefined && layer.maxzoom < zoom) {
      return 0;
    } else if (typeof width === 'undefined') {
      return 1;
    } else if (typeof width === 'number') {
      return width;
    }
    const stops = width.stops;
    if (stops.length === 1 || stops[0][0] >= zoom) {
      return stops[0][1];
    } else if (stops[stops.length - 1][0] <= zoom) {
      return stops[stops.length - 1][1];
    }
    const index = taxonomy.stops.findStopLessThanOrEqualTo(stops, zoom);
    const t = taxonomy.stops.interpolationFactor(zoom, width.base, stops[index][0], stops[index + 1][0]);
    const outputLower = stops[index][1];
    const outputUpper = stops[index + 1][1];
    return taxonomy.stops.interpolate.number(outputLower, outputUpper, t);
  };

  taxonomy.renderLine = function(layer) {
    const paint = layer.paint;
    const color = paint['line-color'] || '#000';
    const res = {};
    res.id = layer.id;
    taxonomy.zooms.forEach(function(zoom) {
      res[zoom] = { width: taxonomy.parseNumber(layer, paint['line-width'], zoom), color: color };
    });
    return res;
  };

  taxonomy.borderStyleFromCasing = function(casing, base, zoom) {
    if (!casing || !base || !casing[zoom] || !base[zoom]) {
      return '';
    }
    const width = (casing[zoom].width - base[zoom].width) / 2;
    return 'border-top-width:' + width + 'px;' +
      'border-bottom-width:' + width + 'px;' +
      'border-top-color:' + casing[zoom].color + ';' +
      'border-bottom-color:' + casing[zoom].color + ';'+
      'border-top-style:solid;' +
      'border-bottom-style:solid;';
  };
}