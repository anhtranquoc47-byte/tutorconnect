namespace TutorConnect.Domain.Interfaces
{
    public sealed record StoredFile(string FileUrl, string OriginalFileName, string ContentType, long SizeBytes);

    /// <summary>
    /// Lưu trữ file upload (ảnh bằng chứng khiếu nại, avatar, v.v.) và trả về URL công khai.
    /// </summary>
    public interface IFileStorageService
    {
        Task<StoredFile> SaveAsync(
            Stream content,
            string originalFileName,
            string contentType,
            long sizeBytes,
            string subFolder,
            CancellationToken cancellationToken = default);
    }
}
