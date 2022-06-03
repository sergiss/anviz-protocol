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

const { getInt24BigEndian, setInt24BigEndian } = require("../utils/bitwise-utils");

class DeviceInfo2 {

	getBytes(data, offset) {
		data[offset] = this.fingerprintPrecision;
		data[offset + 1] = this.wiegandHeadCode;
		data[offset + 2] = this.wieganOption;
		data[offset + 3] = this.workCodePermission;
		data[offset + 4] = this.realTimeModeSetting;
		data[offset + 5] = this.autoUpdateFpSetting;
		data[offset + 6] = this.relayMode;
		data[offset + 7] = this.lockDelay;
		setInt24BigEndian(data, offset + 8, this.memoryFullAlarm);
		data[offset + 11] = this.repeatAttendanceDelay;
		data[offset + 12] = this.doorSensorDelay;
		data[offset + 13] = this.scheduledBellDelay;
		data[offset + 14] = this.reserved;
	}

    static valueOf(data) {
        const deviceInfo = new DeviceInfo2();
		deviceInfo.fingerprintPrecision = data[0];
		deviceInfo.wiegandHeadCode = data[1];
		deviceInfo.wieganOption = data[2];
		deviceInfo.workCodePermission = data[3];
		deviceInfo.realTimeModeSetting = data[4];
		deviceInfo.autoUpdateFpSetting = data[5];
		deviceInfo.relayMode = data[6];
		deviceInfo.lockDelay = data[7];
		deviceInfo.memoryFullAlarm = getInt24BigEndian(data, 8);
		deviceInfo.repeatAttendanceDelay = data[11];
		deviceInfo.doorSensorDelay = data[12];
		deviceInfo.scheduledBellDelay = data[13];
		deviceInfo.reserved = data[14];
		return deviceInfo;
    }

}

module.exports = { DeviceInfo2 };