using TutorConnect.API;
using TutorConnect.Application;
using TutorConnect.Infrastructure.SqlServer;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configure JWT authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
var issuer = jwtSettings["Issuer"] ?? "TutorConnect";
var audience = jwtSettings["Audience"] ?? "TutorConnectUsers";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var frontendBaseUrl = builder.Configuration["Frontend:BaseUrl"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (!string.IsNullOrWhiteSpace(frontendBaseUrl))
        {
            policy.WithOrigins(frontendBaseUrl.TrimEnd('/'))
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

builder.Services.AddPresentation(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddInfrastructureSqlServer(builder.Configuration);

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<TutorConnect.Infrastructure.SqlServer.Persistence.ApplicationDbContext>();
    dbContext.Database.ExecuteSqlRaw(@"
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChatConversations')
        BEGIN
            CREATE TABLE ChatConversations (
                Id BIGINT IDENTITY(1,1) PRIMARY KEY,
                Participant1Id BIGINT NOT NULL,
                Participant2Id BIGINT NOT NULL,
                ConversationType NVARCHAR(50) NOT NULL DEFAULT 'General',
                Title NVARCHAR(255) NULL,
                TutorSubjectId BIGINT NULL,
                LastMessage NVARCHAR(MAX) NULL,
                LastMessageAtUtc DATETIME2 NOT NULL DEFAULT GETUTCDATE()
            );
        END;

        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChatMessages')
        BEGIN
            CREATE TABLE ChatMessages (
                Id BIGINT IDENTITY(1,1) PRIMARY KEY,
                ConversationId BIGINT NOT NULL,
                SenderId BIGINT NOT NULL,
                Content NVARCHAR(MAX) NOT NULL,
                AttachmentUrl NVARCHAR(500) NULL,
                SentAtUtc DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                IsRead BIT NOT NULL DEFAULT 0
            );
        END;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'FailedLoginAttempts')
        BEGIN
            ALTER TABLE Users ADD FailedLoginAttempts INT NOT NULL DEFAULT 0;
        END;
    ");
}


app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// In development, allow the app to stay on plain HTTP when using the
// `http` launch profile. The HTTPS profile still works because the browser
// already talks to the HTTPS endpoint directly.
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
