using FluentValidation;

namespace TutorConnect.Application.Features.Complaints.Queries.GetComplaintsForAdmin
{
    public class GetComplaintsForAdminQueryValidator : AbstractValidator<GetComplaintsForAdminQuery>
    {
        public GetComplaintsForAdminQueryValidator()
        {
            RuleFor(x => x.PageNumber).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
            RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
            RuleFor(x => x.Type).MaximumLength(50);
        }
    }
}
