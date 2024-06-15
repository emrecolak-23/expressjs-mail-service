import express from "express";
import { ConsulInstance } from "./config/consul";
import dotenv from "dotenv";
import EmailService from "./services/Aws-Mailer";
import { EmailSender } from "./events/listeners/email-sender.listener";
import { rabbitMQ } from "./config/rabbit";
import path from "path";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
} else {
  dotenv.config();
}

import { Channel } from "amqplib";

const app = express();
const PORT = process.env.PORT || 3000;
const defaultLanguage = process.env.DEFAULT_LANGUAGE || "en";

enum Channels {
  EMAIL_SEND = "mail-sender",
  ADMIN_NOTIFICATION = "AdminNotification",
}

const start = async () => {
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
  const consulInstance = ConsulInstance.getInstance(consulService, consulHost);
  await consulInstance.registerService();
  const consulClient = consulInstance.getConsulClient();

  await rabbitMQ.connect(AMQP_URI);
  const channel = rabbitMQ.getChannel() as Channel;
  const emailService = EmailService.getInstance();
  new EmailSender(channel, consulClient, emailService).subscribe();
};

start();
