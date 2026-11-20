
/* ============================================
   SKYRIN ENGINEERING
   ATTENDANCE MANAGEMENT SYSTEM

   AUTHENTICATION + ATTENDANCE
============================================ */


/* ============================================
   1. GOOGLE FORM CONFIGURATION
============================================ */

const GOOGLE_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSc-cfIUEYMQmZn-Eh-Ri-_ZSc3CHdN3ftb-hXa2_n7UTAmybQ/viewform?usp=dialog";


/* ============================================
   2. AUTHENTICATION ELEMENTS
============================================ */

const loginForm = document.getElementById("loginForm");

const registerForm = document.getElementById("registerForm");

const loginTab = document.getElementById("loginTab");

const registerTab = document.getElementById("registerTab");

const authStatus = document.getElementById("authStatus");

const logoutBtn = document.getElementById("logoutBtn");


/* ============================================
   3. AUTHENTICATION STATUS
============================================ */

function setAuthStatus(message) {

    if (authStatus) {
        authStatus.textContent = message;
    }

}


/* ============================================
   4. SWITCH TO LOGIN
============================================ */

if (loginTab) {

    loginTab.addEventListener("click", function () {

        loginForm.hidden = false;

        registerForm.hidden = true;

        loginTab.classList.add("active");

        registerTab.classList.remove("active");

        setAuthStatus("Enter your registered employee details.");

    });

}


/* ============================================
   5. SWITCH TO CREATE ACCOUNT
============================================ */

if (registerTab) {

    registerTab.addEventListener("click", function () {

        loginForm.hidden = true;

        registerForm.hidden = false;

        registerTab.classList.add("active");

        loginTab.classList.remove("active");

        setAuthStatus("Create your SKYRIN employee account.");

    });

}


/* ============================================
   6. CREATE ACCOUNT
============================================ */

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("registerName").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        // Check employee name

        if (!name) {

            setAuthStatus("Please enter your full name.");

            return;

        }


        // Check password length

        if (password.length < 8) {

            setAuthStatus(
                "Password must contain at least 8 characters."
            );

            return;

        }


        // Confirm password

        if (password !== confirmPassword) {

            setAuthStatus("Passwords do not match.");

            return;

        }


        try {

            setAuthStatus("Creating your account...");

            const response = await fetch("/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name: name,

                    password: password

                })

            });


            const result = await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message || "Account creation failed."
                );

            }


            setAuthStatus(
                "Account created successfully! Opening dashboard..."
            );


            // Reload page after successful registration

            window.location.reload();


        } catch (error) {

            setAuthStatus(error.message);

        }

    });

}


/* ============================================
   7. LOGIN ACCOUNT
============================================ */

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const name =
            document.getElementById("loginName").value.trim();

        const password =
            document.getElementById("loginPassword").value;


        if (!name || !password) {

            setAuthStatus(
                "Please enter your employee name and password."
            );

            return;

        }


        try {

            setAuthStatus("Verifying your login details...");


            const response = await fetch("/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name: name,

                    password: password

                })

            });


            const result = await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message || "Login failed."
                );

            }


            setAuthStatus(
                "Login successful! Opening attendance dashboard..."
            );


            // Reload page after successful login

            window.location.reload();


        } catch (error) {

            setAuthStatus(error.message);

        }

    });

}


/* ============================================
   8. LOGOUT
============================================ */

if (logoutBtn) {

    logoutBtn.addEventListener("click", async function () {

        const confirmLogout = window.confirm(
            "Are you sure you want to logout?"
        );


        if (!confirmLogout) {
            return;
        }


        logoutBtn.disabled = true;

        logoutBtn.textContent = "Logging out...";


        try {

            const response = await fetch("/logout", {

                method: "POST"

            });


            if (!response.ok) {

                throw new Error("Unable to logout. Please try again.");

            }


            window.location.reload();


        } catch (error) {

            alert(error.message);

            logoutBtn.disabled = false;

            logoutBtn.textContent = "↪ Logout from Account";

        }

    });

}


/* ============================================
   9. ATTENDANCE ELEMENTS
============================================ */

// Employee identification

const employeeIdEl =
    document.getElementById("employeeId");

const employeeNameEl =
    document.getElementById("employeeName");


// Attendance type

const attendanceTypeEl =
    document.getElementById("attendanceType");


// Camera elements

const video =
    document.getElementById("camera");

const canvas =
    document.getElementById("canvas");

const preview =
    document.getElementById("photoPreview");

const cameraPlaceholder =
    document.getElementById("cameraPlaceholder");


// Buttons

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


// Information elements

const statusEl =
    document.getElementById("status");

const dateTimeEl =
    document.getElementById("dateTime");

const locationEl =
    document.getElementById("location");


// Intro screen

const introScreen =
    document.getElementById("introScreen");


/* ============================================
   10. APPLICATION VARIABLES
============================================ */

let cameraStream = null;

let capturedPhoto = false;

let capturedPhotoData = null;

let gps = null;

let capturedAt = null;


/* ============================================
   11. INTRO SCREEN
============================================ */

if (introScreen) {

    document.body.classList.add("splash-active");


    setTimeout(function () {

        introScreen.classList.add("intro-hidden");

        document.body.classList.remove("splash-active");


        setTimeout(function () {

            introScreen.remove();

        }, 750);

    }, 3000);

}


/* ============================================
   12. STATUS MESSAGE
============================================ */

function setStatus(message) {

    if (statusEl) {

        statusEl.textContent = message;

    }

}


/* ============================================
   13. UPDATE CONTINUE BUTTON
============================================ */

function updateContinueButton() {

    if (!continueBtn) {
        return;
    }


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


/* ============================================
   14. EMPLOYEE INPUT VALIDATION
============================================ */

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


/* ============================================
   15. STOP CAMERA
============================================ */

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


/* ============================================
   16. START CAMERA
============================================ */

if (startCameraBtn) {

    startCameraBtn.addEventListener("click", async function () {

        if (!video || !canvas || !captureBtn) {

            setStatus(
                "Camera elements are missing in the HTML."
            );

            return;

        }


        try {

            // Check browser camera support

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


            // Request camera permission

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


            // Start video preview

            await video.play();


            // Reset previous photo capture

            capturedPhoto = false;

            capturedPhotoData = null;

            capturedAt = null;


            // Require fresh GPS location

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

                downloadLink.removeAttribute("href");

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


/* ============================================
   17. CAPTURE LIVE PHOTO
============================================ */

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


        // Set canvas dimensions

        canvas.width = width;

        canvas.height = height;


        const context = canvas.getContext("2d");


        if (!context) {

            setStatus(
                "Unable to capture the photo."
            );

            return;

        }


        // Capture camera image

        context.drawImage(
            video,
            0,
            0,
            width,
            height
        );


        // Convert photo to JPEG

        capturedPhotoData = canvas.toDataURL(
            "image/jpeg",
            0.90
        );


        capturedPhoto = true;


        // Record capture timestamp

        capturedAt = new Date();


        if (dateTimeEl) {

            dateTimeEl.textContent =
                capturedAt.toLocaleString();

        }


        // Display captured photo

        if (preview) {

            preview.src = capturedPhotoData;

            preview.hidden = false;

        }


        video.hidden = true;


        if (cameraPlaceholder) {

            cameraPlaceholder.hidden = true;

        }


        // Provide photo download

        if (downloadLink) {

            downloadLink.href = capturedPhotoData;

            downloadLink.download =
                "SKYRIN_Attendance_Photo.jpg";

            downloadLink.hidden = false;

        }


        // Stop camera after capturing

        stopCamera();


        captureBtn.disabled = true;

        updateContinueButton();


        setStatus(
            "Photo captured successfully. Now capture your GPS location."
        );

    });

}


/* ============================================
   18. CAPTURE GPS LOCATION
============================================ */

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


                // Display coordinates

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


/* ============================================
   19. OPEN GOOGLE FORM
============================================ */

if (continueBtn) {

    continueBtn.addEventListener("click", function () {


        // Validate Employee ID

        if (
            !employeeIdEl ||
            !employeeIdEl.value.trim()
        ) {

            setStatus(
                "Please enter your Employee ID."
            );

            if (employeeIdEl) {

                employeeIdEl.focus();

            }

            return;

        }


        // Validate Employee Name

        if (
            !employeeNameEl ||
            !employeeNameEl.value.trim()
        ) {

            setStatus(
                "Please enter your Employee Name."
            );

            return;

        }


        // Validate attendance type

        if (
            !attendanceTypeEl ||
            !attendanceTypeEl.value
        ) {

            setStatus(
                "Please select IN or OUT attendance."
            );

            if (attendanceTypeEl) {

                attendanceTypeEl.focus();

            }

            return;

        }


        // Validate captured photo

        if (!capturedPhoto) {

            setStatus(
                "Please capture your live photo first."
            );

            return;

        }


        // Validate GPS

        if (!gps) {

            setStatus(
                "Please capture your GPS location first."
            );

            return;

        }


        // Validate timestamp

        if (!capturedAt) {

            setStatus(
                "Attendance timestamp is missing."
            );

            return;

        }


        // Validate Google Form URL

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


        // Open Google Form in same tab

        window.location.assign(formURL);

    });

}


/* ============================================
   20. INITIAL ATTENDANCE SETTINGS
============================================ */

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

    locationEl.textContent =
        "Location not captured yet";

}


if (dateTimeEl) {

    dateTimeEl.textContent =
        "Not captured";

}


if (statusEl) {

    setStatus(
        "Welcome to SKYRIN ENGINEERING Attendance Management."
    );

}


updateContinueButton();

