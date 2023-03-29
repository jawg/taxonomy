export class Expressions {
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
    return from.map(function (d, i) {
      return this.number(d, to[i], t);
    });
  }
  asExpression(exp) {
    if (Array.isArray(exp)) {
      return exp;
    }
    if (!exp.stops) {
      throw new Error(`${JSON.stringify(exp)} is not a correct expression`);
    }
    if (exp.base === 1 || exp.base === undefined) {
      return ['interpolate', ['linear'], ['zoom']].concat(exp.stops.reduce((acc, e) => acc.concat(e), []));
    }
    return ['interpolate', ['exponential', exp.base], ['zoom']].concat(exp.stops.reduce((acc, e) => acc.concat(e), []));
  }
  parseInterpolate(exp, value) {
    if (!exp || exp[0] !== 'interpolate' || exp.length < 4) {
      return null;
    }

    const base = exp[1][0] === 'exponential' ? exp[1][1] : 1;
    const stops = exp.slice(3).reduce((acc, e, i) => {
      i % 2 === 0 ? acc.push([e]) : acc[acc.length - 1].push(e);
      return acc;
    }, []);
    if (stops.length === 1 || stops[0][0] >= value) {
      return {
        value: stops[0][1],
      };
    } else if (stops[stops.length - 1][0] <= value) {
      return {
        value: stops[stops.length - 1][1],
      };
    }
    const index = this.findStopLessThanOrEqualTo(stops, value);
    return {
      lower: stops[index][1],
      upper: stops[index + 1][1],
      t: this.interpolationFactor(value, base, stops[index][0], stops[index + 1][0]),
    };
  }
  renderMatch(exp, match) {
    if (!Array.isArray(exp)) {
      return exp;
    }
    return this.decision(
      exp.map((e) => this.renderMatch(e, match)),
      match
    );
  }
  lookup(exp, match) {
    if (!Array.isArray(exp)) {
      return exp;
    }
    switch (exp[0]) {
      case 'at':
        return this.lookup(exp[2], match)[exp[1]];
      case 'get':
      case 'has':
      case '!has':
        return match[`${exp[0]}:${exp[1]}`];
      case 'in':
        return this.lookup(exp[2], match).indexOf(exp[1]) >= 0;
      case '!in':
        return this.lookup(exp[2], match).indexOf(exp[1]) < 0;
      case 'index-of':
        return this.lookup(exp[2], match).indexOf(exp[1]);
      case 'length':
        return this.lookup(exp[1], match).length;
      case 'slice':
        return this.lookup(exp[1], match).slice(exp[2], exp[3]);
    }
    return exp;
  }
  decision(exp, match) {
    if (!Array.isArray(exp)) {
      return exp;
    }
    switch (exp[0]) {
      case '!':
        return !this.lookup(exp[1], match);
      case '==':
        return this.lookup(exp[1], match) == exp[2];
      case '!=':
        return this.lookup(exp[1], match) != exp[2];
      case '>':
        return this.lookup(exp[1], match) > exp[2];
      case '<':
        return this.lookup(exp[1], match) < exp[2];
      case '>=':
        return this.lookup(exp[1], match) >= exp[2];
      case '<=':
        return this.lookup(exp[1], match) <= exp[2];
      case 'all':
        return exp.slice(1).every((e) => this.lookup(e, match) === true);
      case 'some':
        return exp.slice(1).any((e) => this.lookup(e, match) === true);
      case 'match': {
        for (let i = 2; i < exp.length - 2; i = i + 2) {
          if (exp[1] == exp[i] || (Array.isArray(exp[i]) && exp[1] == exp[i][0])) {
            return exp[i + 1];
          }
        }
        return exp[exp.length - 1];
      }
      case 'case': {
        for (let i = 1; i < exp.length - 2; i = i + 2) {
          if (exp[i] === true) {
            return exp[i + 1];
          }
        }
        return exp[exp.length - 1];
      }
      case 'step': {
        let value = exp[1];
        let res = exp[2];
        if (value < exp[3]) {
          return res;
        }
        for (let i = 3; i < exp.length; i = i + 2) {
          if (exp[i] >= value) {
            return exp[i + 1];
          }
        }
        return res;
      }
      case 'coalesce':
        return exp.slice(1).find((e) => e !== null && e !== undefined);
    }
    return this.lookup(exp, match);
  }
}
