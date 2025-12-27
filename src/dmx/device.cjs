const DmxAddress = require('./address.cjs')
const DmxDeviceTemplate = require('./device-template.cjs')

class DmxDevice {
  constructor({name, address, template=new DmxDeviceTemplate(), values={}}){
    this.name = name;
    this.address = new DmxAddress(address);
    this.template = template;
    this.values = values;  //Mapped by template.fields.name
  }

  getField(name){
    return this.template.getField(name);
  }

  getFieldNames(){
    var names=[];
    for(var idx in this.template.fields){
      names.push(idx);
    }
    return names;
  }

  /*update(){
    Dmx.emitter.emit('update.Device.'+this.name, this);
  }*/

  set(name, value, format='rgb'){
    console.log("Dmx.Device.setField() - " + name + ',' + value)
    f = this.getField(name);

    let newVal = value

    if(!Array.isArray(newVal)){
      console.log('computeValue', name, ' from', value)
      newVal = f.computeValue(value)
    }
    else if(value.length == f.bytes && f.format != null){
      console.log('formatValue', name, ' from', value)
      newVal = f.formatValue(value, format)
    }

    this.values[f.name] = [...newVal];

    //Dmx.emitter.emit('change.Device.'+this.name, {device:this, field:f});
  }
}

module.exports = DmxDevice