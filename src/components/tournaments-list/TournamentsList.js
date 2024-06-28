import React, { useState, useEffect } from "react";
import "tailwindcss/tailwind.css";

const TournamentsList = ({ onSelect }) => {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTournaments, setSelectedTournaments] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [customUrl, setCustomUrl] = useState("");
  const [tournamentId, setTournamentId] = useState("");
  const [broadcasts, setBroadcasts] = useState(true);

  useEffect(() => {
    fetch("https://lichess.org/api/broadcast?nb=50")
      .then((response) => response.text())
      .then((data) => {
        const jsonData = data
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line));
        const ongoingTournaments = jsonData.filter(
          (tournament) =>
            tournament.rounds &&
            tournament.rounds.some((round) => round.ongoing === true)
        );
        setTournaments(ongoingTournaments);
        setFilteredTournaments(ongoingTournaments);
        if (ongoingTournaments.length === 0) {
          setBroadcasts(false);
        }
      })
      .catch((error) => console.error("Error fetching tournaments:", error));
  }, []);

  const handleSearch = () => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = tournaments.filter((tournament) =>
      tournament.tour.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setFilteredTournaments(filtered);
  };

  const handleCustomUrlChange = (e) => {
    setCustomUrl(e.target.value);
    const urlParts = e.target.value.split("/");
    const id = urlParts[urlParts.length - 1];
    setTournamentId(id);
  };

  const onSelectTournament = () => {
    if (tournamentId) {
      setSelectedTournaments([tournamentId]);
      onSelect([tournamentId]); // This line is added to simulate the selection
    }
  };

  return (
    <div className="mt-20 flex flex-col items-center">
      <h1 className="border-b-4 border-green-500 pb-4 text-2xl font-bold text-green-500 text-center mb-12">
        LIVE BROADCASTS
      </h1>
      <div className="flex justify-center mb-8 space-x-4">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tournaments..."
          className="mr-4 p-2 text-base border rounded"
        />
        <button
          onClick={handleSearch}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Search
        </button>
        <input
          value={customUrl}
          onChange={handleCustomUrlChange}
          placeholder="Enter custom Lichess URL..."
          className="mr-4 p-2 text-base border rounded"
        />
        <button
          onClick={onSelectTournament}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Go
        </button>
      </div>
      <button
        onClick={() => {
          onSelect(selectedTournaments);
          setSelectedTournaments([]);
        }}
        className="mb-8 p-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Confirm
      </button>
      {filteredTournaments.length === 0 ? (
        <p className="text-white text-xl">No broadcasts available</p>
      ) : (
        filteredTournaments.map((tournament) =>
          tournament.tour &&
          tournament.rounds &&
          tournament.rounds.length > 0 ? (
            <div
              key={tournament.tour.id}
              className={`flex flex-col items-start border ${
                selectedTournaments.includes(tournament.tour.id)
                  ? "border-4 border-green-500"
                  : "border border-gray-300"
              } p-4 m-4 rounded cursor-pointer bg-opacity-60 ${
                selectedTournaments.includes(tournament.tour.id)
                  ? "bg-green-100"
                  : "bg-gray-800"
              } transition-transform transform hover:scale-105 w-full max-w-2xl`}
            >
              {tournament.image && (
                <img
                  className="w-full h-auto mb-4"
                  src={tournament.image}
                  alt="Tournament"
                />
              )}
              <input
                type="checkbox"
                checked={checkedItems[tournament.tour.id]}
                onChange={() => {
                  setCheckedItems((prevState) => ({
                    ...prevState,
                    [tournament.tour.id]: !prevState[tournament.tour.id],
                  }));
                  const ongoingRound = tournament.rounds.find(
                    (round) => round.ongoing === true
                  );
                  if (ongoingRound) {
                    setSelectedTournaments((prevTournaments) =>
                      prevTournaments.includes(ongoingRound.id)
                        ? prevTournaments.filter((id) => id !== ongoingRound.id)
                        : [...prevTournaments, ongoingRound.id]
                    );
                  }
                }}
                className="mb-4"
              />
              <div className="flex justify-between w-full mb-4">
                <h2 className="text-lg text-white">{tournament.tour.name}</h2>
                <p className="text-base text-white">{tournament.tour.date}</p>
              </div>
              <p className="text-base text-white mb-4 truncate-3-lines">
                {tournament.tour.description}
              </p>
              <a
                href={tournament.tour.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Official Website
              </a>
            </div>
          ) : null
        )
      )}
    </div>
  );
};

export default TournamentsList;
