using FluentValidation;

namespace TutorConnect.Application.Features.Complaints.Queries.GetMyComplaints
{
    public class GetMyComplaintsQueryValidator : AbstractValidator<GetMyComplaintsQuery>
    {
        public GetMyComplaintsQueryValidator()
        {
            RuleFor(x => x.UserId).GreaterThan(0);
            RuleFor(x => x.PageNumber).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
            RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
        }
    }
}
