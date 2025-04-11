import React, { useEffect, useRef, useState } from "react";
import styles from "./styles/FileUploadSection.module.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import wordIcon from "../assets/word-icon.png";
import deleteIcon from "../assets/delete.jpg";
import { setIsAttachButtonDisabled, setErrorMessage, setInteractionId } from "../features/fileUploadSlice";
import { resetFileProcessSlice } from "../features/fileProcessSlice";
import { safeLogUserAction } from "../utils/logUserAction";
import { useGlobalContext } from "../context/GlobalContext";

const FileUploadSection = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const { isFileProcessed } = useSelector((state) => state.fileProcess);

  const { errorMessage, successMessage, isAttachButtonDisabled } = useSelector((state) => state.fileUpload);
  const { files, setFiles } = useGlobalContext();

  const [filesUploaded, setFilesUploaded] = useState(false);

  useEffect(() => {
    if (Array.isArray(files) && files.length === 0) {
      fileInputRef.current.value = null;
      setFilesUploaded(false); // if files are removed, then flag is toggled to false
    }
  }, [files]);

  const handleFileUpload = async (event) => {
    const newFiles = Array.from(event.target.files);
    const allowedTypes = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const validFiles = newFiles.filter((file) => allowedTypes.includes(file.type));

    if (validFiles.length === 0) {
      dispatch(setErrorMessage("Only Word files (DOCX) are allowed."));
      return;
    }

    dispatch(setErrorMessage(""));
    try {
      dispatch(setIsAttachButtonDisabled(true));
      const response = await axios.get(`${API_URL}/documents/generate-interaction-id`);
      const generatedInteractionId = response.data.interactionId;
      dispatch(setInteractionId(generatedInteractionId));

      const updatedFiles = validFiles.map((fileObj) => ({
        name: `${fileObj.name.replace(".docx", "")}_${generatedInteractionId}.docx`,
        type: fileObj.name.split(".").pop(),
        uploadDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }),
        interactionId: generatedInteractionId,
        file: fileObj,
      }));

      setFiles(updatedFiles);
      setFilesUploaded(true);

      const formData = new FormData();
      updatedFiles.forEach((fileObj) => {
        formData.append("files", fileObj.file);
        formData.append("interactionId", fileObj.interactionId);
        formData.append("user", typeof user !== "undefined" ? JSON.stringify(user) : "unknown");
      });

      const uploadResponse = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (uploadResponse.status === 200) {
      }
    } catch (error) {
      dispatch(setErrorMessage("Error uploading files: " + (error.response ? error.response.data : error.message)));
      dispatch(setIsAttachButtonDisabled(false));
    } finally {
      try {
        await safeLogUserAction(
          typeof instance !== "undefined" && instance !== null ? instance : undefined,
          "File Uploaded",
          "User has uploaded RD."
        );
      } catch (error) {
        dispatch(setErrorMessage(`Failed to log user action`));
      }
    }
  };

  const handleDeleteFile = async () => {
    try {
      if (files.length === 0) {
        dispatch(setErrorMessage("No file to delete"));
        return;
      }

      const fileObj = files[0];
      if (!fileObj || !fileObj.interactionId) {
        dispatch(setErrorMessage("Invalid file data. No interaction ID found."));
        return;
      }

      const response = await axios.post(`${API_URL}/documents/delete-file`, {
        interactionId: fileObj.interactionId,
      });

      if (response.status === 200) {
        setFiles([]);
        setFilesUploaded(false);
        dispatch(setInteractionId(null));
        dispatch(setErrorMessage(""));
        dispatch(setIsAttachButtonDisabled(false));
        dispatch(resetFileProcessSlice());
      } else {
        dispatch(setErrorMessage(`Error deleting file: ${response.status}`));
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      dispatch(setErrorMessage(`Error deleting file: ${error.response ? error.response.data : error.message}`));
    }
  };

  const handleResetButtonClick = async () => {
    await handleDeleteFile();
  };

  return (
    <>
      <div className={styles.greyBox}>
        <div className={styles.uploadHeader}>Upload the Requirement Document</div>

        <div className={styles.uploadContent}>
          {files.length > 0 ? (
            <div className={styles.fileStatusBox}>
              <img src={wordIcon} alt="Word Icon" className={styles.fileIcon} />
              <div className={styles.fileDetails}>
                <div className={styles.fileName}>{files[0].name}</div>
                <div className={styles.uploadDate}>Uploaded on: {files[0].uploadDate}</div>
                <div className={styles.interactionId}>Interaction ID: {files[0].interactionId}</div>
              </div>
              <button className={styles.deleteBtn} onClick={handleDeleteFile}>
                <img src={deleteIcon} alt="Delete Icon" className={styles.deleteIcon} />
              </button>
            </div>
          ) : (
            <div className={styles.fileStatusBox}>
              <div className={styles.noFile}>No file attached</div>
            </div>
          )}

          <div className={styles.attachFileBtn}>
            <button
              className={`${styles.fileUploadBtn} ${isAttachButtonDisabled ? styles.disabled : ""}`}
              onClick={() => fileInputRef.current?.click()}
              disabled={isAttachButtonDisabled}
            >
              ATTACH FILE
            </button>

            <button className={`${styles.fileResetBtn} ${files.length > 0 ? "" : styles.disabled}`} onClick={handleResetButtonClick}>
              RESET FILE
            </button>

            <input type="file" id="file-upload" onChange={handleFileUpload} ref={fileInputRef} style={{ display: "none" }} />
          </div>

          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
        </div>

        <div className={styles.timelineContainer}>
          <div className={styles.timeline}>
            <div className={`${styles.timelinePoint} ${filesUploaded ? styles.uploaded : ""}`}>File Uploaded</div>
            <div className={`${styles.timelineConnector} ${isFileProcessed ? styles.inProcess : ""}`} />
            <div className={`${styles.timelinePoint} ${isFileProcessed ? styles.uploaded : ""}`}>SQL Generating Consultant Bot</div>
          </div>
        </div>
      </div>
      {filesUploaded && <div className={styles.noteText}>Keep a note of the RD ID for chatbot. </div>}
    </>
  );
};

export default FileUploadSection;
