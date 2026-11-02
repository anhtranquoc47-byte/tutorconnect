using System.ComponentModel.DataAnnotations;

namespace TutorConnect.API.Models
{
    public sealed class PaginationRequest
    {
        private const int MaxPageSize = 100;

        [Range(1, int.MaxValue, ErrorMessage = "PageNumber must be at least 1.")]
        public int PageNumber { get; set; } = 1;

        [Range(1, MaxPageSize, ErrorMessage = "PageSize must be between 1 and 100.")]
        public int PageSize { get; set; } = 20;
    }
}
