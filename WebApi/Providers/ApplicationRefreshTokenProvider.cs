using System;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security.Infrastructure;
using WebApi.Models;

namespace WebApi.Providers
{
    public class ApplicationRefreshTokenProvider : IAuthenticationTokenProvider
    {
        public async Task CreateAsync(AuthenticationTokenCreateContext context)
        {
            var clientid = context.Ticket.Properties.Dictionary[Constants.KEY_CLIENT_ID];

            if (string.IsNullOrEmpty(clientid))
            {
                return;
            }

            var refreshTokenId = Guid.NewGuid().ToString("n");
            
            //TODO: replace with IoC instead of OwinContext
            var repo = new AuthService(context.OwinContext.Get<ApplicationDbContext>());
            var refreshTokenLifeTime = context.OwinContext.Get<string>(Constants.KEY_CLIENT_REFRESHTOKEN_LIFETIME);
            var formCollection = await context.Request.ReadFormAsync();

            var token = new RefreshToken
            {
                Id = Helper.GetHash(refreshTokenId),
                ClientId = clientid,
                Subject = context.Ticket.Identity.Name,
                IssuedUtc = DateTime.UtcNow,
                ExpiresUtc = DateTime.UtcNow.AddMinutes(Convert.ToDouble(refreshTokenLifeTime)),
                Origin = Helper.GetHash(formCollection[Constants.KEY_ORIGIN_TOKEN])
            };

            context.Ticket.Properties.IssuedUtc = token.IssuedUtc;
            context.Ticket.Properties.ExpiresUtc = token.ExpiresUtc;

            token.ProtectedTicket = context.SerializeTicket();

            var result = await repo.AddRefreshToken(token);

            if (result)
            {
                context.SetToken(refreshTokenId);
            }
        }

        public async Task ReceiveAsync(AuthenticationTokenReceiveContext context)
        {
            var allowedOrigin = context.OwinContext.Get<string>(Constants.KEY_CLIENT_ALLOWED_ORIGIN);
            context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] { allowedOrigin });

            string hashedTokenId = Helper.GetHash(context.Token);

            //TODO: replace with IoC instead of OwinContext
            var repo = new AuthService(context.OwinContext.Get<ApplicationDbContext>());

            var formCollection = await context.Request.ReadFormAsync();
            var originToken = formCollection[Constants.KEY_ORIGIN_TOKEN];
            var hashedOrigin = string.IsNullOrWhiteSpace(originToken) ? null : Helper.GetHash(originToken);

            var refreshToken = await repo.FindRefreshToken(hashedTokenId, hashedOrigin);

            if (refreshToken != null)
            {
                //Get protectedTicket from refreshToken class
                context.DeserializeTicket(refreshToken.ProtectedTicket);
                await repo.RemoveRefreshToken(hashedTokenId);
            }
        }

        public void Create(AuthenticationTokenCreateContext context)
        {
            throw new NotImplementedException();
        }

        public void Receive(AuthenticationTokenReceiveContext context)
        {
            throw new NotImplementedException();
        }
    }
}