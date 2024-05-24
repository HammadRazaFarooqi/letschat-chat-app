import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const upload = async (file) => {
  // Initialize Firebase Storage
  const storage = getStorage();

  // Create a reference to the file to be uploaded
  const date = new Date();
  const storageRef = ref(storage, `images.${date + file.name}`);

  return new Promise((resolve, reject) => {
    // Start the upload task
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Monitor the state of the upload task
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Calculate and log the progress of the upload
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        // Handle different states of the upload task
        
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error("Upload failed:", error);
        reject("Something went wrong! " + error.code);
      },
      () => {
        // Handle successful uploads on complete
        // Get the download URL of the uploaded file
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};

export default upload;
