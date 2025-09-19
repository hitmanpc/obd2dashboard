FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

RUN apt-get update && apt-get install -y socat

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ObdDashboard.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
USER root
ENTRYPOINT ["sh", "-c", "mkdir -p /virtual && socat -d -d PTY,link=/virtual/usb1,raw,echo=0,mode=666 TCP:elm327Emulator:35000 & dotnet ObdDashboard.dll"]
# ENTRYPOINT ["sh", "-c", "socat -d -d PTY,link=/virtual/usb1,raw,echo=0,mode=666 TCP:elm327Emulator:35000 & dotnet ObdDashboard.dll"]
# ENTRYPOINT [ "dotnet","ObdDashboard.dll" ]