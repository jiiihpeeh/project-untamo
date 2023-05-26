#!/bin/sh

# Create BUILD constant as a directory name
#get script directory
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
BUILD=$SCRIPT_DIR/"build-project"
FRONT=$SCRIPT_DIR/"front"
BACK=$SCRIPT_DIR/"back_go"
AUDIODIR=$BACK/"audio-resources"
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
cd $FRONT || exit
npm install
npm run build


# Build backend in ./back_go
cd $BACK || exit

# Build for AMD64 Linux
if command -v go >/dev/null && GOOS=linux GOARCH=amd64 go version >/dev/null 2>&1; then
    env GOOS=linux GOARCH=amd64 go build -o "$BUILD/$AMD64LINUX/$AMD64LINUX"
    strip "$BUILD/$AMD64LINUX/$AMD64LINUX"
    #check if upx is installed
    if command -v upx >/dev/null; then
        upx -9 "$BUILD/$AMD64LINUX/$AMD64LINUX"
    else
        echo "Skipping compression. Please ensure the 'upx' command is installed."
    fi
    mkdir -p "$BUILD/$AMD64LINUX/audio-resources"
    echo $AUDIODIR
    cp -r $AUDIODIR/* "$BUILD/$AMD64LINUX/audio-resources"
    mkdir -p "$BUILD/$AMD64LINUX/dist"
    cp -r $FRONT/dist/* "$BUILD/$AMD64LINUX/dist"
else
    echo "Skipping AMD64 Linux build. Please ensure Go and the cross-compilation toolchain are properly installed."
fi

# Build for AArch64 Linux
if command -v go >/dev/null && GOOS=linux GOARCH=arm64 go version >/dev/null 2>&1; then
    env GOOS=linux GOARCH=arm64 go build -o "$BUILD/$ARM64LINUX/$ARM64LINUX"
    /usr/aarch64-linux-gnu/bin/strip "$BUILD/$ARM64LINUX/$ARM64LINUX"
    #check if upx is installed
    if command -v upx >/dev/null; then
        upx -9 "$BUILD/$ARM64LINUX/$ARM64LINUX"
    else
        echo "Skipping compression. Please ensure the 'upx' command is installed."
    fi
    mkdir -p "$BUILD/$ARM64LINUX/audio-resources"
    cp -r $AUDIODIR/* "$BUILD/$ARM64LINUX/audio-resources"
    mkdir -p "$BUILD/$ARM64LINUX/dist"
    cp -r $FRONT/dist/* "$BUILD/$ARM64LINUX/dist"
else
    echo "Skipping AArch64 Linux build. Please ensure Go and the cross-compilation toolchain are properly installed."
fi

# Build for AMD64 Windows
if command -v go >/dev/null && GOOS=windows GOARCH=amd64 go version >/dev/null 2>&1; then
    env GOOS=windows GOARCH=amd64 go build -o "$BUILD/$AMD64WINDOWS/$AMD64WINDOWS"
    /usr/x86_64-w64-mingw32/bin/strip "$BUILD/$AMD64WINDOWS/$AMD64WINDOWS"
    #upx "$BUILD/$AMD64WINDOWS/$AMD64WINDOWS"
    #check if upx is installed
    if command -v upx >/dev/null; then
        upx -9 "$BUILD/$AMD64WINDOWS/$AMD64WINDOWS"
    else
        echo "Skipping compression. Please ensure the 'upx' command is installed."
    fi
    mkdir -p "$BUILD/$AMD64WINDOWS/audio-resources"
    cp -r $AUDIODIR/* "$BUILD/$AMD64WINDOWS/audio-resources"
    mkdir -p "$BUILD/$AMD64WINDOWS/dist"
    cp -r $FRONT/dist/* "$BUILD/$AMD64WINDOWS/dist"
else
    echo "Skipping AMD64 Windows build. Please ensure Go and the cross-compilation toolchain are properly installed."
fi
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
