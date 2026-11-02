using System.Text.Json.Serialization;

namespace TutorConnect.API.Models
{
    /// <summary>
    /// Consistent response envelope used by API controllers and exception handling.
    /// </summary>
    public sealed class ApiResponse<T>
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public T? Data { get; set; }

        [JsonPropertyName("code")]
        public int Code { get; set; }
    }
}
