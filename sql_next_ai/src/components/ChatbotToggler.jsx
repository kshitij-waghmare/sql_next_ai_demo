import React, {useEffect} from "react";
import { useLocation } from "react-router-dom";
 
/**
 * ChatbotToggler component handles the visibility of the chatbot.
 * It hides the chatbot when the user navigates to the /helpPage route
 * and ensures it is visible on all other pages.
 */
const ChatbotToggler = () => {
  const location = useLocation(); // Get the current route location
 
  useEffect(() => {
    const targetSelector = "__intelli_main-container"; // Class name of the chatbot container
 
    /**
     * Function to show or hide the chatbot based on the current route.
     */
    const handleChatBotVisibility = () => {
      const widget = document.getElementsByClassName(targetSelector)[0]; // Get chatbot element
      if (widget) {
        // Hide chatbot on /helpPage, show it on other routes
        widget.style.display = (location.pathname.includes("helpPage") || location.pathname.includes("referPrompt")) ? "none" : "block";
      }
    };
 
    // If chatbot already exists in the DOM, apply visibility logic immediately
    handleChatBotVisibility();
 
    /**
     * If the chatbot container is NOT present, observe the DOM for its addition.
     * This ensures that the chatbot is hidden when dynamically loaded.
     */
    if (!document.getElementsByClassName(targetSelector)[0]) {
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          // Find if the chatbot container was added to the DOM
          const addedNode = [...mutation.addedNodes].find((node) => node.classList && node.classList.contains(targetSelector));
          if (addedNode) {
            handleChatBotVisibility(); // Apply visibility rules
            observer.disconnect(); // Stop observing after chatbot is found
            break;
          }
        }
      });
 
      // Observe only direct children of <body> (chatbot gets added here)
      observer.observe(document.body, { childList: true });
 
      // Cleanup observer on component unmount
      return () => observer.disconnect();
    }
  }, [location.pathname]); // Re-run effect when route changes
 
  return null; // This component does not render anything
};
 
export default ChatbotToggler;