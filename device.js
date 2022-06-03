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

const { Connection } = require("./connection/connection");
const { Message } = require("./connection/message");
const { DeviceInfo1 } = require("./model/device-info1");
const { DeviceInfo2 } = require("./model/device-info2");
const { Record } = require("./model/record");
const { RecordInformation } = require("./model/record-information");
const { UserInfo } = require("./model/user-info");
const { setInt32BigEndian, setLong40BigEndian } = require("./utils/bitwise-utils");

class Device extends Connection {

    constructor(host, port = 5010, deviceId = 0) { // When deviceId (CH) is 0，all devices connected will response to this command.
        super(host, port);
        this.deviceId = deviceId;
    }

    handleResponse = (cmd, callback)=> {
        cmd.onResponse = (response) => {
            if (response.command != cmd.command) {
                let message = `Command code mismatch, expected: ${cmd.command}, received: ${response.command}`;
                throw new Error(message);
            }
            if(response.returnValue != Connection.ACK_SUCCESS) {
                throw new Error("ACK Error: " + response.returnValue);
            }
            return callback(response);
        };
        this.send(cmd);
    }

    setDeviceId = (id) => {
        const cmd = new Message();
        cmd.info = 'setDeviceId';
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.SET_DEVICE_ID;
        const data = Buffer.alloc(4);
        setInt32BigEndian(data, 0, id);
        cmd.data = data;
        this.handleResponse(cmd, (response)=> {
            this.deviceId = id;
        });
    }

    getDeviceId = (callback)=> { // FIXME: there's no answer
		/*const cmd = new Message();
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.GET_DEVICE_ID;
        this.handleResponse(cmd, (response)=> {
            callback(getInt32BigEndian(response.data, 0));
        });*/
        if(callback) callback(this.deviceId);
        return this.deviceId;
    }

    getDeviceInfo1 = (callback) => {
		const cmd = new Message();
        cmd.info = 'getDeviceInfo1';
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.GET_DEVICE_INFO1;
        this.handleResponse(cmd, (response)=> {
            callback(DeviceInfo1.valueOf(response.data));
        });
	}

    setDeviceInfo1 = (deviceInfo) => {
        const cmd = new Message();
        cmd.info = 'setDeviceInfo1';
		cmd.deviceCode = this.deviceId;
        const data = Buffer.alloc(12);
        deviceInfo.getBytes(data, 0);
        cmd.data = data;
		cmd.command = Message.SET_DEVICE_INFO1;
        this.handleResponse(cmd, (response)=> {});
    }

    getDeviceInfo2 = (callback) => {
		const cmd = new Message();
        cmd.info = 'getDeviceInfo2';
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.GET_DEVICE_INFO2;
        this.handleResponse(cmd, (response)=> {
            callback(DeviceInfo2.valueOf(response.data));
        });
	}

    setDeviceInfo2 = (deviceInfo) => {
        const cmd = new Message();
        cmd.info = 'setDeviceInfo2';
		cmd.deviceCode = this.deviceId;
        const data = Buffer.alloc(15);
        deviceInfo.getBytes(data, 0);
        cmd.data = data;
		cmd.command = Message.SET_DEVICE_INFO2;
        this.handleResponse(cmd, (response)=> {});
    }

    getRecordInformation = (callback)=> {
        const cmd = new Message();
        cmd.info = 'getRecordInformation';
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.GET_RECORD_INFORMATION;
        this.handleResponse(cmd, (response)=> {
            callback(RecordInformation.valueOf(response.data));
        });
    }

    getAllRecords(callback) {
        this.getRecordInformation((info)=> {
            this._getRecords(0x1, info.allRecordAmount, callback);
        });
    }

    getNewRecords(callback) {
        this.getRecordInformation((info)=> {
            this._getRecords(0x2, info.newRecordAmount, callback);
        });
    }

    _getRecords = (mode, amount, callback)=> {
        
        const cmd = new Message();
        cmd.info = '_getRecords';
        cmd.deviceCode = this.deviceId;
        cmd.command = Message.GET_RECORDS;
        cmd.data = Buffer.from([mode, Math.min(amount, Message.MAX_RESULTS)]);
        
        let retries = 2;
        let records = [];

        const handler = (response)=> { 
            try {
                const count = response.data[0] & 0xFF; // valid records
                for(let i = 0; i < count; ++i) {
                    let offset = i * 14 + 1;
                    const record = Record.valueOf(response.data, offset);
                    record.deviceCode = response.deviceCode;
                    records.push(record);
                }
                amount -= count;
                if(count > 0 && amount > 0) {
                    retries = 2;
                    cmd.data[0] = 0x0; // Download normal;
                    cmd.data[1] = Math.min(amount, Message.MAX_RESULTS); 
                } else {
                    callback(records);
                    return null;
                }
            } catch(e) {
                if(retries === 0) throw e;
                retries--;
                cmd.data[0] = 0x10; // Send last packet again
            }
            // this.handleResponse(cmd, handler);
            return cmd;
        }
        this.handleResponse(cmd, handler);
  
    }

    clearAllRecords = (callback)=> {
        const cmd = new Message();
        cmd.info = 'clearAllRecords';
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.CLEAR_RECORDS;
        cmd.data = Buffer.from([0, 0, 0, 0]);
        this.handleResponse(cmd, (response)=> {
            const data = response.data;
            if(callback) callback(data[0] << 16 | (data[1] & 0xFF) << 8 | (data[2] & 0xFF));
        });
    }

    clearAllRecordsSign = (callback)=> {
        this.clearRecordsSign(0, callback);
    }

    /**
	 * Cancel all records, or cancel all/part new records sign
	 * @param amount 0 = all redords sign
	 */
    clearRecordsSign = (amount, callback)=>{
        let code;
		if(amount < 1) {
			amount = 0;
			code = 0x1; // all sign
		} else {
			code = 0x2; // amount sign
		}
		const cmd = new Message();
        cmd.info = 'clearRecordSign';
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.CLEAR_RECORDS;
        cmd.data = Buffer.from([code, (amount >> 16) & 0xFF, (amount >> 8) & 0xFF, amount & 0xFF]);

        this.handleResponse(cmd, (response)=> {
            const data = response.data;
            if(callback) callback(data[0] << 16 | (data[1] & 0xFF) << 8 | (data[2] & 0xFF));
        })
    }

    getSerialNumber = (callback) => {
		const cmd = new Message();
        cmd.info = 'getSerialNumber';
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.GET_SERIAL_NUMBER;
        this.handleResponse(cmd, (response)=> {
            callback(response.data.toString('utf8', 0, 16));
        });
	}

    openLock = ()=> {
        const cmd = new Message();
        cmd.info = 'openLock';
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.OPEN_LOCK;
        this.handleResponse(cmd, (response)=> {});
    }

    getDateTime = (callback) => {
		const cmd = new Message();
        cmd.info = 'getDateTime';
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.GET_DATE_TIME;
        this.handleResponse(cmd, (response)=> {
            const data = response.data;
            const millis = Date.UTC(
                (data[0] & 0xFF) + 2000, // YEAR
                data[1], // MONTH
                data[2], // DAY_OF_MONTH
                data[3], // HOUR_OF_DAY
                data[4], // MINUTE
                data[5], // SECOND
                0 // MILLISECOND
            );
            const date = new Date(millis);
            callback(date);
        });
    }

    setDateTime = (date) => {
        const cmd = new Message();
        cmd.info = 'setDateTime';
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.SET_DATE_TIME;
        const data = Buffer.alloc(6);
        data[0] = date.getFullYear() - 2000;
		data[1] = date.getMonth() + 1;
		data[2] = date.getDate();
		data[3] = date.getHours();
		data[4] = date.getMinutes();
		data[5] = date.getSeconds();
        cmd.data = data;
        this.handleResponse(cmd, (response)=> {});
    }

    /**
	 * Download fingerprint/face template from T&A device
	 * Note: The template information contains the userId, and cannot be used with a different id (setFpTemplate)
	 * @param userId
	 * @param backupCode 11 -> Facepass 7, 1 -> fingerprint
     */
    getFpTemplate = (userId, backupCode, callback)=> {
        const cmd = new Message();
        cmd.info = 'getFpTemplate';
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.GET_FP_TEMPLATE;
        const data = Buffer.alloc(6);
        setLong40BigEndian(data, 0, userId);
		data[5] = backupCode;
        cmd.data = data;
        this.handleResponse(cmd, (response)=> {
            callback(response.data);
        });
    }

    /**
	 * Upload fingerprint/face template to the T&A device
	 * Note: The template information contains the userId, and cannot be used with a different id.
	 * @param userId
	 * @param backupCode 11 -> Facepass 7, 1 -> fingerprint
	 * @param ftTemplate
     */
    setFpTemplate = (userId, backupCode, ftTemplate) => {
        const cmd = new Message();
        cmd.info = 'setFpTemplate';
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.SET_FP_TEMPLATE;
        const data = Buffer.alloc(6);
        setLong40BigEndian(data, 0, userId);
		data[5] = backupCode;
        cmd.data = Buffer.concat([data, ftTemplate]);
        this.handleResponse(cmd, (response)=> { });
    }

    getUserInfos = (callback)=> {

        const cmd = new Message();
        cmd.info = 'getUserInfos';
        cmd.deviceCode = this.deviceId;
        cmd.command = Message.GET_USER_INFO;
        cmd.data = Buffer.from([0x1, Message.MAX_RESULTS]); // 0x1 = Download Start
        
        let retries = 2;
        let records = [];

        const handler = (response)=> {
            try {
                const count = response.data[0] & 0xFF;
                for(let i = 0; i < count; ++i) {
                    let offset = i * 40 + 1;
                    const userInfo = UserInfo.valueOf(response.data, offset);
                    userInfo.deviceCode = response.deviceCode;
                    records.push(userInfo);
                }
                if(count > 0) {
                    retries = 2;
                    cmd.data[0] = 0x0; // Download normal;
                } else {
                    callback(records);
                    return null;
                }
            } catch(e) {
                if(retries === 0) throw e;
                retries--;
                cmd.data[0] = 0x10; // Send last packet again
            }
            // this.handleResponse(cmd, handler);
            return cmd;
        }
        this.handleResponse(cmd, handler);

    }

    deleteUser = (userId) => {
        const cmd = new Message();
        cmd.info = 'deleteUser';
        cmd.deviceCode = this.deviceId;
        cmd.command = Message.DELETE_USER;
        var data = Buffer.alloc(6); 
        setLong40BigEndian(data, 0, userId);
        data[5] = 0xFF;
        cmd.data = data;
        this.handleResponse(cmd, (response) => {});
    }

    setUserInfo = (userInfo) => {
        this.setUserInfos([userInfo]);
    }

    setUserInfos = (userInfos) => {
        for(let i = 0; i < userInfos.length;) {
			let j = Math.min(userInfos.length, i + 12); // sub list max 12 items
			this._setUserInfos(userInfos.slice(i, j));
			i = j;
		}
    }

    _setUserInfos(userInfos) {
        const cmd = new Message();
        cmd.info = '_setUserInfos';
		cmd.deviceCode = this.deviceId;
		cmd.command = Message.SET_USER_INFO;
        const n = userInfos.length;
		const data = Buffer.alloc(1 + n * 40);
		data[0] = n; // Information Num
		for (let i = 0; i < n; ++i) {
			const userInfo = userInfos[i];
			userInfo.getBytes(data, i * 40 + 1);
		}
		cmd.data = data;
        this.handleResponse(cmd, (response) => {});
    }

}

module.exports = { Device };