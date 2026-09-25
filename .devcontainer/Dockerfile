FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

# Install base tools, Java 17, Node.js 20, Maven, and PostgreSQL client
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        curl \
        wget \
        git \
        gnupg2 \
        ca-certificates \
        lsb-release \
        openjdk-17-jdk \
        maven \
        postgresql-client \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH
