import React, { useState } from "react";
import styles from "./styles/HelpPage.module.css";
import { FaInfoCircle, FaQuestionCircle, FaBook, FaVideo, FaLifeRing } from "react-icons/fa";
import bgImage from "../assets/banner.png"; // Placeholder for the background image

const prompts = [
  {
    title: "SQL Query to Fetch Business Unit Name for Purchase Orders",
    description:
      "Please suggest SQL query to fetch the Business Unit name for Purchase Orders.",
  },
  {
    title: "Supplier and On-Hand Quantities Report",
    description:
      "Create a report which provides details of Supplier and On-Hand Quantities of Item and Item Details from Oracle Fusion Cloud.",
  },
  {
    title: "Account Payable Aging Report (Oracle Fusion Cloud)",
    description:
      "Prepare SQL query in Oracle Fusion to fetch the Account Payable Aging Report.",
  },
  {
    title: "Prepayment Applied and Remaining Amount Details",
    description:
      "Prepare a query to get prepayment applied and amount remaining details of payable invoice along with the payment status.",
  },
];

const Help = () => {
  const [activeSection, setActiveSection] = useState("introduction");

  const renderContent = () => {
    switch (activeSection) {
      case "introduction":
        return (
          <div className={styles.rightContent}>
            <p>
        <h5>Introduction</h5>
        <br />
        <div>
          Welcome to the future of <strong>SQL Automation!</strong>{" "}
          <strong>Mastek Gen AI-powered SQL Automation Tool</strong> transforms
          Oracle Fusion query creation with unmatched speed, intelligence, and
          ease. Whether you're a business analyst or developer, say goodbye to
          complex SQL coding!
        </div>
        <br />
        <div> <br />
          <strong>Instant Query Generation</strong> – Upload a{" "}
          <strong>Requirement Document</strong> and there you go! Your SQL query appears
           in chatbot window. You can see the Reference RD from the site. 
        </div>
        <br />
        <div>
          <strong>No RD available? No Problem!</strong> – Just describe what you need in
          everyday language, and AI does the rest. AI gives all the SQL queries in a 
          <strong> Black Box</strong> for convenience. 
        </div>
        <br />
        <div>
          <strong>Mastek’s Oracle Fusion Expertise</strong> – Supercharged by a
          powerful <strong>LLM</strong>, guiding you like a pro! This tool will help
          reduce Oracle Fusion <strong> Operations </strong> by drastic margins.  
        </div>
      </p>
          </div>
        );
      case "prompts":
        return (
          <div className={styles.promptsContainer}>
            <h1 className={styles.heading}>Sample Prompts</h1>
            {prompts.map((prompt, index) => (
              <div className={styles.promptCard} key={index}>
                <h2 className={styles.promptTitle}>{prompt.title}</h2>
                <p className={styles.promptDescription}>{prompt.description}</p>
              </div>
            ))}
          </div>
        );
      case "guide":
        return (
          <div className={styles.rightContent}>
            <p>Click the link below to download the User Guide document:</p> <br />
            <a href="/SQL AUTOMATION TESTING USER MANUAL_v1.0.pdf" download>
              <strong> Download User Guide </strong>
            </a>
          </div>
        );
      case "videos":
        return (
          <div className={styles.videoContainer}>
            <h5 className={styles.h5}>Watch Demo Videos</h5>
            <video className="video-player" width="400" controls>
              {/* <source src={`${process.env.PUBLIC_URL}/myVideo.mp4`} type="video/mp4" /> */}
              <source src="Sql Automation_Demo_01.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <video className="video-player" width="400" controls>
              {/* <source src={`${process.env.PUBLIC_URL}/myVideo.mp4`} type="video/mp4" /> */}
              <source src="Sql Automation_Simple english to Sql.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case "support":
        return (
          <div className={styles.rightContent}>
            <h5 className={styles.h5}>
              Need help? Contact our support team at <a href="mailto:support@sqlnext.ai">support@sqlnext.ai</a>
            </h5>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>
            <span className={styles.headerHeadingIcx}>icx</span>
            <span className={styles.headerHeadingPro}>Pro</span>
          </h1>
          <h4 className={styles.header4}>AI Product Engineering</h4>
        </div>
      </div>

      <div className={styles.secondSection}>
        <img src={bgImage} alt="help" className={styles.mainImage} />
        <div className={styles.textOverlaySolution}>
          <h2>SQLNEXT.AI - Revolutionizing</h2>
          <h3>SQL Automation With Gen AI</h3>
          <p>Powered by Mastek's Oracle Fusion Expertise</p>
        </div>
      </div>

      <div className={styles.thirdSection}>
        <div className={`${styles.card} ${styles.leftCard}`}>
          <div className={styles.leftContent}>
            <div className={styles.iconOption} onClick={() => setActiveSection("introduction")}>
              <FaInfoCircle className={styles.icon} />
              Introduction
            </div>
            <div className={styles.iconOption} onClick={() => setActiveSection("prompts")}>
              <FaQuestionCircle className={styles.icon} />
              Sample Prompts
            </div>
            <div className={styles.iconOption} onClick={() => setActiveSection("guide")}>
              <FaBook className={styles.icon} />
              User Guide
            </div>
            <div className={styles.iconOption} onClick={() => setActiveSection("videos")}>
              <FaVideo className={styles.icon} />
              Demo Videos
            </div>
            <div className={styles.iconOption} onClick={() => setActiveSection("support")}>
              <FaLifeRing className={styles.icon} />
              Support
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.rightCard}`}>{renderContent()}</div>
      </div>
    </div>
  );
};

export default Help;
