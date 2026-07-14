import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Button from "../components/Button";
import "./PastMeetResults.css";

// Age group configuration brought in to translate IDs to readable labels
// (kept in sync with Results.jsx)
const ageGroupOptions = [
  { id: "1", label: "Under 12" },
  { id: "3", label: "Under 14" },
  { id: "17", label: "Under 16" },
  { id: "18", label: "Under 18" },
  { id: "19", label: "Under 20" },
];

const ageGroupLabels = Object.fromEntries(
  ageGroupOptions.map((item) => [item.id, item.label]),
);

// Order lookup for sorting: index in this array = display order (Under 12 -> Under 20)
const ageGroupOrder = ageGroupOptions.map((item) => item.id);

const PastMeetResults = () => {
  const { meetId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [meet, setMeet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost/Athletic-Meet-Management-Results-System/backend";

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE}/results/get_by_meet.php?meet_id=${meetId}`);
        const payload = await response.json();

        if (payload.status === "success") {
          setResults(payload.data || []);
          if (payload.data?.length > 0) {
            setMeet({
              meet_name: payload.data[0].meet_name,
              year: payload.data[0].year,
            });
          }
        } else {
          setError(payload.message || "Failed to load results");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    if (meetId) {
      fetchResults();
    }
  }, [meetId]);

  const handlePrint = () => {
    window.print();
  };

  // Sort results by age group ascending (Under 12 -> Under 20), unknown groups pushed to the end
  const getSortedResults = () => {
    return [...results].sort((a, b) => {
      const orderA = ageGroupOrder.indexOf(String(a.agegroup_id));
      const orderB = ageGroupOrder.indexOf(String(b.agegroup_id));
      const safeA = orderA === -1 ? ageGroupOrder.length : orderA;
      const safeB = orderB === -1 ? ageGroupOrder.length : orderB;
      return safeA - safeB;
    });
  };

  return (
    <Layout>
      <div className="results-page">
        <div className="results-header">
          <div>
            <h1>{meet?.meet_name || "Past Meet Results"}</h1>
            <p>
              {meet?.year ? `Results for ${meet.year}` : "Detailed results for the selected meet."}
            </p>
          </div>

          <div className="results-actions">
            <Button variant="secondary" onClick={() => navigate("/past-meets")}>Back to Past Meets</Button>
            <Button onClick={handlePrint}>Print / PDF</Button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="results-table-wrapper print-area">
          {loading ? (
            <p>Loading results...</p>
          ) : results.length > 0 ? (
            <>
              <div className="print-header">
                <h2>{meet?.meet_name || "Meet Results"}</h2>
                <p>{meet?.year || ""}</p>
              </div>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Bib</th>
                    <th>Athlete</th>
                    <th>Age Group</th>
                    <th>School</th>
                    <th>Event</th>
                    <th>Performance</th>
                    <th>Position</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedResults().map((result, index) => (
                    <tr key={result.id || index}>
                      <td>{index + 1}</td>
                      <td>{result.bib_no}</td>
                      <td>{result.athlete_name || "-"}</td>
                      <td>
                        {ageGroupLabels[String(result.agegroup_id)] ||
                          (result.agegroup_id ? `Under ${result.agegroup_id}` : "-")}
                      </td>
                      <td>{result.school_name || "-"}</td>
                      <td>{result.event_name || "-"}</td>
                      <td>
                        {result.performance_time
                          ? `${result.performance_time}s`
                          : result.performance_distance
                          ? `${result.performance_distance}m`
                          : "-"}
                      </td>
                      <td>{result.position ?? "-"}</td>
                      <td>{result.points ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p>No results found for this meet.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PastMeetResults;


// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Layout from "../components/layout/Layout";
// import Button from "../components/Button";
// import "./PastMeetResults.css";

// const PastMeetResults = () => {
//   const { meetId } = useParams();
//   const navigate = useNavigate();
//   const [results, setResults] = useState([]);
//   const [meet, setMeet] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const API_BASE = "http://localhost/Athletic-Meet-Management-Results-System/backend";

//   useEffect(() => {
//     const fetchResults = async () => {
//       setLoading(true);
//       setError("");

//       try {
//         const response = await fetch(`${API_BASE}/results/get_by_meet.php?meet_id=${meetId}`);
//         const payload = await response.json();

//         if (payload.status === "success") {
//           setResults(payload.data || []);
//           if (payload.data?.length > 0) {
//             setMeet({
//               meet_name: payload.data[0].meet_name,
//               year: payload.data[0].year,
//             });
//           }
//         } else {
//           setError(payload.message || "Failed to load results");
//         }
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load results");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (meetId) {
//       fetchResults();
//     }
//   }, [meetId]);

//   const handlePrint = () => {
//     window.print();
//   };

//   return (
//     <Layout>
//       <div className="results-page">
//         <div className="results-header">
//           <div>
//             <h1>{meet?.meet_name || "Past Meet Results"}</h1>
//             <p>
//               {meet?.year ? `Results for ${meet.year}` : "Detailed results for the selected meet."}
//             </p>
//           </div>

//           <div className="results-actions">
//             <Button variant="secondary" onClick={() => navigate("/past-meets")}>Back to Past Meets</Button>
//             <Button onClick={handlePrint}>Print / PDF</Button>
//           </div>
//         </div>

//         {error && <div className="error-message">{error}</div>}

//         <div className="results-table-wrapper print-area">
//           {loading ? (
//             <p>Loading results...</p>
//           ) : results.length > 0 ? (
//             <>
//               <div className="print-header">
//                 <h2>{meet?.meet_name || "Meet Results"}</h2>
//                 <p>{meet?.year || ""}</p>
//               </div>
//               <table className="results-table">
//                 <thead>
//                   <tr>
//                     <th>#</th>
//                     <th>Bib</th>
//                     <th>Athlete</th>
//                     <th>School</th>
//                     <th>Event</th>
//                     <th>Performance</th>
//                     <th>Position</th>
//                     <th>Points</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {results.map((result, index) => (
//                     <tr key={result.id || index}>
//                       <td>{index + 1}</td>
//                       <td>{result.bib_no}</td>
//                       <td>{result.athlete_name || "-"}</td>
//                       <td>{result.school_name || "-"}</td>
//                       <td>{result.event_name || "-"}</td>
//                       <td>
//                         {result.performance_time
//                           ? `${result.performance_time}s`
//                           : result.performance_distance
//                           ? `${result.performance_distance}m`
//                           : "-"}
//                       </td>
//                       <td>{result.position ?? "-"}</td>
//                       <td>{result.points ?? "-"}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </>
//           ) : (
//             <p>No results found for this meet.</p>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default PastMeetResults;
