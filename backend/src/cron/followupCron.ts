import cron from 'node-cron';
import { checkEmailReplies } from '../utils/email';
import leadService from '../services/lead.service';
import emailLogService from '../services/emailLog.service';
import conversationService from '../services/conversation.service';

// Schedule the cron job to run every day at 9:00 AM
// Minute(0-59) | Hour(0-23) | Day(1-31) | Month(1-12) | Weekday(0-7)
cron.schedule("0 * * * *", async () => {
  try {
    console.log("---------------------------------------------");
    
    console.log("Starting daily follow-up cron job...");

    // Step 1: Check for email replies and Update statuses
    await checkEmailReplies();
    console.log("Email replies checked and statuses updated.");

    // Step 2: Fetch all leads who haven't replied yet (status: 'new')
    const pendingLeads = await leadService.getPendingLeads();
    console.log(`Found ${pendingLeads.length} pending leads.`);

    // Step 3: Process each pending lead
    for (const lead of pendingLeads) {
      try {
          console.log("Pending Lead:", lead.email);

        // Generate summary from lead messages
        // messages[] contains conversation history

        const summary = await conversationService.summarizeConversation(lead.conversationId)
        // Construct email body with summary
        const emailBody = `
        
      <!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f4f4f4; font-family: Roboto;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding: 40px 0;">
    <tr><td align="center">

      <table width="90%" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:6px; overflow:hidden;">

        <!-- Logo -->
        <tr>
          <td align="center" style="padding: 20px;">
            <img src="https://www.modelcamtechnologies.com/images/logo1.png"
              alt="Modelcam Logo"
              width="150"
              style="display:block;">
          </td>
        </tr>

        <!-- Header -->
        <tr>
          <td style="background:#6DA944; padding:20px; color:#ffffff; font-size:20px; font-weight:bold;">
            Following up on our previous conversation:
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px; line-height:1.6; color:#333333;">
            <h2 style="margin:0 0 15px 0; font-size:16px;">Hello there,</h2>

            <div style="background:#f1f7ff; padding:15px; border-left:4px solid #6DA944;">
              ${summary}
            </div>

            <p style="margin:15px 0;">Best regards,<br>Modelcam Technologies pvt. ltd.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f8; padding:15px; text-align:center; font-size:12px; color:#777;">
            © 2025 Modelcam Technologies Pvt. Ltd.
          </td>
        </tr>

      </table>

    </td></tr>
  </table>

</body>
</html>

      `;

        // Step 4: Send follow-up email
        await emailLogService.sendEmailToLead({leadId: lead._id.toString(), to: lead.email, subject: "Following up on our conversation", body: emailBody})

        console.log(`Follow-up email sent to ${lead.email}`);
      } catch (err: any) {
        console.error(`Error processing lead ${lead._id}:`, err.message);
      }
    }

    console.log("Daily follow-up cron job completed successfully.");
  } catch (err: any) {
    console.error("Error in follow-up cron job:", err.message);
  }
});