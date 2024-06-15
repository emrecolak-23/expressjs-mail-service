"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
class Amqblib {
    get connection() {
        if (!this._connection) {
            throw new Error("Cannot access Rabbit Mq channel before connecting");
        }
        return this._connection;
    }
    getChannel() {
        return this._channel;
    }
    connect(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this._connection = yield amqplib_1.default.connect(url);
                console.log("Connected to RabbitMQ");
                this._channel = yield this._connection.createChannel();
                return this._connection;
            }
            catch (err) {
                throw new Error("Connection to RabbitMQ failed");
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._channel) {
                yield this._channel.close();
            }
            if (this._connection) {
                yield this._connection.close();
            }
        });
    }
    checkRabbitMqConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield amqplib_1.default.connect(process.env.AMQP_URI);
            const channel = yield connection.createChannel();
            yield channel.assertQueue("test", { durable: true });
            yield channel.close();
            yield connection.close();
        });
    }
}
exports.rabbitMQ = new Amqblib();
