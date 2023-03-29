import std/[os,osproc,strutils, tempfiles, base64,asyncdispatch, tables], jsony, ws, supersnappy
import QRgen

const svgFile = "logo.svg"

proc getSVGLogo():string{.compileTime.} =
    result = svgFile.readFile.compress

const 
    logoSvg = getSVGLogo()
    jTrue = "true".cstring
    jFalse = "false".cstring

type AppDir = object 
    inserted: bool
    path : string

var
    appDir : AppDir

type 
    Call = enum 
        NotValid = 0
        QrSvg = 1
        SetAppDir = 2
        

    CallObject = object 
        case call : Call
        of QrSvg:
            content: string
        of SetAppDir:
            directory: string
        of NotValid:
            discard

template withExecptions(actions: untyped): cstring =
    var output : cstring
    try:
        actions
        output = jTrue
    except:
        output = jFalse
    output

template withOutputExecptions(action: untyped): cstring =
    var output : cstring
    try:
        output = action
    except:
        output = jFalse
    output

proc qrGen(content: string): cstring =
    let myQR = newQR(content, ecLevel=qrECH)
    return myQR.printSvg("#251119","#FF6C00",100,100,20,svgImg=logoSvg.uncompress).toJson.cstring

proc callNim*(call: cstring):cstring{.exportc.}=
    var calling : CallObject 
    try:
        calling = ($call).fromJson(CallObject)
    except:
        calling = CallObject(call: NotValid)

    echo calling.call
    case calling.call:
    of QrSvg:
        result = withOutputExecptions:
            qrGen(calling.content)
    
    of NotValid:
        result = jFalse

    of SetAppDir:
        if dirExists(calling.directory):
            appDir = AppDir( inserted: true, path : calling.directory)
            result = jTrue
        else:
            result = jFalse

