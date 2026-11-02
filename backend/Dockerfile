# ===== Build stage =====
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY TutorConnect.slnx ./
COPY TutorConnect.API/TutorConnect.API.csproj TutorConnect.API/
COPY TutorConnect.Application/TutorConnect.Application.csproj TutorConnect.Application/
COPY TutorConnect.Domain/TutorConnect.Domain.csproj TutorConnect.Domain/
COPY TutorConnect.Infrastructure.SqlServer/TutorConnect.Infrastructure.SqlServer.csproj TutorConnect.Infrastructure.SqlServer/

RUN dotnet restore TutorConnect.slnx

COPY . .
RUN dotnet publish TutorConnect.API/TutorConnect.API.csproj -c Release -o /app/publish

# ===== Runtime stage =====
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "TutorConnect.API.dll"]