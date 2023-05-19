#!/bin/sh
export CC=aarch64-linux-gnu-gcc
#compile as arm64
GOOS=linux GOARCH=arm64 go build . 