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

const setLong40BigEndian = (data, offset, value) => {
    data[offset    ] = Number(BigInt(value) >> 32n);
    data[offset + 1] = value >> 24;
    data[offset + 2] = value >> 16;
    data[offset + 3] = value >> 8 ;
    data[offset + 4] = value;
}

const getLong40BigEndian = (data, offset) => {
    return data[offset] << 32 
        | (data[offset + 1] & 0xFF) << 24
        | (data[offset + 2] & 0xFF) << 16
        | (data[offset + 3] & 0xFF) << 8 
        | (data[offset + 4] & 0xFF);
}

const getInt32BigEndian = (data, offset) => {
    return data[offset] << 24 
        | (data[offset + 1] & 0xFF) << 16
        | (data[offset + 2] & 0xFF) << 8 
        | (data[offset + 3] & 0xFF);
}

const setInt32BigEndian = (data, offset, value) => {
    data[offset    ] = value >> 24;
    data[offset + 1] = value >> 16;
    data[offset + 2] = value >> 8;
    data[offset + 3] = value;
}

const getInt24BigEndian = (data, offset) => {
    return data[offset] << 16 
        | (data[offset + 1] & 0xFF) << 8 
        | (data[offset + 2] & 0xFF);
}

const setInt24BigEndian = (data, offset, value) => {
    data[offset    ] = value >> 16;
    data[offset + 1] = value >> 8;
    data[offset + 2] = value;
}

const getInt16BigEndian = (data, offset) => {
    return data[offset] << 8 | (data[offset + 1] & 0xFF);
}

const setInt16BigEndian = (data, offset, value) => {
    data[offset    ] = value >> 8;
    data[offset + 1] = value;
}

const getInt16LittleEndian = (data, offset) => {
    return (data[offset] & 0XFF) | (data[offset + 1] << 8);
}

const setInt16LittleEndian = (data, offset, value) => {
    data[offset    ] = value;
    data[offset + 1] = value >> 8;
}

module.exports = {getLong40BigEndian, setLong40BigEndian, getInt32BigEndian, setInt32BigEndian, getInt24BigEndian, setInt24BigEndian, getInt16BigEndian, setInt16BigEndian, getInt16LittleEndian, setInt16LittleEndian};