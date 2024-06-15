"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const AWS = __importStar(require("aws-sdk"));
const email_sender_listener_1 = require("../events/listeners/email-sender.listener");
class EmailService {
    static getInstance() {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }
    constructor() {
        this.SES_CONFIG = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_KEY,
            region: process.env.AWS_REGION,
        };
        this.AWS_SES = new AWS.SES(this.SES_CONFIG);
    }
    sendEmail(recipientEmail, templateReplaced, userType) {
        console.log(userType, "userType");
        const params = {
            Source: userType === email_sender_listener_1.UserType.INMIDI
                ? process.env.SOURCE_EMAIL_INMIDI
                : process.env.SOURCE_EMAIL,
            Destination: {
                ToAddresses: recipientEmail,
            },
            ReplyToAddresses: [],
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: templateReplaced,
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: userType === email_sender_listener_1.UserType.INMIDI
                        ? `inmidi.de wissen`
                        : `isteyim.com bilgi`,
                },
            },
        };
        return this.AWS_SES.sendEmail(params).promise();
    }
    sendTemplateEmailTest(recipientEmail, template, templateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Source: "info@isteyim.com",
                Template: template,
                Destination: {
                    ToAddresses: ["serkan.yildiz@isteyim.com"],
                },
                TemplateData: JSON.stringify({ id: "121314" }),
            };
            return this.AWS_SES.sendTemplatedEmail(params).promise();
        });
    }
}
exports.default = EmailService;
