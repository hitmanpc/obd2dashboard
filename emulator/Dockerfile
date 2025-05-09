# Use an official Python runtime as a base image
FROM python:3.13-slim-bullseye

# Set working directory
WORKDIR /app

# copy requirements.txt (must include the git+... line)
COPY requirements.txt .

# Install git (needed to clone the repo)
RUN apt-get update && apt-get install -y git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


# Install Python dependencies

RUN pip install --no-cache-dir -r requirements.txt

# Expose port (default is 35000 but change if needed)
EXPOSE 35000

# Set environment variable for Python unbuffered output
# ENV PYTHONUNBUFFERED=1

# Default command to run the emulator (listening on TCP socket)
CMD ["sh", "-c", "python -m elm -n 35000 --daemon && tail -f /dev/null"]
