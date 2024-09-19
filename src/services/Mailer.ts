import sgMail from "@sendgrid/mail";

interface Email {
  name: string;
  email: string;
}

const fromEmail: Email = {
  name: "Isteyim.com Destek",
  email: "user@isteyiminfo.com",
};

class Mailer {
  from_email: Email;
  body: string;

  constructor(
    public subject: string,
    public recipients: string[],
    public content: string,
    public html?: string
  ) {
    this.from_email = fromEmail;
    this.subject = subject;
    this.body = content;
    this.recipients = recipients;
    this.html = html;
  }

  async send() {
    try {
      const sendgridKey = process.env.SEND_GRID_KEY!;
      sgMail.setApiKey(sendgridKey);

      await sgMail.send({
        to: this.recipients,
        from: this.from_email.email,
        subject: this.subject,
        text: this.content,
        html: this.html,
      });
    } catch (err: any) {
      console.log(err.response.body, "err");
    }
  }
}

export default Mailer;
