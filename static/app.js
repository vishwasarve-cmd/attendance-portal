
/*
   GOOGLE FORM CONFIGURATION

   Replace the URL with your Google Form responder URL.
   Replace the entry IDs with your actual Google Form entry IDs.
*/

const GOOGLE_FORM_URL =
    "https://docs.google.com/forms/d/e/REPLACE_WITH_FORM_ID/viewform";

const FORM_ENTRY_IDS = {
    attendanceType: "entry.1111111111",
    dateTime: "entry.2222222222",
    latitude: "entry.3333333333",
    longitude: "entry.4444444444",
    locationAccuracy: "entry.5555555555"
};


/* HTML ELEMENTS */

const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("photoPreview");

const statusEl = document.getElementById("status");
const dateTimeEl = document.getElementById("dateTime");
const locationEl = document.getElementById("location");

const captureBtn = document.getElementById("capturePhoto");
const continueBtn = document.getElementById("continueForm");

const downloadLink = document.getElementById("downloadPhoto");


/* VARIABLES */

let stream = null;
let capturedPhoto = false;
let gps = null;
let capturedAt = null;


/* STATUS MESSAGE */

function setStatus(message) {
    statusEl.textContent = message;
}


/* START CAMERA */

document.getElementById("startCamera").addEventListener("click", async () => {

    try {

        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error(
                "Camera access requires HTTPS or localhost and a supported browser."
            );
        }

        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false
        });

        video.srcObject = stream;

        video.hidden = false;
        preview.hidden = true;

        captureBtn.disabled = false;

        setStatus("Camera ready. Take your live photo.");

    } catch (err) {

        setStatus("Could not start camera: " + err.message);

    }

});


/* CAPTURE PHOTO */

captureBtn.addEventListener("click", () => {

    if (!stream) return;

    const trackSettings = stream.getVideoTracks()[0].getSettings();

    const width = trackSettings.width || video.videoWidth || 640;
    const height = trackSettings.height || video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, width, height);

    capturedAt = new Date();

    dateTimeEl.textContent = capturedAt.toLocaleString();

    const photoUrl = canvas.toDataURL("image/jpeg", 0.88);

    preview.src = photoUrl;

    preview.hidden = false;
    video.hidden = true;

    downloadLink.href = photoUrl;
    downloadLink.hidden = false;

    capturedPhoto = true;

    updateContinueState();

    setStatus(
        "Photo captured. Download it if your Google Form asks for a file upload."
    );

    stream.getTracks().forEach(track => track.stop());

    stream = null;

});


/* GET GPS LOCATION */

document.getElementById("getLocation").addEventListener("click", () => {

    if (!navigator.geolocation) {

        setStatus("Geolocation is not supported by this browser.");

        return;
    }

    setStatus("Getting GPS location…");

    navigator.geolocation.getCurrentPosition(

        position => {

            gps = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };

            locationEl.textContent =
                `${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)} (±${Math.round(gps.accuracy)} m)`;

            updateContinueState();

            setStatus("Location captured.");

        },

        error => {

            setStatus(
                "Location error: " +
                error.message +
                ". Allow location permission and try again."
            );

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

});


/* ENABLE CONTINUE BUTTON */

function updateContinueState() {

    continueBtn.disabled = !(
        capturedPhoto &&
        gps &&
        capturedAt
    );

}


/* CONTINUE TO GOOGLE FORM */

continueBtn.addEventListener("click", () => {

    if (!capturedPhoto || !gps || !capturedAt) return;

    const url = new URL(GOOGLE_FORM_URL);

    const values = {

        [FORM_ENTRY_IDS.attendanceType]:
            document.getElementById("attendanceType").value,

        [FORM_ENTRY_IDS.dateTime]:
            capturedAt.toISOString(),

        [FORM_ENTRY_IDS.latitude]:
            gps.latitude,

        [FORM_ENTRY_IDS.longitude]:
            gps.longitude,

        [FORM_ENTRY_IDS.locationAccuracy]:
            Math.round(gps.accuracy) + " metres"

    };


    /* CHECK GOOGLE FORM CONFIGURATION */

    for (const [entry, value] of Object.entries(values)) {

        if (
            entry.includes("REPLACE") ||
            entry.endsWith("1111111111") ||
            entry.endsWith("2222222222") ||
            entry.endsWith("3333333333") ||
            entry.endsWith("4444444444") ||
            entry.endsWith("5555555555")
        ) {

            setStatus(
                "Set your Google Form URL and entry IDs in static/app.js first."
            );

            return;

        }

        url.searchParams.set(entry, value);

    }


    // Opens the pre-filled Google Form.
    // The user must review and press Submit in Google Forms.

    window.open(
        url.toString(),
        "_blank",
        "noopener"
    );

});

