

const fs = require('fs');
const contents = fs.readFileSync('./audioresources/rooster.opus', {encoding: 'base64'});



let bobject = {data64: contents}

let bstr = JSON.stringify(bobject)
fs.writeFile('audio.json', bstr, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('saved!');
});
