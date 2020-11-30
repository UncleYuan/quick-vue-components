export default function(config) {
  // if(process.env.ENV=="production"){
  // return "http://gateway.bsmdev.itsjsc.com:8898";
  // }
  // console.log(config);

  switch (location.port) {
    // case "9528":
    //   return "http://10.118.105.59:8897";
    case "9528":
      return "http://api-adminfront.bmspro.txy.itsjsc.com:8888/";
      // return "http://api-adminfront.bmsdev.itsjsc.com:8899";
    case "9529":
      return "http://api-adminfront.bmsdev2.itsjsc.com:8898";
      //   return "http://api-adminfront.bmsdev2.itsjsc.com:8898";

    case "8060":
      return "http://10.5.12.11:8897";

    default:
      return `http://api-${location.host}`;
  }
}
