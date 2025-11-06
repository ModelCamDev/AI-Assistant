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
        const emailBody = `Hi there,\n\nFollowing up on our previous conversation:\n\n${summary}\n\nBest regards,\nModelcam Technologies pvt. ltd.`;

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