import { sendEmail } from '../utils/email';
import EmailLog from './../models/emaillog.model';
interface ISendEmailToLead { 
    leadId: string, 
    to: string, 
    subject: string, 
    body: string
 }
class EmailLogService{
    async sendEmailToLead(sendEMailInput: ISendEmailToLead){
        const {leadId, to, subject, body} = sendEMailInput;
        try {
            const messageId = await sendEmail(to, subject, body);
            const emailLog = new EmailLog({leadId: leadId, subject: subject, body: body, messageId: messageId, status: 'sent'});
            await emailLog.save();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to create emailLog");
        }
    }
    async updateEmailLogByMessageId(messageId: string){
        try {
            const emailLog = await EmailLog.findOneAndUpdate({messageId}, {status: 'replied'}, {new: true});
            return emailLog
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to update emailLog");
        }
    }
}

export default new EmailLogService();