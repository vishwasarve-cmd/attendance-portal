
/* ============================================
   SKYRIN ENGINEERING
   ATTENDANCE MANAGEMENT SYSTEM
============================================ */


/* 1. GOOGLE FORM CONFIGURATION */

const GOOGLE_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSc-cfIUEYMQmZn-Eh-Ri-_ZSc3CHdN3ftb-hXa2_n7UTAmybQ/viewform?usp=dialog";


/* 2. HTML ELEMENTS */

// Employee identification
const employeeIdEl = document.getElementById("employeeId");
const employeeNameEl = document.getElementById("employeeName");

// Attendance type
const attendanceTypeEl = document.getElementById("attendanceType");

// Camera elements
const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("photoPreview");
const cameraPlaceholder =
    document.getElementById("cameraPlaceholder");

// Buttons
const startCameraBtn = document.getElementById("startCamera");
const captureBtn = document.getElementById("capturePhoto");
const locationBtn = document.getElementById("getLocation");
const continueBtn = document.getElementById("continueForm");
const downloadLink = document.getElementById("downloadPhoto");

// Information elements
const statusEl = document.getElementById("status");
const dateTimeEl = document.getElementById("dateTime");
const locationEl = document.getElementById("location");

// Intro screen
const introScreen = document.getElementById("introScreen");


/* 3. APPLICATION VARIABLES */

let cameraStream = null;

let capturedPhoto = false;
let capturedPhotoData = null;

let gps = null;
let capturedAt = null;


/* 4. INTRO SCREEN */

if (introScreen) {

    setTimeout(function () {

        introScreen.classList.add("intro-hidden");

        document.body.classList.remove("splash-active");

        setTimeout(function () {
            introScreen.remove();
        }, 750);

    }, 3000);

}


/* 5. STATUS MESSAGE */

function setStatus(message) {

    if (statusEl) {
        statusEl.textContent = message;
    }

}


/* 6. UPDATE CONTINUE BUTTON */

function updateContinueButton() {

    if (!continueBtn) return;

    const employeeId =
        employeeIdEl ? employeeIdEl.value.trim() : "";

    const employeeName =
        employeeNameEl ? employeeNameEl.value.trim() : "";

    const attendanceType =
        attendanceTypeEl ? attendanceTypeEl.value : "";

    continueBtn.disabled = !(
        employeeId.length > 0 &&
        employeeName.length > 0 &&
        attendanceType.length > 0 &&
        capturedPhoto &&
        gps !== null &&
        capturedAt !== null
    );

}


/* 7. EMPLOYEE INPUT VALIDATION */

if (employeeIdEl) {

    employeeIdEl.addEventListener(
        "input",
        updateContinueButton
    );

}

if (employeeNameEl) {

    employeeNameEl.addEventListener(
        "input",
        updateContinueButton
    );

}

if (attendanceTypeEl) {

    attendanceTypeEl.addEventListener(
        "change",
        updateContinueButton
    );

}


/* 8. STOP CAMERA */

function stopCamera() {

    if (cameraStream) {

        cameraStream.getTracks().forEach(function (track) {
            track.stop();
        });

        cameraStream = null;

    }

    if (video) {
        video.srcObject = null;
    }

}


/* 9. START CAMERA */

if (startCameraBtn) {

    startCameraBtn.addEventListener("click", async function () {

        if (!video || !canvas || !captureBtn) {

            setStatus("Camera elements are missing in the HTML.");

            return;

        }

        try {

            // Check browser camera support.
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {

                throw new Error(
                    "Camera requires HTTPS or localhost."
                );

            }

            stopCamera();

            startCameraBtn.disabled = true;

            setStatus("Requesting camera permission...");

            // Request camera permission.
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

            // Start video preview.
            await video.play();

            // Reset previous photo capture.
            capturedPhoto = false;
            capturedPhotoData = null;
            capturedAt = null;

            // Require fresh GPS for this new capture.
            gps = null;

            if (dateTimeEl) {
                dateTimeEl.textContent = "Not captured";
            }

            if (locationEl) {
                locationEl.textContent =
                    "Location not captured yet";
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

        } finally {

            startCameraBtn.disabled = false;

        }

    });

}


/* 10. CAPTURE LIVE PHOTO */

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

        if (!context) {

            setStatus("Unable to capture the photo.");

            return;

        }

        // Draw camera image onto canvas.
        context.drawImage(
            video,
            0,
            0,
            width,
            height
        );

        // Convert photo to JPEG.
        capturedPhotoData = canvas.toDataURL(
            "image/jpeg",
            0.90
        );

        capturedPhoto = true;

        // Record capture timestamp.
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

        // Provide photo download.
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


/* 11. CAPTURE GPS LOCATION */

if (locationBtn) {

    locationBtn.addEventListener("click", function () {

        if (!navigator.geolocation) {

            setStatus(
                "GPS location is not supported by your browser."
            );

            return;

        }

        locationBtn.disabled = true;

        setStatus("Getting your GPS location...");

        navigator.geolocation.getCurrentPosition(

            function (position) {

                gps = {

                    latitude: position.coords.latitude,

                    longitude: position.coords.longitude,

                    accuracy: position.coords.accuracy

                };

                // Display coordinates.
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

                gps = null;

                locationBtn.disabled = false;

                updateContinueButton();

                setStatus(
                    "GPS error: " +
                    error.message +
                    ". Please allow location permission and try again."
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


/* 12. OPEN GOOGLE FORM */

if (continueBtn) {

    continueBtn.addEventListener("click", function () {

        // Check Employee ID.
        if (
            !employeeIdEl ||
            !employeeIdEl.value.trim()
        ) {

            setStatus("Please enter your Employee ID.");

            if (employeeIdEl) {
                employeeIdEl.focus();
            }

            return;

        }

        // Check Employee Name.
        if (
            !employeeNameEl ||
            !employeeNameEl.value.trim()
        ) {

            setStatus("Please enter your Employee Name.");

            if (employeeNameEl) {
                employeeNameEl.focus();
            }

            return;

        }

        // Check attendance type.
        if (
            !attendanceTypeEl ||
            !attendanceTypeEl.value
        ) {

            setStatus("Please select IN or OUT attendance.");

            if (attendanceTypeEl) {
                attendanceTypeEl.focus();
            }

            return;

        }

        // Check captured photo.
        if (!capturedPhoto) {

            setStatus(
                "Please capture your live photo first."
            );

            return;

        }

        // Check GPS.
        if (!gps) {

            setStatus(
                "Please capture your GPS location first."
            );

            return;

        }

        // Check timestamp.
        if (!capturedAt) {

            setStatus(
                "Attendance timestamp is missing."
            );

            return;

        }

        // Validate Google Form URL.
        const formURL = GOOGLE_FORM_URL.trim();

        if (
            !formURL.startsWith(
                "https://docs.google.com/forms/"
            ) ||
            !formURL.includes("/viewform")
        ) {

            setStatus(
                "Google Form link is invalid. Please check app.js."
            );

            return;

        }

        setStatus(
            "Opening SKYRIN ENGINEERING attendance form..."
        );

        continueBtn.disabled = true;

        // Open Google Form in the same tab.
        window.location.assign(formURL);

    });

}


/* 13. INITIAL SETTINGS */

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

if (locationEl) {
    locationEl.textContent = "Location not captured yet";
}

if (dateTimeEl) {
    dateTimeEl.textContent = "Not captured";
}

setStatus(
    "Welcome to SKYRIN ENGINEERING Attendance Management."
);

updateContinueButton();

