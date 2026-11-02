using TutorConnect.Infrastructure.SqlServer.Persistence;
using TutorConnect.Infrastructure.SqlServer.Repositories;
using TutorConnect.Infrastructure.SqlServer.Services;
using TutorConnect.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TutorConnect.Infrastructure.SqlServer
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureSqlServer(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "Connection string 'DefaultConnection' was not found.");

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString));

            // Register services
            services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
            services.AddScoped<IJwtTokenService, JwtTokenService>();
            services.AddScoped<IEmailService, EmailService>();
            // Register application services
            services.AddScoped<TutorConnect.Application.Services.ISessionService, SessionService>();
            services.AddScoped<TutorConnect.Application.Services.IBookingService, BookingService>();
            services.AddScoped<TutorConnect.Application.Services.ILearningGoalService, LearningGoalService>();
            services.AddScoped<TutorConnect.Application.Services.IReviewService, ReviewService>();
            services.AddScoped<TutorMetricsProvider>();
            services.AddScoped<TutorConnect.Application.Services.ITutorService, TutorService>();
            services.AddScoped<TutorConnect.Application.Services.ISubjectService, SubjectService>();
            services.AddScoped<TutorConnect.Application.Services.IMatchingService, MatchingService>();
            services.AddScoped<IFileStorageService, LocalFileStorageService>();
            services.AddScoped<TutorConnect.Application.Services.IChatService, ChatService>();

            // Register repositories
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
            services.AddScoped<ISessionProgressRepository, SessionProgressRepository>();
            services.AddScoped<IComplaintRepository, ComplaintRepository>();
            services.AddScoped<IDashboardRepository, DashboardRepository>();
     
            return services;
        }
    }
}
