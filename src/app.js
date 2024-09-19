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
// import express from "express";
const consul_1 = require("./config/consul");
const dotenv_1 = __importDefault(require("dotenv"));
const Aws_Mailer_1 = __importDefault(require("./services/Aws-Mailer"));
const email_sender_listener_1 = require("./events/listeners/email-sender.listener");
const rabbit_1 = require("./config/rabbit");
const path_1 = __importDefault(require("path"));
if (process.env.NODE_ENV !== "production") {
    dotenv_1.default.config({ path: path_1.default.join(__dirname, "..", ".env.local") });
}
else {
    dotenv_1.default.config();
}
// const app = express();
// const PORT = process.env.PORT || 3000;
// const defaultLanguage = process.env.DEFAULT_LANGUAGE || "en";
// enum Channels {
//   EMAIL_SEND = "mail-sender",
//   ADMIN_NOTIFICATION = "AdminNotification",
// }
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Starting mail service");
    if (!process.env.AMQP_URI) {
        throw new Error("AMQP_URI must be defined");
    }
    if (!process.env.CONSUL_URL) {
        throw new Error("CONSUL_URL must be defined");
    }
    if (!process.env.CONSUL_SERVICE) {
        throw new Error("CONSUL_SERVICE must be defined");
    }
    const AMQP_URI = process.env.AMQP_URI;
    const consulHost = process.env.CONSUL_URL;
    const consulService = process.env.CONSUL_SERVICE;
    const consulInstance = consul_1.ConsulInstance.getInstance(consulService, consulHost);
    yield consulInstance.registerService();
    const consulClient = consulInstance.getConsulClient();
    yield rabbit_1.rabbitMQ.connect(AMQP_URI);
    const channel = rabbit_1.rabbitMQ.getChannel();
    const emailService = Aws_Mailer_1.default.getInstance();
    new email_sender_listener_1.EmailSender(channel, consulClient, emailService).subscribe();
    // app.listen(PORT, () => {
    //   console.log(`Mail service is running on port ${PORT}`);
    // });
});
// app.post("/test-email", async (req, res) => {
//   const mailer = new Mailer(
//     "test",
//     ["emfi@isteyim.com", "sinan.gcp@gmail.com"],
//     "test",
//     "<h1>Yessss</h1>"
//   );
//   await mailer.send();
//   res.send("Email sent");
// });
start();
