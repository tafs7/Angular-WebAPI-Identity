using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using WebApi.Models;

namespace WebApi
{
    public class AuthService
    {
        private readonly ApplicationDbContext _ctx;

        public AuthService(ApplicationDbContext ctx)
        {
            _ctx = ctx;
        }

        public async Task<Client> FindClient(string clientId)
        {
            var client = await _ctx.Clients.FindAsync(clientId);
            return client;
        }

        public async Task<bool> AddRefreshToken(RefreshToken token)
        {

            var existingToken = _ctx.RefreshTokens.SingleOrDefault(r => r.Subject == token.Subject && r.ClientId == token.ClientId);

            if (existingToken != null)
            {
                await RemoveRefreshToken(existingToken);
            }

            _ctx.RefreshTokens.Add(token);

            return await _ctx.SaveChangesAsync() > 0;
        }

        public async Task<bool> RemoveRefreshToken(string refreshTokenId)
        {
            var refreshToken = await _ctx.RefreshTokens.FindAsync(refreshTokenId);

            if (refreshToken == null) 
                return false;

            _ctx.RefreshTokens.Remove(refreshToken);

            return await _ctx.SaveChangesAsync() > 0;
        }

        public async Task<bool> RemoveRefreshToken(RefreshToken refreshToken)
        {
            _ctx.RefreshTokens.Remove(refreshToken);
            return await _ctx.SaveChangesAsync() > 0;
        }

        public async Task<RefreshToken> FindRefreshToken(string refreshTokenId, string origin = null)
        {
            var refreshToken = await _ctx.RefreshTokens.SingleOrDefaultAsync(r => r.Id == refreshTokenId && r.Origin == origin);

            return refreshToken;
        }

        public List<RefreshToken> GetAllRefreshTokens()
        {
            return _ctx.RefreshTokens.ToList();
        }
    }
}