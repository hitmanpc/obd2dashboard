# Use an official Python runtime as a base image
FROM python:3.13-slim-bullseye

# Set working directory
WORKDIR /app

# copy requirements.txt (must include the git+... line)
COPY requirements.txt .

# Install required packages
RUN apt-get update && apt-get install -y \
    git \
    tini \
    procps \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


# Install Python dependencies

RUN pip install --no-cache-dir -r requirements.txt

# Expose port (default is 35000 but change if needed)
EXPOSE 35000

# Set environment variable for Python unbuffered output
ENV PYTHONUNBUFFERED=1

# Use tini as init system
ENTRYPOINT ["/usr/bin/tini", "--"]

# Create a startup script
COPY start.sh /app/
RUN chmod +x /app/start.sh

# Default command to run the emulator
CMD ["/app/start.sh"]
# CMD ["python", "-m", "elm", "-n", "35000", "--daemon"] 