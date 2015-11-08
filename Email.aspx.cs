using System.Net.Mail;

public partial class Default: System.Web.UI.Page
{ 
  [System.Web.Services.WebMethod]
  public static void SendMessage(string subject, string to, string body)
  {
         const string SERVER = "relay-hosting.secureserver.net";
         MailAddress from = new MailAddress("info@gmail.com");
         MailAddress to = new MailAddress(to);
         MailMessage message = new MailMessage(from, to);

         message.Subject = subject;
         message.Body = body;
         message.IsBodyHtml = false;
         SmtpClient client = new SmtpClient(SERVER);
        client.Send(message);
   }
}
