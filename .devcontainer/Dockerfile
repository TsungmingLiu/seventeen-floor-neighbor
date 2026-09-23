FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg openssh-server \
    && mkdir -p /run/sshd \
    && rm -rf /var/lib/apt/lists/*

USER node
