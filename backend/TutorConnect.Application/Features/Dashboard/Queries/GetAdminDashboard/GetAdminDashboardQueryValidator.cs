using FluentValidation;

namespace TutorConnect.Application.Features.Dashboard.Queries.GetAdminDashboard
{
    public class GetAdminDashboardQueryValidator : AbstractValidator<GetAdminDashboardQuery>
    {
        public GetAdminDashboardQueryValidator()
        {
            RuleFor(x => x)
                .Must(x => !x.FromUtc.HasValue || !x.ToUtc.HasValue || x.FromUtc.Value < x.ToUtc.Value)
                .WithMessage("FromUtc phải nhỏ hơn ToUtc")
                .OverridePropertyName(nameof(GetAdminDashboardQuery.FromUtc));
        }
    }
}
