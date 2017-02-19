'use strict';
import Pubsub from './pub-sub.js';
export default () => {
  window.PubSub = window.PubSub || new Pubsub();
}
