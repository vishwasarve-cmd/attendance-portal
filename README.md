# Browser attendance capture + Google Forms

## What this demo does
- Serves a browser page using Python Flask.
- Captures a live camera photo in the browser.
- Captures GPS coordinates with browser permission.
- Records the browser's date/time when the photo is taken.
- Lets the user choose IN or OUT.
- Opens a Google Form pre-filled with attendance type, timestamp and GPS values.
- Provides a photo download link so the user can upload the image to a Google Form File upload question.

## Important limitations
1. This is not a fully tamper-proof attendance system. Browser JavaScript and pre-filled Google Form fields can be changed by a user before submission. A user can also deny GPS/camera permission or potentially spoof location.
2. Google Forms does not allow a normal external website to silently attach a camera image to a File upload question. The user must upload the downloaded image in the Google Form, and Google may require the user to sign in.
3. Google Forms can be configured to prevent respondents from editing a response after submission, but that does not make prefilled values trustworthy.
4. Flask is a web server. This example uses Flask only to serve the page locally and does not use a database or custom API. For access by multiple users over the internet, you still need to host it on an HTTPS web server.
5. Camera and GPS generally require HTTPS, except localhost during development.

## Setup on macOS / Windows
Open Terminal in this folder and run:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

On Windows PowerShell, activate with:
```powershell
.venv\\Scripts\\Activate.ps1
```

Open http://127.0.0.1:5000 in your browser. Allow camera and location permissions.

## Configure your Google Form
Create questions in Google Forms for:
- Attendance type (IN / OUT)
- Date and time
- Latitude
- Longitude
- Location accuracy
- Photo (use the File upload question type)

For each text question, use the three-dot menu > Get pre-filled link, enter sample values, and click Get link. The resulting URL contains parameters such as `entry.123456789=...`. Copy the entry IDs and place them in `FORM_ENTRY_IDS` in `static/app.js`. Also replace `GOOGLE_FORM_URL` with your form's responder URL.

Make sure the question types match the values being prefilled. For the attendance type question, a short-answer field is easiest for this demo; a multiple-choice question can also work if the prefilled answer exactly matches an option.

In Google Forms Settings, turn off response editing if that setting is available for your form. Consider limiting responses to signed-in organization accounts if appropriate.

## IN and OUT workflow
The user selects IN time or OUT time, captures a fresh photo and GPS, then continues to the pre-filled form and presses Submit. Each submission is a separate form response.

## For stronger integrity
If attendance must be auditable, do not rely on client-side timestamps/GPS or prefilled Google Forms fields. Use a trusted server-side timestamp, validate submissions on the server, and store records in a controlled database or Google Sheets through a Google Apps Script / authenticated backend. That is a different architecture from a no-backend Google Forms workflow.
