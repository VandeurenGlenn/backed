 export default shouldRegister = name => {
   return customElements.get(name) ? false : true;
 }
