import WebFont from 'webfontloader';

export class Fonts {
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
