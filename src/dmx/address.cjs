
class DmxAddress{
  constructor(options){
    this.universe = 0;
    this.offset = 0;

    if(options !== undefined && options != null){
      this.set(options);
    }
  }

  toString(){
    return this.universe + '.' + this.offset;
  }

  set(options){
    if(typeof options == 'string'){
      var tokens = options.split('.');
      if(tokens.length == 2){
        this.universe = parseInt(tokens[0]);
        this.offset = parseInt(tokens[1]);
      }
    }
    else{
      if(options.universe !== undefined){
        this.universe = options.universe;
      }

      if(options.offset !== undefined){
        this.offset = options.offset;
      }
    }
  }
}

module.exports = DmxAddress

