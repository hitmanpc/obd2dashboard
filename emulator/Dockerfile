# Use an official Python runtime as a base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# copy requirements.txt (must include the git+... line)
COPY requirements.txt .

# Install required packages
RUN apt-get update && apt-get install -y \
    git \
    tini \
    procps \
    gcc \
    python3-dev \
    build-essential \
    # socat \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install setuptools with pkg_resources support BEFORE installing requirements
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir "setuptools<70.0.0" wheel

# Set environment variable to use system setuptools instead of isolated build env
ENV PIP_NO_BUILD_ISOLATION=1

# Install Python dependencies
RUN pip install --no-cache-dir --no-build-isolation -r requirements.txt 

# Expose port (default is 35000 but change if needed)
EXPOSE 35000

# Set environment variable for Python unbuffered output
ENV PYTHONUNBUFFERED=1

# Use tini as init system
ENTRYPOINT ["/usr/bin/tini", "--"]

# Create a startup script
# COPY tcp2UsbScript.sh /app/
# RUN chmod +x /app/tcp2UsbScript.sh
COPY start.sh /app/
RUN chmod +x /app/start.sh


# Default command to run the emulator
CMD ["/app/start.sh"]

# CMD ["/app/tcp2UsbScript.sh"]
# CMD ["python", "-m", "elm", "-n", "35000", "--daemon"]