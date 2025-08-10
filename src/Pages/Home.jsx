import React, { useEffect, useRef, useState } from 'react';
import '../Styles/Home.css';
import axios from 'axios';
import PropertyCarousel from '../Components/PropertyCarousel';
import SpeechToTextButton from '../Components/SpeechToTextButton';

const Home = ({ user, setUser }) => {
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `Hi!\nWelcome to Agent Mira. I’m here to help you find your perfect property. Tell me what you’re looking for!`,
      properties: []
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [sortOption, setSortOption] = useState("");

  const [result, setResult] = useState({
    location: null,
    amenities: [],
    min_bedrooms: null,
    max_bedrooms: null,
    min_price: null,
    max_price: null,
    min_size: null,
    max_size: null,
    min_bathrooms: null,
    max_bathrooms: null
  });

  // Sorted properties list
  const sortedProperties = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "size-asc": return a.size_sqft - b.size_sqft;
      case "size-desc": return b.size_sqft - a.size_sqft;
      default: return 0;
    }
  });

  // Load properties first, then user preferences
  useEffect(() => {
    const initData = async () => {
      try {
        // Step 1 — Fetch all properties
        const resProps = await fetch(`${import.meta.env.VITE_API_URL}/api/data`);
        const allProperties = await resProps.json();
        setProperties(allProperties);
        setFiltered(allProperties); // default is all

        // Step 2 — Load user data
        let activeUser = user;
        if (!activeUser) {
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            activeUser = JSON.parse(savedUser);
            setUser(activeUser);
          }
        }

        // Step 3 — Apply preferences if any
        if (activeUser?.preferences) {
          setResult(prev => ({ ...prev, ...activeUser.preferences }));

          try {
            const resFiltered = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/customData`,
              { mergedResult: activeUser.preferences }
            );
            setFiltered(resFiltered.data);
          } catch (err) {
            console.error("Failed to fetch filtered properties:", err);
          }
        }

        // Step 4 — Restore messages if any
        if (activeUser?.messages) {
          setMessages(activeUser.messages);
        }
      } catch (err) {
        console.error("Error initializing data:", err);
      }
    };

    initData();
  }, [user, setUser]);

  // Always scroll chat to bottom on messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSearchQuery = async () => {
    if (search.trim().length < 1) {
      alert('Please enter something more descriptive.');
      return;
    }

    const newUserMsg = { from: 'user', text: search, properties: [] };
    setMessages(prev => [...prev, newUserMsg]);
    const mess = search;
    setSearch('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/input`, {
        message: mess,
        currentDetails: JSON.stringify(result)
      });

      const parsed = response.data;
      setResult(parsed);

      const { message: botMessageText, ...parsedWithoutMessage } = parsed;
      const data = await axios.post(`${import.meta.env.VITE_API_URL}/api/customData`, {
        mergedResult: parsedWithoutMessage
      });

      setFiltered(data.data);

      const botMsg = {
        from: 'bot',
        text: botMessageText,
        properties: data.data
      };
      setMessages(prev => [...prev, botMsg]);

      if (user) {
        try {
          await axios.patch(
            `${import.meta.env.VITE_API_URL}/api/users/preferences`,
            parsedWithoutMessage,
            { withCredentials: true }
          );
          await axios.patch(
            `${import.meta.env.VITE_API_URL}/api/users/messages`,
            [...messages, newUserMsg, botMsg],
            { withCredentials: true }
          );
          setUser(prevUser => ({
            ...prevUser,
            preferences: parsedWithoutMessage,
            messages: [...messages, newUserMsg, botMsg]
          }));
        } catch (err) {
          console.error('Failed to save preferences/messages:', err);
        }
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddToCompare = (property) => {
    if (!compareList.some(item => item.id === property.id)) {
      setCompareList(prev => [...prev, property]);
    }
    setShowCompare(true);
  };

  const handleRemoveFromCompare = (id) => {
    setCompareList(prev => prev.filter(item => item.id !== id));
  };

  const maxPrice = Math.min(...compareList.map(p => p.price), 0);
  const maxBedrooms = Math.max(...compareList.map(p => p.bedrooms), 0);
  const maxBathrooms = Math.max(...compareList.map(p => p.bathrooms), 0);
  const maxSize = Math.max(...compareList.map(p => p.size_sqft), 0);

  return (
    <div className="home-container">
      {/* Chat Section */}
      <div className="chat-box">
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.from}`}>
              <p>{msg.text}</p>
              {msg.properties?.length > 0 && (
                <PropertyCarousel properties={msg.properties} />
              )}
            </div>
          ))}
          {isTyping && (
            <div className="chat-message bot typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          className="search-bar"
          onSubmit={(e) => { e.preventDefault(); handleSearchQuery(); }}
        >
          <input
            type="text"
            placeholder="Describe the property you want..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="send-btn">Send</button>
          <SpeechToTextButton onResult={(text)=>{setSearch(text);}} className="send-btn mic-btn"/>

        </form>
      </div>

      {/* Data Display */}
      <div className="data-dis">
        <div className="filter-compare-section">
          <div className="sort-options">
            <label>Sort by:</label>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="">None</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="size-asc">Size: Small to Large</option>
              <option value="size-desc">Size: Large to Small</option>
            </select>
          </div>

          {compareList.length > 0 && (
            <button className="compare-btn" onClick={() => setShowCompare(!showCompare)}>
              {showCompare ? 'Close Compare' : `Compare (${compareList.length})`}
            </button>
          )}
        </div>

        <div className="property-grid">
          {sortedProperties.length > 0 ? (
            sortedProperties.map(property => (
              <div key={property.id} className="property-card">
                <div className="property-image-container">
                  <img src={property.image_url} alt={property.title} className="property-image" />
                  <button className="compare-overlay-btn" onClick={() => handleAddToCompare(property)}>Compare</button>
                </div>
                <div className="property-content">
                  <h3>{property.title}</h3>
                  <p className="property-price">${property.price.toLocaleString()}</p>
                  <p><strong>Location:</strong> {property.location}</p>
                  <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
                  <p><strong>Bathrooms:</strong> {property.bathrooms}</p>
                  <p><strong>Size:</strong> {property.size_sqft} sq ft</p>
                  <p><strong>{property.amenities.join(', ')}</strong></p>
                </div>
              </div>
            ))
          ) : (
            <p>No matching properties found.</p>
          )}
        </div>
      </div>

      {showCompare && (
        <div className="compare-modal">
          <div className="compare-content">
            <h2>Compare Properties</h2>
            <button className="close-btn" onClick={() => setShowCompare(false)}>X</button>
            {compareList.length === 0 ? (
              <p className="empty-compare-text">Add properties to compare</p>
            ) : (
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    {compareList.map(property => (
                      <th key={property.id}>
                        <div className="property-header">
                          <div className="compare-image-wrapper">
                            <img src={property.image_url} alt={property.title} className="compare-image" />
                          </div>
                          <span className="property-title">{property.title}</span>
                        </div>
                        <button className="remove-btn" onClick={() => handleRemoveFromCompare(property.id)}>Remove</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Price</td>
                    {compareList.map((p, idx) => (
                      <td key={idx} className={p.price === maxPrice ? 'highlight' : ''}>
                        ${p.price.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Location</td>
                    {compareList.map((p, idx) => <td key={idx}>{p.location}</td>)}
                  </tr>
                  <tr>
                    <td>Bedrooms</td>
                    {compareList.map((p, idx) => (
                      <td key={idx} className={p.bedrooms === maxBedrooms ? 'highlight' : ''}>
                        {p.bedrooms}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Bathrooms</td>
                    {compareList.map((p, idx) => (
                      <td key={idx} className={p.bathrooms === maxBathrooms ? 'highlight' : ''}>
                        {p.bathrooms}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Size (sq ft)</td>
                    {compareList.map((p, idx) => (
                      <td key={idx} className={p.size_sqft === maxSize ? 'highlight' : ''}>
                        {p.size_sqft}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Amenities</td>
                    {compareList.map((p, idx) => <td key={idx}>{p.amenities.join(', ')}</td>)}
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
