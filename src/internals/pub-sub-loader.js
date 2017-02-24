'use strict';
import Pubsub from './pub-sub.js';
export default isNode => {
  if (isNode) {
    global.PubSub =  global.PubSub || new Pubsub();
  } else {
    window.PubSub = window.PubSub || new Pubsub();
  }
}
