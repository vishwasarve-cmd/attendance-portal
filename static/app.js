
/* ============================================
   SKYRIN ENGINEERING
   ATTENDANCE MANAGEMENT SYSTEM
============================================ */


/* 1. GOOGLE FORM URL */

// Use your actual Google Form responder link.
// Keep the URL inside quotation marks.

const GOOGLE_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSc-cfIUEYMQmZn-Eh-Ri-_ZSc3CHdN3ftb-hXa2_n7UTAmybQ/viewform?usp=dialog";


/* 2. HTML ELEMENTS */

const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("photoPreview");

const cameraPlaceholder =
    document.getElementById("cameraPlaceholder");

const statusEl = document.getElementById("status");
const dateTimeEl = document.getElementById("dateTime");
const locationEl = document.getElementById("location");

const startCameraBtn =
    document.getElementById("startCamera");

const captureBtn =
    document.getElementById("capturePhoto");

const locationBtn =
    document.getElementById("getLocation");

const continueBtn =
    document.getElementById("continueForm");

const downloadLink =
    document.getElementById("downloadPhoto");


/* 3. VARIABLES */

let cameraStream = null;

let capturedPhoto = false;
let capturedPhotoData = null;

let gps = null;
let capturedAt = null;


/* 4. STATUS MESSAGE */

function setStatus(message) {
    if (statusEl) {
        statusEl.textContent = message;
    }
}


/* 5. UPDATE CONTINUE BUTTON */

function updateContinueButton() {
    if (!continueBtn) return;

    continueBtn.disabled = !(
        capturedPhoto &&
        gps !== null &&
        capturedAt !== null
    );
}


/* 6. STOP CAMERA */

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
            track.stop();
        });

        cameraStream = null;
    }

    if (video) {
        video.srcObject = null;
    }
}


/* 7. START CAMERA */

if (startCameraBtn) {

    startCameraBtn.addEventListener("click", async function () {

        if (!video || !captureBtn) {
            setStatus("Camera HTML elements are missing.");
            return;
        }

        try {

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                throw new Error(
                    "Camera requires HTTPS or localhost."
                );
            }

            stopCamera();

            setStatus("Requesting camera permission...");

            cameraStream =
                await navigator.mediaDevices.getUserMedia({

                    video: {
                        facingMode: "user"
                    },

                    audio: false

                });

            video.srcObject = cameraStream;
            video.hidden = false;

            if (preview) {
                preview.hidden = true;
            }

            if (cameraPlaceholder) {
                cameraPlaceholder.hidden = true;
            }

            // Wait for the camera preview to start.
            await video.play();

            // Reset previous photo capture.
            capturedPhoto = false;
            capturedPhotoData = null;
            capturedAt = null;

            if (dateTimeEl) {
                dateTimeEl.textContent = "Not captured";
            }

            if (downloadLink) {
                downloadLink.hidden = true;
            }

            captureBtn.disabled = false;

            updateContinueButton();

            setStatus(
                "Camera ready. Capture your live photo."
            );

        } catch (error) {

            console.error("Camera error:", error);

            stopCamera();

            if (cameraPlaceholder) {
                cameraPlaceholder.hidden = false;
            }

            setStatus(
                "Camera error: " + error.message
            );

        }

    });

}


/* 8. CAPTURE LIVE PHOTO */

if (captureBtn) {

    captureBtn.addEventListener("click", function () {

        if (!cameraStream || !video || !canvas) {

            setStatus(
                "Please start the camera first."
            );

            return;

        }

        const width = video.videoWidth;
        const height = video.videoHeight;

        if (!width || !height) {

            setStatus(
                "Camera is not ready. Please try again."
            );

            return;

        }

        // Set canvas dimensions.
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        // Draw live camera image.
        context.drawImage(
            video,
            0,
            0,
            width,
            height
        );

        // Convert captured photo into JPEG.
        capturedPhotoData = canvas.toDataURL(
            "image/jpeg",
            0.90
        );

        capturedPhoto = true;

        // Capture date and time.
        capturedAt = new Date();

        if (dateTimeEl) {
            dateTimeEl.textContent =
                capturedAt.toLocaleString();
        }

        // Display captured photo.
        if (preview) {
            preview.src = capturedPhotoData;
            preview.hidden = false;
        }

        video.hidden = true;

        if (cameraPlaceholder) {
            cameraPlaceholder.hidden = true;
        }

        // Enable photo download.
        if (downloadLink) {

            downloadLink.href = capturedPhotoData;

            downloadLink.download =
                "SKYRIN_Attendance_Photo.jpg";

            downloadLink.hidden = false;

        }

        // Stop camera after capturing.
        stopCamera();

        captureBtn.disabled = true;

        updateContinueButton();

        setStatus(
            "Photo captured successfully. Now capture your GPS location."
        );

    });

}


/* 9. CAPTURE GPS LOCATION */

if (locationBtn) {

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

                if (locationEl) {

                    locationEl.textContent =
                        gps.latitude.toFixed(6) +
                        ", " +
                        gps.longitude.toFixed(6) +
                        " (Accuracy: ±" +
                        Math.round(gps.accuracy) +
                        " m)";

                }

                locationBtn.disabled = false;

                updateContinueButton();

                setStatus(
                    "GPS location captured successfully."
                );

            },

            function (error) {

                locationBtn.disabled = false;

                setStatus(
                    "GPS error: " +
                    error.message +
                    ". Please allow location permission."
                );

            },

            {

                enableHighAccuracy: true,

                timeout: 15000,

                maximumAge: 0

            }

        );

    });

}


/* 10. OPEN GOOGLE FORM */

if (continueBtn) {

    continueBtn.addEventListener("click", function () {

        // Validate captured photo.
        if (!capturedPhoto) {

            setStatus(
                "Please capture your live photo first."
            );

            return;

        }

        // Validate GPS.
        if (!gps) {

            setStatus(
                "Please capture your GPS location first."
            );

            return;

        }

        // Validate timestamp.
        if (!capturedAt) {

            setStatus(
                "Attendance timestamp is missing."
            );

            return;

        }

        // Validate Google Form URL.
        const formURL = GOOGLE_FORM_URL.trim();

        if (
            !formURL ||
            !formURL.startsWith(
                "https://docs.google.com/forms/"
            ) ||
            !formURL.includes("/viewform")
        ) {

            setStatus(
                "Google Form link is missing or invalid. Please check app.js."
            );

            return;

        }

        setStatus(
            "Opening SKYRIN ENGINEERING attendance form..."
        );

        // Open Google Form in the same browser tab.
        window.location.assign(formURL);

    });

}


/* 11. INITIAL SETTINGS */

if (captureBtn) {
    captureBtn.disabled = true;
}

if (continueBtn) {
    continueBtn.disabled = true;
}

if (video) {
    video.hidden = true;
}

if (preview) {
    preview.hidden = true;
}

if (downloadLink) {
    downloadLink.hidden = true;
}

if (cameraPlaceholder) {
    cameraPlaceholder.hidden = false;
}

setStatus(
    "Welcome to SKYRIN ENGINEERING Attendance Management."
);


