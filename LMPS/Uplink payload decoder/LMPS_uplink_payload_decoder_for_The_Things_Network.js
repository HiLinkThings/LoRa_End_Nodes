function decodeUplink(input) {
  var data = {};
  
  switch (input.fPort) {
    
    case 8:
      
      data.firmware_version = input.bytes[0];
      data.work_mode = input.bytes[1];
      data.sample_total_times = input.bytes[2];
      data.sample_intrval = input.bytes[3];//uints: min
      data.report_interval = (input.bytes[4] << 8) + input.bytes[5];//uints: sec
      data.rejoin_interval = input.bytes[6];//uints: min
      data.confirm_status = (input.bytes[7] >> 5) & 0x01;//1: confirm uplink, 0: unconfirm uplink
      data.confirm_retransmission_fcntup_increment = (input.bytes[7] >> 4) & 0x01;//1 means the retransmission uplink counter increase by 1
      data.max_confirm_uplink_retries = input.bytes[7] & 0x0F;
      data.linkadr_retransmission_fcntup_increment = (input.bytes[8] >> 4) & 0x01;//1 means the retransmission uplink counter increase by 1
      data.max_linkadr_nbtrans = input.bytes[8] & 0x0F;
      
    break;
  
	case 9:
	    
	  if(input.bytes[0] == 0xFF & input.bytes[1] == 0xFF)
	  {
	    data.uplink_type = "reply with an answer";
	  }
	  else
	    data.uplink_type = "unkonw payload";
	    
	break;
	
    case 10:
  
      data.work_mode = (input.bytes[0] >> 4) & 0x0F;
      data.battery_voltage = (((input.bytes[0] << 8) + input.bytes[1]) & 0x1FF) / 100;
      data.uplink_type = "real time data";
  
      if(data.work_mode == 1 && input.bytes.length == 7)
      {
        data.temperature_sht30 = (((input.bytes[2] & 0x80 ? input.bytes[2] - 0x100 : input.bytes[2]) << 8) + input.bytes[3]) / 100;
        data.relative_humidity_sht30 = input.bytes[4]/2;
      }
      else
        data.uplink_type = "unkonw payload";
    
    break;
  
    case 11:
  
      data.work_mode = (input.bytes[0] >> 4) & 0x0F;
      data.battery_voltage = (((input.bytes[0] << 8) + input.bytes[1]) & 0x1FF) / 100;
      data.uplink_type = "real time data";
  
      if(data.work_mode == 2 && input.bytes.length == 7)
      {
        data.temperature_ds18b20 = (((input.bytes[5] & 0x80 ? input.bytes[5] - 0x100 : input.bytes[5]) << 8) + input.bytes[6]) / 100;
      }
      else
        data.uplink_type = "unkonw payload";
    
    break;
  
    case 12:
  
      data.work_mode = (input.bytes[0] >> 4) & 0x0F;
      data.battery_voltage = (((input.bytes[0] << 8) + input.bytes[1]) & 0x1FF) / 100;
      data.uplink_type = "real time data";
  
      if(data.work_mode == 3 && input.bytes.length == 7)
      {
        data.door_status = input.bytes[0] & 0x08 ? "open" : "close";
        data.door_open_times = ((input.bytes[2] << 16) + (input.bytes[3] << 8) + input.bytes[4]);
      }
      else
        data.uplink_type = "unkonw payload";
    
    break;

    case 13:
  
      data.work_mode = (input.bytes[0] >> 4) & 0x0F;
      data.battery_voltage = (((input.bytes[0] << 8) + input.bytes[1]) & 0x1FF) / 100;
      data.uplink_type = "real time data";
  
      if(data.work_mode == 4)
      {
        data.collection = collectionUplink(input.bytes,2);
      }
      else
        data.uplink_type = "unkonw payload";
  
    break;
  
    case 14:
  
      data.work_mode = (input.bytes[0] >> 4) & 0x0F;
      data.battery_voltage = (((input.bytes[0] << 8) + input.bytes[1]) & 0x1FF) / 100;
      data.uplink_type = "real time data";
  
      if(data.work_mode == 5)
      {
        data.collection = collectionUplink(input.bytes,1);
      }
      else
        data.uplink_type = "unkonw payload";
  
    break;
  
    default:
    throw Error("unknown FPort");
  }
  
  return {
    data: data,
  };
}

function collectionUplink(bytes,type) {
  var temp = [],hum = [];
  var index = 0;
  
  if(type == 1)
  {
    for (var i = 2; i < bytes.length; i = i+2) {
      temp[index++] = (((bytes[i] & 0x80 ? bytes[i] - 0x100 : bytes[i]) << 8) + bytes[i+1]) / 100;
    }
    
    return {
      temperature: temp
    };
    
  }else
  {
    for (var j = 2; j < bytes.length; j = j+3) {
      hum[index] = bytes[j+2]/2;
      temp[index++] = (((bytes[j] & 0x80 ? bytes[j] - 0x100 : bytes[j]) << 8) + bytes[j+1]) / 100;
    }
    
    return {
      temperature: temp,
      humidity: hum
    };
  }
}