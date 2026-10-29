const startBtn = document.getElementById("startBtn");
const camera = document.getElementById("camera");
const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const useBtn = document.getElementById("useBtn");
const downloadBtn = document.getElementById("downloadBtn");
const legoBtn = document.getElementById("legoBtn");
const photo = document.getElementById("photo");
const context = photo.getContext("2d");
const countdown = document.getElementById("countdown");


let photos = [];
let currentPhoto = null;
let isCapturing = false;
let legoEnabled = false;


// MEMBUKA KAMERA
startBtn.addEventListener("click", async function() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user"},
            audio: false
        });


        camera.srcObject = stream;
        await camera.play();


        countdown.textContent = "Ready for Photo 1!";
    } catch (error) {
        alert ("Kamera tidak bisa dibuka. Periksa izin kamera!");
        console.error(error);
    }
});


// MENGAMBIL SATU FOTO
captureBtn.addEventListener("click", async function() {
    if (!camera.srcObject || camera.videoWidth === 0) {
        alert("Nyalakan kamera dulu ya!");
        return;
    }


    if (isCapturing) return;


    isCapturing = true;
    captureBtn.disabled = true;


    for (let i = 3; i > 0; i--) {
        countdown.textContent =
            "Foto" + (photos.length + 1) + ": " + i;

        await new Promise(resolve =>
            setTimeout(resolve, 1000)
        );
    }


    countdown.textContent = "Cheese! 🍒";


    // Simpan hasil foto sementara 
    currentPhoto = document.createElement("canvas");
    currentPhoto.width = camera.videoWidth;
    currentPhoto.height = camera.videoHeight;


    const currentContext = currentPhoto.getContext("2d");


    // Mirror hasil foto
    currentContext.translate(currentPhoto.width, 0);
    currentContext.scale(-1, 1);
    currentContext.drawImage(
        camera,
        0,
        0,
        currentPhoto.width,
        currentPhoto.height
    );


    //Tampilkan preview
    photo.width = currentPhoto.width;
    photo.height = currentPhoto.height;


    context.drawImage(currentPhoto, 0, 0);
    photo.style.display = "block";


    countdown.textContent =
        "How's Photo" + (photos.length + 1) + "? 🍒";


    retakeBtn.style.display = "inline-block";
    useBtn.style.display = "inline-block";
    captureBtn.style.display = "none";


    isCapturing = false;
});


// Retake foto atau start over
retakeBtn.addEventListener("click", function() {
    if (photos.length === 2) {
        // Ulang seluruh sesi
        photos = [];

        legoEnabled = false;
        legoBtn.textContent = "LEGO Effect";


        currentPhoto = null;
        countdown.textContent = "Ready for Photo 1!";
    } else {
        // Ulang foto yang sedang di preview
        currentPhoto = null;
        countdown.textContent =
            "Let's retry Photo" + (photos.length + 1) + "!🍒";
    }


    context.clearRect(0, 0, photo.width, photo.height);
    photo.style.display = "none";


    retakeBtn.style.display = "none";
    retakeBtn.textContent = "Retake 🔄";
    useBtn.style.display = "none";
    downloadBtn.style.display = "none";
    legoBtn.style.display = "none";

    captureBtn.style.display = "inline-block";
    captureBtn.disabled = false;
    captureBtn.textContent = "Take a Photo! 📸";
    console.log("Retake berhasil dijalankan");
    console.log("Display tombol:", getComputedStyle(captureBtn).display);
    console.log("Tombol disabled:", captureBtn.disabled);
    console.log("Kamera aktif:", !!camera.srcObject);
});


// Gunakan foto
useBtn.addEventListener("click", function() {
    if (!currentPhoto) return;


    photos.push(currentPhoto);
    currentPhoto = null;


    retakeBtn.style.display = "none";
    useBtn.style.display = "none";


    if (photos.length < 2) {
        photo.style.display = "none";
        captureBtn.style.display = "inline-block";
        captureBtn.disabled = false;


        countdown.textContent = "Ready for Photo 2!";
    } else {
        createPhotostrip();
    }
});


// Membuat frame photo strip
function createPhotostrip() {
    const photoWidth = photos[0].width;
    const photoHeight = photos[0].height;


    const gap = 20;
    const margin = 20;
    const labelHeight = 90;


    photo.width = photoWidth + margin * 2;
    photo.height = 
        photoHeight * 2 + gap + margin * 2 + labelHeight;


    // Frame cherry red
    context.fillStyle = "#a4161a";
    context.fillRect(0, 0, photo.width, photo.height);
   

    // Foto pertama dan kedua
    photos.forEach(function(img, index) {
        const y = margin + index * (photoHeight + gap);


        const finalImage = legoEnabled
            ? applyLegoEffect(img)
            : img;


        context.drawImage(
            finalImage,
            margin,
            y,
            photoWidth,
            photoHeight
        );
    });



    // Tulisan PIICA
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.font = "bold 48px Arial";


    context.fillText(
        "PICCA",
        photo.width / 2,
        photo.height - 35
    );


    photo.style.display = "block";
    countdown.textContent = "Your photostrip is ready! 🍒"


    // Retake seluruh sesi
    retakeBtn.style.display = "inline-block";
    retakeBtn.textContent = "Start Over 🔄";
    downloadBtn.style.display = "inline-block";
    legoBtn.style.display = "inline-block";
}


// Downloadd hasil photostrip 
downloadBtn.addEventListener("click", function() {
    const link = document.createElement("a");


    link.download = "PICCA.Photostrip.png";
    link.href = photo.toDataURL("image/png");


    link.click();
});


// Membuat efek lego mozaik


function applyLegoEffect(sourceCanvas) {
    const result = document.createElement("canvas");
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    result.width = width;
    result.height = height;

    const ctx = result.getContext("2d");
    const sourceCtx = sourceCanvas.getContext("2d");
    const pixels = sourceCtx.getImageData(
        0, 0, width, height
    ).data;

    const unit = 16;
    const cols = Math.ceil(width / unit);
    const rows = Math.ceil(height / unit);
    const occupied = Array.from(
        { length: rows },
        () => Array(cols).fill(false)
    );

    // Celah gelap di antara kepingan
    ctx.fillStyle = "#282321";
    ctx.fillRect(0, 0, width, height);

    function getColor(x, y, w, h) {
        const sx = Math.min(
            width - 1,
            Math.max(0, Math.floor(x + w / 2))
        );
        const sy = Math.min(
            height - 1,
            Math.max(0, Math.floor(y + h / 2))
        );

        const i = (sy * width + sx) * 4;

        return [
            pixels[i],
            pixels[i + 1],
            pixels[i + 2]
        ];
    }

    function drawStud(x, y, radius, color) {
        const [r, g, b] = color;

        // Bayangan stud
        ctx.beginPath();
        ctx.ellipse(
            x + 0.7, y + 1.2,
            radius, radius * 0.82,
            0, 0, Math.PI * 2
        );
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fill();

        // Efek plastik timbul
        const gradient = ctx.createRadialGradient(
            x - radius * 0.35,
            y - radius * 0.4,
            0.2,
            x, y, radius * 1.25
        );

        gradient.addColorStop(
            0,
            `rgb(${Math.min(255, r + 55)},${Math.min(255, g + 55)},${Math.min(255, b + 55)})`
        );
        gradient.addColorStop(
            0.7, `rgb(${r},${g},${b})`
        );
        gradient.addColorStop(
            1,
            `rgb(${Math.floor(r * 0.55)},${Math.floor(g * 0.55)},${Math.floor(b * 0.55)})`
        );

        ctx.beginPath();
        ctx.ellipse(
            x, y, radius, radius * 0.82,
            0, 0, Math.PI * 2
        );
        ctx.fillStyle = gradient;
        ctx.fill();

        // Kilau kecil
        ctx.beginPath();
        ctx.ellipse(
            x - radius * 0.28,
            y - radius * 0.32,
            radius * 0.28,
            radius * 0.15,
            -0.4, 0, Math.PI * 2
        );
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fill();
    }

    // Susun kepingan dengan ukuran bervariasi
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (occupied[row][col]) continue;

            // Balok memiliki lebar 1–3 unit dan tinggi 1–2 unit
            const options = [
                [1, 1], [2, 1], [3, 1],
                [1, 2], [2, 2]
            ].sort(() => Math.random() - 0.5);

            let tileW = 1;
            let tileH = 1;

            for (const [tw, th] of options) {
                if (col + tw > cols || row + th > rows) {
                    continue;
                }

                let available = true;

                for (let yy = row; yy < row + th; yy++) {
                    for (let xx = col; xx < col + tw; xx++) {
                        if (occupied[yy][xx]) {
                            available = false;
                        }
                    }
                }

                if (available) {
                    tileW = tw;
                    tileH = th;
                    break;
                }
            }

            for (let yy = row; yy < row + tileH; yy++) {
                for (let xx = col; xx < col + tileW; xx++) {
                    occupied[yy][xx] = true;
                }
            }

            const x = col * unit;
            const y = row * unit;
            const w = Math.min(tileW * unit, width - x);
            const h = Math.min(tileH * unit, height - y);
            const color = getColor(x, y, w, h);
            const [r, g, b] = color;

            const inset = 1.2;
            const bx = x + inset;
            const by = y + inset;
            const bw = Math.max(1, w - inset * 2);
            const bh = Math.max(1, h - inset * 2);

            // Bayangan dan badan balok
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(bx + 1, by + 2, bw, bh);

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(bx, by, bw, bh);

            ctx.fillStyle = "rgba(255,255,255,0.18)";
            ctx.fillRect(bx, by, bw, 1.4);
            ctx.fillRect(bx, by, 1.4, bh);

            ctx.fillStyle = "rgba(0,0,0,0.24)";
            ctx.fillRect(bx, by + bh - 1.4, bw, 1.4);

            // Variasi bentuk: bulat dan segitiga
            const shapeRoll = Math.random();

            if (shapeRoll < 0.13) {
                // Kepingan bulat dekoratif
                const radius = Math.min(bw, bh) * 0.43;

                ctx.beginPath();
                ctx.arc(
                    bx + bw / 2,
                    by + bh / 2,
                    radius + 0.8,
                    0, Math.PI * 2
                );
                ctx.fillStyle = "rgba(0,0,0,0.35)";
                ctx.fill();

                const circleGradient = ctx.createRadialGradient(
                    bx + bw * 0.35,
                    by + bh * 0.3,
                    0.2,
                    bx + bw / 2,
                    by + bh / 2,
                    radius
                );

                circleGradient.addColorStop(
                    0,
                    `rgb(${Math.min(255,r+50)},${Math.min(255,g+50)},${Math.min(255,b+50)})`
                );
                circleGradient.addColorStop(
                    1, `rgb(${r},${g},${b})`
                );

                ctx.beginPath();
                ctx.arc(
                    bx + bw / 2,
                    by + bh / 2,
                    radius,
                    0, Math.PI * 2
                );
                ctx.fillStyle = circleGradient;
                ctx.fill();

                drawStud(
                    bx + bw / 2,
                    by + bh / 2,
                    Math.max(1.5, radius * 0.45),
                    color
                );

            } else if (shapeRoll < 0.25 && bw >= unit * 2) {
                // Dua segitiga dengan warna senada
                // menutupi permukaan balok secara utuh
                ctx.beginPath();
                ctx.moveTo(bx, by);
                ctx.lineTo(bx + bw, by);
                ctx.lineTo(bx, by + bh);
                ctx.closePath();
                ctx.fillStyle = `rgb(${Math.min(255,r+12)},${Math.min(255,g+12)},${Math.min(255,b+12)})`;
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(bx + bw, by);
                ctx.lineTo(bx + bw, by + bh);
                ctx.lineTo(bx, by + bh);
                ctx.closePath();
                ctx.fillStyle = `rgb(${Math.floor(r*0.94)},${Math.floor(g*0.94)},${Math.floor(b*0.94)})`;
                ctx.fill();

                // Garis sambungan diagonal
                ctx.beginPath();
                ctx.moveTo(bx, by + bh);
                ctx.lineTo(bx + bw, by);
                ctx.strokeStyle = "rgba(0,0,0,0.2)";
                ctx.lineWidth = 1;
                ctx.stroke();

            } else {
                // Stud mengikuti ukuran balok
                const studRadius = Math.min(
                    unit * 0.27,
                    bh * 0.3
                );
                const countX = Math.max(
                    1, Math.floor(tileW)
                );
                const countY = Math.max(
                    1, Math.floor(tileH)
                );

                for (let sy = 0; sy < countY; sy++) {
                    for (let sx = 0; sx < countX; sx++) {
                        drawStud(
                            bx + (sx + 0.5) * bw / countX,
                            by + (sy + 0.5) * bh / countY,
                            studRadius,
                            color
                        );
                    }
                }
            }
        }
    }

    return result;
}
    

// TOMBOL LEGO EFFECT
legoBtn.addEventListener("click", function() {
    legoEnabled = !legoEnabled;


    legoBtn.textContent = legoEnabled
        ? "Normal Photo"
        : "LEGO Effect";


    createPhotostrip();
});