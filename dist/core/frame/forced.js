import sleep from "../frame/sleep.js";
import LoggerFactory from "@core/frame/logger/LoggerFactory";
import LogType from "@core/frame/logger/LogType";
export default async function forced(fun, interval = 250) {
    while (true) {
        try {
            return await fun();
        }
        catch (error) {
            const logger = LoggerFactory.createLogger(LogType.ERROR, `FORCED`);
            logger.log(error);
        }
        await sleep(interval);
    }
}
