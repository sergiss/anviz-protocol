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

const { getInt16BigEndian } = require("../utils/bitwise-utils");

class DeviceInfo1 {

	getBytes(data, offset) {
		data[offset] = ((this.communicationPassword >> 16) & 0xF) | ((this.communicationPasswordLength & 0xF) << 4);
		data[offset + 1] = (this.communicationPassword >> 8) & 0xFF;
		data[offset + 2] = this.communicationPassword & 0xFF;
		data[offset + 3] = this.sleepTime;
		data[offset + 4] = this.volume;
		data[offset + 5] = this.language;
		data[offset + 6] = this.timeFormat | ((this.dateFormat & 0xF) << 4);
		data[offset + 7] = this.attendanceState;
		data[offset + 8] = this.languageSetting;
	}

   static valueOf(data) {
		const deviceInfo = new DeviceInfo1();
		deviceInfo.firmwareVersion = data.toString('utf-8', 0, 8);
		deviceInfo.communicationPasswordLength = (data[8] >> 4) & 0xF; 
		const v1 = (data[8] & 0xF) << 16;
		const v2 = (getInt16BigEndian(data, 9) & 0xFFFF);
		deviceInfo.communicationPassword = v1 | v2;
		deviceInfo.sleepTime = data[11];
		deviceInfo.volume = data[12];
		deviceInfo.language = data[13];
		deviceInfo.timeFormat = data[14] & 0xF;
		deviceInfo.dateFormat = (data[14] >> 4) & 0xF;
		deviceInfo.attendanceState = data[15];
		deviceInfo.languageSetting = data[16];
		deviceInfo.commandVersion = data[17];
		return deviceInfo;
	}

}

module.exports = {DeviceInfo1};