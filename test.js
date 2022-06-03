/*
 * Copyright (c) 2022, Sergio S.- sergi.ss4@gmail.com http://sergiosoriano.com
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *    	
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 */

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
    console.log(info);
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

device.getUserInfos((userInfos)=> {
    for(let i = 0; i < userInfos.length; ++i) {
        console.log(userInfos[i]);
       
    }
});

const createUser = (id, name, group, pwd) => {
    let userInfo = new UserInfo();
    userInfo.name = name;
    userInfo.userId = id;
    userInfo.group = group;
    userInfo.password = pwd;
    userInfo.passwordLength = pwd.length();
    device.setUserInfo(userInfo);
}

/** CREATE USER **/
// createUser(1, "Sergi", 1, "12345");

/** DELETE USER **/
// device.deleteUser(1);

/** get/set FINGERPRINT **/
/* device.getFpTemplate(1, 11, (data)=> { // Get FpTemplate
    device.deleteUser(1); // Remove user
    let userInfo = new UserInfo();
    userInfo.name = "Sergi2";
    userInfo.userId = 1;
    userInfo.group = 1;
    device.setUserInfo(userInfo); // create user
    device.setFpTemplate(1, 11, data); // Set FpTemplate
}); */

console.log('Press any key to exit');

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', ()=> {
    device.disconnect();
    console.log("Done!")
    process.exit(1);
});
