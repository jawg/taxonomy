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
    return +taxonomy.stops.interpolate.number(outputLower, outputUpper, t).toFixed(2);
  };

  taxonomy.parseColor = function(layer, color, zoom) {
    if ((layer.minzoom !== undefined && zoom < layer.minzoom) || layer.maxzoom !== undefined && layer.maxzoom < zoom) {
      return '#000';
    } else if (typeof color === 'undefined') {
      return '#000';
    } else if (typeof color === 'string') {
      return color;
    }
    const stops = color.stops;
    if (stops.length === 1 || stops[0][0] >= zoom) {
      return stops[0][1];
    } else if (stops[stops.length - 1][0] <= zoom) {
      return stops[stops.length - 1][1];
    }
    const index = taxonomy.stops.findStopLessThanOrEqualTo(stops, zoom);
    const t = taxonomy.stops.interpolationFactor(zoom, color.base, stops[index][0], stops[index + 1][0]);
    const typeValueLower = colorConverter.getStringTypeAndValue(stops[index][1]);
    const typeValueUpper = colorConverter.getStringTypeAndValue(stops[index + 1][1]);
    const outputLower = typeValueLower.type === 'rgb' ? typeValueLower.value : colorConverter[typeValueLower.type].rgb(typeValueLower.value);
    const outputUpper = typeValueUpper.type === 'rgb' ? typeValueUpper.value : colorConverter[typeValueUpper.type].rgb(typeValueUpper.value);
    return colorConverter.rgba.toString([
      taxonomy.stops.interpolate.number(outputLower[0], outputUpper[0], t),
      taxonomy.stops.interpolate.number(outputLower[1], outputUpper[1], t),
      taxonomy.stops.interpolate.number(outputLower[2], outputUpper[2], t), 1]);
  };

  taxonomy.renderLine = function(layer) {
    return taxonomy.widthAndColorByZooms(layer, { width: layer.paint['line-width'], color: layer.paint['line-color']});
  };

  taxonomy.widthAndColorByZooms = function(layer, props) {
    const color = props.color || '#000';
    const width = props.width || 1;
    const zooms = props.zooms || taxonomy.zooms;
    const res = {};
    res.maxWidth = 0;
    res.id = layer.id;
    zooms.forEach(function(zoom) {
      const parsedWidth = taxonomy.parseNumber(layer, width, zoom);
      if (parsedWidth > res.maxWidth) {
        res.maxWidth = parsedWidth;
      }
      res[zoom] = { width: parsedWidth, color: taxonomy.parseColor(layer, color, zoom) };
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

  taxonomy.getFontWeight = function(font) {
    if (/extra(- )?light/i.test(font)) {
      return 200;
    } else if (/light/i.test(font)) {
      return 300;
    } else if (/semi(- )?bold/i.test(font)) {
      return 600
    } else if (/bold/i.test(font)) {
      return 700;
    } else if (/black/i.test(font)) {
      return 900;
    }
    return 400;
  };

  taxonomy.getFontStyle = function(font) {
    if (/italic$/i.test(font)) {
      return 'italic';
    }
    return 'normal';
  };

  taxonomy.getFontFamily = function(font) {
    const family = font.split(/( black| bold| light| regular| semi[- ]?bold| extra[- ]?light| italic)/i);
    if (family && family[0]) {
      return family[0];
    }
    return '';
  };
}