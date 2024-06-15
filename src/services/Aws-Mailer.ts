import * as AWS from "aws-sdk";
import { SES } from "aws-sdk";
import { UserType } from "../events/listeners/email-sender.listener";

class EmailService {
  static instance: EmailService;
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private SES_CONFIG: AWS.SES.ClientConfiguration;
  private AWS_SES: SES;

  private constructor() {
    this.SES_CONFIG = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    };
    this.AWS_SES = new AWS.SES(this.SES_CONFIG);
  }

  sendEmail(
    recipientEmail: string[],
    templateReplaced: string,
    userType: UserType
  ): Promise<AWS.SES.SendEmailResponse> {
    console.log(userType, "userType");
    const params: AWS.SES.SendEmailRequest = {
      Source:
        userType === UserType.INMIDI
          ? process.env.SOURCE_EMAIL_INMIDI!
          : process.env.SOURCE_EMAIL!,
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
          Data:
            userType === UserType.INMIDI
              ? `inmidi.de wissen`
              : `isteyim.com bilgi`,
        },
      },
    };

    return this.AWS_SES.sendEmail(params).promise();
  }

  async sendTemplateEmailTest(
    recipientEmail: string[],
    template: any,
    templateData: any
  ): Promise<AWS.SES.SendTemplatedEmailResponse> {
    const params: AWS.SES.SendTemplatedEmailRequest = {
      Source: "info@isteyim.com",
      Template: template,
      Destination: {
        ToAddresses: ["serkan.yildiz@isteyim.com"],
      },
      TemplateData: JSON.stringify({ id: "121314" }),
    };

    return this.AWS_SES.sendTemplatedEmail(params).promise();
  }
}

export default EmailService;
