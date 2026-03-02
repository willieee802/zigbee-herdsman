import * as stream from "node:stream";

import {logger} from "../../../utils/logger";
import type {Frame} from "./frame";
import {aesCbcEncryptBase64, aesCbcEncryptBase64Hex} from '../../../utils/aes';
import {KonnextConfig} from '../../../controller/model/konnextConfig';

const NS = "zh:zstack:unpi:writer";

export class Writer extends stream.Readable {
    public writeFrame(frame: Frame, konnextConfig: KonnextConfig): void {
        const buffer = frame.toBuffer();
        logger.debug(`--> frame [${[...buffer]}]`, NS);
        let msg:any = buffer;

        // 如果是需要加密，且加密模式为LOTENALL，则进行加密
        if(konnextConfig.isEncrypted === 1 && konnextConfig.encryptMode === 'LOTENALL' && konnextConfig.secretKey && konnextConfig.macAddress) {
            msg = aesCbcEncryptBase64Hex(buffer.toString('hex'),konnextConfig.secretKey, konnextConfig.macAddress);
        }
        logger.debug(`--> zigbee-write [${msg}]`, NS);
        this.push(msg);
    }

    public writeBuffer(buffer: Buffer, konnextConfig: KonnextConfig): void {
        logger.debug(`--> buffer [${[...buffer]}]`, NS);
        let msg:any = buffer;

        // 如果是需要加密，且加密模式为LOTENALL，则进行加密
        if(konnextConfig.isEncrypted === 1 && konnextConfig.encryptMode === 'LOTENALL' && konnextConfig.secretKey && konnextConfig.macAddress) {
            msg = aesCbcEncryptBase64Hex(buffer.toString('hex'),konnextConfig.secretKey, konnextConfig.macAddress);
        }
        logger.debug(`--> zigbee-write [${msg}]`, NS);
        this.push(msg);
    }

    public override _read(): void {}
}
