const clientID = "479563869562-d4frmm9dfvajlv2ntb4u9i8vm2jmuthr.apps.googleusercontent.com";
let googleAccountsClient;
let accessToken = null;
let userName = "";

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
            document.getElementById("name-section").classList.remove("hidden");
        }
    });

    document.getElementById("auth-btn").addEventListener("click", () => {
        googleAccountsClient.requestAccessToken();
    });
    
    document.getElementById("name-submit").addEventListener("click", () => {
        userName = document.getElementById("name-input").value;
        if (userName) {
            document.getElementById("name-section").classList.add("hidden");
            document.getElementById("home-section").classList.remove("hidden");
        } else {
            alert("Please enter your name.");
        }
    });

    document.getElementById("get-pdfs-btn").addEventListener("click", getPDFs);
    document.getElementById("upload-pdfs-btn").addEventListener("click", () => {
        document.getElementById("upload-section").classList.remove("hidden");
    });

    document.getElementById("upload-btn").addEventListener("click", uploadFile);
}

function getPDFs() {
    // Assuming PDFs are stored by subject in some collection
    const subjects = ["ATCD", "CV", "DT", "ML", "FIOT"];
    const subjectList = document.getElementById("subject-list");
    subjectList.innerHTML = "";

    subjects.forEach(subject => {
        const listItem = document.createElement("li");
        listItem.textContent = subject;
        listItem.addEventListener("click", () => showPDFLinks(subject));
        subjectList.appendChild(listItem);
    });

    document.getElementById("get-pdfs-section").classList.remove("hidden");
}

function showPDFLinks(subject) {
    // Fetch PDF links from Google Drive or a database
    const pdfLinks = [
        { name: "Sample PDF 1", uploader: "User1", url: "https://drive.google.com/1" },
        { name: "Sample PDF 2", uploader: "User2", url: "https://drive.google.com/2" },
    ];

    const pdfList = document.createElement("ul");
    pdfLinks.forEach(pdf => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="${pdf.url}" target="_blank">${pdf.name} (Uploaded by: ${pdf.uploader})</a>`;
        pdfList.appendChild(listItem);
    });

    document.getElementById("get-pdfs-section").innerHTML = `<h2>${subject} PDFs</h2>`;
    document.getElementById("get-pdfs-section").appendChild(pdfList);
}

function uploadFile() {
    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];
    const subject = document.getElementById("subject-select").value;

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
        parents: ["appDataFolder"]
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
        getPDFs(); // Refresh the list of available PDFs
    })
    .catch(error => {
        console.error("Error uploading file:", error);
        alert("File upload failed.");
    });
}
