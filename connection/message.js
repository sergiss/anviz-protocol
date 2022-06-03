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

class Message {

    static MAX_RESULTS = 0x8;
	
	static GET_DEVICE_ID = 0x74;
	static SET_DEVICE_ID = 0x75;
	
	static GET_DEVICE_INFO1  = 0x30; // Get the information of T&A device 1
	static SET_DEVICE_INFO1  = 0x31; // Set the configure information of T&A 1
	static GET_DEVICE_INFO2  = 0x32; // Get the information of T&A device 2
	static SET_DEVICE_INFO2  = 0x33; // Set the configure information of T&A 2
	static GET_SERIAL_NUMBER = 0x24;
	
	static GET_DATE_TIME = 0x38; // Get the date and time of T&A
	static SET_DATE_TIME = 0x39; // Set the date and time of T&A
	
	static GET_RECORD_INFORMATION = 0x3C;
	
	static GET_RECORDS   = 0x40;
	static CLEAR_RECORDS = 0x4E;

	static GET_USER_INFO = 0x72;
	static SET_USER_INFO = 0x73;
	static DELETE_USER   = 0x4C;
	
	static GET_FP_TEMPLATE = 0x44;
	static SET_FP_TEMPLATE = 0x45;
		
	static OPEN_LOCK = 0x5E;

    constructor() {

    }

}

module.exports = { Message };