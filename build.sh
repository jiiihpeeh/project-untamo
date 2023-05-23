#!/bin/sh

# Create BUILD constant as a directory name
BUILD="build-project"
AMD64LINUX="untamoserver-amd64_linux"
AMD64WINDOWS="untamoserver-amd64_windows"
ARM64LINUX="untamoserver-arm64_linux"

# Build the project
echo "Building the project..."

# Create build folders
mkdir -p "$BUILD/$AMD64LINUX/dist"
mkdir -p "$BUILD/$AMD64WINDOWS/dist"
mkdir -p "$BUILD/$ARM64LINUX/dist"

# Build web frontend in ./front
cd ./front || exit
npm install
npm run build
cd ..

# Build backend in ./back_go
cd ./back_go || exit

# Build for AMD64 Linux
if command -v go >/dev/null && GOOS=linux GOARCH=amd64 go version >/dev/null 2>&1; then
    env GOOS=linux GOARCH=amd64 go build -o "../$BUILD/$AMD64LINUX/untamo_server_linux_amd64"
    strip "../$BUILD/$AMD64LINUX/untamo_server_linux_amd64"
    cp -r ./audio-resources/ "../$BUILD/$AMD64LINUX/audio-resources"
    mkdir -p "$BUILD/$AMD64LINUX/dist"
    cd ..
    cp -r ./front/dist/* "$BUILD/$AMD64LINUX/dist"
    cd back_go || exit
else
    echo "Skipping AMD64 Linux build. Please ensure Go and the cross-compilation toolchain are properly installed."
fi

# Build for AArch64 Linux
if command -v go >/dev/null && GOOS=linux GOARCH=arm64 go version >/dev/null 2>&1; then
    env GOOS=linux GOARCH=arm64 go build -o "../$BUILD/$ARM64LINUX/untamo_server_linux_arm64"
    /usr/aarch64-linux-gnu/bin/strip "../$BUILD/$ARM64LINUX/untamo_server_linux_arm64"
    cp -r ./audio-resources/ "../$BUILD/$ARM64LINUX/audio-resources"
    mkdir -p "$BUILD/$ARM64LINUX/dist"
    cd ..
    cp -r ./front/dist/* "$BUILD/$ARM64LINUX/dist"
    cd back_go || exit
else
    echo "Skipping AArch64 Linux build. Please ensure Go and the cross-compilation toolchain are properly installed."
fi

# Build for AMD64 Windows
if command -v go >/dev/null && GOOS=windows GOARCH=amd64 go version >/dev/null 2>&1; then
    env GOOS=windows GOARCH=amd64 go build -o "../$BUILD/$AMD64WINDOWS/untamo_server_windows_amd64.exe"
    /usr/x86_64-w64-mingw32/bin/strip "../$BUILD/$AMD64WINDOWS/untamo_server_windows_amd64.exe"
    cp -r ./audio-resources/ "../$BUILD/$AMD64WINDOWS/audio-resources"
    mkdir -p "$BUILD/$AMD64WINDOWS/dist"
    cd ..
    cp -r ./front/dist/* "$BUILD/$AMD64WINDOWS/dist"
    cd back_go || exit
else
    echo "Skipping AMD64 Windows build. Please ensure Go and the cross-compilation toolchain are properly installed."
fi
cd ..
cd "$BUILD" || exit

# Compress build folders
if command -v tar >/dev/null; then
    if [ -d "$AMD64LINUX" ]; then
        tar -cvJf "./$AMD64LINUX.tar.xz" "./$AMD64LINUX"
    fi
    if [ -d "$ARM64LINUX" ]; then
        tar -cvJf "./$ARM64LINUX.tar.xz" "./$ARM64LINUX"
    fi
else
    echo "Skipping compression. Please ensure the 'tar' command is installed."
fi

if command -v zip >/dev/null; then
    if [ -d "$AMD64WINDOWS" ]; then
        zip -r "./$AMD64WINDOWS.zip" "./$AMD64WINDOWS"
    fi
else
    echo "Skipping compression. Please ensure the 'zip' command is installed."
fi

# Remove build folders
rm -rf "./$AMD64LINUX"
rm -rf "./$AMD64WINDOWS"
rm -rf "./$ARM64LINUX"
