// sounds as simple as possible

const _path = './sounds/'; // public/sounds

const _list = {
    shuffle: _path + 'shuffle.mp3',
    win: _path +'win.mp3',
    lose: _path +'lose.mp3',
    tie: _path +'tie.mp3',
    intro: _path +'intro.mp3',
}

let audio = {};
let _isReady = false;
let muted = false;

let _toggleMute = ()=>{
    muted = !muted;
}

let _isMuted = ()=>{
    return muted;
}

let _initiate = (callback)=>{

    // hack to inititate all sounds on mobile on user interaction
    for (let key in _list) {
        audio[key] = new Audio(_list[key]);
        audio[key].volume = 0;
        audio[key].play();
        audio[key].pause();
        audio[key].volume = 1;
    }

    _isReady = true;
    if(callback) callback();
}


let _play = (key)=>{

    if(muted) return;
    if(!_isReady) return _initiate();

    if(key) {

        if(_list[key] === '' || _list[key] === undefined){
            console.log('missing sound for #'+key);
            return;
        }

        audio[key].play();
    }

}

export let isMuted = _isMuted;
export let isReady = _isReady;
export let initiate = _initiate;
export let toggleMute = _toggleMute;
export let play = _play;