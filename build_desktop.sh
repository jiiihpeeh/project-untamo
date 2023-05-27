#!/bin/sh

# Build the desktop version of the app

SCRIPTDIR="$(dirname "$(readlink -f "$0")")"
AMD64LINUX="x86_64-unknown-linux-gnu"
AMD64WIN="x86_64-pc-windows-msvc"
AMD64GNUWIN="x86_64-pc-windows-gnu"


cd $SCRIPTDIR
AUDIOPLAYDIR="$SCRIPTDIR/desktop/AudioPlay/untamo_audio_play"
AUDIOPLAYBUILDLINUX="$AUDIOPLAYDIR/target/$AMD64LINUX/release/untamo_audio_play"
AUDIOPLAYBUILDWIN="$AUDIOPLAYDIR/target/$AMD64GNUWIN/release/untamo_audio_play.exe"
AUDIOPLAYLINUXBUNDLE=$EXTBINDIR/untamo_audio_play-$AMD64LINUX
AUDIOPLAYWINBUNDLE=$EXTBINDIR/untamo_audio_play-$AMD64WIN.exe

UNTAMODIR="$SCRIPTDIR/desktop/Untamo"
EXTBINDIR="$UNTAMODIR/src-tauri/bins"

cd $AUDIOPLAYDIR

if [ ! -f "$AUDIOPLAYLINUXBUNDLE" ]; then
    rustup target add x86_64-unknown-linux-gnu
    if [ ! -f "$AUDIOPLAYBUILDLINUX" ]; then
        echo "File $AUDIOPLAYBUILDLINUX does not exist."
        echo "Building $AUDIOPLAYBUILDLINUX"
        cargo build --release --target x86_64-unknown-linux-gnu
    fi
    cp $AUDIOPLAYBUILDLINUX $EXTBINDIR/untamo_audio_play-$AMD64LINUX
fi

if [ ! -f "$AUDIOPLAYWINBUNDLE" ]; then
    rustup target add x86_64-pc-windows-msvc
    rustup target add x86_64-pc-windows-gnu
    if [ ! -f "$AUDIOPLAYBUILDWIN" ]; then
        echo "File $AUDIOPLAYBUILDWIN does not exist."
        echo "Building $AUDIOPLAYBUILDWIN"
        cargo build --release --target x86_64-pc-windows-gnu
    fi
    cp $AUDIOPLAYBUILDWIN $EXTBINDIR/untamo_audio_play-$AMD64WIN.exe
    upx -9 $EXTBINDIR/untamo_audio_play-$AMD64WIN.exe
fi


cd $UNTAMODIR
#build the desktop app
npm install
npm run tauri build
