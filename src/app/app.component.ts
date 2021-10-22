import { Component, VERSION } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  name = 'Angular ' + VERSION.major;
  diff2;

  ngOnInit(): void {
    let obj1 = { x: 1, y: 2, lastname: 'Williams' };
    let obj2 = { x: 1, firstname: 'Bob', lastname: 'Gar' };

    this.name = this.objectDiff(obj2, obj1);

    //this.diff2 = Array.from(Object.values(this.deepDiff(obj1, obj2)));
    this.diff2 = this.deepDiff(obj1, obj2);
  }

  objectDiff(object, base) {
    function changes(object, base) {
      const accumulator = {};
      Object.keys(base).forEach(key => {
        if (object[key] === undefined) {
          accumulator[`-${key}`] = base[key];
        }
      });
      return _.transform(
        object,
        (accumulator, value, key) => {
          if (base[key] === undefined) {
            accumulator[`+${key}`] = value;
          } else if (!_.isEqual(value, base[key])) {
            accumulator[key] =
              _.isObject(value) && _.isObject(base[key])
                ? changes(value, base[key])
                : value;
          }
        },
        accumulator
      );
    }
    return changes(object, base);
  }

  /**
   * Deep diff between two object-likes
   * @param  {Object} fromObject the original object
   * @param  {Object} toObject   the updated object
   * @return {Object}            a new object which represents the diff
   */
  deepDiff(fromObject, toObject) {
    const changes = {};

    const buildPath = (path, obj, key) =>
      _.isUndefined(path) ? key : `${path}.${key}`;

    const walk = (fromObject, toObject, path) => {
      for (const key of _.keys(fromObject)) {
        const currentPath = buildPath(path, fromObject, key);
        if (!_.has(toObject, key)) {
          changes[currentPath] = { from: _.get(fromObject, key) };
        }
      }

      for (const [key, to] of _.entries(toObject)) {
        const currentPath = buildPath(path, toObject, key);
        if (!_.has(fromObject, key)) {
          changes[currentPath] = { to };
        } else {
          const from = _.get(fromObject, key);
          if (!_.isEqual(from, to)) {
            if (_.isObjectLike(to) && _.isObjectLike(from)) {
              walk(from, to, currentPath);
            } else {
              changes[currentPath] = { from, to };
            }
          }
        }
      }
    };

    walk(fromObject, toObject, undefined);

    return changes;
  }
}
