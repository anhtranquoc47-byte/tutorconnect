using MediatR;
using TutorConnect.Application.Common.Models;
using TutorConnect.Application.Features.Users.DTOs;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Users.Queries.GetUsers
{
    public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, PaginationResponse<UserProfileResponse>>
    {
        private readonly IUserRepository _userRepository;

        public GetUsersQueryHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<PaginationResponse<UserProfileResponse>> Handle(
            GetUsersQuery request,
            CancellationToken cancellationToken)
        {
            var (items, totalItems) = await _userRepository.GetPagedAsync(
                request.PageNumber,
                request.PageSize,
                request.Role,
                request.Status,
                request.Search,
                cancellationToken);

            var responses = items
                .Select(u => new UserProfileResponse(
                    u.Id,
                    u.Email,
                    u.FullName,
                    u.Phone,
                    u.Role,
                    u.Status,
                    u.TimeZoneId))
                .ToList();

            return new PaginationResponse<UserProfileResponse>(
                responses,
                totalItems,
                request.PageNumber,
                request.PageSize);
        }
    }
}
