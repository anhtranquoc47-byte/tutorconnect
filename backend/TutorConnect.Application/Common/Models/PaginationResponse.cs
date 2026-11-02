using System.Text.Json.Serialization;

namespace TutorConnect.Application.Common.Models
{
    public sealed class PaginationResponse<T>
    {
        [JsonPropertyName("items")]
        public IReadOnlyList<T> Items { get; set; } = Array.Empty<T>();

        [JsonPropertyName("pageNumber")]
        public int PageNumber { get; set; }

        [JsonPropertyName("pageSize")]
        public int PageSize { get; set; }

        [JsonPropertyName("totalItems")]
        public long TotalItems { get; set; }

        [JsonPropertyName("totalPages")]
        public int TotalPages => PageSize <= 0
            ? 0
            : (int)Math.Ceiling(TotalItems / (double)PageSize);

        public PaginationResponse()
        {
        }

        public PaginationResponse(
            IReadOnlyList<T> items,
            long totalItems,
            int pageNumber,
            int pageSize)
        {
            Items = items;
            TotalItems = totalItems;
            PageNumber = pageNumber;
            PageSize = pageSize;
        }
    }
}
