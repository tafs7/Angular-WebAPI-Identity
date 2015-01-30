using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Cors;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using WebApi.Models;

namespace WebApi.Providers
{
    public class ApplicationOAuthProvider : OAuthAuthorizationServerProvider
    {
        private readonly string _publicClientId;

        public ApplicationOAuthProvider(string publicClientId)
        {
            if (publicClientId == null)
            {
                throw new ArgumentNullException("publicClientId");
            }

            _publicClientId = publicClientId;
        }

        /// <summary>
        /// Called to validate that the context.ClientId is a registered "client_id", and that the context.RedirectUri a "redirect_uri" 
        /// registered for that client. This only occurs when processing the Authorize endpoint.
        /// </summary>
        public override Task ValidateClientRedirectUri(OAuthValidateClientRedirectUriContext context)
        {
            if (context.ClientId == _publicClientId)
            {
                var expectedRootUri = new Uri(context.Request.Uri, "/");

                if (expectedRootUri.AbsoluteUri == context.RedirectUri)
                {
                    context.Validated();
                }
            }

            return Task.FromResult<object>(null);
        }

        /// <summary>
        /// Called to validate that the origin of the request is a registered "client_id", and that the correct credentials for that client are
        /// present on the request.
        /// </summary>
        public override async Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            string clientId;
            string clientSecret;

            if (!context.TryGetBasicCredentials(out clientId, out clientSecret))
            {
                context.TryGetFormCredentials(out clientId, out clientSecret);
            }

            if (context.ClientId == null)
            {
                //Remove the comments from the below line if not requiring clientId, and comment the call to SetError
                //context.Validated();
                context.SetError("invalid_clientId", "ClientId should be sent.");
                return;
            }

            //TODO: change to IoC instead of OwinContext
            var repo = new AuthService(context.OwinContext.Get<ApplicationDbContext>());
            var client = await repo.FindClient(context.ClientId);

            if (client == null)
            {
                context.SetError(Constants.INVALID_CLIENT_ID, string.Format("Client '{0}' is not registered in the system.", context.ClientId));
                return;
            }

            if (client.ApplicationType == ApplicationTypes.NativeConfidential)
            {
                if (string.IsNullOrWhiteSpace(clientSecret))
                {
                    context.SetError(Constants.INVALID_CLIENT_ID, "Client secret should be sent.");
                    return;
                }

                if (client.Secret != Helper.GetHash(clientSecret))
                {
                    context.SetError(Constants.INVALID_CLIENT_ID, "Client secret is invalid.");
                    return;
                }
            }

            if (!client.Active)
            {
                context.SetError(Constants.INVALID_CLIENT_ID, "Client is inactive.");
                return;
            }

            context.OwinContext.Set(Constants.KEY_CLIENT_ALLOWED_ORIGIN, client.AllowedOrigin);
            context.OwinContext.Set(Constants.KEY_CLIENT_REFRESHTOKEN_LIFETIME, client.RefreshTokenLifeTime.ToString(CultureInfo.InvariantCulture));

            context.Validated();
        }

        //called when HTTP GET /Token with "grant_type" of "password"
        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {
            var userManager = context.OwinContext.GetUserManager<ApplicationUserManager>();

            var user = await userManager.FindAsync(context.UserName, context.Password);

            if (user == null)
            {
                context.SetError("invalid_grant", "The user name or password is incorrect.");
                return;
            }

            var oAuthIdentity = await user.GenerateUserIdentityAsync(userManager, OAuthDefaults.AuthenticationType);
            var cookiesIdentity = await user.GenerateUserIdentityAsync(userManager, CookieAuthenticationDefaults.AuthenticationType);

            AuthenticationProperties properties = CreateProperties(context.ClientId ?? string.Empty, user.UserName);
            var ticket = new AuthenticationTicket(oAuthIdentity, properties);
            context.Validated(ticket);
            context.Request.Context.Authentication.SignIn(cookiesIdentity);
        }

        //called when HTTP GET /Token with "grant_type" of "refresh_token"
        public override async Task GrantRefreshToken(OAuthGrantRefreshTokenContext context)
        {
            var originalClient = context.Ticket.Properties.Dictionary[Constants.KEY_CLIENT_ID];
            var currentClient = context.ClientId;
            //var currentClient = context.OwinContext.Get<string>(Constants.KEY_CLIENT_ID);

            if (originalClient != currentClient)
            {
                context.SetError(Constants.INVALID_CLIENT_ID, "Refresh token is issued to a different clientId.");
                return;
            }

            // Change auth ticket for refresh token requests
            var newIdentity = new ClaimsIdentity(context.Ticket.Identity);

            //we can add some new claims here:
            //var newClaim = newIdentity.Claims.FirstOrDefault(c => c.Type == "newClaim");
            //if (newClaim != null) newIdentity.RemoveClaim(newClaim);
            //newIdentity.AddClaim(new Claim("newClaim", "newValue"));

            var newTicket = new AuthenticationTicket(newIdentity, context.Ticket.Properties);
            context.Validated(newTicket);
        }

        public override Task TokenEndpoint(OAuthTokenEndpointContext context)
        {
            foreach (KeyValuePair<string, string> property in context.Properties.Dictionary)
            {
                context.AdditionalResponseParameters.Add(property.Key, property.Value);
            }

            return Task.FromResult<object>(null);
        }

        public static AuthenticationProperties CreateProperties(string clientId, string userName)
        {
            IDictionary<string, string> data = new Dictionary<string, string>
            {
                {"client_id", clientId},
                {"userName", userName}
            };
            return new AuthenticationProperties(data);
        }
    }
}