import { v4 as uuidv4 } from "uuid";
import { Channel, ConsumeMessage } from "amqplib";
import { Listener } from "./base.listener";
import { EventType } from "./event.types";
import { ExceptionHandlerPublisher } from "../publishers/exception-handler.publisher";
import { replacePlaceHolder } from "../../utils/helpers";
import { ConsulInstance } from "../../config/consul";

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
      console.log(kvConfig);
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
      await this.emailService.sendEmail(
        message.destination,
        templateReplaced,
        message.userType
      );
      this.channel!.ack(msg);
    } catch (err3: any) {
      this.handleErrors(type, msg, err3);
    }
  }

  async handleErrors(type: string, msg: ConsumeMessage, error: Error) {
    console.error(error);
    this.channel!.nack(msg, false, false);
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
  }
}
