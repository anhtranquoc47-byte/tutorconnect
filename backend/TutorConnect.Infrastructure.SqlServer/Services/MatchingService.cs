using Microsoft.EntityFrameworkCore;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Availability.DTOs;
using TutorConnect.Application.Features.Matching.DTOs;
using TutorConnect.Application.Services;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Enums;
using TutorConnect.Infrastructure.SqlServer.Persistence;

namespace TutorConnect.Infrastructure.SqlServer.Services
{
    internal sealed class MatchingService : IMatchingService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly TutorMetricsProvider _metricsProvider;

        public MatchingService(ApplicationDbContext dbContext, TutorMetricsProvider metricsProvider)
        {
            _dbContext = dbContext;
            _metricsProvider = metricsProvider;
        }

public async Task<IReadOnlyList<TutorSearchItemResponse>> SearchTutorsAsync(
    TutorSearchRequest request,
    long studentId,
    CancellationToken cancellationToken = default)
{
    if (request.SubjectId <= 0)
    {
        throw new ArgumentOutOfRangeException(nameof(request.SubjectId), "SubjectId must be greater than zero.");
    }

    if (string.IsNullOrWhiteSpace(request.TeachingLevel))
    {
        throw new ArgumentException("TeachingLevel is required.", nameof(request.TeachingLevel));
    }

    var student = await _dbContext.Users
        .AsNoTracking()
        .FirstOrDefaultAsync(u => u.Id == studentId, cancellationToken);

    if (student is null)
    {
        throw new NotFoundException("Student not found.");
    }

    if (student.Role != UserRole.Student || student.Status != UserStatus.Active)
    {
        throw new ForbiddenException("Only an active Student can search for matching tutors.");
    }

    var subject = await _dbContext.Subjects
        .AsNoTracking()
        .FirstOrDefaultAsync(s => s.Id == request.SubjectId, cancellationToken);

    if (subject is null)
    {
        throw new NotFoundException("Subject not found.");
    }

    if (!subject.IsActive)
    {
        return Array.Empty<TutorSearchItemResponse>();
    }

    var teachingLevel = request.TeachingLevel.Trim();

       // Tìm tất cả gia sư đang hoạt động dạy môn học này
    var candidates = await _dbContext.TutorSubjects
        .AsNoTracking()
        .Include(ts => ts.Subject)
        .Include(ts => ts.Tutor)
            .ThenInclude(t => t.User)
        .Include(ts => ts.Tutor)
            .ThenInclude(t => t.TutorAvailabilities)
        .Where(ts =>
            ts.IsActive
            && ts.SubjectId == request.SubjectId
            && ts.Subject.IsActive
            && ts.Tutor.User.Role == UserRole.Tutor
            && ts.Tutor.User.Status == UserStatus.Active)
        .ToListAsync(cancellationToken);

      // Lọc theo Cấp độ (Tiểu học, THCS, THPT, Đại học hoặc Tất cả cấp độ)
    candidates = candidates
        .Where(ts => MatchesTeachingLevel(ts.TeachingLevel, teachingLevel))
        .ToList();

    // Nếu học viên có chọn ngày/giờ cụ thể thì chỉ loại bỏ Gia sư đang bận dạy MÔN KHÁC (cùng môn thì vẫn giữ lại để dạy nhóm)
    if (request.StartTimeUtc.HasValue && request.EndTimeUtc.HasValue && request.StartTimeUtc.Value != default && request.EndTimeUtc.Value != default)
    {
        var startTimeUtc = NormalizeUtc(request.StartTimeUtc.Value);
        var endTimeUtc = NormalizeUtc(request.EndTimeUtc.Value);

        var tutorIds = candidates.Select(ts => ts.TutorId).Distinct().ToArray();

        var busyTutorIds = await _dbContext.Bookings
            .AsNoTracking()
            .Where(b => tutorIds.Contains(b.TutorSubject.TutorId)
                && b.TutorSubject.SubjectId != request.SubjectId // Trùng giờ KHÁC MÔN HỌC
                && (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Confirmed)
                && startTimeUtc < b.EndTimeUtc
                && endTimeUtc > b.StartTimeUtc)
            .Select(b => b.TutorSubject.TutorId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var busySet = busyTutorIds.ToHashSet();
        candidates = candidates.Where(ts => !busySet.Contains(ts.TutorId)).ToList();
    }

    if (candidates.Count == 0)
    {
        return Array.Empty<TutorSearchItemResponse>();
    }

    var metrics = await _metricsProvider.GetAsync(
        candidates.Select(ts => ts.TutorId),
        cancellationToken);

    return candidates
        .Select(ts =>
        {
            var metric = metrics.TryGetValue(ts.TutorId, out var value)
                ? value
                : new TutorMetrics(0d, 0, 50d);

            return new TutorSearchItemResponse(
                ts.TutorId,
                ts.Tutor.User.FullName,
                ts.Tutor.Bio,
                ts.Tutor.Qualification,
                ts.Tutor.ExperienceYears,
                ts.SubjectId,
                ts.Subject.Name,
                ts.TeachingLevel,
                ts.FeePerSessionCredits,
                metric.AverageRating,
                metric.ReviewCount,
                100d,
                null,
                metric.ReputationScore);
        })
        .OrderByDescending(x => x.ReputationScore)
        .ThenByDescending(x => x.AverageRating)
        .ThenByDescending(x => x.ReviewCount)
        .ThenBy(x => x.FeePerSessionCredits)
        .ThenByDescending(x => x.ExperienceYears)
        .ThenBy(x => x.FullName)
        .ToList();
}

        private static bool IsCoveredByWeeklyAvailability(
            TutorProfile tutor,
            DateTime startTimeUtc,
            DateTime endTimeUtc)
        {
            TimeZoneInfo timeZone;
            try
            {
                timeZone = TimeZoneInfo.FindSystemTimeZoneById(tutor.User.TimeZoneId);
            }
            catch (TimeZoneNotFoundException)
            {
                return false;
            }
            catch (InvalidTimeZoneException)
            {
                return false;
            }

            var localStart = TimeZoneInfo.ConvertTimeFromUtc(startTimeUtc, timeZone);
            var localEnd = TimeZoneInfo.ConvertTimeFromUtc(endTimeUtc, timeZone);
            if (localStart.Date != localEnd.Date || localStart.DayOfWeek != localEnd.DayOfWeek)
            {
                return false;
            }

            var startTime = TimeOnly.FromDateTime(localStart);
            var endTime = TimeOnly.FromDateTime(localEnd);

            return tutor.TutorAvailabilities.Any(a => a.IsActive
                && a.DayOfWeek == localStart.DayOfWeek
                && a.StartTime <= startTime
                && a.EndTime >= endTime);
        }

        private static DateTime NormalizeUtc(DateTime value)
        {
            return value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
            };
        }

              private static string NormalizeTeachingLevel(string? level)
        {
            var trimmed = level?.Trim();
            if (string.IsNullOrEmpty(trimmed)) return string.Empty;

            return trimmed switch
            {
                "Tiểu học" or "Primary School" or "Beginner" or "Cơ bản" => "Tiểu học",
                "THCS" or "Middle School" or "Intermediate" or "Trung bình" => "THCS",
                "THPT" or "High School" or "Advanced" or "Nâng cao" or "IELTS" => "THPT",
                "Đại học" or "University" => "Đại học",
                "Tất cả" or "All Levels" => "All Levels",
                _ => trimmed
            };
        }

        private static bool MatchesTeachingLevel(string tutorLevel, string requestedLevel)
        {
            var normalizedRequested = NormalizeTeachingLevel(requestedLevel);

            if (string.Equals(normalizedRequested, "All Levels", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            var normalizedTutor = NormalizeTeachingLevel(tutorLevel);
            if (string.Equals(normalizedTutor, "All Levels", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return string.Equals(normalizedTutor, normalizedRequested, StringComparison.OrdinalIgnoreCase);
        }
    }
}