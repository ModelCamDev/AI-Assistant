import nodemailer from "nodemailer";
import { FetchMessageObject, ImapFlow } from "imapflow";
import dotenv from 'dotenv';
import emailLogService from "../services/emailLog.service";
import leadService from "../services/lead.service";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Send email and return unique messageId
export const sendEmail = async (to: string, subject: string, body: string) => {
  console.log("Recieved email data:", to, subject);
  
  const mailOptions = {
    from: `AI Assistant <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: body,
  };

  try {
      const info = await transporter.sendMail(mailOptions);
      return info.messageId;
  } catch (error: any) {
    console.log("Error sending email:", error.message, error.name);
  }

};
// Check email replies

interface EmailReplyInfo {
  from?: string;
  subject?: string;
  inReplyTo?: string;
  date?: Date;
}

export const checkEmailReplies = async () => {
    const client = new ImapFlow({
          host: "imap.gmail.com",
          port: 993,
          secure: true,
          auth: {
              user: process.env.EMAIL_USER || '',
              pass: process.env.EMAIL_PASS || '',
          },
          logger: false
      });
  try {

    await client.connect();
    console.log("Connected:", client.usable);

    const mailbox = await client.mailboxOpen("INBOX");
    console.log("Opened mailbox:", mailbox.path, " | Total messages:", mailbox.exists);

    const sinceDate = new Date(Date.now()- (2*24*60*60*1000));
    const result = await client.search({since: sinceDate});
    if (!result) {
        console.log('No recent messages found.');
        return
    }
        console.log("Found result:", result?.length);
        for (let msgId of result){
            let msg: FetchMessageObject | false;
            try {
                msg = await client.fetchOne(msgId, {envelope:true, source:true})
            } catch (error) {
                console.warn(`Failed to fetch message ${msgId}:`, error);
                continue
            }
            if (!msg || !msg.envelope) {
                continue
            }
            const headers = msg.envelope;
            console.log("Headers of mails", headers);
            // console.log("Source of mails", msg.source.toString());
            const inReplyTo = headers?.inReplyTo || msg.source?.toString().match(/In-Reply-To:\s*(.*)/i)?.[1];
            console.log("Found in reply to:", inReplyTo);
            if (inReplyTo) {
                const emailLog = await emailLogService.updateEmailLogByMessageId(inReplyTo);
                if (emailLog) {
                    const lead = await leadService.updateLeadStatus(emailLog?.leadId.toString(), 'replied')
                    console.log("Lead has replied to your email: ", lead?.email);
                    
                }
            }       
        }
    
    

    console.log("✅ Email reply check complete.");
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    try {
      await client.logout();
      console.log("Logged out of IMAP.");
    } catch (logoutErr) {
      console.warn("Error during logout:", logoutErr);
    }
  }
};