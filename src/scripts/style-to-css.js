const widthToPixel = (width) => {
  if (width !== undefined) {
    return `${width}px`;
  }
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
    style['border-top-width'] = widthToPixel(width);
    style['border-bottom-width'] = widthToPixel(width);
    style['border-top-color'] = casing['line-color'];
    style['border-bottom-color'] = casing['line-color'];
    style['border-top-style'] = 'solid';
    style['border-bottom-style'] = 'solid';
  }

  return style;
};
