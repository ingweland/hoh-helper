import { BatchRequestDto } from "./generated/proto/batch_request_dto";
import getLogger from "./logger";

const logger = getLogger("proto-validator");

export class BatchRequestDtoValidator {
    private readonly allowedValues: Set<string>;

    constructor(allowedValues: string[]) {
        this.allowedValues = new Set(allowedValues);
    }

    public shouldProceed(base64Payload: string): boolean {
        try {
            const bytes = this.base64ToBytes(base64Payload);
            const decoded = BatchRequestDto.decode(bytes);

            return decoded.items?.some((item) => {
                const endpoint = item.endpoint.replace(/^\/+|\/+$/g, "");
                return this.allowedValues.has(endpoint);
            }) ?? false;
        } catch (error) {
            logger.error("Failed to decode batch request", error);
            return false;
        }
    }

    private base64ToBytes(base64: string): Uint8Array {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return bytes;
    }
}