// Replace these with your actual credentials
const clientID = "479563869562-d4frmm9dfvajlv2ntb4u9i8vm2jmuthr.apps.googleusercontent.com"; // Replace this
const sheetsAPIUrl = "https://script.google.com/macros/s/AKfycby_pTj8posaaZd688eHtESrD6cFjltorDrhxXS-TnDGeGkpsrFL7_O32rX87LjD3VI/exec"; // Replace this
let accessToken = null;
let userName = "";

// Initialize Google Authentication
function onGoogleScriptLoad() {
    googleAccountsClient = google.accounts.oauth2.initTokenClient({
        client_id: clientID,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (tokenResponse) => {
            accessToken = tokenResponse.access_token;
            alert("User authenticated successfully!");
            document.getElementById("name-section").classList.remove("hidden");
        }
    });

    document.getElementById("auth-btn").addEventListener("click", () => {
        googleAccountsClient.requestAccessToken();
    });
}

// Handling Name Input
document.getElementById("name-submit").addEventListener("click", () => {
    userName = document.getElementById("name-input").value;
    if (userName) {
        document.getElementById("name-section").classList.add("hidden");
        document.getElementById("home-section").classList.remove("hidden");
    } else {
        alert("Please enter your name.");
    }
});

// Navigation Buttons
document.getElementById("get-pdfs-btn").addEventListener("click", getFiles);
document.getElementById("upload-pdfs-btn").addEventListener("click", () => {
    document.getElementById("upload-section").classList.remove("hidden");
});
document.getElementById("upload-btn").addEventListener("click", uploadFile);

// Function to Upload File to Google Drive
function uploadFile() {
    let file = document.getElementById("file-input").files[0];
    let subject = document.getElementById("subject-select").value;

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }
    if (!accessToken) {
        alert("Please authenticate first.");
        return;
    }

    let metadata = { name: file.name, mimeType: file.type };
    let formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", file);

    fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            let fileLink = `https://drive.google.com/file/d/${data.id}/view`;
            alert("File uploaded successfully!");

            // Store metadata in Google Sheets
            storeFileMetadata(file.name, subject, fileLink);
        } else {
            alert("File upload failed! Check API response.");
            console.error("Upload Error:", data);
        }
    })
    .catch(error => {
        console.error("Error uploading file:", error);
        alert("File upload failed.");
    });
}

// Function to Store Metadata in Google Sheets
function storeFileMetadata(fileName, subject, fileLink) {
    fetch(sheetsAPIUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, subject, fileLink })
    })
    .then(response => response.text())
    .then(data => {
        console.log("File metadata saved:", data);
        alert("File metadata stored in Google Sheets!");
    })
    .catch(error => console.error("Error storing metadata:", error));
}

// Function to Retrieve Files from Google Sheets
function getFiles() {
    fetch(sheetsAPIUrl)
    .then(response => response.json())
    .then(data => {
        let subjectList = document.getElementById("subject-list");
        subjectList.innerHTML = "";

        data.forEach(file => {
            subjectList.innerHTML += `<li>${file.subject}: <a href="${file.fileLink}" target="_blank">${file.fileName}</a></li>`;
        });
    })
    .catch(error => console.error("Error fetching files:", error));
}
