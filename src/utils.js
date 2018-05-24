//
// toJsProp
//

/**
 * @mixin Backed
 * @module utils
 * @export toJsProp
 *
 * some-prop -> someProp
 *
 * @param {string} string The content to convert
 * @return {string} string
 */
export const toJsProp = string => {
  let parts = string.split('-');
  if (parts.length > 1) {
    var upper = parts[1].charAt(0).toUpperCase();
    string = parts[0] + upper + parts[1].slice(1).toLowerCase();
  }
  return string;
}
/**
* Replaces all accented chars with regular ones
*/
const replaceAccents = string => {
  // verifies if the String has accents and replace them
  if (string.search(/[\xC0-\xFF]/g) > -1) {
      string = string
              .replace(/[\xC0-\xC5]/g, "A")
              .replace(/[\xC6]/g, "AE")
              .replace(/[\xC7]/g, "C")
              .replace(/[\xC8-\xCB]/g, "E")
              .replace(/[\xCC-\xCF]/g, "I")
              .replace(/[\xD0]/g, "D")
              .replace(/[\xD1]/g, "N")
              .replace(/[\xD2-\xD6\xD8]/g, "O")
              .replace(/[\xD9-\xDC]/g, "U")
              .replace(/[\xDD]/g, "Y")
              .replace(/[\xDE]/g, "P")
              .replace(/[\xE0-\xE5]/g, "a")
              .replace(/[\xE6]/g, "ae")
              .replace(/[\xE7]/g, "c")
              .replace(/[\xE8-\xEB]/g, "e")
              .replace(/[\xEC-\xEF]/g, "i")
              .replace(/[\xF1]/g, "n")
              .replace(/[\xF2-\xF6\xF8]/g, "o")
              .replace(/[\xF9-\xFC]/g, "u")
              .replace(/[\xFE]/g, "p")
              .replace(/[\xFD\xFF]/g, "y");
  }

  return string;
}

const removeNonWord = string => string.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, '');

const WHITE_SPACES = [
    ' ', '\n', '\r', '\t', '\f', '\v', '\u00A0', '\u1680', '\u180E',
    '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006',
    '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F',
    '\u205F', '\u3000'
];

/**
* Remove chars from beginning of string.
*/
const ltrim = (string, chars) => {
  chars = chars || WHITE_SPACES;

  var start = 0,
      len = string.length,
      charLen = chars.length,
      found = true,
      i, c;

  while (found && start < len) {
      found = false;
      i = -1;
      c = string.charAt(start);

      while (++i < charLen) {
          if (c === chars[i]) {
              found = true;
              start++;
              break;
          }
      }
  }

  return (start >= len) ? '' : string.substr(start, len);
}

/**
* Remove chars from end of string.
*/
const rtrim = (string, chars) => {
  chars = chars || WHITE_SPACES;

  var end = string.length - 1,
      charLen = chars.length,
      found = true,
      i, c;

  while (found && end >= 0) {
      found = false;
      i = -1;
      c = string.charAt(end);

      while (++i < charLen) {
          if (c === chars[i]) {
              found = true;
              end--;
              break;
          }
      }
  }

  return (end >= 0) ? string.substring(0, end + 1) : '';
}

/**
 * Add space between camelCase text.
 */
const unCamelCase = string => {
  string = string.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2');
  string = string.toLowerCase();
  return string;
}

/**
 * Remove white-spaces from beginning and end of string.
 */
export const trim = (string, chars) => {
  chars = chars || WHITE_SPACES;
  return ltrim(rtrim(string, chars), chars);
}

/**
 * Convert to lower case, remove accents, remove non-word chars and
 * replace spaces with the specified delimeter.
 * Does not split camelCase text.
 */
export const slugify = (string, delimeter) => {
  if (delimeter == null) {
      delimeter = "-";
  }

  string = replaceAccents(string);
  string = removeNonWord(string);
  string = trim(string) //should come after removeNonWord
          .replace(/ +/g, delimeter) //replace spaces with delimeter
          .toLowerCase();
  return string;
}

/**
* Replaces spaces with hyphens, split camelCase text, remove non-word chars, remove accents and convert to lower case.
*/
export const hyphenate = string => {
  string = unCamelCase(string);
  return slugify(string, "-");
}

//
// merge
//

/**
 * @mixin Backed
 * @module utils
 * @export merge
 *
 * some-prop -> someProp
 *
 * @param {object} object The object to merge with
 * @param {object} source The object to merge
 * @return {object} merge result
 */
export const merge = (object = {}, source = {}) => {
  // deep assign
  for (const key of Object.keys(object)) {
    if (source[key]) {
      Object.assign(object[key], source[key]);
    }
  }
  // assign the rest
  for (const key of Object.keys(source)) {
    if (!object[key]) {
      object[key] = source[key];
    }
  }
  return object;
}

//
// loadScript
//

/**
 * @mixin Backed
 * @module utils
 * @export loadScript
 *
 * defer handles loading after the document is parsed, async loads while parsing
 *
 * @param {string} src link/path to the script to load
 * @param {string} method default: 'async',  options: `defer, async, ''`
 * @param {string} type default: undefined,  options: `module, utf-8, ...`
 * @return {object} merge result
 */
 export const loadScript = (src, method = 'async', type) => {
   return new Promise((resolve, reject) => {
     let script = document.createElement('script');
     script.setAttribute(method, '');
     if (type) script.setAttribute('type', type);
     script.onload = result => {
       resolve(result);
     }
     script.onerror = error => {
       reject(error);
     }
     script.src = src;
     document.body.appendChild(script);
   });
 }

 /**
  * @mixin utils
  * @export loadModule
  *
  * defer handles loading after the document is parsed, async loads while parsing
  *
  * @param {string} src link/path to the module to load
  * @param {string} method default: 'async',  options: `defer, async, ''`
  * @return {promise}
  */
  export const loadModule = (src, method = 'async') => {
    return loadScript(src, method, 'module');
  }

 //
 // fireEvent
 //

 /**
  * @mixin backed
  * @module utils
  * @export fireEvent
  *
  * @param {string} type Name of the event
  * @param {HTMLElement} target context
  * @param {string|boolean|number|object|array} detail
  */
 export const fireEvent = (type='', detail=null, target=HTMLElement) => {
   target.dispatchEvent(new CustomEvent(type, {detail: detail}));
 };


 let sheduled = false;
 const afterRenderQue = [];
 const beforeRenderQue = [];

 const callMethod = array => {
   const context = array[0];
   const callback = array[1];
   const args = array[2];
   try {
     callback.apply(context, args);
   } catch(e) {
     setTimeout(() => {
       throw e;
     })
   }
 };

 const flushQue = que => {
   while (que.length) {
     callMethod(que.shift);
   }
 };

 const runQue = que => {
   for (let i=0, l=que.length; i < l; i++) {
     callMethod(que.shift());
   }
   sheduled = false;
 }

 const shedule = () => {
   sheduled = true;
   requestAnimationFrame(() => {
     flushQue(beforeRenderQue);
     setTimeout(() => {
       runQue(afterRenderQue);
     });
   });
 };

 export const RenderStatus = (() => {
   window.RenderStatus = window.RenderStatus || {
     afterRender: (context, callback, args) => {
       if (!sheduled) {
         shedule();
       }
       afterRenderQue.push([context, callback, args]);
     },
     beforeRender: (context, callback, args) => {
       if (!sheduled) {
         shedule();
       }
       beforeRenderQue.push([context, callback, args]);
     }
   }
 })();

 export const shouldRegister = name => {
   return customElements.get(name) ? false : true;
 }

 export const define = klass => {
   const name = hyphenate(klass.name);
   return shouldRegister(name) ? customElements.define(name, klass) : '';
 }
