import WebFont from 'webfontloader';
import colorConverter from 'color-operations-ui/src/scripts/color-converter.js';

class Expressions {
  constructor() {}
  findStopLessThanOrEqualTo(stops, input) {
    const n = stops.length;
    var lowerIndex = 0;
    var upperIndex = n - 1;
    var currentIndex = 0;
    var currentValue, upperValue;

    while (lowerIndex <= upperIndex) {
      currentIndex = Math.floor((lowerIndex + upperIndex) / 2);
      currentValue = stops[currentIndex][0];
      upperValue = stops[currentIndex + 1][0];
      if (input === currentValue || (input > currentValue && input < upperValue)) {
        // Search complete
        return currentIndex;
      } else if (currentValue < input) {
        lowerIndex = currentIndex + 1;
      } else if (currentValue > input) {
        upperIndex = currentIndex - 1;
      }
    }
    return Math.max(currentIndex - 1, 0);
  }
  interpolationFactor(input, base, lowerValue, upperValue) {
    const difference = upperValue - lowerValue;
    const progress = input - lowerValue;

    if (difference === 0) {
      return 0;
    } else if (base === 1 || base === undefined) {
      return progress / difference;
    } else {
      return (Math.pow(base, progress) - 1) / (Math.pow(base, difference) - 1);
    }
  }
  number(a, b, t) {
    return a * (1 - t) + b * t;
  }
  array(from, to, t) {
    return from.map(function(d, i) {
      return this.number(d, to[i], t);
    });
  }
  asExpression(exp) {
    if (Array.isArray(exp)) {
      return exp
    }
    if (!exp.stops) {
      throw new Error(`${JSON.stringify(exp)} is not a correct expression`)
    }
    if (exp.base === 1 || exp.base === undefined) {
      return ["interpolate", ["linear"],
        ["zoom"]
      ].concat(exp.stops.reduce((acc, e) => acc.concat(e), []))
    }
    return ["interpolate", ["exponential", exp.base],
      ["zoom"]
    ].concat(exp.stops.reduce((acc, e) => acc.concat(e), []))
  }
  parseInterpolate(exp, value) {
    if (!exp || exp[0] !== 'interpolate' || exp.length < 4) {
      return null
    }

    const base = exp[1][0] === "exponential" ? exp[1][1] : 1
    const stops = exp.slice(3).reduce((acc, e, i) => {
      i % 2 === 0 ? acc.push([e]) : acc[acc.length - 1].push(e)
      return acc
    }, []);
    if (stops.length === 1 || stops[0][0] >= value) {
      return {
        value: stops[0][1]
      };
    } else if (stops[stops.length - 1][0] <= value) {
      return {
        value: stops[stops.length - 1][1]
      };
    }
    const index = this.findStopLessThanOrEqualTo(stops, value);
    return {
      lower: stops[index][1],
      upper: stops[index + 1][1],
      t: this.interpolationFactor(value, base, stops[index][0], stops[index + 1][0])
    }
  }
  renderMatch(exp, match) {
    if (!Array.isArray(exp)) {
      return exp
    } else if (exp[0] !== 'match') {
      return exp.map(e => this.renderMatch(e, match))
    }
    const input = exp[1].join(':')

    return exp.reduce((acc, e, i) => {
      if (i >= 2 && i % 2 === 0 && (match[input] == e || (Array.isArray(e) && match[input] == e[0]))) {
        return exp[i + 1]
      }
      return acc;
    }, exp[exp.length - 1])
  }
}

class Fonts {
  constructor() {
    this._families = {};
  }
  getWeight(font) {
    if (/extra(- )?light/i.test(font)) {
      return 200;
    } else if (/light/i.test(font)) {
      return 300;
    } else if (/semi(- )?bold/i.test(font)) {
      return 600;
    } else if (/bold/i.test(font)) {
      return 700;
    } else if (/black/i.test(font)) {
      return 900;
    }
    return 400;
  }
  getStyle(font) {
    if (/italic$/i.test(font)) {
      return 'italic';
    }
    return 'normal';
  }
  getFamily(font) {
    const family = font.split(/( black| bold| light| regular| semi[- ]?bold| extra[- ]?light| italic)/i);
    if (family && family[0]) {
      return family[0];
    }
    return '';
  }
  getProps(font) {
    return {
      family: this.getFamily(font),
      style: this.getStyle(font),
      weight: this.getWeight(font),
    };
  }
  add(fontProps) {
    this._families[fontProps.family] = this._families[fontProps.family] || [];
    const type = fontProps.weight + (fontProps.style == 'italic' ? 'i' : '');
    if (this._families[fontProps.family].indexOf(type) == -1) {
      this._families[fontProps.family].push(type);
    }
  }
  download() {
    const families = [];
    for (var i in this._families) {
      families.push(i + ':' + this._families[i].join(','));
    }
    if (families.length > 0) {
      WebFont.load({
        google: {
          families: families,
        },
      });
    }
  }
}

class Taxonomy {
  constructor() {
    this.zooms = this.generateArray(1, 20);
    this.expressions = new Expressions();
    this.fonts = new Fonts();
  }
  generateArray(min, max) {
    const res = [];
    for (var i = min; i < max; i++) {
      res.push(i);
    }
    return res;
  }
  getZooms(zooms) {
    if (typeof zooms === 'undefined') {
      return this.zooms;
    } else if (typeof zooms === 'number') {
      return [zooms];
    } else if (typeof zooms === 'object' && typeof zooms.minzoom === 'number' && typeof zooms.maxzoom === 'number') {
      return this.generateArray(zooms.minzoom, zooms.maxzoom);
    }
    return zooms;
  }
  parseNumber(layer, width, zoom) {
    if (
      (layer.minzoom !== undefined && zoom < layer.minzoom) ||
      (layer.maxzoom !== undefined && layer.maxzoom < zoom)
    ) {
      return 0;
    } else if (typeof width === 'undefined') {
      return 1;
    } else if (typeof width === 'number') {
      return width;
    }
    const expression = this.expressions.asExpression(width)
    const interpolate = this.expressions.parseInterpolate(expression, zoom)
    if (interpolate) {
      if (interpolate.value) return interpolate.value
      return +this.expressions.number(interpolate.lower, interpolate.upper, interpolate.t).toFixed(2);
    }
  }
  parseColor(layer, color, zoom) {
    if (
      (layer.minzoom !== undefined && zoom < layer.minzoom) ||
      (layer.maxzoom !== undefined && layer.maxzoom < zoom)
    ) {
      return '#000';
    } else if (typeof color === 'undefined') {
      return '#000';
    } else if (typeof color === 'string') {
      return color;
    }
    const expression = this.expressions.asExpression(color)
    const interpolate = this.expressions.parseInterpolate(expression, zoom)
    if (interpolate) {
      if (interpolate.value) return interpolate.value
      const typeValueLower = colorConverter.getStringTypeAndValue(interpolate.lower);
      const typeValueUpper = colorConverter.getStringTypeAndValue(interpolate.upper);
      const outputLower =
        typeValueLower.type === 'rgb' ?
        typeValueLower.value :
        colorConverter[typeValueLower.type].rgb(typeValueLower.value);
      const outputUpper =
        typeValueUpper.type === 'rgb' ?
        typeValueUpper.value :
        colorConverter[typeValueUpper.type].rgb(typeValueUpper.value);
      return colorConverter.rgba.toString([
        this.expressions.number(outputLower[0], outputUpper[0], interpolate.t),
        this.expressions.number(outputLower[1], outputUpper[1], interpolate.t),
        this.expressions.number(outputLower[2], outputUpper[2], interpolate.t),
        1,
      ]);
    }
  }
  renderLine(layer, zooms) {
    const line = this.widthAndColorByZooms(layer, {
      width: layer.paint['line-width'],
      color: layer.paint['line-color'],
      zooms: zooms,
      opacity: layer.paint['line-opacity'],
    });
    if (layer.paint['line-gap-width']) {
      const gap = this.widthAndColorByZooms(layer, {
        width: layer.paint['line-gap-width'],
        color: layer.paint['line-color'],
        zooms: zooms,
        opacity: layer.paint['line-opacity'],
      });
      for (let zoom in gap) {
        if (line[zoom] && typeof line[zoom].width === 'number') {
          line[zoom].width += gap[zoom].width;
        }
      }
    }
    return line;
  }
  renderMatches(layer, matches) {
    return matches.map(match => {
      let newLayer = {
        id: layer.id,
        name: match.name,
        metadata: layer.metadata,
        paint: {},
        layout: {}
      };
      Object.keys(layer.paint || {}).forEach(key => {
        newLayer.paint[key] = this.expressions.renderMatch(layer.paint[key], match)
      })
      Object.keys(layer.layout || {}).forEach(key => {
        newLayer.layout[key] = this.expressions.renderMatch(layer.layout[key], match)
      })
      return newLayer
    })
  }
  widthAndColorByZooms(layer, props) {
    const color = props.color || '#000';
    const width = props.width || 1;
    const opacity = props.opacity;
    const zooms = props.zooms || this.zooms;
    const res = {};
    res.maxWidth = 0;
    res.id = layer.id;
    zooms.forEach((zoom) => {
      const parsedWidth = this.parseNumber(layer, width, zoom);
      if (parsedWidth > res.maxWidth) {
        res.maxWidth = parsedWidth;
      }
      res[zoom] = {
        width: isNaN(parsedWidth) ? 0 : parsedWidth,
        color: this.parseColor(layer, color, zoom),
        opacity: this.parseNumber(layer, opacity, zoom),
      };
    });
    return res;
  }
  borderStyleFromCasing(casing, base, zoom) {
    if (!casing || !base || !casing[zoom] || !base[zoom]) {
      return '';
    }
    const width = Math.max((casing[zoom].width - base[zoom].width) / 2, 0);
    return (
      'border-top-width:' +
      width +
      'px;' +
      'border-bottom-width:' +
      width +
      'px;' +
      'border-top-color:' +
      casing[zoom].color +
      ';' +
      'border-bottom-color:' +
      casing[zoom].color +
      ';' +
      'border-top-style:solid;' +
      'border-bottom-style:solid;'
    );
  }
}

export default new Taxonomy();