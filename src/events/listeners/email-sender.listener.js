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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSender = exports.UserType = void 0;
const uuid_1 = require("uuid");
const base_listener_1 = require("./base.listener");
const exception_handler_publisher_1 = require("../publishers/exception-handler.publisher");
const helpers_1 = require("../../utils/helpers");
var Channels;
(function (Channels) {
    Channels["EMAIL_SEND"] = "mail-sender";
    Channels["ADMIN_NOTIFICATION"] = "AdminNotification";
})(Channels || (Channels = {}));
var UserType;
(function (UserType) {
    UserType["INMIDI"] = "INMIDI";
    UserType["ISTEYIM"] = "ISTEYIM";
})(UserType || (exports.UserType = UserType = {}));
class EmailSender extends base_listener_1.Listener {
    constructor(channel, consulClient, emailService) {
        super(channel);
        this.consulClient = consulClient;
        this.emailService = emailService;
        this.queueName = Channels.EMAIL_SEND;
    }
    onMessage(data, type, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const defaultLanguage = process.env.DEFAULT_LANGUAGE || "en";
                const message = JSON.parse(msg === null || msg === void 0 ? void 0 : msg.content.toString());
                let kvConfig = `config/MailService/${message.type}/${message.language}`;
                console.log(kvConfig);
                let consulMailTemplate;
                consulMailTemplate = yield this.consulClient.kv.get(kvConfig);
                if (!consulMailTemplate) {
                    kvConfig = `config/MailService/${message.type}/${defaultLanguage}`;
                    console.log(kvConfig);
                    consulMailTemplate = yield this.consulClient.kv.get(kvConfig);
                    if (!consulMailTemplate) {
                        throw new Error(`config/MailService/${message.type}/${message.language} TEMPLATE bulunamadı`);
                    }
                }
                const emailTemplate = consulMailTemplate.Value;
                const templateReplaced = (0, helpers_1.replacePlaceHolder)(emailTemplate, message.properties);
                console.log(message, "message");
                yield this.emailService.sendEmail(message.destination, templateReplaced, message.userType);
                this.channel.ack(msg);
            }
            catch (err3) {
                this.handleErrors(type, msg, err3);
            }
        });
    }
    handleErrors(type, msg, error) {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(error);
            this.channel.nack(msg, false, false);
            new exception_handler_publisher_1.ExceptionHandlerPublisher(this.channel).publish({
                messageId: (0, uuid_1.v4)(),
                body: {
                    type,
                    destination: process.env.CONSUL_SERVICE,
                    exception: error.message,
                    body: JSON.stringify(msg),
                },
                source: "exception-handler-service",
            });
        });
    }
}
exports.EmailSender = EmailSender;
