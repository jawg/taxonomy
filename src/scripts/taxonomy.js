import colorConverter from 'color-operations-ui/src/scripts/color-converter.js';
import { Expressions } from './expressions';
import { Fonts } from './fonts';

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
    const expression = this.expressions.asExpression(width);
    const interpolate = this.expressions.parseInterpolate(expression, zoom);
    if (interpolate) {
      if (interpolate.value) return interpolate.value;
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
    const expression = this.expressions.asExpression(color);
    const interpolate = this.expressions.parseInterpolate(expression, zoom);
    if (interpolate) {
      if (interpolate.value) return interpolate.value;
      const typeValueLower = colorConverter.getStringTypeAndValue(interpolate.lower);
      const typeValueUpper = colorConverter.getStringTypeAndValue(interpolate.upper);
      const outputLower =
        typeValueLower.type === 'rgb'
          ? typeValueLower.value
          : colorConverter[typeValueLower.type].rgb(typeValueLower.value);
      const outputUpper =
        typeValueUpper.type === 'rgb'
          ? typeValueUpper.value
          : colorConverter[typeValueUpper.type].rgb(typeValueUpper.value);
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
    return matches.map((match) => {
      let newLayer = {
        id: layer.id,
        name: match.name,
        metadata: layer.metadata,
        paint: {},
        layout: {},
      };
      Object.keys(layer.paint || {}).forEach((key) => {
        newLayer.paint[key] = this.expressions.renderMatch(layer.paint[key], match);
      });
      Object.keys(layer.layout || {}).forEach((key) => {
        newLayer.layout[key] = this.expressions.renderMatch(layer.layout[key], match);
      });
      return newLayer;
    });
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
  searchMatches(exp, matches, layer) {
    if (exp[0] === 'match') {
      let key = Array.isArray(exp[1]) ? exp[1].join(':') : exp[1];
      for (let i = 1; i < exp.length - 2; i = i + 2) {
        let name = Array.isArray(exp[i + 1]) ? exp[i + 1][0] : exp[i + 1];
        if (!matches.find((m) => m.name === name)) {
          matches.push({ name, [key]: name });
        }
      }
      let defaultName = `${layer.id}:default`;
      if (!matches.find((m) => m.name === defaultName)) {
        matches.push({ name: defaultName, [key]: defaultName });
      }
    } else if (exp[0] === 'step') {
      let key = Array.isArray(exp[1]) ? exp[1].join(':') : exp[1];
      if (key === 'zoom') {
        return;
      }
      if (!matches.find((m) => m.name === `${layer.id}:0`)) {
        matches.push({ name: `${layer.id}:0`, [key]: 0 });
      }
      for (let i = 2; i < exp.length - 2; i = i + 2) {
        let value = Array.isArray(exp[i + 1]) ? exp[i + 1][0] : exp[i + 1];
        if (!matches.find((m) => m.name === `${layer.id}:${value}`)) {
          matches.push({ name: `${layer.id}:${value}`, [key]: value });
        }
      }
    } else {
      exp.filter(Array.isArray).forEach((e) => this.searchMatches(e, matches, layer));
    }
  }
  autoGenerateMatches(layer) {
    if (layer.metadata['taxonomy:matches'] || Array.isArray(layer.metadata['taxonomy:matches'])) {
      return;
    }
    const matches = [];
    Object.keys(layer.paint || {}).forEach((key) => {
      if (Array.isArray(layer.paint[key])) {
        this.searchMatches(layer.paint[key], matches, layer);
      }
    });
    Object.keys(layer.layout || {}).forEach((key) => {
      if (Array.isArray(layer.layout[key])) {
        this.searchMatches(layer.layout[key], matches, layer);
      }
    });
    if (matches.length > 0) {
      layer.metadata['taxonomy:matches'] = matches;
    }
    return matches;
  }
  generateLayersWithMatches() {
    return (acc, layer) => {
      this.autoGenerateMatches(layer);
      if (!layer.metadata['taxonomy:matches'] || layer.metadata['taxonomy:matches'].length < 1) {
        acc.push(layer);
        return acc;
      }
      return acc.concat(this.renderMatches(layer, layer.metadata['taxonomy:matches']));
    };
  }
}

export default new Taxonomy();
