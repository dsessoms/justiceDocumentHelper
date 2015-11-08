using System;
using System.Net;
using System.Net.Mail;

namespace Email
{
  public partial class Default: System.Web.UI.Page
  { 
    protected void Page_Load(object sender, EventArgs e)
    {

    }

    [System.Web.Services.WebMethod]
    public static void SendMessage(string subject, string toAddress, string body)
    {
           SmtpClient client = new SmtpClient
           {
             Host = "smtp.gmail.com",
             Port = 587,
             EnableSsl = true,
             DeliveryMethod = SmtpDeliveryMethod.Network,
             UseDefaultCredentials = false,
             Credentials = new NetworkCredential("neighborhoodlegalclinics@gmail.com","KCBAPBS4y!3"),
             Timeout = 30000
           };
      
           MailAddress from = new MailAddress("neighborhoodlegalclinics@gmail.com");
           MailAddress to = new MailAddress(toAddress);
           MailMessage message = new MailMessage(from, to);
  
           message.Subject = subject;
           message.Body = body;
           message.IsBodyHtml = false;
           client.Send(message);
     }
  }
}
