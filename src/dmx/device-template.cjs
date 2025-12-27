const { default: DmxField } = require("./field.cjs");

class DmxDeviceTemplate {
  constructor(options){
    this.fields = {};
    this.name = '';

    if(options){
      this.setupFields(options)
    }
  }

  setupFields(opts){
    if(!opts.fields || opts.fields.length == 0){
      return
    }

    for(let i=0; i < opts.fields.length; i++){

      this.addField(new DmxField( opts.fields[i] ))

    }
  }

  getField(name){
    if(this.fields[name] === undefined){
      //throw "No such field [" + name + "]";
      return undefined;
    }

    return this.fields[name];
  }

  addField(field){
    this.fields[field.name] = field;
    return this.fields[field.name];
  }
}

module.exports = DmxDeviceTemplate


