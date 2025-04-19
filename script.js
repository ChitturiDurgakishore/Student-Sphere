const clientID = "479563869562-d4frmm9dfvajlv2ntb4u9i8vm2jmuthr.apps.googleusercontent.com";
let googleAccountsClient;
let accessToken = null;
let userName = '';

// This gets called ONLY after Google's script is loaded
function onGoogleScriptLoad() {
    console.log("Google API script loaded");

    googleAccountsClient = google.accounts.oauth2.initTokenClient({
        client_id: clientID,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (tokenResponse) => {
            accessToken = tokenResponse.access_token;
            console.log("Access Token:", accessToken);
            alert("User authenticated successfully!");
            document.getElementById("auth-section").classList.add("hidden");
            document.getElementById("name-section").classList.remove("hidden");
        }
    });

    document.getElementById("auth-btn").addEventListener("click", () => {
        googleAccountsClient.requestAccessToken();
    });

    document.getElementById("submit-name-btn").addEventListener("click", () => {
        userName = document.getElementById("name-input").value;
        if (userName) {
            alert("Hello " + userName + "!");
            document.getElementById("name-section").classList.add("hidden");
            document.getElementById("upload-section").classList.remove("hidden");
        } else {
            alert("Please enter your name.");
        }
    });

    document.getElementById("upload-btn").addEventListener("click", uploadFile);
}

function uploadFile() {
    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    if (!accessToken) {
        alert("Please authenticate first.");
        return;
    }

    const metadata = {
        name: file.name,
        mimeType: file.type,
        parents: ['root'], // Optional: Add parent folder for organization
    };

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
        console.error("Error uploading file:", error);
        alert("File upload failed.");
    });
}
