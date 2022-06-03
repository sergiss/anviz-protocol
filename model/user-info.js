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

const { getInt16BigEndian, getInt32BigEndian, getLong40BigEndian, setInt16BigEndian, setInt32BigEndian, setLong40BigEndian } = require("../utils/bitwise-utils");
const { toString } = require("../utils/utils");

class UserInfo {

    constructor() {
        this.password = 0;
        this.passwordLength = 0;
        this.card = 0;
        this.dpt = 0;
        this.group = 0;
        this.attendanceMode = 0;
        this.enrollFpState = 0;
        this.keep = 0;
        this.specialMessage = 0;
    }

    getBytes(data, offset) {

        setLong40BigEndian(data, offset, this.userId);
		
		//result.passwordLength = (data[offset + 5] >> 4) & 0xF; 
		//int v1 = ((data[offset + 5] & 0xF) << 16) | getInt16BigEndian(data, offset + 6);
		//int v2 = data[offset + 27] << 12;
		
		data[offset + 5] = (this.passwordLength << 4) | ((this.password >> 16) & 0xF);
		setInt16BigEndian(data, offset + 6, this.password & 0xFFFF);
		setInt16BigEndian(data, offset + 27, this.password >> 12); // 8 bits
		
		setInt32BigEndian(data, offset + 8, this.card);

		for(let i = offset + 12, n = i + 19; i < n; ++i) { // Clear name bytes
            data[i] = 0;
        }
        
		if(this.name != null) { // set name bytes
            let index = offset + 12;
            let n = Math.min(index + 19, index + (this.name.length * 2 + 2));
            data[index++] = -2;
            data[index++] = -1;
            let i = 0;
            while(index < n) {
                data[index++] = 0;
                data[index++] = this.name.charCodeAt(i++);
            }
		}

		data[offset + 32] = this.dpt;
		data[offset + 33] = this.group;
		data[offset + 34] = this.attendanceMode;
		setInt16BigEndian(data, offset + 35, this.enrollFpState);
		data[offset + 38] = this.keep;
		data[offset + 39] = this.specialMessage;
    }

    static valueOf(data, offset) { // UNICODE version 
		const result = new UserInfo();
		result.userId = getLong40BigEndian(data, offset);
		result.passwordLength = (data[offset + 5] >> 4) & 0xF; 
        // The low 20bits of password is saved in Byte 6-8, high 8 bits saved in Byte28
		const v1 = (((data[offset + 5] & 0xF) << 16) | getInt16BigEndian(data, offset + 6));
		const v2 = data[offset + 27] << 12;
        result.password = v1 | v2;
		result.card = getInt32BigEndian(data, offset + 8);
        const d = data.slice(offset + 12, offset + 19);
		result.name = toString(data, offset + 12, offset + 31);
		result.dpt   = data[offset + 32];
		result.group = data[offset + 33];
		result.attendanceMode = data[offset + 34];
		result.enrollFpState = getInt16BigEndian(data, offset + 35);
		result.keep = data[offset + 38];
		result.specialMessage = data[offset + 39];
		return result;
	}

}

module.exports = {UserInfo};