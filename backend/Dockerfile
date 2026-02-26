# Stage 1: Use a slim Python base image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install ffmpeg
# This is the key step to solve the system dependency problem.
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the requirements file
COPY requirements.txt .

# Install Python dependencies
# --no-cache-dir reduces image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Set a healthy default for Gunicorn workers
# This can be overridden with environment variables
ENV WORKERS ${WORKERS:-2}
ENV THREADS ${THREADS:-4}

# Command to run the application using Gunicorn (a production server)
# uvicorn.workers.UvicornWorker allows Gunicorn to run an ASGI app (FastAPI)
# We bind to 0.0.0.0 to accept connections from outside the container.
CMD ["gunicorn", \
     "-w", "1", \
     "-k", "uvicorn.workers.UvicornWorker", \
     "-b", "0.0.0.0:8000", \
     "main:app"]