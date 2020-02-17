import _ from 'lodash';
import { Diff } from 'diff';

function mergeObjects(base, ours, theirs) {
  const merged = {};
  const keys = _.union(_.keys(ours), _.keys(theirs));
  for (let key of keys) {
    const baseValue = base ? base[key] : undefined;
    const ourValue = ours ? ours[key] : undefined;
    const theirValue = theirs ? theirs[key] : undefined;
    const mergedValue = mergeValues(baseValue, ourValue, theirValue);
    if (mergedValue !== undefined) {
      merged[key] = mergedValue;
    }
  }
  return merged;
}

function mergeValues(base, ours, theirs) {
  if (_.isEqual(ours, theirs)) {
    // the same
    return _.cloneDeep(ours);
  } else if (_.isEqual(ours, base)) {
    // not changed in ours, use theirs
    return _.cloneDeep(theirs);
  } else if (_.isEqual(theirs, base)) {
    // not changed in theirs, use ours
    return _.cloneDeep(ours);
  } else {
    // conflict
    if (isObject(ours) && isObject(theirs)) {
      return mergeObjects(base, ours, theirs);
    } else if (typeof(ours) === 'string' || typeof(theirs) === 'string') {
      return mergeStrings(base, ours, theirs);
    } else {
      // favor theirs when conflicts can't be merged
      return theirs;
    }
  }
}

function mergeStrings(base, ours, theirs) {
  if (typeof(ours) !== 'string') {
    ours = '';
  }
  if (typeof(theirs) !== 'string') {
    theirs = '';
  }
  if (typeof(base) !== 'string') {
    base = '';
  }
  const diff = getDiff(ours, theirs)
  const ourDiff = getDiff(base, ours);
  const theirDiff = getDiff(base, theirs);

  const merged = [];
  let ourIndex = 0;
  let theirIndex = 0;
  for (let { before, after } of diff) {
    if (before !== after) {
      while (before.length > 0 || after.length > 0) {
        const ourToken = before.shift();
        const theirToken = after.shift();
        if (!findChange(ourIndex, ourDiff)) {
          // not changed in ours, use theirs
          merged.push(theirToken || '');
        } else if (!findChange(theirIndex, theirDiff)) {
          // not changed in theirs, use ours
          merged.push(ourToken || '');
        } else {
          // conflict--use theirs
          merged.push(theirToken || '');
        }
        if (ourToken !== undefined) {
          ourIndex++;
        }
        if (theirToken !== undefined) {
          theirIndex++;
        }
      }
    } else {
      while (before.length > 0) {
        const token = before.shift();
        merged.push(token);
        ourIndex++;
        theirIndex++;
      }
    }
  }
  return merged.join('');
}

function findChange(index, diff) {
  for (const { before, after } of diff) {
    if (index < after.length) {
      return (before !== after);
    } else {
      index -= after.length;
    }
  }
  return false;
}

class CustomDiffer extends Diff {
  tokenize(value) {
    return value.split(/(\S.+?[.!?])(?=\s+|$)/);
  }

  join(chars) {
    return chars;
  }
}

function getDiff(before, after) {
  const differ = new CustomDiffer;
  const segments = [];
  const diff = differ.diff(before, after);
  const empty = [];
  for (let { added, removed, value } of diff) {
    if (removed) {
      segments.push({ before: value, after: empty });
    } else if (added) {
      const lastSegment = segments[segments.length - 1];
      if (lastSegment && lastSegment.after === empty) {
        lastSegment.after = value;
      } else {
        segments.push({ before: empty, after: value });
      }
    } else {
      segments.push({ before: value, after: value });
    }
  }
  return segments;
}

function isObject(v) {
  return typeof(v) === 'object' && v.constructor === Object;
}

export {
  mergeObjects,
  mergeStrings,
};
