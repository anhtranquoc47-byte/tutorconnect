using TutorConnect.Application.Features.Subjects.DTOs;

namespace TutorConnect.Application.Services
{
    public interface ISubjectService
    {
        Task<IReadOnlyList<SubjectResponse>> GetSubjectsAsync(bool includeInactive, CancellationToken cancellationToken = default);
        Task<SubjectResponse> GetSubjectAsync(long subjectId, bool includeInactive, CancellationToken cancellationToken = default);
        Task<SubjectResponse> CreateSubjectAsync(SubjectCreateRequest request, long adminId, CancellationToken cancellationToken = default);
        Task<SubjectResponse> UpdateSubjectAsync(long subjectId, SubjectUpdateRequest request, long adminId, CancellationToken cancellationToken = default);
        Task<SubjectResponse> SetSubjectStatusAsync(long subjectId, SubjectStatusRequest request, long adminId, CancellationToken cancellationToken = default);
        Task DeleteSubjectAsync(long subjectId, long adminId, CancellationToken cancellationToken = default);
    }
}
