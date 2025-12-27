class DmxField {
  constructor({offset=0, bytes=1, chunkSize=1, name='', min=0, max=null, defaultVal=0, length=null, format=null}){
    this.offset = offset;
    this.bytes = bytes;
    this.chunkSize = chunkSize;
    this.name = name;
    this.min = min;
    this.default = defaultVal;
    this.max = (max != null) ? max : Math.pow(2, 8*this.bytes)-1;
    this.length = (length != null) ? length : undefined
    this.format = format

    this.nextOffset = ((length != null) ? (length * bytes) : bytes) + this.offset 
    //this.nextOffset = this.endOffset + 1*this.bytes + 1
  }

  formatValue(value, inputFormat='rgb'){
    if(this.format == null || value.length != this.bytes){
      console.error('formatValue() ERROR')
      throw new Error('formatValue error')
    }

    let newVal = new Array(this.bytes)

    for(i=0; i<this.bytes; i++){
      newVal[i] = value[ inputFormat.indexOf(this.format[i]) ]
    }

    return newVal
  }

  computeValue(value){
    if(value.length !== undefined && value.length > 0){
      return value;
    }

    if(value > 0.0 && value <= 1.0) {
      value = Math.round(value * f.max);
    }
    else{
      value = Math.round(value);
    }

    if(value < f.min){
      throw "value too low";
    }

    if(value > f.max){
      throw "value too high";
    }

    console.log(value);

    if(value === undefined || isNaN(value) || 'number' !== typeof value){
      console.warn('input type error', value)
      throw new Error('Unexpected input type/value')
    }

    var arr=new Array(this.bytes);
    for(var i=0; i<this.bytes; i++){
      arr[this.bytes - (1+i)] = (value >> i*8) & 255;
    }

    return arr;
  }
}

module.exports = DmxField
