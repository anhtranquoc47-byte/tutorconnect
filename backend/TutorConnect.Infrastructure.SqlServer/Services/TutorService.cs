using Microsoft.EntityFrameworkCore;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Availability.DTOs;
using TutorConnect.Application.Features.Subjects.DTOs;
using TutorConnect.Application.Features.Tutors.DTOs;
using TutorConnect.Application.Services;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Enums;
using TutorConnect.Infrastructure.SqlServer.Persistence;

namespace TutorConnect.Infrastructure.SqlServer.Services
{
    internal sealed class TutorService : ITutorService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly TutorMetricsProvider _metricsProvider;

        public TutorService(ApplicationDbContext dbContext, TutorMetricsProvider metricsProvider)
        {
            _dbContext = dbContext;
            _metricsProvider = metricsProvider;
        }

        public async Task<TutorOwnerProfileResponse> GetOwnerProfileAsync(
            long tutorId,
            CancellationToken cancellationToken = default)
        {
            var profile = await LoadProfileAsync(tutorId, tracking: false, cancellationToken);
            var metrics = await GetMetricsAsync(tutorId, cancellationToken);
            return ToOwnerResponse(profile, metrics);
        }

        public async Task<TutorOwnerProfileResponse> UpdateOwnerProfileAsync(
            long tutorId,
            TutorProfileUpdateRequest request,
            CancellationToken cancellationToken = default)
        {
            var profile = await LoadProfileAsync(tutorId, tracking: true, cancellationToken);
            EnsureActiveTutor(profile);

            if (request.ExperienceYears is < 0 or > 80)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(request.ExperienceYears),
                    "ExperienceYears must be between 0 and 80.");
            }

            profile.UpdateProfessionalInformation(
                request.Bio,
                request.Qualification,
                (short)request.ExperienceYears,
                request.VerificationDocumentUrl);

            await _dbContext.SaveChangesAsync(cancellationToken);
            var metrics = await GetMetricsAsync(tutorId, cancellationToken);
            return ToOwnerResponse(profile, metrics);
        }

        public async Task<TutorOwnerProfileResponse> SubmitProfileAsync(
            long tutorId,
            CancellationToken cancellationToken = default)
        {
            var profile = await LoadProfileAsync(tutorId, tracking: true, cancellationToken);
            EnsureActiveTutor(profile);
            EnsureProfileReadyForReview(profile);

            profile.Submit(DateTime.UtcNow);
            await _dbContext.SaveChangesAsync(cancellationToken);

            var metrics = await GetMetricsAsync(tutorId, cancellationToken);
            return ToOwnerResponse(profile, metrics);
        }

        public async Task<TutorPublicProfileResponse> GetPublicProfileAsync(
            long tutorId,
            CancellationToken cancellationToken = default)
        {
            var profile = await LoadProfileAsync(tutorId, tracking: false, cancellationToken);

            if (profile.User.Status != UserStatus.Active
                || profile.ApprovalStatus != TutorApprovalStatus.Approved)
            {
                throw new NotFoundException("Tutor profile not found.");
            }

            var metrics = await GetMetricsAsync(tutorId, cancellationToken);
            return ToPublicResponse(profile, metrics);
        }

        public async Task<IReadOnlyList<TutorAdminProfileResponse>> GetAdminProfilesAsync(
            string? status,
            long adminId,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveAdminAsync(adminId, cancellationToken);

            TutorApprovalStatus? parsedStatus = null;
            if (!string.IsNullOrWhiteSpace(status))
            {
                if (!Enum.TryParse<TutorApprovalStatus>(status.Trim(), true, out var value))
                {
                    throw new ArgumentException("Unknown tutor approval status.", nameof(status));
                }

                parsedStatus = value;
            }

            var query = _dbContext.TutorProfiles
                .AsNoTracking()
                .Include(p => p.User)
                .Include(p => p.TutorSubjects)
                    .ThenInclude(ts => ts.Subject)
                .AsQueryable();

            if (parsedStatus.HasValue)
            {
                query = query.Where(p => p.ApprovalStatus == parsedStatus.Value);
            }

            var profiles = await query
                .OrderByDescending(p => p.SubmittedAtUtc)
                .ThenBy(p => p.User.FullName)
                .ToListAsync(cancellationToken);

            var metrics = await _metricsProvider.GetAsync(
                profiles.Select(p => p.UserId),
                cancellationToken);

            return profiles
                .Select(p => ToAdminResponse(p, GetMetric(metrics, p.UserId)))
                .ToList();
        }

        public async Task<TutorAdminProfileResponse> GetAdminProfileAsync(
            long tutorId,
            long adminId,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveAdminAsync(adminId, cancellationToken);
            var profile = await LoadProfileAsync(tutorId, tracking: false, cancellationToken);
            var metrics = await GetMetricsAsync(tutorId, cancellationToken);
            return ToAdminResponse(profile, metrics);
        }

        public async Task<TutorAdminProfileResponse> ReviewProfileAsync(
            long tutorId,
            long adminId,
            TutorApprovalUpdateRequest request,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveAdminAsync(adminId, cancellationToken);
            var profile = await LoadProfileAsync(tutorId, tracking: true, cancellationToken);

            if (profile.ApprovalStatus != TutorApprovalStatus.Pending)
            {
                throw new InvalidOperationException("Only a Pending tutor profile can be approved or rejected.");
            }

            var status = request.Status?.Trim();
            if (string.Equals(status, nameof(TutorApprovalStatus.Approved), StringComparison.OrdinalIgnoreCase))
            {
                EnsureProfileReadyForReview(profile);
                profile.Approve(adminId, DateTime.UtcNow, request.ReviewNote);
            }
            else if (string.Equals(status, nameof(TutorApprovalStatus.Rejected), StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(request.ReviewNote))
                {
                    throw new ArgumentException("ReviewNote is required when rejecting a tutor profile.");
                }

                profile.Reject(adminId, request.ReviewNote, DateTime.UtcNow);
            }
            else
            {
                throw new ArgumentException("Status must be Approved or Rejected.", nameof(request.Status));
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            var metrics = await GetMetricsAsync(tutorId, cancellationToken);
            return ToAdminResponse(profile, metrics);
        }

        public async Task<IReadOnlyList<TutorSubjectResponse>> GetTutorSubjectsAsync(
            long tutorId,
            CancellationToken cancellationToken = default)
        {
            await EnsureTutorExistsAsync(tutorId, cancellationToken);

            return await _dbContext.TutorSubjects
                .AsNoTracking()
                .Where(ts => ts.TutorId == tutorId)
                .Include(ts => ts.Subject)
                .OrderBy(ts => ts.Subject.Name)
                .ThenBy(ts => ts.TeachingLevel)
                .Select(ts => new TutorSubjectResponse(
                    ts.Id,
                    ts.TutorId,
                    new SubjectResponse(
                        ts.Subject.Id,
                        ts.Subject.Code,
                        ts.Subject.Name,
                        ts.Subject.Description,
                        ts.Subject.IsActive),
                    ts.TeachingLevel,
                    ts.FeePerSessionCredits,
                    ts.IsActive))
                .ToListAsync(cancellationToken);
        }

        public async Task<TutorSubjectResponse> CreateTutorSubjectAsync(
            long tutorId,
            TutorSubjectCreateRequest request,
            CancellationToken cancellationToken = default)
        {
            var profile = await LoadProfileAsync(tutorId, tracking: true, cancellationToken);
            EnsureActiveTutor(profile);

            var subject = await _dbContext.Subjects
                .FirstOrDefaultAsync(s => s.Id == request.SubjectId, cancellationToken);

            if (subject is null)
            {
                throw new NotFoundException("Subject not found.");
            }

            if (!subject.IsActive)
            {
                throw new InvalidOperationException("Inactive subjects cannot be assigned to tutors.");
            }

            if (string.IsNullOrWhiteSpace(request.TeachingLevel))
            {
                throw new ArgumentException("TeachingLevel is required.", nameof(request.TeachingLevel));
            }

            if (request.TeachingLevel.Trim().Length > 100)
            {
                throw new ArgumentException(
                    "TeachingLevel must not exceed 100 characters.",
                    nameof(request.TeachingLevel));
            }

            if (request.FeePerSessionCredits <= 0)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(request.FeePerSessionCredits),
                    "FeePerSessionCredits must be greater than zero.");
            }

            var teachingLevel = request.TeachingLevel.Trim();
            var existing = await _dbContext.TutorSubjects
                .Include(ts => ts.Subject)
                .FirstOrDefaultAsync(
                    ts => ts.TutorId == tutorId
                        && ts.SubjectId == request.SubjectId
                        && ts.TeachingLevel == teachingLevel,
                    cancellationToken);

            if (existing is not null)
            {
                if (existing.IsActive)
                {
                    throw new InvalidOperationException(
                        "This Subject and TeachingLevel are already assigned to the tutor.");
                }

                existing.UpdateFee(request.FeePerSessionCredits);
                existing.Activate();
                profile.RequireReapproval();
                await _dbContext.SaveChangesAsync(cancellationToken);
                return ToTutorSubjectResponse(existing);
            }

            var tutorSubject = new TutorSubject(
                tutorId,
                request.SubjectId,
                teachingLevel,
                request.FeePerSessionCredits);

            await _dbContext.TutorSubjects.AddAsync(tutorSubject, cancellationToken);
            profile.RequireReapproval();
            await _dbContext.SaveChangesAsync(cancellationToken);
            tutorSubject = await _dbContext.TutorSubjects
                .AsNoTracking()
                .Include(ts => ts.Subject)
                .FirstAsync(ts => ts.Id == tutorSubject.Id, cancellationToken);

            return ToTutorSubjectResponse(tutorSubject);
        }

        public async Task<TutorSubjectResponse> UpdateTutorSubjectAsync(
            long tutorId,
            long tutorSubjectId,
            TutorSubjectUpdateRequest request,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveTutorByIdAsync(tutorId, cancellationToken);

            var tutorSubject = await _dbContext.TutorSubjects
                .Include(ts => ts.Subject)
                .FirstOrDefaultAsync(
                    ts => ts.Id == tutorSubjectId && ts.TutorId == tutorId,
                    cancellationToken);

            if (tutorSubject is null)
            {
                throw new NotFoundException("TutorSubject not found.");
            }

            tutorSubject.UpdateFee(request.FeePerSessionCredits);
            await _dbContext.SaveChangesAsync(cancellationToken);
            return ToTutorSubjectResponse(tutorSubject);
        }

        public async Task<TutorSubjectResponse> SetTutorSubjectStatusAsync(
            long tutorId,
            long tutorSubjectId,
            TutorSubjectStatusRequest request,
            CancellationToken cancellationToken = default)
        {
            var profile = await LoadProfileAsync(tutorId, tracking: true, cancellationToken);
            EnsureActiveTutor(profile);

            var tutorSubject = profile.TutorSubjects.FirstOrDefault(ts => ts.Id == tutorSubjectId);

            if (tutorSubject is null)
            {
                throw new NotFoundException("TutorSubject not found.");
            }

            if (request.IsActive)
            {
                if (!tutorSubject.Subject.IsActive)
                {
                    throw new InvalidOperationException("An inactive Subject cannot be activated for a tutor.");
                }

                if (!tutorSubject.IsActive)
                {
                    tutorSubject.Activate();
                    profile.RequireReapproval();
                }
            }
            else if (tutorSubject.IsActive)
            {
                tutorSubject.Deactivate();
                if (profile.ApprovalStatus is TutorApprovalStatus.Pending or TutorApprovalStatus.Rejected)
                {
                    profile.RequireReapproval();
                }
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            return ToTutorSubjectResponse(tutorSubject);
        }

        public async Task<IReadOnlyList<TutorAvailabilityResponse>> GetTutorAvailabilitiesAsync(
            long tutorId,
            CancellationToken cancellationToken = default)
        {
            await EnsureTutorExistsAsync(tutorId, cancellationToken);

            return await _dbContext.TutorAvailabilities
                .AsNoTracking()
                .Where(a => a.TutorId == tutorId)
                .OrderBy(a => a.DayOfWeek)
                .ThenBy(a => a.StartTime)
                .Select(a => new TutorAvailabilityResponse(
                    a.Id,
                    a.TutorId,
                    a.DayOfWeek,
                    a.StartTime,
                    a.EndTime,
                    a.IsActive))
                .ToListAsync(cancellationToken);
        }

        public async Task<TutorAvailabilityResponse> CreateTutorAvailabilityAsync(
            long tutorId,
            AvailabilityCreateRequest request,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveTutorByIdAsync(tutorId, cancellationToken);
            ValidateAvailabilityPeriod(request.DayOfWeek, request.StartTime, request.EndTime);

            var existing = await _dbContext.TutorAvailabilities
                .FirstOrDefaultAsync(
                    a => a.TutorId == tutorId
                        && a.DayOfWeek == request.DayOfWeek
                        && a.StartTime == request.StartTime
                        && a.EndTime == request.EndTime,
                    cancellationToken);

            if (existing is not null)
            {
                if (existing.IsActive)
                {
                    throw new InvalidOperationException("This weekly availability already exists.");
                }

                await EnsureNoAvailabilityOverlapAsync(
                    tutorId,
                    request.DayOfWeek,
                    request.StartTime,
                    request.EndTime,
                    existing.Id,
                    cancellationToken);

                existing.Activate();
                await _dbContext.SaveChangesAsync(cancellationToken);
                return ToAvailabilityResponse(existing);
            }

            await EnsureNoAvailabilityOverlapAsync(
                tutorId,
                request.DayOfWeek,
                request.StartTime,
                request.EndTime,
                null,
                cancellationToken);

            var availability = new TutorAvailability(
                tutorId,
                request.DayOfWeek,
                request.StartTime,
                request.EndTime);

            await _dbContext.TutorAvailabilities.AddAsync(availability, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
            return ToAvailabilityResponse(availability);
        }

        public async Task<TutorAvailabilityResponse> UpdateTutorAvailabilityAsync(
            long tutorId,
            long availabilityId,
            AvailabilityUpdateRequest request,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveTutorByIdAsync(tutorId, cancellationToken);
            ValidateAvailabilityPeriod(request.DayOfWeek, request.StartTime, request.EndTime);

            var availability = await _dbContext.TutorAvailabilities
                .FirstOrDefaultAsync(
                    a => a.Id == availabilityId && a.TutorId == tutorId,
                    cancellationToken);

            if (availability is null)
            {
                throw new NotFoundException("TutorAvailability not found.");
            }

            var duplicate = await _dbContext.TutorAvailabilities
                .AsNoTracking()
                .AnyAsync(
                    a => a.Id != availabilityId
                        && a.TutorId == tutorId
                        && a.DayOfWeek == request.DayOfWeek
                        && a.StartTime == request.StartTime
                        && a.EndTime == request.EndTime,
                    cancellationToken);

            if (duplicate)
            {
                throw new InvalidOperationException("This weekly availability already exists.");
            }

            if (availability.IsActive)
            {
                await EnsureNoAvailabilityOverlapAsync(
                    tutorId,
                    request.DayOfWeek,
                    request.StartTime,
                    request.EndTime,
                    availabilityId,
                    cancellationToken);
            }

            availability.ChangePeriod(request.DayOfWeek, request.StartTime, request.EndTime);
            await _dbContext.SaveChangesAsync(cancellationToken);
            return ToAvailabilityResponse(availability);
        }

        public async Task<TutorAvailabilityResponse> SetTutorAvailabilityStatusAsync(
            long tutorId,
            long availabilityId,
            AvailabilityStatusRequest request,
            CancellationToken cancellationToken = default)
        {
            await EnsureActiveTutorByIdAsync(tutorId, cancellationToken);

            var availability = await _dbContext.TutorAvailabilities
                .FirstOrDefaultAsync(
                    a => a.Id == availabilityId && a.TutorId == tutorId,
                    cancellationToken);

            if (availability is null)
            {
                throw new NotFoundException("TutorAvailability not found.");
            }

            if (request.IsActive && !availability.IsActive)
            {
                await EnsureNoAvailabilityOverlapAsync(
                    tutorId,
                    availability.DayOfWeek,
                    availability.StartTime,
                    availability.EndTime,
                    availability.Id,
                    cancellationToken);
                availability.Activate();
            }
            else if (!request.IsActive && availability.IsActive)
            {
                availability.Deactivate();
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            return ToAvailabilityResponse(availability);
        }

        private async Task EnsureNoAvailabilityOverlapAsync(
            long tutorId,
            DayOfWeek dayOfWeek,
            TimeOnly startTime,
            TimeOnly endTime,
            long? excludeAvailabilityId,
            CancellationToken cancellationToken)
        {
            var hasOverlap = await _dbContext.TutorAvailabilities
                .AsNoTracking()
                .AnyAsync(
                    a => a.TutorId == tutorId
                        && a.IsActive
                        && a.DayOfWeek == dayOfWeek
                        && (!excludeAvailabilityId.HasValue || a.Id != excludeAvailabilityId.Value)
                        && startTime < a.EndTime
                        && endTime > a.StartTime,
                    cancellationToken);

            if (hasOverlap)
            {
                throw new InvalidOperationException(
                    "Weekly availability cannot overlap another active availability window on the same day.");
            }
        }

        private static void ValidateAvailabilityPeriod(
            DayOfWeek dayOfWeek,
            TimeOnly startTime,
            TimeOnly endTime)
        {
            if (!Enum.IsDefined(dayOfWeek))
            {
                throw new ArgumentOutOfRangeException(nameof(dayOfWeek), "Unknown DayOfWeek value.");
            }

            if (endTime <= startTime)
            {
                throw new ArgumentException(
                    "End time must be later than start time. Overnight availability must be split into two weekly windows.");
            }
        }

        private static TutorAvailabilityResponse ToAvailabilityResponse(TutorAvailability availability)
        {
            return new TutorAvailabilityResponse(
                availability.Id,
                availability.TutorId,
                availability.DayOfWeek,
                availability.StartTime,
                availability.EndTime,
                availability.IsActive);
        }

        private async Task<TutorProfile> LoadProfileAsync(
            long tutorId,
            bool tracking,
            CancellationToken cancellationToken)
        {
            var query = _dbContext.TutorProfiles
                .Include(p => p.User)
                .Include(p => p.TutorSubjects)
                    .ThenInclude(ts => ts.Subject)
                .AsQueryable();

            if (!tracking)
            {
                query = query.AsNoTracking();
            }

            var profile = await query
                .FirstOrDefaultAsync(p => p.UserId == tutorId, cancellationToken);

            if (profile is null || profile.User.Role != UserRole.Tutor)
            {
                throw new NotFoundException("Tutor profile not found.");
            }

            return profile;
        }

        private async Task EnsureTutorExistsAsync(long tutorId, CancellationToken cancellationToken)
        {
            var exists = await _dbContext.TutorProfiles
                .AsNoTracking()
                .AnyAsync(p => p.UserId == tutorId && p.User.Role == UserRole.Tutor, cancellationToken);

            if (!exists)
            {
                throw new NotFoundException("Tutor profile not found.");
            }
        }

        private async Task EnsureActiveTutorByIdAsync(long tutorId, CancellationToken cancellationToken)
        {
            var profile = await _dbContext.TutorProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == tutorId, cancellationToken);

            if (profile is null)
            {
                throw new NotFoundException("Tutor profile not found.");
            }

            EnsureActiveTutor(profile);
        }

        private static void EnsureActiveTutor(TutorProfile profile)
        {
            if (profile.User.Role != UserRole.Tutor
                || profile.User.Status != UserStatus.Active
                || profile.ApprovalStatus == TutorApprovalStatus.Suspended)
            {
                throw new ForbiddenException("Only an active, non-suspended Tutor can perform this action.");
            }
        }

        private static void EnsureProfileReadyForReview(TutorProfile profile)
        {
            if (string.IsNullOrWhiteSpace(profile.Qualification))
            {
                throw new InvalidOperationException("Qualification is required before submitting or approving a tutor profile.");
            }

            if (!profile.TutorSubjects.Any(ts => ts.IsActive && ts.Subject.IsActive))
            {
                throw new InvalidOperationException(
                    "At least one active TutorSubject is required before submitting or approving a tutor profile.");
            }
        }

        private async Task EnsureActiveAdminAsync(long adminId, CancellationToken cancellationToken)
        {
            var admin = await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == adminId, cancellationToken);

            if (admin is null || admin.Role != UserRole.Admin || admin.Status != UserStatus.Active)
            {
                throw new ForbiddenException("Only an active Admin can perform this action.");
            }
        }

        private async Task<TutorMetrics> GetMetricsAsync(
            long tutorId,
            CancellationToken cancellationToken)
        {
            var metrics = await _metricsProvider.GetAsync(new[] { tutorId }, cancellationToken);
            return GetMetric(metrics, tutorId);
        }

        private static TutorMetrics GetMetric(
            IReadOnlyDictionary<long, TutorMetrics> metrics,
            long tutorId)
        {
            return metrics.TryGetValue(tutorId, out var value)
                ? value
                : new TutorMetrics(0d, 0, 50d);
        }

        private static TutorOwnerProfileResponse ToOwnerResponse(TutorProfile profile, TutorMetrics metrics)
        {
            return new TutorOwnerProfileResponse(
                profile.UserId,
                profile.User.FullName,
                profile.Bio,
                profile.Qualification,
                profile.ExperienceYears,
                metrics.AverageRating,
                metrics.ReviewCount,
                metrics.ReputationScore,
                profile.TutorSubjects
                    .OrderBy(ts => ts.Subject.Name)
                    .ThenBy(ts => ts.TeachingLevel)
                    .Select(ToTutorSubjectSummaryResponse)
                    .ToList(),
                profile.User.Phone,
                profile.VerificationDocumentUrl,
                profile.ApprovalStatus,
                profile.ReviewNote,
                profile.SubmittedAtUtc,
                profile.ReviewedAtUtc);
        }

        private static TutorPublicProfileResponse ToPublicResponse(TutorProfile profile, TutorMetrics metrics)
        {
            return new TutorPublicProfileResponse(
                profile.UserId,
                profile.User.FullName,
                profile.Bio,
                profile.Qualification,
                profile.ExperienceYears,
                metrics.AverageRating,
                metrics.ReviewCount,
                metrics.ReputationScore,
                profile.TutorSubjects
                    .Where(ts => ts.IsActive && ts.Subject.IsActive)
                    .OrderBy(ts => ts.Subject.Name)
                    .ThenBy(ts => ts.TeachingLevel)
                    .Select(ToTutorSubjectSummaryResponse)
                    .ToList());
        }

        private static TutorAdminProfileResponse ToAdminResponse(TutorProfile profile, TutorMetrics metrics)
        {
            return new TutorAdminProfileResponse(
                profile.UserId,
                profile.User.FullName,
                profile.Bio,
                profile.Qualification,
                profile.ExperienceYears,
                metrics.AverageRating,
                metrics.ReviewCount,
                metrics.ReputationScore,
                profile.TutorSubjects
                    .OrderBy(ts => ts.Subject.Name)
                    .ThenBy(ts => ts.TeachingLevel)
                    .Select(ToTutorSubjectSummaryResponse)
                    .ToList(),
                profile.User.Phone,
                profile.VerificationDocumentUrl,
                profile.ApprovalStatus,
                profile.ReviewNote,
                profile.SubmittedAtUtc,
                profile.ReviewedAtUtc,
                profile.User.Email,
                profile.User.Status,
                profile.ReviewedByAdminId);
        }

        private static TutorSubjectSummaryResponse ToTutorSubjectSummaryResponse(TutorSubject tutorSubject)
        {
            return new TutorSubjectSummaryResponse(
                tutorSubject.Id,
                ToSubjectResponse(tutorSubject.Subject),
                tutorSubject.TeachingLevel,
                tutorSubject.FeePerSessionCredits,
                tutorSubject.IsActive);
        }

        private static TutorSubjectResponse ToTutorSubjectResponse(TutorSubject tutorSubject)
        {
            return new TutorSubjectResponse(
                tutorSubject.Id,
                tutorSubject.TutorId,
                ToSubjectResponse(tutorSubject.Subject),
                tutorSubject.TeachingLevel,
                tutorSubject.FeePerSessionCredits,
                tutorSubject.IsActive);
        }

        private static SubjectResponse ToSubjectResponse(Subject subject)
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
