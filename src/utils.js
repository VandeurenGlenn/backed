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
 * @return {object} merge result
 */
 export const loadScript = (src, method) => {
   return new Promise((resolve, reject) => {
     let script = document.createElement('script');
     script.setAttribute(method, '');
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
 export const fireEvent = (type='', detail=null, target=this) => {
   target.dispatchEvent(new CustomEvent(type, {detail: detail}));
 };
