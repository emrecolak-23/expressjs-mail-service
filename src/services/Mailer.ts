import sgMail from "@sendgrid/mail"

const sendgridKey = process.env.SEND_GRID_KEY!

interface Email {
    name: string,
    email: string
}


const fromEmail: Email = {
    name: "Isteyim.com Destek",
    email: "info@isteyim.com"
}

class Mailer {
    from_email: Email
    body: string


    constructor(public subject: string, public recipients: string[], public content: string, public html?: string) {
        this.from_email = fromEmail
        this.subject = subject
        this.body = content
        this.recipients = recipients
        this.html = html
    }

    async send() {
        sgMail.setApiKey(sendgridKey)

        await sgMail.send({
            to: this.recipients,
            from: this.from_email,
            subject: this.subject,
            text: this.content,
            html: this.html
        })
    }

}

export default Mailer