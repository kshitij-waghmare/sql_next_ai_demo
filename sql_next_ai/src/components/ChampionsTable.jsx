import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setChampions } from "../features/championsSlice";
import axios from "axios";
import styles from "./styles/ChampionsTable.module.css"; // Import the module CSS


const ChampionsTable = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const { champions } = useSelector((state) => state.champions);

  useEffect(() => {
    const fetchChampions = () => {
      axios
        .get(`${API_URL}/top-sql-automation-users`)
        .then((response) => {
          // Extract users array properly
          const users = response.data.users.map((user) => ({
            name: user.displayName || "Unknown",
            location: user.officeLocation || "Unknown",
            email: user.userPrincipalName || "",
          }));

          dispatch(setChampions(users));
        })
        .catch((error) => console.error("Error fetching champions:", error));
    };

    fetchChampions();
    const interval = setInterval(fetchChampions, 23 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h4 className={styles.championsTitle}>Champions</h4>
      <table className={styles.championsTable}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>User Full Name</th>
            <th>Work Location</th>
          </tr>
        </thead>
        <tbody>
          {champions.length > 0 ? (
            champions.map((champion, index) => (
              <tr key={index}>
                <td>{index + 1}</td> {/* Serial Number */}
                <td>
                  <a href={`https://teams.microsoft.com/l/chat/0/0?users=${champion.email}`} target="_blank" rel="noopener noreferrer">
                    {champion.name}
                  </a>
                </td>
                <td>{champion.location}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No champions found</td> {/* Updated colspan to 3 */}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ChampionsTable;
