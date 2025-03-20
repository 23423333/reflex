import { supabase } from './supabase';

interface SendSMSParams {
  to: string;
  message: string;
}

export const sendSMS = async ({ to, message }: SendSMSParams) => {
  try {
    // Format the phone number to E.164 format if it doesn't start with '+'
    const formattedNumber = to.startsWith('+') ? to : `+${to}`;

    // Make a request to your backend API that handles Twilio integration
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedNumber,
        message,
        accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
        authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
        fromNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }

    const data = await response.json();
    return { success: true, messageId: data.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

export const scheduleSMS = async (message: string, scheduleDate: string, recipients: string[]) => {
  try {
    // Store the scheduled message in the database
    const { data, error } = await supabase
      .from('scheduled_messages')
      .insert({
        message,
        schedule_date: scheduleDate,
        client_filter: JSON.stringify(recipients || []), // Ensure we always store a valid JSON array
        message_type: 'reminder',
        status: 'scheduled'
      })
      .select();

    if (error) throw error;

    // Send SMS immediately if the schedule date is now or in the past
    const now = new Date();
    const scheduledTime = new Date(scheduleDate);
    
    if (scheduledTime <= now) {
      for (const recipientId of recipients) {
        // Get recipient's phone number from clients table
        const { data: clientData } = await supabase
          .from('clients')
          .select('phone_number')
          .eq('id', recipientId)
          .single();

        if (clientData?.phone_number) {
          await sendSMS({
            to: clientData.phone_number,
            message
          });
        }
      }

      // Update message status to sent
      await supabase
        .from('scheduled_messages')
        .update({ status: 'sent' })
        .eq('id', data[0].id);
    }

    return data;
  } catch (error) {
    console.error('Error scheduling SMS:', error);
    throw error;
  }
};

// Function to check and send scheduled messages
export const checkAndSendScheduledMessages = async () => {
  try {
    const now = new Date();
    
    // Get all scheduled messages that are due
    const { data: scheduledMessages, error } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('status', 'scheduled')
      .lte('schedule_date', now.toISOString());

    if (error) throw error;

    if (scheduledMessages) {
      for (const message of scheduledMessages) {
        try {
          // Parse the client_filter with error handling
          let recipients: string[] = [];
          
          if (message.client_filter) {
            try {
              const parsed = JSON.parse(message.client_filter);
              recipients = Array.isArray(parsed) ? parsed : [];
            } catch (parseError) {
              console.error('Error parsing client_filter:', parseError);
              recipients = [];
            }
          }
          
          for (const recipientId of recipients) {
            // Get recipient's phone number
            const { data: clientData } = await supabase
              .from('clients')
              .select('phone_number')
              .eq('id', recipientId)
              .single();

            if (clientData?.phone_number) {
              await sendSMS({
                to: clientData.phone_number,
                message: message.message
              });
            }
          }

          // Update message status to sent
          await supabase
            .from('scheduled_messages')
            .update({ status: 'sent' })
            .eq('id', message.id);
        } catch (messageError) {
          console.error('Error processing message:', messageError);
          // Continue with next message even if one fails
          continue;
        }
      }
    }
  } catch (error) {
    console.error('Error processing scheduled messages:', error);
    throw error;
  }
};

// Set up interval to check for scheduled messages every minute
setInterval(checkAndSendScheduledMessages, 60000);