// Ensure the DOM is fully loaded before adding event listeners
document.addEventListener("DOMContentLoaded", () => {
  const authButton = document.getElementById("auth-btn");
  authButton.addEventListener("click", () => {
      console.log("Authenticate button clicked via event listener");
      authenticate(); // Call the authenticate function
  });
  
  const signInButton = document.getElementById("sign-in-btn");
  signInButton.addEventListener("click", () => {
      console.log("Sign In button clicked");
      signIn(); // Call the signIn function
  });

  const signOutButton = document.getElementById("sign-out-btn");
  signOutButton.addEventListener("click", () => {
      console.log("Sign Out button clicked");
      signOut(); // Call the signOut function
  });
});

// Authenticate with Google API
function authenticate() {
  console.log("Authenticate function called");
  gapi.load("client:auth2", () => {
      console.log("gapi loaded successfully");
      gapi.auth2.init({
          client_id: "479563869562-d4frmm9dfvajlv2ntb4u9i8vm2jmuthr.apps.googleusercontent.com"
      }).then(() => {
          console.log("Google API initialized successfully");
          document.getElementById("sign-in-btn").disabled = false;
      }).catch(error => {
          console.error("Initialization Error Details:", JSON.stringify(error));
      });
  });
}

// Sign in the user
function signIn() {
  const authInstance = gapi.auth2.getAuthInstance();
  authInstance.signIn().then(user => {
      document.getElementById("sign-out-btn").disabled = false;
      document.getElementById("upload-section").classList.remove("hidden");
      console.log("User signed in:", user.getBasicProfile().getName());
  }).catch(error => {
      console.error("Sign-in Error:", JSON.stringify(error));
  });
}

// Sign out the user
function signOut() {
  const authInstance = gapi.auth2.getAuthInstance();
  authInstance.signOut().then(() => {
      document.getElementById("sign-out-btn").disabled = true;
      document.getElementById("upload-section").classList.add("hidden");
      console.log("User signed out");
  }).catch(error => {
      console.error("Sign-out Error:", JSON.stringify(error));
  });
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

  const accessToken = gapi.auth.getToken().access_token; // Get access token
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
