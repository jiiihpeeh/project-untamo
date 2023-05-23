#!/bin/sh
#Create BUILD constant as a directory name
BUILD="build-project"
AMD64LINUX="untamoserver-amd64_linux"
AMD64WINDOWS="untamoserver-amd64_windows"
ARM64LINUX="untamoserver-arm64_linux"
# Build the project
echo "Building the project..."
#create build folder from BUILD constant
mkdir $BUILD
mkdir $BUILD/$AMD64LINUX
mkdir $BUILD/$AMD64WINDOWS
mkdir $BUILD/$ARM64LINUX
#build web frontend in ./front
cd ./front
npm install
npm run build
cd ..
#build backend in ./back_go
cd ./back_go
#build for linux amd64
env GOOS=linux GOARCH=amd64 go build -o ../$BUILD/$AMD64LINUX/untamo_server_linux_amd64
#build same for windows amd64
env GOOS=windows GOARCH=amd64 go build -o ../$BUILD/$AMD64WINDOWS/untamo_server_windows_amd64.exe
#build for raspberry pi arm64
env GOOS=linux GOARCH=arm64 go build -o ../$BUILD/$ARM64LINUX/untamo_server_linux_arm64
#strip debug info
strip ../$BUILD/$AMD64LINUX/untamo_server_linux_amd64
#strip for arm64

/usr/aarch64-linux-gnu/bin/strip ../$BUILD/$ARM64LINUX/untamo_server_linux_arm64
#strip for windows
/usr/x86_64-w64-mingw32/bin/strip ../$BUILD/$AMD64LINUX/untamo_server_windows_amd64.exe
#
cd ..
#create build folder

cp -r ./front/dist to ./$BUILD/$AMD64LINUX
cp -r ./front/dist to ./$BUILD/$AMD64WINDOWS
cp -r ./front/dist to ./$BUILD/$ARM64LINUX
#copy files from back_go/audio-resources/ to build folders
cp -r ./back_go/audio-resources/ ./$BUILD/$AMD64LINUX
cp -r ./back_go/audio-resources/ ./$BUILD/$AMD64WINDOWS
cp -r ./back_go/audio-resources/ ./$BUILD/$ARM64LINUX
#compress build folders linux as tar.xz and windows as zip
cd ./$BUILD
tar -cvJf ./$AMD64LINUX.tar.xz ./$AMD64LINUX
tar -cvJf ./$ARM64LINUX.tar.xz ./$ARM64LINUX 
zip -r ./$AMD64WINDOWS.zip ./$AMD64WINDOWS
#remove build folders
rm -rf ./$AMD64LINUX
rm -rf ./$AMD64WINDOWS
rm -rf ./$ARM64LINUX



