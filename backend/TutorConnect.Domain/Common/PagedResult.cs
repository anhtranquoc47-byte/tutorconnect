namespace TutorConnect.Domain.Common
{
    /// <summary>
    /// Framework-independent paged data container.
    /// </summary>
    public sealed class PagedResult<T>
    {
        public IReadOnlyList<T> Items { get; }
        public int TotalCount { get; }

        public PagedResult(IReadOnlyList<T> items, int totalCount)
        {
            Items = items;
            TotalCount = totalCount;
        }
    }
}
