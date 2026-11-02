namespace TutorConnect.Domain.Common
{
    internal static class DomainGuard
    {
        public static string Required(string? value, string parameterName, int maxLength)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException($"{parameterName} is required.", parameterName);
            }

            var trimmedValue = value.Trim();
            if (trimmedValue.Length > maxLength)
            {
                throw new ArgumentException(
                    $"{parameterName} must not exceed {maxLength} characters.",
                    parameterName);
            }

            return trimmedValue;
        }

        public static string Email(string? value, string parameterName)
        {
            var normalizedEmail = Required(value, parameterName, 320).ToLowerInvariant();

            if (normalizedEmail.Any(char.IsWhiteSpace))
            {
                throw new ArgumentException(
                    $"{parameterName} must not contain whitespace.",
                    parameterName);
            }

            return normalizedEmail;
        }

        public static string? Optional(string? value, string parameterName, int maxLength)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            var trimmedValue = value.Trim();
            if (trimmedValue.Length > maxLength)
            {
                throw new ArgumentException(
                    $"{parameterName} must not exceed {maxLength} characters.",
                    parameterName);
            }

            return trimmedValue;
        }

        public static void Positive(int value, string parameterName)
        {
            if (value <= 0)
            {
                throw new ArgumentOutOfRangeException(parameterName, "Value must be greater than zero.");
            }
        }

        public static void Positive(long value, string parameterName)
        {
            if (value <= 0)
            {
                throw new ArgumentOutOfRangeException(parameterName, "Value must be greater than zero.");
            }
        }

        public static void InRange(short value, short minimum, short maximum, string parameterName)
        {
            if (value < minimum || value > maximum)
            {
                throw new ArgumentOutOfRangeException(
                    parameterName,
                    $"Value must be between {minimum} and {maximum}.");
            }
        }

        public static void Positive(short value, string parameterName)
        {
            if (value <= 0)
            {
                throw new ArgumentOutOfRangeException(parameterName, "Value must be greater than zero.");
            }
        }

        public static void Rating(byte value, string parameterName)
        {
            if (value is < 1 or > 5)
            {
                throw new ArgumentOutOfRangeException(parameterName, "Rating must be between 1 and 5.");
            }
        }

        public static void Percentage(decimal value, string parameterName)
        {
            if (value is < 0 or > 100)
            {
                throw new ArgumentOutOfRangeException(parameterName, "Percentage must be between 0 and 100.");
            }
        }

        public static void Period(DateTime startTimeUtc, DateTime endTimeUtc)
        {
            if (endTimeUtc <= startTimeUtc)
            {
                throw new ArgumentException("End time must be later than start time.");
            }
        }

        public static void Period(TimeOnly startTime, TimeOnly endTime)
        {
            if (endTime <= startTime)
            {
                throw new ArgumentException(
                    "End time must be later than start time. Overnight availability must be split into two weekly windows.");
            }
        }

        public static void Score(decimal? score, decimal? maxScore)
        {
            if (score is null && maxScore is null)
            {
                return;
            }

            if (score is null || maxScore is null)
            {
                throw new ArgumentException("Score and MaxScore must either both have values or both be null.");
            }

            if (maxScore <= 0 || score < 0 || score > maxScore)
            {
                throw new ArgumentException("Score must satisfy 0 <= Score <= MaxScore and MaxScore > 0.");
            }
        }

        public static void DefinedEnum<TEnum>(TEnum value, string parameterName)
            where TEnum : struct, Enum
        {
            if (!Enum.IsDefined(value))
            {
                throw new ArgumentOutOfRangeException(parameterName, $"Unknown {typeof(TEnum).Name} value.");
            }
        }
    }
}
