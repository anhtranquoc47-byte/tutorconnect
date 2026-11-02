using TutorConnect.Application.Features.Bookings.DTOs;
using System.Threading;
using System.Threading.Tasks;
using TutorConnect.Application.Features.Progress.DTOs;


namespace TutorConnect.Application.Services
{
    public interface ISessionService
    {
        Task<CompleteBookingResult> CompleteBookingAsync(
            long bookingId,
            long tutorId,
            SessionProgressUpsertRequest request,
            CancellationToken cancellationToken = default);
    }
}
