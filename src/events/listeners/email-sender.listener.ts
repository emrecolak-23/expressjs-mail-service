import { v4 as uuidv4 } from "uuid";
import { Channel, ConsumeMessage } from "amqplib";
import { Listener } from "./base.listener";
import { EventType } from "./event.types";
import { ExceptionHandlerPublisher } from "../publishers/exception-handler.publisher";
import { replacePlaceHolder } from "../../utils/helpers";
import Mailer from "../../services/Mailer";

enum Channels {
  EMAIL_SEND = "mail-sender",
  ADMIN_NOTIFICATION = "AdminNotification",
}

export enum UserType {
  INMIDI = "INMIDI",
  ISTEYIM = "ISTEYIM",
}

interface Message {
  destination: string[];
  language: string;
  type: string;
  properties: any;
  userType: UserType;
}

export class EmailSender extends Listener {
  queueName = Channels.EMAIL_SEND;
  constructor(
    channel: Channel,
    private consulClient: any,
    private emailService: any
  ) {
    super(channel);
  }

  async onMessage(data: EventType["body"], type: string, msg: ConsumeMessage) {
    try {
      const defaultLanguage = process.env.DEFAULT_LANGUAGE || "en";

      const message = JSON.parse(msg?.content.toString());
      let kvConfig = `config/MailService/${message.type}/${message.language}`;
      let consulMailTemplate: any;
      consulMailTemplate = await this.consulClient.kv.get(kvConfig);
      if (!consulMailTemplate) {
        kvConfig = `config/MailService/${message.type}/${defaultLanguage}`;
        console.log(kvConfig);
        consulMailTemplate = await this.consulClient.kv.get(kvConfig);
        if (!consulMailTemplate) {
          throw new Error(
            `config/MailService/${message.type}/${message.language} TEMPLATE bulunamadı`
          );
        }
      }
      const emailTemplate = consulMailTemplate.Value;
      const templateReplaced = replacePlaceHolder(
        emailTemplate,
        message.properties
      );
      console.log(message, "message");
      // const emailResponse = await this.emailService.sendEmail(
      //   message.destination,
      //   templateReplaced,
      //   message.userType
      // );

      const mailer = new Mailer(
        message.userType === UserType.INMIDI
          ? `inmidi.de wissen`
          : `isteyim.com bilgi`,
        message.destination,
        message.userType === UserType.INMIDI
          ? `inmidi.de wissen`
          : `isteyim.com bilgi`,
        templateReplaced
      );

      await mailer.send();

      console.log(mailer, "response email sent");
      this.channel!.ack(msg);
    } catch (err3: any) {
      console.log(err3, "email sent error");
      this.handleErrors(type, msg, err3);
    }
  }

  async handleErrors(type: string, msg: ConsumeMessage, error: Error) {
    new ExceptionHandlerPublisher(this.channel).publish({
      messageId: uuidv4(),
      body: {
        type,
        destination: process.env.CONSUL_SERVICE,
        exception: error.message,
        body: JSON.stringify(msg),
      },
      source: "exception-handler-service",
    });
    this.channel!.nack(msg, false, false);
  }
}
