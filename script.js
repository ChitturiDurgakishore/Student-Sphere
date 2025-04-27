// Replace these with your actual credentials
const clientID = "479563869562-d4frmm9dfvajlv2ntb4u9i8vm2jmuthr.apps.googleusercontent.com"; // Replace this
const sheetsAPIUrl = "https://script.google.com/macros/s/AKfycbx9nu2WNokgsCYo1_StyZHyoWoC9R8rOi25fXjtS5z4K9MA-Vx7jZz0WiSNhLp0C0w/exec"; // Replace this
let accessToken = null;
let userName = "";

// Initialize Google Authentication
function onGoogleScriptLoad() {
    googleAccountsClient = google.accounts.oauth2.initTokenClient({
        client_id: clientID,
        scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata",
        callback: (tokenResponse) => {
            accessToken = tokenResponse.access_token;
            console.log("Access Token:", accessToken); // Debugging: Log the token

            if (!accessToken) {
                alert("Failed to authenticate. Please try again.");
                return;
            }

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
        alert("Please select a file.");
        return;
    }
    if (!accessToken || typeof accessToken !== "string") {
        alert("Authentication error! Access token missing.");
        console.error("Access token is undefined. Try logging in again.");
        return;
    }

    console.log("Uploading file:", file.name);
    console.log("Using Access Token:", accessToken);

    let metadata = { name: file.name, mimeType: file.type };
    let formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", file);

    fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: { 
            Authorization: `Bearer ${accessToken}`
        },
        body: formData
    })
    .then(response => {
        console.log("Raw API Response:", response.status); // Debugging log
        return response.json();
    })
    .then(data => {
        console.log("Upload Response:", data);
        if (data.id) {
            let fileLink = `https://drive.google.com/file/d/${data.id}/view`;
            alert("File uploaded successfully!");
            storeFileMetadata(file.name, subject, fileLink);
        } else {
            console.error("Upload Error:", data);
            alert("File upload failed! Check API response.");
        }
    })
    .catch(error => {
        console.error("Error uploading file:", error);
        alert("File upload failed.");
    });
}

// Function to Store Metadata in Database (PHP Backend)
function storeFileMetadata(fileName, subject, fileLink) {
    console.log("Storing metadata to database:", fileName, subject, fileLink);

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    fetch("upload_link.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            subject: subject,
            uploadDate: today,
            link: fileLink,
            uploadedBy: userName
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Server Response:", data);
        if (data.status === "success") {
            alert("PDF uploaded and saved to database!");
        } else {
            alert("PDF uploaded but failed to save metadata.");
        }
    })
    .catch(error => {
        console.error("Error storing metadata:", error);
        alert("Upload succeeded but failed to save data.");
    });
}

// Function to Retrieve Files from Google Sheets (or Database)
function getFiles() {
    fetch(sheetsAPIUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Fetched data:", data); // Debugging log
        let subjectList = document.getElementById("subject-list");
        subjectList.innerHTML = "";

        if (data.length === 0) {
            subjectList.innerHTML = "<p>No PDFs available yet.</p>";
            return;
        }

        data.forEach(file => {
            subjectList.innerHTML += `<li>${file.subject}: <a href="${file.fileLink}" target="_blank">${file.fileName}</a></li>`;
        });
    })
    .catch(error => {
        console.error("Error fetching files:", error);
        alert("Failed to fetch study materials.");
    });
}
