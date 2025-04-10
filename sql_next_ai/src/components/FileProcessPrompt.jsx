import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetFileProcessSlice, setFileProcess } from "../features/fileProcessSlice";
import styles from "./styles/FileProcessPrompt.module.css";
import rdUploadPortalImage from "../assets/rd-upload-portal-chatbot.png";
import axios from "axios";
import { resetFileUploadSlice, setErrorMessage } from "../features/fileUploadSlice";

const FileProcessPrompt = () => {
  const FTP_API_URL = import.meta.env.VITE_FTP_API_URL;
  const USERNAME = import.meta.env.VITE_FTP_API_USERNAME;
  const PASSWORD = import.meta.env.VITE_FTP_API_PASSWORD;
  const { files, interactionId } = useSelector((state) => state.fileUpload);
  const { isProcessConfirmed, isFileProcessed, isFileProcessLoading } = useSelector((state) => state.fileProcess);
  const dispatch = useDispatch();

  const POST_PROCESSING_INFO = "You can proceed to the Consultant Bot once the File is processed.";
  const FILE_PROCESSING_MESSAGE = "Your RD is getting processed...";

  const handleYesButtonClick = async () => {
    if (files.length > 0) {
      dispatch(setErrorMessage(""));
      dispatch(setFileProcess({ isFileProcessLoading: true }));
      dispatch(setFileProcess({ isProcessConfirmed: true }));

      const formData = new FormData();
      const fileObj = files[0];

      formData.append("requirement_document", fileObj.file);
      formData.append("rd_id", interactionId);

      try {
        const response = await axios.post(FTP_API_URL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Basic ${btoa(`${USERNAME}:${PASSWORD}`)}`,
          },
        });
        if (response.status === 200) {
          dispatch(
            setFileProcess({
              isFileProcessLoading: false,
              isFileProcessed: true,
            })
          );
        }
      } catch (error) {
        dispatch(setErrorMessage("FTP upload failed"));
        dispatch(resetFileProcessSlice());
      }
    }
    // const account = instance.getAllAccounts()[0];
    //   const userInfo = await fetchUserInfo(instance);
    //   // Log the request data before sending it
    //   const logResponse = await axios.post(`${apiUrl}/log-user-action`, {
    //   userId: userInfo.id,
    //   action: 'Clicked Yes to Process RD',
    //   details: `User clicked Yes for Processing RD with Interaction ID: ${interactionId}`,
    //   userInfo: userInfo,
    //   });
  };

  const handleNoButtonClick = () => {
    dispatch(resetFileUploadSlice());
    dispatch(resetFileProcessSlice());
    // setCsvData('');
  };

  return (
    <>
      <div className={styles.greyBox}>
        <div>
          <h4 className={styles.fileProcessTitle}>Consult Bot for SQL Details</h4>
        </div>
        <div className={styles.whiteBox}>
          {files.length > 0 && !isProcessConfirmed && (
            <>
              <img className={styles.rdUploadPortalImg} src={rdUploadPortalImage} alt="Logo" />
              <p className={styles.questionText}>Should we process the document?</p>
              <div className={styles.buttonRow}>
                <button className={styles.actionButton} onClick={handleYesButtonClick}>
                  Yes
                </button>
                <button className={styles.actionButton} onClick={handleNoButtonClick}>
                  No
                </button>
              </div>
            </>
          )}
          {isProcessConfirmed && (
            <>
              <img className={styles.rdUploadPortalImg} src={rdUploadPortalImage} alt="Logo" />
              <span className={styles.questionText}>{POST_PROCESSING_INFO}</span>
            </>
          )}
        </div>
      </div>
      {/* Green Text Box for "File has been processed." */}
      {isFileProcessed && <div className={styles.greenTextBox}>File has been processed.</div>}
      {isFileProcessLoading && <div className={styles.fileProcessingMessage}>{FILE_PROCESSING_MESSAGE}</div>}
    </>
  );
};

export default FileProcessPrompt;
