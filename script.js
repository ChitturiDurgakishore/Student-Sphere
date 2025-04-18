// Ensure the DOM is fully loaded before adding event listeners
document.addEventListener("DOMContentLoaded", () => {
    const authButton = document.getElementById("auth-btn");
    authButton.addEventListener("click", () => {
        console.log("Authenticate button clicked via event listener");
        authenticate(); // Call the authenticate function
    });
});

// Initialize the Google Identity Services Client
const clientID = "479563869562-d4frmm9dfvajlv2ntb4u9i8vm2jmuthr.apps.googleusercontent.com"; // Replace with your actual Client ID
let googleAccountsClient;

function loadGoogleAccounts() {
    googleAccountsClient = google.accounts.oauth2.initTokenClient({
        client_id: clientID,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (tokenResponse) => {
            console.log("Access Token:", tokenResponse.access_token);
            alert("User authenticated successfully!");
        }
    });
}

// Authenticate the user
function authenticate() {
    console.log("Authenticate function called");
    if (!googleAccountsClient) {
        loadGoogleAccounts(); // Initialize Google Accounts if not already done
    }
    googleAccountsClient.requestAccessToken(); // Request access token from the user
}

// Upload file to Google Drive
function uploadFile() {
    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    const metadata = {
        name: file.name,
        mimeType: file.type
    };

    const accessToken = googleAccountsClient.accessToken; // Get the access token
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", file);

    fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: new Headers({
            Authorization: "Bearer " + accessToken
        }),
        body: form
    })
    .then(response => response.json())
    .then(data => {
        console.log("File uploaded:", data);
        alert("File uploaded successfully!");
    })
    .catch(error => {
        console.error("Error uploading file:", JSON.stringify(error));
    });
}

// Add an event listener for the upload button
document.addEventListener("DOMContentLoaded", () => {
    const uploadButton = document.getElementById("upload-btn");
    uploadButton.addEventListener("click", () => {
        console.log("Upload button clicked");
        uploadFile(); // Call the upload function
    });
});
