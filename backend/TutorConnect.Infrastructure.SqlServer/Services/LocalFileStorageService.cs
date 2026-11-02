using Microsoft.Extensions.Configuration;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Infrastructure.SqlServer.Services
{
    /// <summary>
    /// Lưu file vào thư mục cục bộ (wwwroot/uploads theo mặc định) và trả về URL tương đối
    /// để phục vụ qua static files middleware. Có thể thay bằng cloud storage (S3/Azure Blob)
    /// sau này bằng cách implement lại IFileStorageService, không ảnh hưởng Application layer.
    /// </summary>
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly string _rootPath;
        private readonly string _publicBaseUrl;

        public LocalFileStorageService(IConfiguration configuration)
        {
            var configuredRoot = configuration["Storage:RootPath"];
            _rootPath = string.IsNullOrWhiteSpace(configuredRoot)
                ? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")
                : configuredRoot;

            _publicBaseUrl = (configuration["Storage:PublicBaseUrl"] ?? "/uploads").TrimEnd('/');
        }

        public async Task<StoredFile> SaveAsync(
            Stream content,
            string originalFileName,
            string contentType,
            long sizeBytes,
            string subFolder,
            CancellationToken cancellationToken = default)
        {
            if (content == null)
            {
                throw new ArgumentNullException(nameof(content));
            }

            if (string.IsNullOrWhiteSpace(subFolder))
            {
                throw new ArgumentException("Sub folder is required.", nameof(subFolder));
            }

            var extension = Path.GetExtension(originalFileName);
            var safeFileName = $"{Guid.NewGuid():N}{extension}";

            var folderPath = Path.Combine(_rootPath, "uploads", subFolder);
            Directory.CreateDirectory(folderPath);

            var absolutePath = Path.Combine(folderPath, safeFileName);

            await using (var fileStream = new FileStream(absolutePath, FileMode.CreateNew, FileAccess.Write))
            {
                await content.CopyToAsync(fileStream, cancellationToken);
            }

            var fileUrl = $"{_publicBaseUrl}/{subFolder}/{safeFileName}";

            return new StoredFile(fileUrl, originalFileName, contentType, sizeBytes);
        }
    }
}
