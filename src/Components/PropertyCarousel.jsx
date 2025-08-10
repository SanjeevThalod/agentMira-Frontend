import React, { useState } from "react";
import "../Styles/PropertyCarousel.css";
import { motion, AnimatePresence } from "framer-motion";

const variants = {
  enter: { opacity: 0, scale: 0.8 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

const PropertyCarousel = ({ properties }) => {
  const [index, setIndex] = useState(0);

  if (!properties.length) return null;

  const prev = () => setIndex(i => (i === 0 ? properties.length - 1 : i - 1));
  const next = () => setIndex(i => (i === properties.length - 1 ? 0 : i + 1));

  const property = properties[index];

  return (
    <div className="chat-property-card">
      <button onClick={prev} className="slider-buttons">&lt;</button>
      <div
        className="property-carousel-wrapper"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={property.id}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="property-content-wrapper"
            style={{ position: "absolute", width: "100%" }}
          >
            <div className="property-image-container">
              <img
                src={property.image_url}
                alt={property.title}
                className="property-image"
              />
            </div>
            <h3>{property.title}</h3>
            <p className="property-price">${property.price.toLocaleString()}</p>
            <p>
              <strong>Location:</strong> {property.location}
            </p>
            <p>
              <strong>Bedrooms:</strong> {property.bedrooms}
            </p>
            <p>
              <strong>Bathrooms:</strong> {property.bathrooms}
            </p>
            <p>
              <strong>Size:</strong> {property.size_sqft} sq ft
            </p>
            <p>
              <strong>{property.amenities.join(", ")}</strong>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>


        <button onClick={next} className="slider-buttons"> &gt;</button>

    </div>
  );
};

export default PropertyCarousel;
