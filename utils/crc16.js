const table = [];
const polynomial = 0x8408;
for (let b = 0; b < 256; b++) {
    let crc = b;
    for (let i = 0; i < 8; i++) {
        crc = (crc >> 1) ^ ((crc & 1) == 1 ? polynomial : 0);
    }
    table[b] = 0xFFFF & crc;
}

const calculateChecksum = (data, len) => {
    let crc = 0xFFFF;
    for(let i = 0; i < len; ++i) {
        let b = data[i];
        crc = (crc >> 8) ^ table[(crc ^ b) & 0xFF];
    }
    return crc & 0xFFFF;
}

module.exports = {calculateChecksum};