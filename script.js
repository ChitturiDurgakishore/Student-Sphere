const clientID = "479563869562-d4frmm9dfvajlv2ntb4u9i8vm2jmuthr.apps.googleusercontent.com"; 
const sheetsAPIUrl = "https://script.google.com/macros/s/AKfycby_pTj8posaaZd688eHtESrD6cFjltorDrhxXS-TnDGeGkpsrFL7_O32rX87LjD3VI/exec"; 
let accessToken = null;
let userName = "";

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

document.getElementById("name-submit").addEventListener("click", () => {
    userName = document.getElementById("name-input").value;
    if (userName) {
        document.getElementById("name-section").classList.add("hidden");
        document.getElementById("home-section").classList.remove("hidden");
    } else {
        alert("Please enter your name.");
    }
});

document.getElementById("get-pdfs-btn").addEventListener("click", getFiles);
document.getElementById("upload-pdfs-btn").addEventListener("click", () => {
    document.getElementById("upload-section").classList.remove("hidden");
});
document.getElementById("upload-btn").addEventListener("click", uploadFile);

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
        headers: { Authorization: "Bearer " + accessToken },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        let fileLink = `https://drive.google.com/file/d/${data.id}/view`;
        storeFileMetadata(file.name, subject, fileLink);
    })
    .catch(error => console.error("Error uploading file:", error));
}

function storeFileMetadata(fileName, subject, fileLink) {
    fetch(sheetsAPIUrl, {
        method: "POST",
        body: JSON.stringify({ fileName, subject, fileLink })
    })
    .then(response => response.text())
    .then(data => console.log("File metadata saved:", data));
}

function getFiles() {
    fetch(sheetsAPIUrl)
    .then(response => response.json())
    .then(data => {
        let subjectList = document.getElementById("subject-list");
        subjectList.innerHTML = "";
        data.forEach(file => {
            subjectList.innerHTML += `<li>${file.subject}: <a href="${file.fileLink}" target="_blank">${file.fileName}</a></li>`;
        });
    });
}
