import * as stream from 'stream';
import Frame from './frame';
import {logger} from '../../../utils/logger';
import {aesCbcEncryptBase64, aesCbcEncryptBase64Hex} from '../../../utils/aes';
import {KonnextConfig} from '../../../controller/model/konnextConfig';

const NS = 'zh:zstack:unpi:writer';

class Writer extends stream.Readable {
    public writeFrame(frame: Frame, konnextConfig: KonnextConfig): void {
        const buffer = frame.toBuffer();
        logger.debug(`--> frame [${[...buffer]}]`, NS);

        let msg:any = buffer;

        // 如果是需要加密，且加密模式为LOTENALL，则进行加密
        if(konnextConfig.isEncrypted === 1 && konnextConfig.encryptMode === 'LOTENALL') {
            msg = aesCbcEncryptBase64Hex(buffer.toString('hex'),konnextConfig.secretKey, konnextConfig.macAddress);
        }
        logger.debug(`--> zigbee-write [${msg}]`, NS);
        this.push(msg);
    }

    public writeBuffer(buffer: Buffer, konnextConfig: KonnextConfig): void {
        logger.debug(`--> buffer [${[...buffer]}]`, NS);

        let msg:any = buffer;

        // 如果是需要加密，且加密模式为LOTENALL，则进行加密
        if(konnextConfig.isEncrypted === 1 && konnextConfig.encryptMode === 'LOTENALL') {
            msg = aesCbcEncryptBase64Hex(buffer.toString('hex'),konnextConfig.secretKey, konnextConfig.macAddress);
        }
        logger.debug(`--> zigbee-write [${msg}]`, NS);
        this.push(msg);
    }

    public _read(): void {}
}

export default Writer;