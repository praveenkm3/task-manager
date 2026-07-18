import transporter from "./transporter.ts";
import "dotenv/config";


export default async function sendEmail(email:any,otp:any){
    await transporter.sendMail({
  from: process.env.EMAIL,
  to: email,
  subject: `Forgot Password`,
  html: `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Task Manager Verification</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
  
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; table-layout: fixed;">
      <tr>
        <td align="center" valign="middle" style="padding: 40px 0;">
           
          <table width="400" border="0" cellspacing="0" cellpadding="0" style="width: 400px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border-collapse: separate;">
            <tr>
              <td align="center" style="padding: 40px 24px;">
                 
                <h1 style="font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
                  Task Manager
                </h1>
                 
                <h3 style="font-size: 16px; font-weight: 500; color: #4b5563; margin: 0 0 32px 0; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
                  Enter This OTP to Verify
                </h3>
                 
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="font-size: 14px; line-height: 1.5; color: #6b7280; padding-bottom: 6px; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
                      Use This OTP to complete your verification process.
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="font-size: 14px; line-height: 1.5; color: #6b7280; padding-bottom: 40px; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
                      This code is valid for 5 minutes.
                    </td>
                  </tr>
                </table>
                 
                <table border="0" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px;">
                  <tr>
                    <td align="center" style="padding: 12px 40px;">
                      <h1 style="font-size: 36px; font-weight: 700; color: #1d4ed8; letter-spacing: 4px; margin: 0; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
                        ${otp}
                      </h1>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
  `,
});
};