const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'music_player'

const player = $('.player');
const heading = $('header h2')
const cdThumd = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Phép màu',
            singer: 'B Ray',
            path: './music/song1.mp3',
            img: './img/img_song1.jpg'
        },
        {
            name: 'Con Gái Rượu',
            singer: 'B ray',
            path: './music/song2.mp3',
            img: './img/img_song2.jpg',
        },
        {
            name: 'Anh Sẽ Đón Em',
            singer: 'Cukak',
            path: './music/song3.mp3',
            img: './img/img_song3.jpg',
        },
        {
            name: 'Sài Gòn Hôm Nay Mưa',
            singer: 'JSOL, Hoàng Duyên',
            path: './music/song4.mp3',
            img: './img/img_song4.jpg',
        },
        {
            name: 'Tháng Năm',
            singer: 'Soobin',
            path: './music/song5.mp3',
            img: './img/img_song5.jpg',
        },
        {
            name: 'Thích Em Hơi Nhiều',
            singer: 'Hoàng Dũng',
            path: './music/song6.mp3',
            img: './img/img_song6.jpg',
        },
        {
            name: 'See Tình',
            singer: 'Hoàng Thùy Linh',
            path: './music/song7.mp3',
            img: './img/img_song7.jpg',
        },
        {
            name: 'Có Hẹn Với Thanh Xuân',
            singer: 'MONSTAR',
            path: './music/song8.mp3',
            img: './img/img_song8.jpg',
        },
        {
            name: 'Chạy Khỏi Thế Giới Này',
            singer: 'Da Lab, Phương Ly',
            path: './music/song9.mp3',
            img: './img/img_song9.jpg',
        },
        {
            name: 'Buông Hàng',
            singer: 'Tommy Tèo',
            path: './music/song10.mp3',
            img: './img/img_song10.jpg',
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <img src="${song.img}" alt="" class="thumb">
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playList.innerHTML = htmls.join('')
    },

    defineProperties: function() {
        Object.defineProperty(this,'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // xử lý CD quay và dừng
        const cdThumdAnimate = cdThumd.animate([
            {transform:'rotate(360deg)'},
        ], {
            duration: 30000,          // 10s
            iterations : Infinity
        })
        cdThumdAnimate.pause()

        // xử lý phóng to thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = document.documentElement.scrollTop || window.scrollY
            newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            }
            else {
                audio.play()
            }   
        }

        // khi Song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumdAnimate.play()
        }

        // khi Song bi pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumdAnimate.pause()
        }

        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // xử lý khi tua song
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // khi next bài hát
        nextBtn.onclick = function() {
            if (_this.isRandom) {  
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // khi lùi bài hát
        prevBtn.onclick = function() {
            if (_this.isRandom) {  
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }  

        // xử lý khi random bài hát
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // xử lý lặp lại bài hát
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // xử lý nextSong khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click()
            }
        }

        // lắng nghe hành vi click vào playlist
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                // xử lý khi click vào song  
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }
            }
        }
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            })
        }, 300);
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumd.style.backgroundImage = `url('${this.currentSong.img}')`
        audio.src = this.currentSong.path
       
    },

    loadConfig: function() {
       this.isRandom =  this.config.isRandom
       this.isRepeat =  this.config.isRepeat
    },

    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()  
    },

    start: function() {
        // gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        // định nghĩa các thuộc tính cho Object
        this.defineProperties()

        // lắng nghe xử lý các sự kiện (DOM Events)
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // render playlist
        this.render()

        // hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start()

