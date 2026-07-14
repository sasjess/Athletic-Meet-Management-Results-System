import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Button from "../components/Button";
import "./Results.css";

const PastMeets = () => {
  const [meets, setMeets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPastMeets = async () => {
      try {
        const res = await fetch("http://localhost/Athletic-Meet-Management-Results-System/backend/dashboard/index.php");
        const data = await res.json();
        if (data.status === "success") {
          setMeets(data.data.pastMeets || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchPastMeets();
  }, []);

  return (
    <Layout>
      <div className="results-page">
        <div className="results-header">
          <div>
            <h1>Past Meets</h1>
            <p>Browse completed meets and their dates.</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="athletes-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Meet Name</th>
                <th>Year</th>
                <th>Status</th>
                <th>Dates</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {meets.length > 0 ? (
                meets.map((meet, index) => (
                  <tr key={meet.meet_id || index}>
                    <td>{index + 1}</td>
                    <td>{meet.meet_name}</td>
                    <td>{meet.year}</td>
                    <td>{meet.status}</td>
                    <td>{meet.start_date ? `${meet.start_date}` : ""}{meet.end_date ? ` - ${meet.end_date}` : ""}</td>
                    <td>
                      <Button size="sm" onClick={() => navigate(`/past-meets/${meet.meet_id}/results`)}>
                        View Results
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No past meets available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default PastMeets;
