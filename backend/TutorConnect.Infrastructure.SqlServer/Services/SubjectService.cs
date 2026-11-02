using Microsoft.EntityFrameworkCore;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Subjects.DTOs;
using TutorConnect.Application.Services;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Enums;
using TutorConnect.Infrastructure.SqlServer.Persistence;

namespace TutorConnect.Infrastructure.SqlServer.Services
{
    internal sealed class SubjectService : ISubjectService
    {
        private readonly ApplicationDbContext _dbContext;

        public SubjectService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IReadOnlyList<SubjectResponse>> GetSubjectsAsync(
            bool includeInactive,
            CancellationToken cancellationToken = default)
        {
            var query = _dbContext.Subjects.AsNoTracking().AsQueryable();
            if (!includeInactive)
            {
                query = query.Where(s => s.IsActive);
            }

            return await query
                .OrderBy(s => s.Name)
                .Select(s => new SubjectResponse(
                    s.Id,
                    s.Code,
                    s.Name,
                    s.Description,
                    s.IsActive))
                .ToListAsync(cancellationToken);
        }

        public async Task<SubjectResponse> GetSubjectAsync(
            long subjectId,
            bool includeInactive,
            CancellationToken cancellationToken = default)
        {
            var subject = await _dbContext.Subjects
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    s => s.Id == subjectId && (includeInactive || s.IsActive),
                    cancellationToken);

            if (subject is null)
            {
                throw new NotFoundException("Subject not found.");
            }

            return ToResponse(subject);
        }

        public async Task<SubjectResponse> CreateSubjectAsync(
            SubjectCreateRequest request,
            long adminId,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveAdminAsync(adminId, cancellationToken);
            var code = NormalizeRequired(request.Code, nameof(request.Code));
            var name = NormalizeRequired(request.Name, nameof(request.Name));
            await EnsureUniqueAsync(code, name, null, cancellationToken);

            var subject = new Subject(code, name, request.Description);
            await _dbContext.Subjects.AddAsync(subject, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
            return ToResponse(subject);
        }

        public async Task<SubjectResponse> UpdateSubjectAsync(
            long subjectId,
            SubjectUpdateRequest request,
            long adminId,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveAdminAsync(adminId, cancellationToken);
            var subject = await _dbContext.Subjects
                .FirstOrDefaultAsync(s => s.Id == subjectId, cancellationToken);

            if (subject is null)
            {
                throw new NotFoundException("Subject not found.");
            }

            var code = NormalizeRequired(request.Code, nameof(request.Code));
            var name = NormalizeRequired(request.Name, nameof(request.Name));
            await EnsureUniqueAsync(code, name, subjectId, cancellationToken);

            subject.Update(code, name, request.Description);
            await _dbContext.SaveChangesAsync(cancellationToken);
            return ToResponse(subject);
        }

        public async Task<SubjectResponse> SetSubjectStatusAsync(
            long subjectId,
            SubjectStatusRequest request,
            long adminId,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveAdminAsync(adminId, cancellationToken);
            var subject = await _dbContext.Subjects
                .FirstOrDefaultAsync(s => s.Id == subjectId, cancellationToken);

            if (subject is null)
            {
                throw new NotFoundException("Subject not found.");
            }

            if (request.IsActive)
            {
                subject.Activate();
            }
            else
            {
                subject.Deactivate();
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            return ToResponse(subject);
        }
                public async Task DeleteSubjectAsync(
            long subjectId,
            long adminId,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveAdminAsync(adminId, cancellationToken);

            var subject = await _dbContext.Subjects
                .Include(s => s.TutorSubjects)
                    .ThenInclude(ts => ts.Bookings)
                .Include(s => s.TutorSubjects)
                    .ThenInclude(ts => ts.LearningGoals)
                .FirstOrDefaultAsync(s => s.Id == subjectId, cancellationToken);

            if (subject is null)
            {
                throw new NotFoundException("Subject not found.");
            }

            foreach (var tutorSubject in subject.TutorSubjects.ToList())
            {
                _dbContext.Bookings.RemoveRange(tutorSubject.Bookings);
                _dbContext.LearningGoals.RemoveRange(tutorSubject.LearningGoals);
                _dbContext.TutorSubjects.Remove(tutorSubject);
            }

            _dbContext.Subjects.Remove(subject);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        private async Task EnsureUniqueAsync(
            string code,
            string name,
            long? excludeSubjectId,
            CancellationToken cancellationToken)
        {
            var duplicateCode = await _dbContext.Subjects
                .AsNoTracking()
                .AnyAsync(
                    s => (!excludeSubjectId.HasValue || s.Id != excludeSubjectId.Value)
                        && s.Code == code,
                    cancellationToken);

            if (duplicateCode)
            {
                throw new InvalidOperationException("Subject code already exists.");
            }

            var duplicateName = await _dbContext.Subjects
                .AsNoTracking()
                .AnyAsync(
                    s => (!excludeSubjectId.HasValue || s.Id != excludeSubjectId.Value)
                        && s.Name == name,
                    cancellationToken);

            if (duplicateName)
            {
                throw new InvalidOperationException("Subject name already exists.");
            }
        }

        private async Task EnsureActiveAdminAsync(long adminId, CancellationToken cancellationToken)
        {
            var isActiveAdmin = await _dbContext.Users
                .AsNoTracking()
                .AnyAsync(
                    u => u.Id == adminId
                        && u.Role == UserRole.Admin
                        && u.Status == UserStatus.Active,
                    cancellationToken);

            if (!isActiveAdmin)
            {
                throw new ForbiddenException("Only an active Admin can perform this action.");
            }
        }

        private static string NormalizeRequired(string? value, string parameterName)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException($"{parameterName} is required.", parameterName);
            }

            return value.Trim();
        }

        private static SubjectResponse ToResponse(Subject subject)
        {
            return new SubjectResponse(
                subject.Id,
                subject.Code,
                subject.Name,
                subject.Description,
                subject.IsActive);
        }
    }
}
