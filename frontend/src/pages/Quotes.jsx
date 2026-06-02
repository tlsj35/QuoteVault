import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Quotes() {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const [page, setPage] = useState("quotes");

  const navigate = useNavigate();

  const loadQuotes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/quotes", {
        withCredentials: true,
      });

      setQuotes(response.data);
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const saveQuote = async () => {
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/quotes/${editingId}`,
          { text, author, tags },
          { withCredentials: true }
        );
      } else {
        await axios.post(
          "http://localhost:5000/quotes",
          { text, author, tags },
          { withCredentials: true }
        );
      }

      setEditingId(null);
      setAutoSaveStatus("");
      setText("");
      setAuthor("");
      setTags("");

      await loadQuotes();

      setPage("quotes");
      alert(editingId ? "Quote updated!" : "Quote saved!");
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.error || "Failed to save quote");
    }
  };

  const deleteQuote = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/quotes/${id}`, {
        withCredentials: true,
      });

      await loadQuotes();
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Delete failed");
    }
  };

  const editQuote = (quote) => {
    setEditingId(quote.id);
    setText(quote.text || "");
    setAuthor(quote.author || "");
    setTags(quote.tags || "");
    setAutoSaveStatus("");
    setPage("new");
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/logout",
        {},
        { withCredentials: true }
      );

      navigate("/");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Logout failed");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAutoSaveStatus("");
    setText("");
    setAuthor("");
    setTags("");
    setPage("quotes");
  };

  const filteredQuotes = quotes.filter((quote) =>
    (quote.text || "").toLowerCase().includes(search.toLowerCase()) ||
    (quote.author || "").toLowerCase().includes(search.toLowerCase()) ||
    (quote.tags || "").toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!editingId) return;

    setAutoSaveStatus("Unsaved changes...");

    const timer = setTimeout(async () => {
      try {
        await axios.put(
          `http://localhost:5000/quotes/${editingId}`,
          { text, author, tags },
          { withCredentials: true }
        );

        await loadQuotes();
        setAutoSaveStatus("Auto-saved");
      } catch (err) {
        console.error(err.response?.data || err);
        setAutoSaveStatus("Auto-save failed");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [text, author, tags, editingId]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>QuoteVault</h1>

      <nav>
        <button onClick={() => setPage("quotes")}>Quotes</button>{" "}
        <button
          onClick={() => {
            setEditingId(null);
            setText("");
            setAuthor("");
            setTags("");
            setAutoSaveStatus("");
            setPage("new");
          }}
        >
          New Quote
        </button>{" "}
        <button onClick={logout}>Logout</button>
      </nav>

      <br />

      {page === "new" && (
        <>
          <h2>{editingId ? "Edit Quote" : "New Quote"}</h2>

          <textarea
            rows="4"
            cols="50"
            placeholder="Quote text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <br /><br />

          <input
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />

          <br /><br />

          <input
            placeholder="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <br /><br />

          <button onClick={saveQuote}>
            {editingId ? "Update Quote" : "Save Quote"}
          </button>{" "}

          <button onClick={cancelEdit}>Cancel</button>

          <p>{autoSaveStatus}</p>
        </>
      )}

      {page === "quotes" && (
        <>
          <hr />

          <input
            type="text"
            placeholder="Search quotes, authors, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "300px",
              padding: "8px",
              marginBottom: "20px",
            }}
          />

          <h2>My Quotes</h2>

          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              style={{
                border: "1px solid gray",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <p>{quote.text}</p>
              <strong>{quote.author}</strong>
              <p>{quote.tags}</p>

              <button onClick={() => editQuote(quote)}>Edit</button>{" "}
              <button onClick={() => deleteQuote(quote.id)}>Delete</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}