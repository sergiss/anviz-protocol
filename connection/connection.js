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

const net = require('net');
const { Message } = require('./message');
const { Record } = require('../model/record');
const { getInt16BigEndian, getInt32BigEndian, getInt16LittleEndian, setInt32BigEndian, setInt16BigEndian, setInt16LittleEndian } = require('../utils/bitwise-utils');
const { calculateChecksum } = require('../utils/crc16');
const {toString} = require('../utils/utils');
const { connected } = require('process');

class Connection {

    static STX = 0xA5; // START TEXT

    static ACK_SUCCESS = 0x0;

    constructor(host, port) {
        this.host = host;
        this.port = port;

        this.buffer = Buffer.from([]);
    }

    connect = ()=> {
        
        this.disconnect();

        this.queue = [];

        this.busy = false;

        const socket = new net.Socket();
        socket.on('error', (e) => {
            if(this.isConnected()) {
                this.disconnect();
                this.listener.onError(e);
            }
        });

        socket.on('close', ()=> {
            if(this.isConnected()) {
                this.disconnect();
                this.listener.onConnectionLost(new Error("Connection closed"));
            }
        });

        socket.on("data", (data)=> {
            this.buffer = this.handleData(Buffer.concat([this.buffer, data]));
        });

        socket.connect({ port: this.port, host: this.host });

        this.socket = socket;

    }

    handleData = (buffer)=> {

        while(buffer.length > 9) {
            if(buffer[0] != Connection.STX ) {
                buffer = buffer.slice(1); // ignore byte index 0
            } else {
                // LEN （data length） 2 Byte
                const len = getInt16BigEndian(buffer, 7) + 11; 
                if(buffer.length  < len) {
                    break; // wait for data
                }
                this._handleResponse(buffer.slice(0, len));
                buffer = buffer.slice(len, buffer.length); // remove frame
            }
        }

        return buffer; // return data
    }

    _handleResponse = (data)=> {

        const n = data.length - 2;
        let crc1 = calculateChecksum(data, n);
		let crc2 = getInt16LittleEndian(data, n) & 0xFFFF;
		if(crc1 != crc2) {
			const message = "Invalid Checksum: " + toString(data, 0, data.length);
			this.listener.onError(new Error(message));
		} else {

            const message = new Message();
            message.deviceCode = getInt32BigEndian(data, 1);
            message.command = data[5] - 0x80;
            message.returnValue = data[6];
            message.data = data.slice(9, n);
    
            if((message.command & 0xFF) == 0x5F) { // RealTime mode
                const record = Record.valueOf(message.data, 0);
                record.deviceCode = message.deviceCode;
                this.listener.onRecord(record);
            } else {
                const cmd = this.queue.shift();
                const next = cmd.onResponse(message);
                if(next) {
                    this.queue.unshift(next);
                    this.socket.write(this.toBuffer(next));
                } else if(this.queue.length > 0) {
                    this.socket.write(this.toBuffer(this.queue[0]));
                } else {
                    this.busy = false;
                }
            }

        }

    }

    isConnected = ()=> {
        return this.socket != null; 
    }

    disconnect = ()=> {
        if(this.socket != null) {
            try {
                this.socket.destroy();
            } catch(e) { // ignore
            } finally {
                this.socket = null;
            }
        }
    }

    send = (cmd) => {
       this.queue.push(cmd);
       if(!this.busy) {
           this.busy = true;
           this.socket.write(this.toBuffer(cmd));
       }
    }

    getQueueInfo() {
        let value = [];
        for(let i = 0; i < this.queue.length; ++i) {
            value.push(this.getInfo(this.queue[i]));
        }
        return value;
    }

    getInfo(cmd) {
        return cmd.info + ':' + cmd.command;
    }

    toBuffer(cmd) {
		const data = cmd.data;
		const dataLen = data != null ? data.length : 0;
		const cmdData = Buffer.alloc(10 + dataLen);
		// STX
		cmdData[0] = Connection.STX;
		// CH （device code)
		setInt32BigEndian(cmdData, 1, cmd.deviceCode);
		// CMD （command)
		cmdData[5] = cmd.command;
		if(dataLen > 0) {
			// LEN (data length)
			setInt16BigEndian(cmdData, 6, dataLen);
			// DATA
            data.copy(cmdData, 8, 0, dataLen);
		}
		// CRC16
		const crc = calculateChecksum(cmdData, cmdData.length - 2); 
		setInt16LittleEndian(cmdData, cmdData.length - 2, crc);
		return cmdData;
	}

    /*print(b) {
        let str = "";
        for(let i = 0; i < b.length; ++i) {
            str += b[i] + ", ";
        }
        console.log(str);
    }*/

}

module.exports = { Connection };