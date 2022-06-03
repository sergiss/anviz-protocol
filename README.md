# Anviz-protocol

Communication protocol with Anviz devices, implemented with javascript.

## Features:

<ul>
  <li>Real Time Mode (Record Events)</li>
  <li>Get/Set Device Id</li>
  <li>Get/Set Device Info1</li>
  <li>Get/Set Device Info2</li>
  <li>Get Serial Number</li>
  <li>Get/Set Date Time</li>
  <li>Get Record Information</li>
  <li>Get Records</li>
  <li>CLEAR_RECORDS</li>
  <li>Get/Set User Info</li>
  <li>Get/Set FP Template</li>
  <li>Open Lock</li>
</ul>

### How to use:
```
    const { Device, UserInfo } = require("./index.js");

    const host = '192.168.0.110'; // Device IP
    var device = new Device(host);

    device.listener = {

        onRecord: (record)=> {
            console.log(record);
            console.log(new Date(record.dateTime));
            device.clearAllRecordsSign();
            device.openLock();
        },

        onError: (e)=> {
            console.log(e);
        },

        onConnectionLost: () => {
            console.log("Connection lost");
        }

    }

    device.connect();

    device.getSerialNumber((serialNumber)=> {
        console.log("Serial: " + serialNumber);
    });

    // Set local date time
    device.setDateTime(new Date());

    device.getRecordInformation((info)=> {
        // console.log(info);
    });

    device.getDeviceInfo1((info)=> {
        info.volume = 0;
        // info.language = 4; // 4 spanish
        device.setDeviceInfo1(info);
    });

    device.getDeviceInfo2((info)=> {
        // console.log(info);
        info.realTimeModeSetting = 1; // enable real time mode
        info.relayMode  = 3; // 0 control lock, 1 scheduled bell, 3 disabled
        info.lockDelay  = 2; // 2 seconds
        device.setDeviceInfo2(info);
        // Notify records
        device.getNewRecords((records)=> {
            for(let i = 0; i < records.length; ++i) {
                device.listener.onRecord(records[i]);
            }
            device.clearAllRecordsSign();
        });
        
    });
```