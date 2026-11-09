
/* ==========================================
   SKYRIN ENGINEERING
   ATTENDANCE MANAGEMENT SYSTEM
========================================== */


/* 1. GOOGLE FORM CONFIGURATION */

// Paste your actual Google Form link here.
// No Entry IDs are required.

const GOOGLE_FORM_URL =
   https://docs.google.com/forms/d/e/1FAIpQLSc-cfIUEYMQmZn-Eh-Ri-_ZSc3CHdN3ftb-hXa2_n7UTAmybQ/viewform?usp=publish-editor


/* 2. HTML ELEMENTS */

const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("photoPreview");

const statusEl = document.getElementById("status");
const dateTimeEl = document.getElementById("dateTime");
const locationEl = document.getElementById("location");

const startCameraBtn = document.getElementById("startCamera");
const captureBtn = document.getElementById("capturePhoto");
const locationBtn = document.getElementById("getLocation");
const continueBtn = document.getElementById("continueForm");

const downloadLink = document.getElementById("downloadPhoto");


/* 3. VARIABLES */

let cameraStream = null;
let capturedPhoto = false;
let capturedPhotoData = null;

let gps = null;
let capturedAt = null;


/* 4. STATUS MESSAGE */

function setStatus(message) {
    statusEl.textContent = message;
}


/* 5. UPDATE CONTINUE BUTTON */

function updateContinueButton() {

    continueBtn.disabled = !(
        capturedPhoto &&
        gps !== null &&
        capturedAt !== null
    );

}


/* 6. START CAMERA */

startCameraBtn.addEventListener("click", async function () {

    try {

        // Stop any previously running camera
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }

        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {

            throw new Error(
                "Camera requires HTTPS or localhost."
            );

        }

        setStatus("Starting camera...");

        cameraStream = await navigator.mediaDevices.getUserMedia({

            video: {
                facingMode: "user"
            },

            audio: false

        });

        video.srcObject = cameraStream;

        video.hidden = false;
        preview.hidden = true;

        capturedPhoto = false;
        capturedPhotoData = null;
        capturedAt = null;

        dateTimeEl.textContent = "Not captured";

        downloadLink.hidden = true;

        captureBtn.disabled = false;

        updateContinueButton();

        setStatus("Camera ready. Capture your live photo.");

    }

    catch (error) {

        setStatus(
            "Camera error: " + error.message
        );

    }

});


/* 7. CAPTURE LIVE PHOTO */

captureBtn.addEventListener("click", function () {

    if (!cameraStream) {

        setStatus("Please start the camera first.");

        return;

    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {

        setStatus("Camera is not ready. Please try again.");

        return;

    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    context.drawImage(
        video,
        0,
        0,
        width,
        height
    );

    // Store captured photo
    capturedPhotoData = canvas.toDataURL(
        "image/jpeg",
        0.90
    );

    capturedPhoto = true;

    // Record timestamp
    capturedAt = new Date();

    dateTimeEl.textContent =
        capturedAt.toLocaleString();

    // Show photo preview
    preview.src = capturedPhotoData;

    preview.hidden = false;
    video.hidden = true;

    // Provide photo download
    downloadLink.href = capturedPhotoData;
    downloadLink.download = "SKYRIN_Attendance_Photo.jpg";
    downloadLink.hidden = false;

    // Stop camera after capturing
    cameraStream.getTracks().forEach(track => track.stop());

    cameraStream = null;

    captureBtn.disabled = true;

    updateContinueButton();

    setStatus(
        "Photo captured successfully. Now capture your GPS location."
    );

});


/* 8. GET GPS LOCATION */

locationBtn.addEventListener("click", function () {

    if (!navigator.geolocation) {

        setStatus(
            "GPS location is not supported by your browser."
        );

        return;

    }

    setStatus("Getting your GPS location...");

    locationBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(

        function (position) {

            gps = {

                latitude: position.coords.latitude,

                longitude: position.coords.longitude,

                accuracy: position.coords.accuracy

            };

            locationEl.textContent =
                gps.latitude.toFixed(6) +
                ", " +
                gps.longitude.toFixed(6) +
                " (Accuracy: ±" +
                Math.round(gps.accuracy) +
                " m)";

            locationBtn.disabled = false;

            updateContinueButton();

            setStatus(
                "GPS location captured successfully."
            );

        },

        function (error) {

            locationBtn.disabled = false;

            setStatus(
                "GPS error: " + error.message +
                ". Please allow location access and try again."
            );

        },

        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

        }

    );

});


/* 9. CONTINUE TO GOOGLE FORM */

continueBtn.addEventListener("click", function () {

    // Check photo
    if (!capturedPhoto) {

        setStatus("Please capture your live photo first.");

        return;

    }

    // Check GPS
    if (!gps) {

        setStatus("Please capture your GPS location first.");

        return;

    }

    // Check timestamp
    if (!capturedAt) {

        setStatus("Attendance timestamp is missing.");

        return;

    }

    // Check Google Form URL
    if (
        !GOOGLE_FORM_URL ||
        GOOGLE_FORM_URL.includes("YOUR_FORM_ID")
    ) {

        setStatus(
            "Please add your actual Google Form URL in app.js."
        );

        return;

    }

    // Open the Google Form directly
    window.open(
        GOOGLE_FORM_URL,
        "_blank"
    );

});


/* 10. INITIAL SETTINGS */

captureBtn.disabled = true;
continueBtn.disabled = true;

setStatus(
    "Welcome to SKYRIN ENGINEERING Attendance Management."
);

