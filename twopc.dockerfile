﻿FROM node:5.7.1-slim
#TODO - Make accurate
MAINTAINER bobo <info@nowhere.org>

ENV FFMPEG_VERSION 2.8.6
ENV YASM_VERSION 1.3.0
ENV LAME_VERSION 3_99_5
ENV NGINX_VERSION 1.9.9
ENV NGINX_RTMP_VERSION 1.1.7.10

ENV SRC "/usr/local"
ENV LD_LIBRARY_PATH "${SRC}/lib"
ENV PKG_CONFIG_PATH "${SRC}/lib/pkgconfig"

ENV BUILDDEPS "autoconf automake gcc g++ libtool make nasm zlib1g-dev libssl-dev xz-utils cmake build-essential libpcre3-dev"

RUN rm -rf /var/lib/apt/lists/* && \
    apt-get update && \
    apt-get install -y --force-yes curl git libpcre3 tar perl ca-certificates ${BUILDDEPS}

# yasm
RUN DIR="$(mktemp -d)" && cd "${DIR}" && \
    curl -LOks "https://www.tortall.net/projects/yasm/releases/yasm-${YASM_VERSION}.tar.gz" && \
    tar xzvf "yasm-${YASM_VERSION}.tar.gz" && \
    cd "yasm-${YASM_VERSION}" && \
    ./configure \
        --prefix="${SRC}" \
        --bindir="${SRC}/bin" && \
    make -j"$(nproc)" && \
    make install && \
    make distclean && \
    rm -rf "${DIR}"

# x264
RUN DIR="$(mktemp -d)" && cd "${DIR}" && \
    git clone --depth 1 "git://git.videolan.org/x264" && \
    cd x264 && \
    ./configure \
        --prefix="${SRC}" \
        --bindir="${SRC}/bin" \
        --enable-static \
        --disable-cli && \
    make -j"$(nproc)" && \
    make install && \
    make distclean && \
    rm -rf "${DIR}"

# libmp3lame
RUN DIR="$(mktemp -d)" && cd "${DIR}" && \
    curl -LOks "https://github.com/rbrito/lame/archive/RELEASE__${LAME_VERSION}.tar.gz" && \
    tar xzvf "RELEASE__${LAME_VERSION}.tar.gz" && \
    cd "lame-RELEASE__${LAME_VERSION}" && \
    ./configure \
        --prefix="${SRC}" \
        --bindir="${SRC}/bin" \
        --enable-nasm \
        --disable-shared && \
    make -j"$(nproc)" && \
    make install && \
    make distclean && \
    rm -rf "${DIR}"

# ffmpeg
# patch: andrew-shulgin Ignore invalid sprop-parameter-sets missing PPS
RUN DIR="$(mktemp -d)" && cd "${DIR}" && \
    curl -LOks "https://ffmpeg.org/releases/ffmpeg-${FFMPEG_VERSION}.tar.gz" && \
    tar xzvf "ffmpeg-${FFMPEG_VERSION}.tar.gz" && \
    cd "ffmpeg-${FFMPEG_VERSION}" && \
    curl -Lks "https://github.com/FFmpeg/FFmpeg/commit/1c7e2cf9d33968375ee4025d2279c937e147dae2.patch" | patch -p1 && \
    ./configure \
        --prefix="${SRC}" \
        --bindir="${SRC}/bin" \
        --extra-cflags="-I${SRC}/include" \
        --extra-ldflags="-L${SRC}/lib" \
        --extra-libs=-ldl \
        --enable-nonfree \
        --enable-gpl \
        --enable-version3 \
        --enable-avresample \
        --enable-libmp3lame \
        --enable-libx264 \
        --enable-openssl \
        --enable-postproc \
        --enable-small \
        --disable-debug \
        --disable-doc \
        --disable-ffserver && \
    make -j"$(nproc)" && \
    make install && \
    make distclean && \
    hash -r && \
    cd tools && \
    make qt-faststart && \
    cp qt-faststart "${SRC}/bin" && \
    rm -rf "${DIR}"
RUN echo "${SRC}/lib" > "/etc/ld.so.conf.d/libc.conf"
RUN ffmpeg -buildconf

# nginx-rtmp
RUN DIR="$(mktemp -d)" && cd "${DIR}" && \
    curl -LOks "https://github.com/nginx/nginx/archive/release-${NGINX_VERSION}.tar.gz" && \
    tar xzvf "release-${NGINX_VERSION}.tar.gz" && \
    curl -LOks "https://github.com/sergey-dryabzhinsky/nginx-rtmp-module/archive/v${NGINX_RTMP_VERSION}.tar.gz" && \
    tar xzvf "v${NGINX_RTMP_VERSION}.tar.gz" && \
    cd "nginx-release-${NGINX_VERSION}" && \
    auto/configure \
        --with-http_ssl_module \
        --add-module="../nginx-rtmp-module-${NGINX_RTMP_VERSION}" && \
    make -j"$(nproc)" && \
    make install && \
    rm -rf "${DIR}"

RUN apt-get purge -y --auto-remove ${BUILDDEPS} && \
    rm -rf /tmp/*

#COPY . /restreamer
ADD https://raw.githubusercontent.com/BobDaMann/TwoPCStreamer/master/package.json /twoPC
WORKDIR /twoPC

RUN npm install -g bower grunt grunt-cli nodemon public-ip eslint && \
    npm install && \
    grunt build && \
    npm prune --production && \
    npm cache clean && \
    bower cache clean --allow-root

ENV RS_USERNAME admin
ENV RS_PASSWORD datarhei

EXPOSE 8080
VOLUME ["/restreamer/db"]

#CMD ["./run.sh"]