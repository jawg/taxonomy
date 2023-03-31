const widthToPixel = (width) => {
  if (width !== undefined) {
    return `${width}px`;
  }
};

const borderStyleFormatter = (style, border, width) => {
  style['border-top-width'] = widthToPixel(width);
  style['border-bottom-width'] = widthToPixel(width);
  style['border-top-color'] = border['line-color'];
  style['border-bottom-color'] = border['line-color'];
  style['border-top-style'] = 'solid';
  style['border-bottom-style'] = 'solid';
};

export const lineStyleFormatter = (line, casing) => {
  const style = {
    height: widthToPixel(line['line-width']),
    'background-color': line['line-color'],
    opacity: line['line-opacity'],
    width: '55px',
  };
  if (casing) {
    const width = Math.max((casing['line-width'] - line['line-width']) / 2, 0);
    borderStyleFormatter(style, casing, width);
  }

  return style;
};

export const polygonStyleFormatter = (polygon, casing) => {
  const style = {
    height: '100px',
    width: '100px',
    'background-color': polygon['fill-color'],
    'opacity': polygon['fill-opacity'],
  };
  if (casing) {
    borderStyleFormatter(style, casing, casing['line-width']);
  }
  return style;
};

export const symbolStyleFormatter = (symbol, fontProps, casing) => {
  const style = {
    'font-size': widthToPixel(symbol['text-width']),
    color: symbol['text-color'],
    'text-transform': symbol['text-transform'],
    'font-style': fontProps.style,
    'font-weight': fontProps.weight,
    'font-family': fontProps.family,
  };
  if (casing) {
    style['text-shadow'] = `0 0 ${widthToPixel(casing['text-width'])} ${casing['text-color']}`;
  }
  return style;
};
