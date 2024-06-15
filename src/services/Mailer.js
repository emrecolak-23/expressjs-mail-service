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
const mail_1 = __importDefault(require("@sendgrid/mail"));
const sendgridKey = process.env.SEND_GRID_KEY;
const fromEmail = {
    name: "Isteyim.com Destek",
    email: "info@isteyim.com"
};
class Mailer {
    constructor(subject, recipients, content, html) {
        this.subject = subject;
        this.recipients = recipients;
        this.content = content;
        this.html = html;
        this.from_email = fromEmail;
        this.subject = subject;
        this.body = content;
        this.recipients = recipients;
        this.html = html;
    }
    send() {
        return __awaiter(this, void 0, void 0, function* () {
            mail_1.default.setApiKey(sendgridKey);
            yield mail_1.default.send({
                to: this.recipients,
                from: this.from_email,
                subject: this.subject,
                text: this.content,
                html: this.html
            });
        });
    }
}
exports.default = Mailer;
