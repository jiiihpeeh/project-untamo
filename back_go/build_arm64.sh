#!/bin/bash

#Ask if  rebuild frontend
read -e -p "(Re)build frontend? Y/N " REPLY

if [[ $REPLY =~ ^[Yy]$ ]]
then
    SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
    #get above level directory
    ROOT_DIR="$(dirname "$SCRIPT_DIR")"
    FRONT=$ROOT_DIR/"front"
    cd $FRONT || exit
    npm install
    npm run build
    cd $SCRIPT_DIR || exit
    mkdir -p "$SCRIPT_DIR/dist"
    #remove $BACK/dist/
    rm -r $SCRIPT_DIR/dist/*
    #copy frontend dist to backend
    cp -r $FRONT/dist/* $SCRIPT_DIR/dist
fi




export CC=aarch64-linux-gnu-gcc
#compile as arm64
GOOS=linux GOARCH=arm64 go build . 
/usr/aarch64-linux-gnu/bin/strip untamo_server.zzz
upx  untamo_server.zzz