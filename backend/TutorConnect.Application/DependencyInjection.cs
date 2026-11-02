using System.Reflection;
using FluentValidation;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TutorConnect.Application.Common.Behaviors;

namespace TutorConnect.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            var assembly = Assembly.GetExecutingAssembly();

            services.AddMediatR(configuration =>
                configuration.RegisterServicesFromAssembly(assembly));

            // Đăng ký tất cả FluentValidation validator trong assembly, và pipeline
            // behavior để MediatR tự động chạy chúng trước handler.
            services.AddValidatorsFromAssembly(assembly);
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

            var mapsterConfig = TypeAdapterConfig.GlobalSettings;
            mapsterConfig.Scan(assembly);
            services.AddSingleton(mapsterConfig);
            services.AddScoped<IMapper, Mapper>();

            return services;
        }
    }
}
