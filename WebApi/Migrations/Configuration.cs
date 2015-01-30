using System.Data.Entity.Migrations;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using WebApi.Models;

namespace WebApi.Migrations
{
    public sealed class Configuration : DbMigrationsConfiguration<WebApi.Models.ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(ApplicationDbContext context)
        {
            var userManager = new ApplicationUserManager(new UserStore<ApplicationUser>(context));
            var roleManager = new ApplicationRoleManager(new RoleStore<IdentityRole>(context));

            const string adminName = "admin@example.com";
            const string adminPassword = "Admin@123456";
            const string adminFirstName = "Admin";
            const string adminLastName = "Smith";

            const string userName = "user@example.com";
            const string userPassword = "User@123456";
            const string userFirstName = "User";
            const string userLastName = "Doe";

            const string adminRoleName = "Admin";
            const string userRoleName = "User";

            var role = roleManager.FindByName(adminRoleName);
            if (role == null)
            {
                role = new IdentityRole(adminRoleName);
                roleManager.Create(role);
            }

            var role2 = roleManager.FindByName(userRoleName);
            if (role2 == null)
            {
                role2 = new IdentityRole(userRoleName);
                roleManager.Create(role2);
            }

            var user = userManager.FindByName(adminName);
            if (user == null)
            {
                user = new ApplicationUser { UserName = adminName, Email = adminName, FirstName = adminFirstName, LastName = adminLastName };
                userManager.Create(user, adminPassword);
                userManager.SetLockoutEnabled(user.Id, false);
            }

            var rolesForUser = userManager.GetRoles(user.Id);
            if (!rolesForUser.Contains(role.Name))
            {
                userManager.AddToRole(user.Id, role.Name);
            }

            user = userManager.FindByName(userName);
            if (user == null)
            {
                user = new ApplicationUser { UserName = userName, Email = userName, FirstName = userFirstName, LastName = userLastName };
                userManager.Create(user, userPassword);
                userManager.SetLockoutEnabled(user.Id, false);
            }

            rolesForUser = userManager.GetRoles(user.Id);
            if (!rolesForUser.Contains(role2.Name))
            {
                userManager.AddToRole(user.Id, role2.Name);
            }

            context.Clients.AddOrUpdate(c=>c.Id,
                new Client
                {
                    Id = "ngAuthApp",
                    Secret = Helper.GetHash("abc@123"),
                    Name = "AngularJS front-end Application",
                    ApplicationType = ApplicationTypes.JavaScript,
                    Active = true,
                    RefreshTokenLifeTime = 7200,
                    AllowedOrigin = "http://localhost:58519"
                },
                new Client
                {
                    Id = "consoleApp",
                    Secret = Helper.GetHash("123@abc"),
                    Name = "Console Application",
                    ApplicationType = ApplicationTypes.NativeConfidential,
                    Active = true,
                    RefreshTokenLifeTime = 14400,
                    AllowedOrigin = "*"
                }
            );
            context.SaveChanges();
        }
    }
}
