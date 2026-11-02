using FluentValidation;

namespace TutorConnect.Application.Features.Users.Queries.GetUsers
{
    public class GetUsersQueryValidator : AbstractValidator<GetUsersQuery>
    {
        public GetUsersQueryValidator()
        {
            RuleFor(x => x.PageNumber)
                .GreaterThanOrEqualTo(1);

            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, 100);

            RuleFor(x => x.Role)
                .IsInEnum()
                .When(x => x.Role.HasValue);

            RuleFor(x => x.Status)
                .IsInEnum()
                .When(x => x.Status.HasValue);

            RuleFor(x => x.Search)
                .MaximumLength(150);
        }
    }
}
