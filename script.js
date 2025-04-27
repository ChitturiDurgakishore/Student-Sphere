const clientID = "479563869562-d4frmm9dfvajlv2ntb4u9i8vm2jmuthr.apps.googleusercontent.com"; // Replace with actual Client ID
const sheetsAPIUrl = "https://script.google.com/macros/s/AKfycbx9nu2WNokgsCYo1_StyZHyoWoC9R8rOi25fXjtS5z4K9MA-Vx7jZz0WiSNhLp0C0w/exec"; // Replace with API URL
let accessToken = null;
let userName = "";

window.onload = function () {
    console.log("Page Loaded");

    const googleAccountsClient = google.accounts.oauth2.initTokenClient({
        client_id: clientID,
        scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata",
        callback: (tokenResponse) => {
            accessToken = tokenResponse.access_token;
            console.log("Access Token:", accessToken);
            if (!accessToken) {
                alert("Failed to authenticate.");
                return;
            }
            alert("User authenticated successfully!");
            document.getElementById("name-section").classList.remove("hidden");
        }
    });

    document.getElementById("auth-btn").addEventListener("click", () => {
        console.log("Auth Button Clicked");
        googleAccountsClient.requestAccessToken();
    });

    document.getElementById("get-pdfs-btn").addEventListener("click", getFiles);
    document.getElementById("upload-pdfs-btn").addEventListener("click", () => {
        document.getElementById("upload-section").classList.remove("hidden");
    });

    document.getElementById("upload-btn").addEventListener("click", uploadFile);
};
document.getElementById("name-submit").addEventListener("click", () => {
    let nameInput = document.getElementById("name-input").value.trim();
    if (!nameInput) {
        alert("Please enter your name.");
        return;
    }
    
    userName = nameInput;
    document.getElementById("home-section").classList.remove("hidden");
    document.getElementById("name-section").classList.add("hidden");
    document.getElementById("user-name").innerText = userName;
});


function getFiles() {
    fetch(sheetsAPIUrl, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(response => response.json())
    .then(data => {
        console.log("Fetched data:", data);
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
    .catch(error => console.error("Error fetching files:", error));
}

function uploadFile() {
    let file = document.getElementById("file-input").files[0];
    let subject = document.getElementById("subject-select").value;

    if (!file) return alert("Please select a file.");

    let metadata = { name: file.name, mimeType: file.type };
    let formData = new FormData();
    formData.append("metadata", JSON.stringify(metadata));
    formData.append("file", file);

    fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        let fileLink = `https://drive.google.com/file/d/${data.id}/view`;
        alert("File uploaded!");
        storeFileMetadata(file.name, subject, fileLink);
    })
    .catch(error => console.error("Error uploading file:", error));
}

function storeFileMetadata(fileName, subject, fileLink) {
    fetch("uploaded_link.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, fileLink, uploadedBy: userName })
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(error => console.error("Error storing metadata:", error));
}
