import type { APIRoute } from 'astro';
import Mailjet from 'node-mailjet';
import {validateEnquiry, escapeHtml} from '../../lib/enquiry.mjs';

export const POST: APIRoute = async ({ request }) => {
    try {
        // Parse form data
        let formData;
        try {
            formData = await request.formData();
        } catch (error) {
            console.error('[ERROR] Failed to parse formData:', error);
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Invalid request format. Please try again.'
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        let enquiry;
        try {
            enquiry = validateEnquiry(formData);
        } catch (error) {
            return new Response(JSON.stringify({success:false, message:error instanceof Error ? error.message : 'Invalid enquiry.'}), {status:400, headers:{'Content-Type':'application/json'}});
        }
        const {name, email, message} = enquiry;

        // Get environment variables
        const apiKey = import.meta.env.MAILJET_API_KEY;
        const apiSecret = import.meta.env.MAILJET_API_SECRET;
        const recipientEmail = import.meta.env.RECIPIENT_EMAIL || 'info@expresiv.com.au';
        const senderEmail = import.meta.env.SENDER_EMAIL || 'noreply@expresiv.com.au';
        const senderName = import.meta.env.SENDER_NAME || 'Expresiv Contact Form';

        // Check if API credentials are configured
        if (!apiKey || !apiSecret) {
            console.error('Mailjet API credentials not configured');
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Email service not configured'
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Initialize Mailjet client
        const mailjet = Mailjet.apiConnect(apiKey, apiSecret);

        // Prepare email content
        const emailContent = `
New contact form submission from Expresiv website:

Name: ${name}
Email: ${email}

Message:
${message}

---
Sent from Expresiv Contact Form
Timestamp: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}
    `.trim();

        // Send email via Mailjet
        await mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: {
                            Email: senderEmail,
                            Name: senderName
                        },
                        To: [
                            {
                                Email: recipientEmail,
                                Name: 'Expresiv Team'
                            }
                        ],
                        Subject: `New Contact Form Submission from ${name}`,
                        TextPart: emailContent,
                        HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                  New Contact Form Submission
                </h2>
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 10px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
                  <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
                </div>
                <div style="margin: 20px 0;">
                  <p style="margin: 10px 0;"><strong>Message:</strong></p>
                  <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px;">
                    ${escapeHtml(message).replace(/\n/g, '<br>')}
                  </div>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 12px; margin: 10px 0;">
                  Sent from Expresiv Contact Form<br>
                  ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}
                </p>
              </div>
            `
                    }
                ]
            });



        return new Response(
            JSON.stringify({
                success: true,
                message: 'Thank you. Your enquiry has been sent. We’ll be in touch.'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Contact email delivery failed.');

        return new Response(
            JSON.stringify({
                success: false,
                message: 'Something went wrong. Please try again or email us directly at info@expresiv.com.au'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

